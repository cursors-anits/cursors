import mongoose, { Schema, Model } from 'mongoose';

export interface IScheduledEmail {
    _id?: mongoose.Types.ObjectId;
    to: string;
    subject: string;
    body: string;
    type: string;
    teamId?: string;
    scheduledFor: Date;
    status: 'Pending' | 'Sent' | 'Failed';
    attempts: number;
    lastError?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type ScheduledEmailModel = Model<IScheduledEmail>;

const ScheduledEmailSchema = new Schema<IScheduledEmail, ScheduledEmailModel>(
    {
        to: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        teamId: {
            type: String,
        },
        scheduledFor: {
            type: Date,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Sent', 'Failed'],
            default: 'Pending',
            index: true,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        lastError: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const ScheduledEmail = (mongoose.models.ScheduledEmail as ScheduledEmailModel) || mongoose.model<IScheduledEmail, ScheduledEmailModel>('ScheduledEmail', ScheduledEmailSchema);

export default ScheduledEmail;
