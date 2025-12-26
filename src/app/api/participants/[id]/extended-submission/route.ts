
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import { ensureFolderExists, uploadToFolder } from '@/lib/gdrive';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const participantId = id; // This is the _id from the URL

        const formData = await request.formData();
        const platforms = JSON.parse(formData.get('platforms') as string || '[]');

        const envFile = formData.get('envFile') as File | null;
        const requirementsFile = formData.get('requirementsFile') as File | null;
        const documentFile = formData.get('documentFile') as File | null;
        const otherFiles = formData.getAll('otherFiles') as File[];

        const participant = await Participant.findById(participantId);
        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        // Create Team Folder in Google Drive
        // Format: "Team-{teamId}_{participantName}"
        const folderName = `Team-${participant.teamId || participant.participantId}_${participant.name}`;
        const teamFolderId = await ensureFolderExists(folderName);

        const filesUploaded: any = {
            otherFiles: []
        };
        let totalFileSize = 0;

        // Helper to upload file
        const processUpload = async (file: File, type: string) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileLink = await uploadToFolder(buffer, file.name, teamFolderId, file.type);
            totalFileSize += file.size;
            return fileLink;
        };

        if (envFile) {
            filesUploaded.envFile = await processUpload(envFile, 'env');
        }

        if (requirementsFile) {
            filesUploaded.requirementsFile = await processUpload(requirementsFile, 'requirements');
        }

        if (documentFile) {
            filesUploaded.documentFile = await processUpload(documentFile, 'document');
        }

        for (const file of otherFiles) {
            const link = await processUpload(file, 'other');
            filesUploaded.otherFiles.push(link);
        }

        // Update Participant
        participant.extendedSubmissionData = {
            codingPlatforms: platforms,
            filesUploaded,
            submittedAt: new Date(),
            folderPath: teamFolderId, // Saving Folder ID for easy access
            totalFileSize
        };

        // Also mark regular submission status as verified if not already
        if (participant.submissionStatus !== 'flagged') {
            participant.submissionStatus = 'verified';
        }

        participant.submissionTime = new Date();

        await participant.save();

        return NextResponse.json({
            success: true,
            folderId: teamFolderId
        });

    } catch (error: any) {
        console.error('Extended submission error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process submission' },
            { status: 500 }
        );
    }
}
