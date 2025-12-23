import mongoose, { Schema, Model } from 'mongoose';

export interface ISettings {
    _id?: mongoose.Types.ObjectId;
    registrationClosed: boolean;
    maintenanceMode: boolean;
    eventDate: Date;
    upiId: string;
    qrImageUrl: string;
    prizePool: string;
    showInternships: boolean;
    fomoConfig?: {
        workshopCount: number;
        hackathonCount: number;
        showFakeCounts: boolean;
    };
    bufferConfig?: {
        workshopLimit: number;
        hackathonLimit: number;
        workshopBuffer: number;
        hackathonBuffer: number;
    };
    colleges?: string[];
    cities?: string[];
    updatedAt?: Date;
}

type SettingsModel = Model<ISettings>;

const SettingsSchema = new Schema<ISettings, SettingsModel>(
    {
        registrationClosed: {
            type: Boolean,
            default: false,
        },
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
        eventDate: {
            type: Date,
            default: () => new Date('2026-01-02T09:00:00'), // Default event date to Jan 2nd, 2026
        },
        upiId: {
            type: String,
            default: 'bmahesh498@okhdfcbank',
        },
        qrImageUrl: {
            type: String,
            default: '/payment qr.jpg',
        },
        prizePool: {
            type: String,
            default: '₹60,000',
        },
        showInternships: {
            type: Boolean,
            default: false,
        },
        fomoConfig: {
            workshopCount: { type: Number, default: 284 },
            hackathonCount: { type: Number, default: 488 },
            showFakeCounts: { type: Boolean, default: true },
        },
        bufferConfig: {
            workshopLimit: { type: Number, default: 300 },
            hackathonLimit: { type: Number, default: 500 },
            workshopBuffer: { type: Number, default: 50 },
            hackathonBuffer: { type: Number, default: 100 },
        },
        colleges: {
            type: [String],
            default: []
        },
        cities: {
            type: [String],
            default: []
        },
    },
    {
        timestamps: true,
    }
);

// Force model rebuild in development to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models.Settings) {
    delete mongoose.models.Settings;
}

const Settings = (mongoose.models.Settings as SettingsModel) || mongoose.model<ISettings, SettingsModel>('Settings', SettingsSchema);

export default Settings;
