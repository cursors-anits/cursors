import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOfferedProblem {
    domainIndex: number;
    problemIndex: number;
    domain: string;
    problem: string;
}

export interface IRefreshHistory {
    timestamp: Date;
    previousOptions: number[][]; // Array of [domainIndex, problemIndex] pairs
}

export interface IProblemAssignment extends Document {
    participantId: string;
    teamId: string;

    // Offered problems (1-3 options, starts with 1, can refresh to add more)
    offeredProblems: IOfferedProblem[];

    // Selected problem
    selectedProblem?: IOfferedProblem;
    isConfirmed: boolean;

    // Refresh tracking
    refreshCount: number;
    maxRefreshes: number;
    refreshHistory: IRefreshHistory[];

    // Metadata
    assignedBy: string; // Admin email
    assignedAt: Date;
    selectedAt?: Date;
    confirmedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

type ProblemAssignmentModel = Model<IProblemAssignment>;

const OfferedProblemSchema = new Schema({
    domainIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 11 // 12 domains (0-11)
    },
    problemIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 4 // 5 problems per domain (0-4)
    },
    domain: {
        type: String,
        required: true
    },
    problem: {
        type: String,
        required: true
    }
}, { _id: false });

const RefreshHistorySchema = new Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    previousOptions: {
        type: [[Number]], // Array of [domainIndex, problemIndex] pairs
        required: true
    }
}, { _id: false });

const ProblemAssignmentSchema = new Schema<IProblemAssignment, ProblemAssignmentModel>(
    {
        participantId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        teamId: {
            type: String,
            required: true,
            index: true
        },
        offeredProblems: {
            type: [OfferedProblemSchema],
            required: true,
            validate: {
                validator: function (v: IOfferedProblem[]) {
                    return v.length >= 1 && v.length <= 3;
                },
                message: 'Must have between 1 and 3 offered problems'
            }
        },
        selectedProblem: {
            type: OfferedProblemSchema,
            required: false
        },
        isConfirmed: {
            type: Boolean,
            required: true,
            default: false
        },
        refreshCount: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        maxRefreshes: {
            type: Number,
            required: true,
            default: 2
        },
        refreshHistory: {
            type: [RefreshHistorySchema],
            default: []
        },
        assignedBy: {
            type: String,
            required: true
        },
        assignedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        selectedAt: {
            type: Date,
            required: false
        },
        confirmedAt: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes for performance
ProblemAssignmentSchema.index({ isConfirmed: 1 });
ProblemAssignmentSchema.index({ teamId: 1, participantId: 1 });

const ProblemAssignment = (mongoose.models.ProblemAssignment as ProblemAssignmentModel) ||
    mongoose.model<IProblemAssignment, ProblemAssignmentModel>('ProblemAssignment', ProblemAssignmentSchema);

export default ProblemAssignment;
