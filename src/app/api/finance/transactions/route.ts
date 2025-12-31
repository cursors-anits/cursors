
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Transaction from '@/lib/db/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        // Fetch all transactions sorted by newest first
        const transactions = await Transaction.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, transactions });
    } catch (error: any) {
        console.error('Fetch Transactions Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.title || !body.amount || !body.type || !body.category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transaction = await Transaction.create(body);
        return NextResponse.json({ success: true, transaction });

    } catch (error: any) {
        console.error('Create Transaction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        const deleted = await Transaction.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Transaction deleted' });

    } catch (error: any) {
        console.error('Delete Transaction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        const transaction = await Transaction.findByIdAndUpdate(_id, updateData, { new: true });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, transaction });

    } catch (error: any) {
        console.error('Update Transaction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
