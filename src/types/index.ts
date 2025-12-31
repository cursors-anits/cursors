import React from 'react';
import { z } from 'zod';

// Navigation
export interface NavItem {
    label: string;
    href: string;
}

// Schedule
export interface ScheduleItem {
    date: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
}

// Zod Schemas for Validation
export const TeamMemberSchema = z.object({
    fullName: z.string().min(2, 'Name is required'),
    email: z.email('Valid email is required'),
    college: z.string().min(1, 'College is required'),
    otherCollege: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    otherCity: z.string().optional(),
    department: z.string().min(2, 'Department is required'),
    whatsapp: z.string().regex(/^\d{10}$/, 'Must be 10 digits'),
    year: z.string(),
    linkedin: z.string().url().optional().or(z.literal('')),
});

export const RegistrationSchema = z.object({
    ticketType: z.enum(['hackathon']),
    teamSize: z.number().min(1).max(5),

    members: z.array(TeamMemberSchema),
    transactionId: z.string().min(12, 'UTR must be 12 digits'),
    screenshot: z.string().min(1, 'Payment screenshot is required'),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type FormData = z.infer<typeof RegistrationSchema>;

// Features
export interface Feature {
    title: string;
    items: string[];
}

// User & Authentication
export type UserRole = 'admin' | 'coordinator' | 'participant' | 'faculty';

export interface User {
    _id?: string;
    email: string;
    name: string;
    role: UserRole;
    passkey?: string; // For participants
    password?: string; // For admin, coordinator, faculty
    teamId?: string;
    assignedLab?: string; // For coordinators and participants
}

export type DashboardView = 'landing' | 'admin' | 'coordinator' | 'participant' | 'faculty';

// Database Models
export interface Participant {
    _id: string;
    participantId: string;
    teamId: string;
    name: string;
    email: string;
    college: string;
    city?: string;
    members?: {
        name: string;
        email: string;
        college: string;
        city?: string;
        department: string;
        whatsapp: string;
        year: string;
    }[];
    department?: string;
    whatsapp?: string;
    year?: number;
    type: string;
    assignedLab?: string;
    assignedHackathonLab?: string;
    assignedSeat?: string;
    avatarUrl?: string;
    paymentScreenshotUrl?: string;
    ticketType?: 'hackathon' | 'combo';
    amountPaid?: number;

    foodAttendance?: string[]; // Array of sessions claimed
    hackathonAttendance?: boolean;
    entryGateTimestamp?: Date | string;
    exitGateTimestamp?: Date | string;
    generatedEmail?: string;
    passkey?: string;
    eventChecklist?: string[]; // Array of checked checklist item IDs
    problemAssignmentId?: string; // Reference to ProblemAssignment
    hasConfirmedProblem?: boolean;
    projectRepo?: string;
    projectTitle?: string;
    projectDocumentUrl?: string;
    projectRepoSubmittedAt?: Date | string;
    projectRepoLocked?: boolean;
    codingPlatform?: string; // Initial platform selection
    extendedSubmissionData?: {
        codingPlatforms?: string[]; // Multiple platforms used
        filesUploaded?: {
            envFile?: string;
            requirementsFile?: string;
            documentFile?: string;
            otherFiles?: string[];
        };
        submittedAt?: Date | string;
        folderPath?: string; // e.g., "/submissions/team123/"
        totalFileSize?: number; // in bytes
    };
    submissionFlags?: {
        isFlagged: boolean;
        flags: string[];
        flaggedAt?: Date | string;
        reviewedBy?: string;
        reviewStatus?: 'pending' | 'approved' | 'rejected';
        reviewNotes?: string;
    };
    submissionStatus?: 'pending' | 'verified' | 'flagged';
    submissionTime?: Date | string;
    status?: 'pending' | 'approved' | 'rejected';
    isManual?: boolean;
    createdAt: string;
}

export interface Coordinator {
    _id: string;
    name: string;
    email: string;
    role: string;
    assigned: string;
    assignedLab?: string;
}

export interface Lab {
    _id: string;
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

export interface SupportRequest {
    _id: string;
    type: 'SOS' | 'Help' | 'Complaint';
    teamId: string;
    labName: string;
    message?: string;
    status: 'Open' | 'Resolved';
    resolvedBy?: string;
    timestamp: number;
    reply?: string;
    replyTime?: number;
    repliedBy?: string;
    participantFollowUp?: string;
    acknowledged?: boolean;
    participantReaction?: 'Like' | 'Dislike';
}

export interface Log {
    _id: string;
    action: string;
    user: string;
    time: string;
    details: string;
    timestamp: number;
}

export interface Settings {
    registrationClosed: boolean;
    maintenanceMode: boolean;
    eventDate: string | Date;
    upiId: string;
    qrImageUrl: string;
    prizePool: string;
    showInternships: boolean;
    fomoConfig?: {
        hackathonCount: number;
        showFakeCounts: boolean;
        fomoDecayRate?: number;
        fomoDecayStart?: Date | string;
    };
    bufferConfig?: {
        hackathonLimit: number;
        hackathonBuffer: number;
    };
    colleges?: string[];
    cities?: string[];
    hackathonStartDate?: Date | string;
    hackathonEndDate?: Date | string;
    submissionWindowOpen?: boolean;
    submissionWindowStartTime?: Date | string;
    certificateDriveUrl?: string;
    registrationDeadline?: Date | string;

}
