
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Settings from '@/lib/db/models/Settings';
import Participant from '@/lib/db/models/Participant';
import { isAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { type, oldName, newName } = await request.json();

        if (!oldName || !newName || !['college', 'city'].includes(type)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();

        // 1. Update Settings (Global List)
        let updatedList = false;
        if (type === 'college') {
            if (!settings.colleges) settings.colleges = [];
            if (!settings.colleges.includes(newName)) {
                settings.colleges.push(newName);
                settings.colleges.sort((a: string, b: string) => a.localeCompare(b));
                updatedList = true;
            }
        } else {
            if (!settings.cities) settings.cities = [];
            if (!settings.cities.includes(newName)) {
                settings.cities.push(newName);
                settings.cities.sort((a: string, b: string) => a.localeCompare(b));
                updatedList = true;
            }
        }

        if (updatedList) await settings.save();

        // 2. Update Participants (Batch Update)
        // Update main participant fields
        const participantQuery = type === 'college' ? { college: oldName } : { city: oldName }; // Note: city might not be on root participant if only in members
        // Actually Participant model has 'college' at root?

        let updateResult1 = { modifiedCount: 0 };
        if (type === 'college') {
            updateResult1 = await Participant.updateMany(
                { college: oldName },
                { $set: { college: newName } }
            );
        }

        // Update nested members
        // We need to use arrayFilters to update specific elements in the 'members' array
        const memberField = type === 'college' ? 'members.college' : 'members.city';
        const setField = type === 'college' ? 'members.$[elem].college' : 'members.$[elem].city';
        const filterField = type === 'college' ? 'elem.college' : 'elem.city';

        const updateResult2 = await Participant.updateMany(
            { [memberField]: oldName },
            { $set: { [setField]: newName } },
            { arrayFilters: [{ [filterField]: oldName }] }
        );

        return NextResponse.json({
            success: true,
            settingsUpdated: updatedList,
            participantsUpdated: (updateResult1.modifiedCount || 0),
            membersUpdated: updateResult2.modifiedCount
        });

    } catch (error: any) {
        console.error('Normalize Data Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to normalize data' }, { status: 500 });
    }
}
