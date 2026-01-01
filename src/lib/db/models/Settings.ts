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
        fomoDecayRate?: number;
        fomoDecayStart?: Date;
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
    certificateDriveUrl?: string;
    registrationDeadline?: Date;
    onlineBasePrice?: number;
    onlineUpiId?: string;
    onlineQrImageUrl?: string;
    onlineRegistrationOpen?: boolean;
    onlineSubmissionUrl?: string;
    onlineMeetUrl?: string;
    onlineWhatsappUrl?: string;
    onlineProblemSelectionOpen?: boolean;
    onlineSubmissionOpen?: boolean;
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
            default: '₹30,000',
        },
        showInternships: {
            type: Boolean,
            default: false,
        },
        fomoConfig: {
            hackathonCount: { type: Number, default: 200 },
            showFakeCounts: { type: Boolean, default: true },
            fomoDecayRate: { type: Number, default: 25 }, // Spots dropping per hour
            fomoDecayStart: { type: Date, default: () => new Date() }, // When the decay starts
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
        certificateDriveUrl: {
            type: String,
            default: ''
        },
        registrationDeadline: {
            type: Date, // If not set, use eventDate or manual toggle
        },
        onlineBasePrice: {
            type: Number,
            default: 299 // Default price for online
        },
        onlineUpiId: {
            type: String,
            default: ''
        },
        onlineQrImageUrl: {
            type: String,
            default: ''
        },
        onlineRegistrationOpen: {
            type: Boolean,
            default: true
        },
        onlineSubmissionUrl: {
            type: String,
            default: ''
        },
        onlineMeetUrl: {
            type: String,
            default: ''
        },
        onlineWhatsappUrl: {
            type: String,
            default: ''
        },
        onlineProblemSelectionOpen: {
            type: Boolean,
            default: false
        },
        onlineSubmissionOpen: {
            type: Boolean,
            default: false
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
