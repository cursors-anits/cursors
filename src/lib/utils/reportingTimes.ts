// Reporting time configurations by ticket type

export interface ReportingTimeInfo {
    time: string;
    date: string;
    dayLabel: string;
    fullDescription: string;
}



export const REPORTING_TIMES = {
    Hackathon: {
        time: '12:30 PM',
        date: 'Monday, January 5, 2026',
        dayLabel: 'Day 4',
        fullDescription: 'All hackathon participants must report to the venue by 12:30 PM on Monday, January 5, 2026 (Day 4)'
    } as ReportingTimeInfo
};

export function getReportingTime(ticketType: 'Hackathon') {
    return REPORTING_TIMES[ticketType];
}

export function getReportingTimeHTML(ticketType: 'Hackathon'): string {
    const info = REPORTING_TIMES[ticketType];
    return `${info.time} on <strong>${info.date} (${info.dayLabel})</strong>`;
}
