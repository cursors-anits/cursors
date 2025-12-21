import mongoose, { Schema, Model } from 'mongoose';

export interface IParticipant {
    _id?: mongoose.Types.ObjectId;
    participantId: string;
    teamId: string;
    name: string;
    email: string;
    college: string;
    department: string;
    whatsapp: string;
    year: string;
    linkedin?: string;
    transactionId: string;
    type: 'Workshop' | 'Hackathon' | 'Combo';
    status: 'Pending' | 'Paid' | 'Confirmed';
    assignedLab?: string;
    assignedWorkshopLab?: string;
    assignedHackathonLab?: string;
    assignedSeat?: string;
    paymentScreenshotUrl?: string;
    avatarUrl?: string;
    eventChecklist?: string[];
    problemAssignmentId?: mongoose.Types.ObjectId;
    hasConfirmedProblem?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

type ParticipantModel = Model<IParticipant>;

const ParticipantSchema = new Schema<IParticipant, ParticipantModel>(
    {
        participantId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        teamId: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        college: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        whatsapp: {
            type: String,
            required: true,
        },
        year: {
            type: String,
            required: true,
        },
        linkedin: {
            type: String,
        },
        type: {
            type: String,
            enum: ['Workshop', 'Hackathon', 'Combo'],
            required: true,
        },
        assignedLab: {
            type: String,
        },
        assignedWorkshopLab: {
            type: String,
        },
        assignedHackathonLab: {
            type: String,
        },
        assignedSeat: {
            type: String,
        },
        paymentScreenshotUrl: {
            type: String,
        },
        avatarUrl: {
            type: String,
        },
        eventChecklist: {
            type: [String],
            default: [],
        },
        transactionId: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
ParticipantSchema.index({ status: 1 });

const Participant = (mongoose.models.Participant as ParticipantModel) || mongoose.model<IParticipant, ParticipantModel>('Participant', ParticipantSchema);

export default Participant;
