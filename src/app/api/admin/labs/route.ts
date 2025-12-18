import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Lab from '@/lib/db/models/Lab';

export async function GET() {
    try {
        await dbConnect();
        const labs = await Lab.find({}).sort({ name: 1 });
        return NextResponse.json(labs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch labs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const lab = await Lab.create(body);
        return NextResponse.json(lab, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create lab' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, ...updateData } = body;
        const lab = await Lab.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(lab);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update lab' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await Lab.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete lab' }, { status: 500 });
    }
}
