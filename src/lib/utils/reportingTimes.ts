// Reporting time configurations by ticket type

export interface ReportingTimeInfo {
    time: string;
    date: string;
    dayLabel: string;
    fullDescription: string;
}

export interface ComboReportingTime {
    workshopTime: string;
    workshopDate: string;
    workshopDayLabel: string;
    hackathonNote: string;
    fullDescription: string;
}

export const REPORTING_TIMES = {
    Workshop: {
        time: '8:30 AM',
        date: 'Friday, January 2, 2026',
        dayLabel: 'Day 1',
        fullDescription: 'All workshop participants must report to the venue by 8:30 AM on Friday, January 2, 2026 (Day 1)'
    } as ReportingTimeInfo,

    Hackathon: {
        time: '12:30 PM',
        date: 'Monday, January 5, 2026',
        dayLabel: 'Day 4',
        fullDescription: 'All hackathon participants must report to the venue by 12:30 PM on Monday, January 5, 2026 (Day 4)'
    } as ReportingTimeInfo,

    Combo: {
        workshopTime: '8:30 AM',
        workshopDate: 'Friday, January 2, 2026',
        workshopDayLabel: 'Day 1',
        hackathonNote: 'Hackathon reporting time will be announced at the end of the workshop',
        fullDescription: 'Workshop: Report at 8:30 AM on Friday, January 2, 2026 (Day 1). Hackathon reporting time will be announced during the workshop.'
    } as ComboReportingTime
};

export function getReportingTime(ticketType: 'Workshop' | 'Hackathon' | 'Combo') {
    return REPORTING_TIMES[ticketType];
}

export function getReportingTimeHTML(ticketType: 'Workshop' | 'Hackathon' | 'Combo'): string {
    const info = REPORTING_TIMES[ticketType];

    if (ticketType === 'Combo') {
        const comboInfo = info as ComboReportingTime;
        return `
            <strong>Workshop:</strong> ${comboInfo.workshopTime} on ${comboInfo.workshopDate} (${comboInfo.workshopDayLabel})<br/>
            <strong>Hackathon:</strong> ${comboInfo.hackathonNote}
        `;
    } else {
        const singleInfo = info as ReportingTimeInfo;
        return `${singleInfo.time} on <strong>${singleInfo.date} (${singleInfo.dayLabel})</strong>`;
    }
}
