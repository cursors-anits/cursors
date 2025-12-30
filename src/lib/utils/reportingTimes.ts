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
    } as ReportingTimeInfo
};

export function getReportingTime(ticketType: 'Hackathon') {
    return REPORTING_TIMES[ticketType];
}

export function getReportingTimeHTML(ticketType: 'Hackathon'): string {
    const info = REPORTING_TIMES[ticketType];
    return `${info.time} on <strong>${info.date} (${info.dayLabel})</strong>`;
}
