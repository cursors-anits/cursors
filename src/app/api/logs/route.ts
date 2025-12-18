import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Log from '@/lib/db/models/Log';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const logs = await Log.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Log.countDocuments();

        return NextResponse.json(
            {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get logs error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { action, user, details } = body;

        if (!action || !user || !details) {
            return NextResponse.json(
                { error: 'Action, user, and details are required' },
                { status: 400 }
            );
        }

        const now = new Date();
        const log = await Log.create({
            action,
            user,
            time: now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            details,
            timestamp: now.getTime(),
        });

        return NextResponse.json({ log }, { status: 201 });
    } catch (error) {
        console.error('Create log error:', error);
        return NextResponse.json(
            { error: 'Failed to create log' },
            { status: 500 }
        );
    }
}
