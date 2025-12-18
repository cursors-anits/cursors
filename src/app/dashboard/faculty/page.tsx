'use client';

import FacultyDashboard from '@/components/dashboards/FacultyDashboard';
import { useData } from '@/lib/context/DataContext';

export default function FacultyPage() {
    const { currentUser } = useData();
    if (!currentUser || currentUser.role !== 'faculty') return null;
    return <FacultyDashboard user={currentUser} />;
}
