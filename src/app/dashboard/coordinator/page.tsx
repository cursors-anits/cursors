'use client';

import CoordinatorDashboardV2 from '@/components/dashboards/CoordinatorDashboardV2';
import { useData } from '@/lib/context/DataContext';

export default function CoordinatorPage() {
    const { currentUser } = useData();
    if (!currentUser || currentUser.role !== 'coordinator') return null;
    return <CoordinatorDashboardV2 user={currentUser} />;
}
