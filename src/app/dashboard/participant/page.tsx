'use client';

import ParticipantDashboard from '@/components/dashboards/ParticipantDashboard';
import { useData } from '@/lib/context/DataContext';

export default function ParticipantPage() {
    const { currentUser } = useData();
    if (!currentUser || currentUser.role !== 'participant') return null;
    return <ParticipantDashboard user={currentUser} />;
}
