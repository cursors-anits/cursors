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
        hackathonCount: number;
        showFakeCounts: boolean;
    };
    bufferConfig?: {
        hackathonLimit: number;
        hackathonBuffer: number;
    };
    colleges?: string[];
    cities?: string[];
    hackathonStartDate?: Date;
    hackathonEndDate?: Date;
    submissionWindowOpen?: boolean;
    submissionWindowStartTime?: Date;
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
            default: () => new Date('2026-01-05T12:30:00'), // Default event date to Jan 5th, 2026
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
            hackathonCount: { type: Number, default: 488 },
            showFakeCounts: { type: Boolean, default: true },
        },
        bufferConfig: {
            hackathonLimit: { type: Number, default: 500 },
            hackathonBuffer: { type: Number, default: 100 },
        },
        colleges: {
            type: [String],
            default: []
        },
        hackathonStartDate: {
            type: Date,
            default: () => new Date('2026-01-05T15:00:00'),
        },
        hackathonEndDate: {
            type: Date,
            default: () => new Date('2026-01-06T15:00:00'),
        },
        submissionWindowOpen: {
            type: Boolean,
            default: false,
        },
        submissionWindowStartTime: {
            type: Date,
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
