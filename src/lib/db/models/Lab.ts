import mongoose, { Schema, Model } from 'mongoose';

export interface ILab {
    _id?: mongoose.Types.ObjectId;
    name: string;
    roomNumber: string;
    capacity: number;
    currentCount: number;
    type: 'Hackathon';
    seatingConfig?: {
        size5: number;
        size4: number;
        size3: number;
        size2: number;
        size1: number;
    };
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
        type: {
            type: String,
            enum: ['Hackathon'],
            required: true,
            default: 'Hackathon'
        },
        seatingConfig: {
            size5: { type: Number, default: 0 },
            size4: { type: Number, default: 0 },
            size3: { type: Number, default: 0 },
            size2: { type: Number, default: 0 },
            size1: { type: Number, default: 0 },
        }
    },
    {
        timestamps: true,
    }
);

const Lab = (mongoose.models.Lab_Optimized as LabModel) || mongoose.model<ILab, LabModel>('Lab_Optimized', LabSchema, 'labs');

export default Lab;
