'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Participant, Coordinator, Log, User, Settings, Lab, SupportRequest } from '@/types';
import { toast } from 'sonner';

interface DataContextType {
    participants: Participant[];
    coordinators: Coordinator[];
    logs: Log[];
    currentUser: User | null;
    settings: Settings | null;
    labs: Lab[];
    supportRequests: SupportRequest[];
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    isLoading: boolean;
    error: string | null;

    // API Methods
    fetchLabs: () => Promise<void>;
    addLab: (l: Omit<Lab, '_id' | 'currentCount'>) => Promise<void>;
    updateLab: (l: Lab) => Promise<void>;
    deleteLab: (id: string) => Promise<void>;

    fetchSupportRequests: (labName?: string) => Promise<void>;
    updateSupportRequest: (id: string, status: string) => Promise<void>;

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
    allocateLabs: () => Promise<void>;
    processEmailQueue: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [currentUser, setCurrentUserState] = useState<User | null>(null);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load session from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('vibe_session');
        if (savedUser) {
            try {
                setCurrentUserState(JSON.parse(savedUser));
            } catch {
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

    // Generic fetcher with error handling
    const apiCall = async <T,>(fn: () => Promise<T>, errorMsg: string): Promise<T | null> => {
        setIsLoading(true);
        setError(null);
        try {
            return await fn();
        } catch (e) {
            console.error(e);
            setError(errorMsg);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // API Fetchers
    const fetchParticipants = useCallback(async () => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/admin/participants');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch participants');
        if (data) setParticipants(Array.isArray(data) ? data : data.participants);
    }, []);

    const fetchCoordinators = useCallback(async () => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/admin/coordinators');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch coordinators');
        if (data) setCoordinators(Array.isArray(data) ? data : data.coordinators);
    }, []);

    const fetchLogs = useCallback(async () => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/logs');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch logs');
        if (data) setLogs(data.logs);
    }, []);

    const fetchLabs = useCallback(async () => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/admin/labs');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch labs');
        if (data) setLabs(data);
    }, []);

    const fetchSupportRequests = useCallback(async (labName?: string) => {
        const url = labName ? `/api/support-requests?labName=${labName}` : '/api/support-requests';
        const data = await apiCall(async () => {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch support requests');
        if (data) setSupportRequests(data);
    }, []);

    const fetchSettings = useCallback(async () => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch settings');
        if (data) setSettings(data);
    }, []);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to update settings');
        if (data) setSettings(data);
    };

    const refreshData = useCallback(async () => {
        await fetchSettings();
        if (!currentUser) return;
        if (currentUser.role === 'admin') {
            await Promise.all([fetchParticipants(), fetchCoordinators(), fetchLogs(), fetchLabs(), fetchSupportRequests()]);
        } else if (currentUser.role === 'coordinator' || currentUser.role === 'faculty') {
            const lab = currentUser.assignedLab;
            await Promise.all([fetchParticipants(), fetchLogs(), fetchSupportRequests(lab)]);
        } else {
            await fetchParticipants();
        }
    }, [currentUser, fetchParticipants, fetchCoordinators, fetchLogs, fetchSettings, fetchLabs, fetchSupportRequests]);

    // CRUD Operations
    const addParticipant = async (p: Omit<Participant, '_id' | 'createdAt'>) => {
        await apiCall(async () => {
            const res = await fetch('/api/admin/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to add participant');
    };

    const updateParticipant = async (p: Participant) => {
        await apiCall(async () => {
            const res = await fetch(`/api/admin/participants`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: p._id, ...p }),
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to update participant');
    };

    const deleteParticipant = async (id: string) => {
        await apiCall(async () => {
            const res = await fetch(`/api/admin/participants?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to delete participant');
    };

    const addLab = async (l: Omit<Lab, '_id' | 'currentCount'>) => {
        await apiCall(async () => {
            const res = await fetch('/api/admin/labs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(l),
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to add lab');
    };

    const updateLab = async (l: Lab) => {
        await apiCall(async () => {
            const res = await fetch('/api/admin/labs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: l._id, ...l }),
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to update lab');
    };

    const deleteLab = async (id: string) => {
        await apiCall(async () => {
            const res = await fetch(`/api/admin/labs?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to delete lab');
    };

    const updateSupportRequest = async (id: string, status: string) => {
        await apiCall(async () => {
            const res = await fetch('/api/support-requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to update request');
    };

    const addCoordinator = async (c: Omit<Coordinator, '_id'>) => {
        await apiCall(async () => {
            const res = await fetch('/api/admin/coordinators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c),
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to add coordinator');
    };

    const updateCoordinator = async (c: Coordinator) => {
        await apiCall(async () => {
            const res = await fetch(`/api/admin/coordinators`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: c._id, ...c }),
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to update coordinator');
    };

    const deleteCoordinator = async (id: string) => {
        await apiCall(async () => {
            const res = await fetch(`/api/admin/coordinators?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error();
            refreshData();
        }, 'Failed to delete coordinator');
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
        } catch {
            console.error('Failed to add log');
        }
    };

    const allocateLabs = async () => {
        await apiCall(async () => {
            const res = await fetch('/api/admin/allocate', {
                method: 'POST',
            });
            if (!res.ok) throw new Error();
            toast.success('Lab allocation completed');
            refreshData();
        }, 'Failed to allocate labs');
    };

    const processEmailQueue = async () => {
        await apiCall(async () => {
            const res = await fetch('/api/admin/process-emails', {
                method: 'POST',
            });
            if (!res.ok) throw new Error();
            toast.success('Email queue processing completed');
        }, 'Failed to process email queue');
    };

    // Auto-fetch initialization
    useEffect(() => {
        fetchSettings();
        if (currentUser) {
            refreshData();
        }
    }, [currentUser, refreshData, fetchSettings]);

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
            addLog,
            settings,
            fetchSettings,
            updateSettings,
            labs,
            supportRequests,
            fetchLabs,
            addLab,
            updateLab,
            deleteLab,
            fetchSupportRequests,
            updateSupportRequest,
            allocateLabs,
            processEmailQueue
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
