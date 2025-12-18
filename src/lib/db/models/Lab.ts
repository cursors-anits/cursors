import mongoose, { Schema, Model } from 'mongoose';

export interface ILab {
    _id?: mongoose.Types.ObjectId;
    name: string;
    roomNumber: string;
    capacity: number;
    currentCount: number;
}

type LabModel = Model<ILab>;

const LabSchema = new Schema<ILab, LabModel>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        roomNumber: {
            type: String,
            required: true,
            trim: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 0,
        },
        currentCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Lab = (mongoose.models.Lab as LabModel) || mongoose.model<ILab, LabModel>('Lab', LabSchema);

export default Lab;
