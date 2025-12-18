import React from 'react';

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

// Team & Registration
export interface TeamMember {
    fullName: string;
    department: string;
    whatsapp: string;
    year: string;
    linkedin?: string;
}

export interface FormData {
    college: string;
    otherCollege?: string;
    city: string;
    otherCity?: string;
    ticketType: 'workshop' | 'hackathon' | 'combo';
    teamSize: number;
    members: TeamMember[];
    transactionId: string;
    screenshot?: File | null;
}

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
    assignedLab?: string; // For coordinators
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
    type: string;
    status: string;
    assignedLab?: string;
    assignedSeat?: string;
    paymentScreenshotUrl?: string;
    createdAt: string;
}

export interface Coordinator {
    _id: string;
    name: string;
    email: string;
    role: string;
    assigned: string;
}

export interface Log {
    _id: string;
    action: string;
    user: string;
    time: string;
    details: string;
    timestamp: number;
}
