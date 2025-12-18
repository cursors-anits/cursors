'use client';

import CoordinatorDashboard from '@/components/dashboards/CoordinatorDashboard';
import { useData } from '@/lib/context/DataContext';

export default function CoordinatorPage() {
    const { currentUser } = useData();
    if (!currentUser || currentUser.role !== 'coordinator') return null;
    return <CoordinatorDashboard user={currentUser} />;
}
