'use client';

import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { useData } from '@/lib/context/DataContext';

export default function AdminPage() {
    const { currentUser } = useData();
    if (!currentUser || currentUser.role !== 'admin') return null;
    return <AdminDashboard user={currentUser} />;
}
