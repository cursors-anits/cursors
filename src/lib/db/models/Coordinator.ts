import mongoose, { Schema, Model } from 'mongoose';

export interface ICoordinator {
    _id?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    personalEmail?: string;
    role: string;
    assigned: string;
    assignedLab?: string;
    userId?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

type CoordinatorModel = Model<ICoordinator>;

const CoordinatorSchema = new Schema<ICoordinator, CoordinatorModel>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        personalEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
        },
        assigned: {
            type: String,
            required: true,
        },
        assignedLab: {
            type: String,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Coordinator = (mongoose.models.Coordinator as CoordinatorModel) || mongoose.model<ICoordinator, CoordinatorModel>('Coordinator', CoordinatorSchema);

export default Coordinator;
