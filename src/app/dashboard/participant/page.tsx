'use client';

import ParticipantDashboardV2 from '@/components/dashboards/ParticipantDashboardV2';
import { useData } from '@/lib/context/DataContext';

export default function ParticipantPage() {
    const { currentUser } = useData();
    if (!currentUser || currentUser.role !== 'participant') return null;
    return <ParticipantDashboardV2 user={currentUser} />;
}
