import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import SupportRequest from '@/lib/db/models/SupportRequest';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const labName = searchParams.get('labName');
        const status = searchParams.get('status') || 'Open';

        const query: any = { status };
        if (labName) {
            query.labName = labName;
        }

        const requests = await SupportRequest.find(query).sort({ timestamp: -1 });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and Status are required' }, { status: 400 });
        }

        const supportRequest = await SupportRequest.findByIdAndUpdate(id, { status }, { new: true });
        return NextResponse.json(supportRequest);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}
