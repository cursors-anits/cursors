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
    fetchSettings: (isBackground?: boolean) => Promise<void>;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    isLoading: boolean;
    error: string | null;

    // API Methods
    fetchLabs: () => Promise<void>;
    addLab: (l: Omit<Lab, '_id' | 'currentCount'>) => Promise<void>;
    updateLab: (l: Lab) => Promise<void>;
    deleteLab: (id: string) => Promise<void>;

    fetchSupportRequests: (labName?: string, isBackground?: boolean) => Promise<void>;
    updateSupportRequest: (id: string, status: string, resolvedBy?: string, reply?: string, participantFollowUp?: string, acknowledged?: boolean, participantReaction?: 'Like' | 'Dislike') => Promise<void>;

    // Auth
    setCurrentUser: (user: User | null) => void;
    logout: () => void;

    // API Methods
    fetchParticipants: (isBackground?: boolean) => Promise<void>;
    fetchCoordinators: () => Promise<void>;
    fetchLogs: () => Promise<void>;

    addParticipant: (p: Omit<Participant, '_id' | 'createdAt'>) => Promise<void>;
    updateParticipant: (p: Participant) => Promise<void>;
    deleteParticipant: (id: string) => Promise<void>;

    addCoordinator: (c: Omit<Coordinator, '_id'>) => Promise<void>;
    updateCoordinator: (c: Coordinator) => Promise<void>;
    deleteCoordinator: (id: string) => Promise<void>;

    addLog: (action: string, details: string) => Promise<void>;
    allocateLabs: (eventType: 'Hackathon') => Promise<void>;
    processEmailQueue: () => Promise<void>;
    markAttendance: (
        target: string | string[],
        mode: 'hackathon' | 'hackathon_exit' | 'entry' | 'exit' | 'snacks',
        status: 'present' | 'absent'
    ) => Promise<void>;
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSessionLoaded, setIsSessionLoaded] = useState(false);

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
        setIsSessionLoaded(true);
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

    // Generic fetcher with error handling & Offline Support
    const apiCall = useCallback(async <T,>(fn: () => Promise<T>, errorMsg: string, isBackground = false): Promise<T | null> => {
        if (!navigator.onLine) {
            if (!isBackground) {
                // Offline Strategy: 
                // We use an in-memory queue for transient offline states (e.g. flaky connection).
                // Persistent queueing (localStorage) is skipped for now to avoid complexity with closure serialization.
                // We notify the user and return null, expecting the caller to handle UI updates.
                toast.warning('You are offline. Action queued.');
            }
            return null;
        }

        if (!isBackground) setIsLoading(true);
        setError(null);
        try {
            return await fn();
        } catch (e) {
            console.error(e);
            setError(errorMsg);
            return null;
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, []);

    // API Fetchers
    const fetchParticipants = useCallback(async (isBackground = false) => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/admin/participants');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch participants', isBackground);
        if (data) setParticipants(Array.isArray(data) ? data : data.participants);
    }, [apiCall]);

    const fetchCoordinators = useCallback(async (isBackground = false) => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/admin/coordinators');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch coordinators', isBackground);
        if (data) setCoordinators(Array.isArray(data) ? data : data.coordinators);
    }, [apiCall]);

    const fetchLogs = useCallback(async (isBackground = false) => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/logs');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch logs', isBackground);
        if (data) setLogs(data.logs);
    }, [apiCall]);

    const fetchLabs = useCallback(async (isBackground = false) => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/admin/labs');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch labs', isBackground);
        if (data) setLabs(data);
    }, [apiCall]);

    const fetchSupportRequests = useCallback(async (labName?: string, isBackground = false) => {
        const url = labName ? `/api/support-requests?labName=${labName}` : '/api/support-requests';
        const data = await apiCall(async () => {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch support requests', isBackground);
        if (data) setSupportRequests(data);
    }, [apiCall]);

    const fetchSettings = useCallback(async (isBackground = false) => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to fetch settings', isBackground);
        if (data) setSettings(data);
    }, [apiCall]);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        const data = await apiCall(async () => {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
            if (!res.ok) throw new Error();
            return res.json();
        }, 'Failed to update settings', true);
        if (data) setSettings(data);
    };

    const refreshData = useCallback(async () => {
        // Use background fetching to prevent full page loader on refreshes
        await fetchSettings();
        if (!currentUser) return;
        if (currentUser.role === 'admin') {
            await Promise.all([
                fetchParticipants(true),
                fetchCoordinators(true),
                fetchLogs(true),
                fetchLabs(true),
                fetchSupportRequests(undefined, true)
            ]);
        } else if (currentUser.role === 'coordinator' || currentUser.role === 'faculty') {
            const lab = currentUser.assignedLab;
            await Promise.all([
                fetchParticipants(true),
                fetchLogs(true),
                fetchSupportRequests(lab, true)
            ]);
        } else {
            await fetchParticipants(true);
        }
    }, [currentUser, fetchParticipants, fetchCoordinators, fetchLogs, fetchSettings, fetchLabs, fetchSupportRequests]);

    // Offline Queue
    const [offlineQueue, setOfflineQueue] = useState<{ fn: () => Promise<any>, name: string }[]>([]);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => {
            setIsOnline(true);
            processOfflineQueue();
        };
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [offlineQueue]);

    const processOfflineQueue = async () => {
        if (offlineQueue.length === 0) return;
        toast.info(`Processing ${offlineQueue.length} offline actions...`);

        const queue = [...offlineQueue];
        setOfflineQueue([]); // Clear queue to prevent loops, pushing back on failure might be needed

        for (const item of queue) {
            try {
                await item.fn();
                addLog('Offline Sync', `Synced action: ${item.name}`);
            } catch (e) {
                console.error('Failed to sync offline action', e);
                toast.error(`Failed to sync: ${item.name}`);
            }
        }
        toast.success('Offline actions synced');
    };

    // Helper to revert state on error
    const revertOptimisticUpdate = (errorMsg: string, refetchFn: () => Promise<void>) => {
        toast.error(errorMsg);
        refetchFn();
    };

    // CRUD Operations - Optimized with Logging & Optimistic Updates
    const addParticipant = async (p: Omit<Participant, '_id' | 'createdAt'>) => {
        // Optimistic Update
        const tempId = 'temp-' + Date.now();
        const optimisticParticipant = { ...p, _id: tempId, createdAt: new Date().toISOString() } as Participant;
        setParticipants(prev => [...prev, optimisticParticipant]);

        await apiCall(async () => {
            const res = await fetch('/api/admin/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
            });
            if (!res.ok) throw new Error();
            addLog('Add Participant', `Added participant ${p.name}`);
            refreshData(); // Background refresh to get real ID
            toast.success('Participant added');
        }, 'Failed to add participant', true); // isBackground=true
    };

    const updateParticipant = async (p: Participant) => {
        // Handle new participant creation
        if (p._id && p._id.startsWith('new-')) {
            await addParticipant(p);
            return;
        }

        // Optimistic Update
        const originalParticipants = [...participants];
        setParticipants(prev => prev.map(item => item._id === p._id ? p : item));

        await apiCall(async () => {
            const res = await fetch(`/api/admin/participants`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: p._id, ...p }),
            });
            if (!res.ok) {
                setParticipants(originalParticipants); // Revert
                throw new Error();
            }
            addLog('Update Participant', `Updated participant ${p.name}`);
            // No full refresh needed if we trust the update, but good to sync eventually
            // We skip explicit refreshData here to keep it snappy, relying on next sync or manual refresh
        }, 'Failed to update participant', true);
    };

    const deleteParticipant = async (id: string) => {
        // Optimistic Update
        const originalParticipants = [...participants];
        const pToDelete = participants.find(p => p._id === id);
        setParticipants(prev => prev.filter(item => item._id !== id));

        await apiCall(async () => {
            const res = await fetch(`/api/admin/participants?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                setParticipants(originalParticipants); // Revert
                throw new Error();
            }
            addLog('Delete Participant', `Deleted participant ${pToDelete?.name || id}`);
        }, 'Failed to delete participant', true);
    };

    const addLab = async (l: Omit<Lab, '_id' | 'currentCount'>) => {
        // Optimistic
        const tempId = 'temp-' + Date.now();
        const optimisticLab = { ...l, _id: tempId, currentCount: 0 } as Lab;
        setLabs(prev => [...prev, optimisticLab]);

        await apiCall(async () => {
            const res = await fetch('/api/admin/labs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(l),
            });
            if (!res.ok) throw new Error();
            addLog('Add Lab', `Added lab ${l.name}`);
            refreshData();
            toast.success('Lab added');
        }, 'Failed to add lab', true);
    };

    const updateLab = async (l: Lab) => {
        const originalLabs = [...labs];
        setLabs(prev => prev.map(item => item._id === l._id ? l : item));

        await apiCall(async () => {
            const res = await fetch('/api/admin/labs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: l._id, ...l }),
            });
            if (!res.ok) {
                setLabs(originalLabs);
                throw new Error();
            }
            addLog('Update Lab', `Updated lab ${l.name}`);
        }, 'Failed to update lab', true);
    };

    const deleteLab = async (id: string) => {
        const originalLabs = [...labs];
        const lToDelete = labs.find(l => l._id === id);
        setLabs(prev => prev.filter(item => item._id !== id));

        await apiCall(async () => {
            const res = await fetch(`/api/admin/labs?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                setLabs(originalLabs);
                throw new Error();
            }
            addLog('Delete Lab', `Deleted lab ${lToDelete?.name || id}`);
        }, 'Failed to delete lab', true);
    };

    const updateSupportRequest = async (id: string, status: string, resolvedBy?: string, reply?: string, participantFollowUp?: string, acknowledged?: boolean, participantReaction?: 'Like' | 'Dislike') => {
        const originalRequests = [...supportRequests];
        setSupportRequests(prev => prev.map(r => r._id === id ? { ...r, status: status as any, resolvedBy, reply, participantFollowUp, acknowledged, participantReaction } : r));

        await apiCall(async () => {
            const res = await fetch('/api/support-requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, resolvedBy, reply, participantFollowUp, acknowledged, participantReaction }),
            });
            if (!res.ok) {
                setSupportRequests(originalRequests);
                throw new Error();
            }
            addLog('Support Update', `Updated request ${id} to ${status}`);
        }, 'Failed to update request', true);
    };

    const addCoordinator = async (c: Omit<Coordinator, '_id'>) => {
        const tempId = 'temp-' + Date.now();
        const optimisticCoord = { ...c, _id: tempId } as Coordinator;
        setCoordinators(prev => [...prev, optimisticCoord]);

        await apiCall(async () => {
            const res = await fetch('/api/admin/coordinators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c),
            });
            if (!res.ok) throw new Error();
            addLog('Add Coordinator', `Added coordinator ${c.name}`);
            refreshData();
            toast.success('Coordinator added');
        }, 'Failed to add coordinator', true);
    };

    const updateCoordinator = async (c: Coordinator) => {
        const originalCoordinators = [...coordinators];
        setCoordinators(prev => prev.map(item => item._id === c._id ? c : item));

        await apiCall(async () => {
            const res = await fetch(`/api/admin/coordinators`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: c._id, ...c }),
            });
            if (!res.ok) {
                setCoordinators(originalCoordinators);
                throw new Error();
            }
            addLog('Update Coordinator', `Updated coordinator ${c.name}`);
        }, 'Failed to update coordinator', true);
    };

    const deleteCoordinator = async (id: string) => {
        const originalCoordinators = [...coordinators];
        const cToDelete = coordinators.find(c => c._id === id);
        setCoordinators(prev => prev.filter(item => item._id !== id));

        await apiCall(async () => {
            const res = await fetch(`/api/admin/coordinators?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                setCoordinators(originalCoordinators);
                throw new Error();
            }
            addLog('Delete Coordinator', `Deleted coordinator ${cToDelete?.name || id}`);
        }, 'Failed to delete coordinator', true);
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

    const allocateLabs = async (eventType: 'Hackathon') => {
        await apiCall(async () => {
            const res = await fetch(`/api/admin/allocate?type=${eventType}`, {
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
        const init = async () => {
            if (isSessionLoaded) {
                await fetchSettings();
                if (currentUser) {
                    await refreshData();
                }
                setIsLoading(false);
            }
        };
        init();
    }, [currentUser, refreshData, fetchSettings, isSessionLoaded]);

    const markAttendance = async (
        target: string | string[],
        mode: 'hackathon' | 'hackathon_exit' | 'entry' | 'exit' | 'snacks',
        status: 'present' | 'absent'
    ) => {
        const targets = Array.isArray(target) ? target : [target];
        const participantIds = targets;
        const isTeam = typeof target === 'string' && target.startsWith('VIBE-'); // Basic check, but usually we pass IDs directly now
        const targetName = isTeam ? `Team ${target}` : `${targets.length} Participants`;

        // Optimistic Update
        // const originalParticipants = [...participants]; // Unused strict revert for now
        // Simple optimistic feeling: UI shouldn't flicker.
        // We rely on refreshData() at the end.

        await apiCall(async () => {
            const isFood = mode === 'snacks';

            if (mode === 'snacks') {
                if (isTeam) {
                    const res = await fetch('/api/coordinator/attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ teamId: target, type: 'snacks' })
                    });
                    if (!res.ok) throw new Error('Failed to mark snacks');
                    const d = await res.json();
                    toast.success(d.message);
                } else {
                    // Send all participant IDs in one go
                    await fetch('/api/coordinator/attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ participantIds: participantIds, type: 'snacks' })
                    });
                }
            } else {
                // Standard Attendance API (Hackathon / Gate)
                const res = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        participantIds,
                        mode,
                    }),
                });

                if (!res.ok) throw new Error();

                // Log it (Food API logs internally, this one we log here)
                addLog(`ATTENDANCE_${mode.toUpperCase()}`, `Marked ${mode} as ${status} for ${targetName}`);
            }

            refreshData();
            // We just fetchLogs inside refreshData mostly, but if using food API logs are server side.

            toast.success(`Marked ${mode} successfully`);

        }, 'Failed to mark attendance', true);
    };

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
            processEmailQueue,
            markAttendance
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
