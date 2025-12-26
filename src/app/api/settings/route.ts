import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Settings from '@/lib/db/models/Settings';
import { isAdmin } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        let settings = await Settings.findOne();

        // Ensure singleton: if more than one exists, clean up
        const count = await Settings.countDocuments();
        if (count > 1) {
            const allSettings = await Settings.find().sort({ createdAt: 1 });
            settings = allSettings[0];
            await Settings.deleteMany({ _id: { $ne: settings._id } });
            console.log('🧹 Cleaned up duplicate settings documents');
        }

        if (!settings) {
            settings = await Settings.create({
                registrationClosed: process.env.NEXT_PUBLIC_REGISTRATION_CLOSED === 'true',
                maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
                upiId: 'bmahesh498@okhdfcbank',
                qrImageUrl: '/payment qr.jpg',
                eventDate: new Date('2026-01-05T12:30:00'),
                colleges: [
                    "Aditya Institute of Technology and Management [AITAM]",
                    "Andhra University College of Engineering [AUCE]",
                    "Andhra University College of Engineering for Women [AUCEW]",
                    "Anil Neerukonda Institute of Technology and Sciences [ANITS]",
                    "Avanthi Institute Of Engineering and Technology [AIET]",
                    "Baba Institute of Technology and Sciences [BITS]",
                    "Behara College of Engineering and Technology [BCET]",
                    "Centurion University of Technology and Management [CUTM]",
                    "Chaitanya Engineering College [CEC]",
                    "Dr. Lankapalli Bullayya College [LBCE]",
                    "Gandhi Institute of Technology and Management [GITAM]",
                    "Gayatri Vidya Parishad College for Degree & P.G. Courses [GVPCDPGC]",
                    "Gayatri Vidya Parishad College of Engineering [GVPCE]",
                    "Gayatri Vidya Parishad College of Engineering Women [GVPCEW]",
                    "GMR Institute of Technology [GMRIT]",
                    "Jawaharlal Nehru Technological University - Gurajada [JNTU-GV]",
                    "Lendi Institute of Engineering & Technology [LIET]",
                    "Maharaj Vijayaram Gajapathi Raj College of Engineering [MVGR]",
                    "Nadimpalli Satyanarayana Raju Institute of Technology [NSRIT]",
                    "N S Raju Institute of Engineering and Technology [NSRIET]",
                    "Pydah College of Engineering and Technology [PCET]",
                    "Raghu Engineering College (Autonomous) [REC]",
                    "Raghu Institute of Technology [RIT]",
                    "Sanketika Vidya Parishad Engineering College [SVPEC]",
                    "Vignan's Institute of Engineering for Women [VIEW]",
                    "Vignan's Institute of Information Technology [VIIT]",
                    "Visakha Institute of Engineering and Technology [VIET]",
                ],
                cities: [
                    "Visakhapatnam", "Vizianagaram", "Srikakulam", "Tekkali", "Bhimavaram", "Rajahmundry"
                ]
            });
            console.log('✅ Created initial settings with defaults');
        } else {
            console.log('🔄 Checking settings migration...');
            // Migration: Ensure existing settings have the new fields
            let modified = false;

            // Migrate Colleges
            if (!settings.colleges || settings.colleges.length === 0) {
                settings.colleges = [
                    "Aditya Institute of Technology and Management [AITAM]",
                    "Andhra University College of Engineering [AUCE]",
                    "Andhra University College of Engineering for Women [AUCEW]",
                    "Anil Neerukonda Institute of Technology and Sciences [ANITS]",
                    "Avanthi Institute Of Engineering and Technology [AIET]",
                    "Baba Institute of Technology and Sciences [BITS]",
                    "Behara College of Engineering and Technology [BCET]",
                    "Centurion University of Technology and Management [CUTM]",
                    "Chaitanya Engineering College [CEC]",
                    "Dr. Lankapalli Bullayya College [LBCE]",
                    "Gandhi Institute of Technology and Management [GITAM]",
                    "Gayatri Vidya Parishad College for Degree & P.G. Courses [GVPCDPGC]",
                    "Gayatri Vidya Parishad College of Engineering [GVPCE]",
                    "Gayatri Vidya Parishad College of Engineering Women [GVPCEW]",
                    "GMR Institute of Technology [GMRIT]",
                    "Jawaharlal Nehru Technological University - Gurajada [JNTU-GV]",
                    "Lendi Institute of Engineering & Technology [LIET]",
                    "Maharaj Vijayaram Gajapathi Raj College of Engineering [MVGR]",
                    "Nadimpalli Satyanarayana Raju Institute of Technology [NSRIT]",
                    "N S Raju Institute of Engineering and Technology [NSRIET]",
                    "Pydah College of Engineering and Technology [PCET]",
                    "Raghu Engineering College (Autonomous) [REC]",
                    "Raghu Institute of Technology [RIT]",
                    "Sanketika Vidya Parishad Engineering College [SVPEC]",
                    "Vignan's Institute of Engineering for Women [VIEW]",
                    "Vignan's Institute of Information Technology [VIIT]",
                    "Visakha Institute of Engineering and Technology [VIET]",
                ];
                modified = true;
                console.log('📝 Migrated colleges list');
            }

            // Migrate Cities
            if (!settings.cities || settings.cities.length === 0) {
                settings.cities = [
                    "Visakhapatnam", "Vizianagaram", "Srikakulam", "Tekkali", "Bhimavaram", "Rajahmundry"
                ];
                modified = true;
            }
            if (!settings.upiId) {
                settings.upiId = 'bmahesh498@okhdfcbank';
                modified = true;
            }
            if (!settings.qrImageUrl || settings.qrImageUrl === '/qr-payment.png') {
                settings.qrImageUrl = '/payment qr.jpg';
                modified = true;
            }
            if (modified) {
                await settings.save();
                console.log('✅ Migrated settings with new fields');
            }
        }

        // Ensure showInternships exists (local migration if needed)
        if (settings.showInternships === undefined) {
            settings.showInternships = false;
            await settings.save();
        }

        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // Authenticate as Admin
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        Object.assign(settings, body);
        await settings.save();

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings update failed:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
