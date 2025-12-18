import mongoose, { Schema, Model } from 'mongoose';

export interface ISettings {
    _id?: mongoose.Types.ObjectId;
    registrationClosed: boolean;
    maintenanceMode: boolean;
    eventDate: Date;
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
    },
    {
        timestamps: true,
    }
);

const Settings = (mongoose.models.Settings as SettingsModel) || mongoose.model<ISettings, SettingsModel>('Settings', SettingsSchema);

export default Settings;
