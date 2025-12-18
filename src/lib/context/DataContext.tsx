'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Participant, Coordinator, Log, User } from '@/types';

interface DataContextType {
    participants: Participant[];
    coordinators: Coordinator[];
    logs: Log[];
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;

    // Auth
    setCurrentUser: (user: User | null) => void;
    logout: () => void;

    // API Methods
    fetchParticipants: () => Promise<void>;
    fetchCoordinators: () => Promise<void>;
    fetchLogs: () => Promise<void>;

    addParticipant: (p: Omit<Participant, '_id' | 'createdAt'>) => Promise<void>;
    updateParticipant: (p: Participant) => Promise<void>;
    deleteParticipant: (id: string) => Promise<void>;

    addCoordinator: (c: Omit<Coordinator, '_id'>) => Promise<void>;
    updateCoordinator: (c: Coordinator) => Promise<void>;
    deleteCoordinator: (id: string) => Promise<void>;

    addLog: (action: string, details: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [currentUser, setCurrentUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load session from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('vibe_session');
        if (savedUser) {
            try {
                setCurrentUserState(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('vibe_session');
            }
        }
    }, []);

    const setCurrentUser = (user: User | null) => {
        setCurrentUserState(user);
        if (user) {
            localStorage.setItem('vibe_session', JSON.stringify(user));
            // Set cookie for middleware (expires in 30 days)
            document.cookie = `vibe_session=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
        } else {
            localStorage.removeItem('vibe_session');
            document.cookie = 'vibe_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    // API Fetchers
    const fetchParticipants = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/participants');
            const data = await res.json();
            if (res.ok) setParticipants(data.participants);
        } catch (e) {
            setError('Failed to fetch participants');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCoordinators = useCallback(async () => {
        try {
            const res = await fetch('/api/coordinators');
            const data = await res.json();
            if (res.ok) setCoordinators(data.coordinators);
        } catch (e) {
            setError('Failed to fetch coordinators');
        }
    }, []);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch('/api/logs');
            const data = await res.json();
            if (res.ok) setLogs(data.logs);
        } catch (e) {
            setError('Failed to fetch logs');
        }
    }, []);

    // CRUD Operations
    const addParticipant = async (p: Omit<Participant, '_id' | 'createdAt'>) => {
        try {
            const res = await fetch('/api/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
            });
            if (res.ok) fetchParticipants();
        } catch (e) {
            setError('Failed to add participant');
        }
    };

    const updateParticipant = async (p: Participant) => {
        try {
            const res = await fetch(`/api/participants?id=${p._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
            });
            if (res.ok) fetchParticipants();
        } catch (e) {
            setError('Failed to update participant');
        }
    };

    const deleteParticipant = async (id: string) => {
        try {
            const res = await fetch(`/api/participants?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchParticipants();
        } catch (e) {
            setError('Failed to delete participant');
        }
    };

    const addCoordinator = async (c: Omit<Coordinator, '_id'>) => {
        try {
            const res = await fetch('/api/coordinators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c),
            });
            if (res.ok) fetchCoordinators();
        } catch (e) {
            setError('Failed to add coordinator');
        }
    };

    const updateCoordinator = async (c: Coordinator) => {
        try {
            const res = await fetch(`/api/coordinators?id=${c._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c),
            });
            if (res.ok) fetchCoordinators();
        } catch (e) {
            setError('Failed to update coordinator');
        }
    };

    const deleteCoordinator = async (id: string) => {
        try {
            const res = await fetch(`/api/coordinators?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchCoordinators();
        } catch (e) {
            setError('Failed to delete coordinator');
        }
    };

    const addLog = async (action: string, details: string) => {
        if (!currentUser) return;
        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    user: currentUser.name,
                    time: new Date().toLocaleTimeString(),
                    details,
                }),
            });
            fetchLogs();
        } catch (e) {
            console.error('Failed to add log');
        }
    };

    // Auto-fetch if user is admin or coordinator
    useEffect(() => {
        if (currentUser?.role === 'admin') {
            fetchParticipants();
            fetchCoordinators();
            fetchLogs();
        } else if (currentUser?.role === 'coordinator') {
            fetchParticipants();
        }
    }, [currentUser, fetchParticipants, fetchCoordinators, fetchLogs]);

    return (
        <DataContext.Provider value={{
            participants,
            coordinators,
            logs,
            currentUser,
            isLoading,
            error,
            setCurrentUser,
            logout,
            fetchParticipants,
            fetchCoordinators,
            fetchLogs,
            addParticipant,
            updateParticipant,
            deleteParticipant,
            addCoordinator,
            updateCoordinator,
            deleteCoordinator,
            addLog
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
