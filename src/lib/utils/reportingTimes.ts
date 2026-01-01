// Reporting time configurations by ticket type

export interface ReportingTimeInfo {
    time: string;
    date: string;
    dayLabel: string;
    fullDescription: string;
}



export const REPORTING_TIMES = {
    Hackathon: {
        time: '10:00 AM',
        date: 'Monday, January 5, 2026',
        dayLabel: 'Day 1',
        fullDescription: 'All hackathon participants must report to the venue by 10:00 AM on Monday, January 5, 2026 (Day 1)'
    } as ReportingTimeInfo,
    Online: {
        time: 'Flexible',
        date: 'Jan 5-6, 2026',
        dayLabel: 'Virtual',
        fullDescription: 'Online participants can join remotely. Submission window opens on Jan 5th.'
    } as ReportingTimeInfo
};

export function getReportingTime(ticketType: 'Hackathon' | 'Online') {
    return REPORTING_TIMES[ticketType];
}

export function getReportingTimeHTML(ticketType: 'Hackathon' | 'Online'): string {
    const info = REPORTING_TIMES[ticketType];
    return `${info.time} on <strong>${info.date} (${info.dayLabel})</strong>`;
}
