import mongoose, { Schema, Model } from 'mongoose';

export interface ISupportRequest {
    _id?: mongoose.Types.ObjectId;
    type: 'SOS' | 'Help' | 'Complaint';
    teamId: string;
    labName: string;
    message?: string;
    status: 'Open' | 'Resolved';
    resolvedBy?: string;
    timestamp: number;
}

type SupportRequestModel = Model<ISupportRequest>;

const SupportRequestSchema = new Schema<ISupportRequest, SupportRequestModel>(
    {
        type: {
            type: String,
            enum: ['SOS', 'Help', 'Complaint'],
            required: true,
        },
        teamId: {
            type: String,
            required: true,
            index: true,
        },
        labName: {
            type: String,
            required: true,
            index: true,
        },
        message: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Open', 'Resolved'],
            default: 'Open',
        },
        resolvedBy: {
            type: String,
        },
        timestamp: {
            type: Number,
            default: () => Date.now(),
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const SupportRequest = (mongoose.models.SupportRequest as SupportRequestModel) || mongoose.model<ISupportRequest, SupportRequestModel>('SupportRequest', SupportRequestSchema);

export default SupportRequest;
