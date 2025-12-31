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
    reply?: string;
    replyTime?: number;
    repliedBy?: string;
    participantFollowUp?: string;
    acknowledged?: boolean;
    participantReaction?: 'Like' | 'Dislike';
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
        reply: String,
        replyTime: Number,
        repliedBy: String,
        participantFollowUp: String,
        acknowledged: {
            type: Boolean,
            default: false
        },
        participantReaction: {
            type: String,
            enum: ['Like', 'Dislike']
        }
    },
    {
        timestamps: true,
    }
);

const SupportRequest = (mongoose.models.SupportRequest as SupportRequestModel) || mongoose.model<ISupportRequest, SupportRequestModel>('SupportRequest', SupportRequestSchema);

export default SupportRequest;
