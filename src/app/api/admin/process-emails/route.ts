import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email';
import connectDB from '@/lib/db/mongodb';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        await processEmailQueue();

        return NextResponse.json({
            success: true,
            message: 'Email queue processing completed.'
        });
    } catch (error: any) {
        console.error('Error processing email queue:', error);
        return NextResponse.json(
            { error: 'Failed to process email queue' },
            { status: 500 }
        );
    }
}
