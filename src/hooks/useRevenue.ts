
import { useMemo } from 'react';
import { Participant } from '@/types';

export function useRevenue(participants: Participant[]) {
    return useMemo(() => {
        // Group by team (include manual participants for team size calculation)
        const teams = participants.reduce((acc, p) => {
            if (!acc[p.teamId]) acc[p.teamId] = [];
            acc[p.teamId].push(p);
            return acc;
        }, {} as Record<string, typeof participants>);

        return Object.values(teams).reduce((acc, members) => {
            const size = members.length;
            // Use ticket type from the first member, defaulting if missing
            const firstMember = members[0];
            const type = firstMember.ticketType || (firstMember.type.toLowerCase().includes('combo') ? 'combo' : 'hackathon');

            let basePrice = 349;
            if (type === 'combo') basePrice = 499;

            const discountPerPerson = size > 1 ? (size - 1) * 10 : 0;
            const finalPricePerPerson = basePrice - discountPerPerson;

            // Count paid members (Strictly exclude manual participants from revenue)
            const paidMembers = members.filter(m => !m.isManual && m.paymentScreenshotUrl).length;

            return acc + (paidMembers * finalPricePerPerson);
        }, 0);
    }, [participants]);
}
