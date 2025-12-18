import mongoose, { Schema, Model } from 'mongoose';

export interface ILog {
    _id?: mongoose.Types.ObjectId;
    action: string;
    user: string;
    time: string;
    details: string;
    timestamp: number;
    createdAt?: Date;
}

type LogModel = Model<ILog>;

const LogSchema = new Schema<ILog, LogModel>(
    {
        action: {
            type: String,
            required: true,
            index: true,
        },
        user: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Number,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// TTL index - automatically delete logs older than 30 days
LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Log = (mongoose.models.Log as LogModel) || mongoose.model<ILog, LogModel>('Log', LogSchema);

export default Log;
