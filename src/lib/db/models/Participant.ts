import mongoose, { Schema, Model } from 'mongoose';

export interface IParticipant {
    _id?: mongoose.Types.ObjectId;
    participantId: string;
    teamId: string;
    name: string;
    email: string;
    college: string;
    department: string;
    city?: string;
    whatsapp: string;
    year: string;
    linkedin?: string;
    domain?: string;
    transactionId: string;
    ticketType?: 'hackathon' | 'combo';
    amountPaid?: number;
    type: 'Hackathon';
    status: 'pending' | 'approved' | 'rejected';
    assignedLab?: string;

    assignedHackathonLab?: string;
    assignedSeat?: string;
    paymentScreenshotUrl?: string;
    avatarUrl?: string;
    eventChecklist?: string[];
    problemAssignmentId?: mongoose.Types.ObjectId;
    hasConfirmedProblem?: boolean;
    projectRepo?: string;
    projectTitle?: string;
    projectDocumentUrl?: string; // Link to abstract/doc
    submissionStatus?: 'pending' | 'verified' | 'flagged';
    submissionTime?: Date;

    // Extended Submission Fields
    projectRepoLocked?: boolean;
    projectRepoSubmittedAt?: Date;
    codingPlatform?: string;
    extendedSubmissionData?: {
        codingPlatforms?: string[];
        filesUploaded?: {
            envFile?: string;
            requirementsFile?: string;
            documentFile?: string;
            otherFiles?: string[];
        };
        submittedAt?: Date;
        folderPath?: string;
        totalFileSize?: number;
    };
    submissionFlags?: {
        isFlagged: boolean;
        flags: string[];
        flaggedAt?: Date;
        reviewedBy?: string;
        reviewStatus?: 'pending' | 'approved' | 'rejected';
        reviewNotes?: string;
    };

    // Attendance Tracking

    hackathonAttendance?: Date;
    entryGateTimestamp?: Date;
    exitGateTimestamp?: Date;
    snacksDay1?: Date;
    snacksDay2?: Date;
    snacksDay3?: Date;
    snacksHackathon?: Date;

    // Food Coupon

    foodAttendance?: string[];

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
        city: {
            type: String,
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
            enum: ['Hackathon'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'Pending', 'Approved', 'Rejected'],
            default: 'approved'
        },
        assignedLab: {
            type: String,
        },
        assignedHackathonLab: {
            type: String,
        },
        domain: {
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
        problemAssignmentId: {
            type: Schema.Types.ObjectId,
            ref: 'ProblemAssignment'
        },
        hasConfirmedProblem: {
            type: Boolean,
            default: false
        },
        projectRepo: {
            type: String,
        },
        projectTitle: {
            type: String,
            trim: true
        },
        projectDocumentUrl: {
            type: String,
            trim: true
        },
        submissionStatus: {
            type: String,
            enum: ['pending', 'verified', 'flagged'],
            default: 'pending'
        },
        submissionTime: {
            type: Date,
        },
        // Extended Submission Fields
        projectRepoLocked: {
            type: Boolean,
            default: false
        },
        projectRepoSubmittedAt: {
            type: Date
        },
        codingPlatform: {
            type: String
        },
        extendedSubmissionData: {
            codingPlatforms: [String],
            filesUploaded: {
                envFile: String,
                requirementsFile: String,
                documentFile: String,
                otherFiles: [String]
            },
            submittedAt: Date,
            folderPath: String, // Google Drive folder ID or link
            totalFileSize: Number
        },
        submissionFlags: {
            isFlagged: { type: Boolean, default: false },
            flags: [String],
            flaggedAt: Date,
            reviewedBy: String,
            reviewStatus: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            reviewNotes: String
        },


        // Attendance Tracking Fields
        hackathonAttendance: {
            type: Date,
        },
        entryGateTimestamp: {
            type: Date,
        },
        exitGateTimestamp: {
            type: Date,
        },
        snacksDay1: {
            type: Date,
        },
        snacksDay2: {
            type: Date,
        },
        snacksDay3: {
            type: Date,
        },
        snacksHackathon: {
            type: Date,
        },


        foodAttendance: {
            type: [String],
            default: []
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
