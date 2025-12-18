import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
    _id?: mongoose.Types.ObjectId;
    email: string;
    name: string;
    role: 'admin' | 'coordinator' | 'participant' | 'faculty';
    password?: string;
    passkey?: string;
    teamId?: string;
    assignedLab?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['admin', 'coordinator', 'participant', 'faculty'],
            required: true,
        },
        password: {
            type: String,
            select: false, // Don't include in queries by default
        },
        passkey: {
            type: String,
            sparse: true, // Allow null but unique when present
            index: true,
        },
        teamId: {
            type: String,
            index: true,
        },
        assignedLab: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function () {
    if (this.password && this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Methods or other schema extensions can be added here

const User = (mongoose.models.User as UserModel) || mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;
