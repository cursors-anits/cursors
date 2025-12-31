import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Transaction type is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Food', 'Logistics', 'Sponsorship', 'Registration', 'Prize', 'Merch', 'Other']
    },
    date: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
