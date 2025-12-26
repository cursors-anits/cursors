// Flagging criteria configuration types

export interface FlaggingCriteria {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    threshold?: number;
}

export interface FlaggingConfig {
    repoCreatedBeforeHackathon: FlaggingCriteria;
    tooFewCommits: FlaggingCriteria; // threshold: minimum commits
    suspiciousCommitGaps: FlaggingCriteria; // threshold: max hours between commits
    largeCodeDumps: FlaggingCriteria; // threshold: max additions in single commit
    singleAuthorInTeam: FlaggingCriteria;
    noCommitsAfterSubmission: FlaggingCriteria; // threshold: hours before submission
    inconsistentCommitTiming: FlaggingCriteria; // all commits at odd hours
    emptyOrMinimalCommits: FlaggingCriteria; // threshold: min lines per commit
}

export const DEFAULT_FLAGGING_CONFIG: FlaggingConfig = {
    repoCreatedBeforeHackathon: {
        id: 'repo-before-hackathon',
        name: 'Repository Created Before Hackathon',
        description: 'Flag if repo was created before hackathon start time',
        enabled: true
    },
    tooFewCommits: {
        id: 'too-few-commits',
        name: 'Too Few Commits',
        description: 'Flag if team has very few commits throughout hackathon',
        enabled: true,
        threshold: 5 // minimum commits
    },
    suspiciousCommitGaps: {
        id: 'suspicious-gaps',
        name: 'Suspicious Commit Gaps',
        description: 'Flag if there are unusually long gaps between commits',
        enabled: true,
        threshold: 48 // hours
    },
    largeCodeDumps: {
        id: 'large-dumps',
        name: 'Large Code Dumps',
        description: 'Flag if single commit has massive code addition',
        enabled: true,
        threshold: 5000 // lines added
    },
    singleAuthorInTeam: {
        id: 'single-author',
        name: 'Single Author in Team',
        description: 'Flag if only one person committed in a multi-person team',
        enabled: true
    },
    noCommitsAfterSubmission: {
        id: 'no-recent-commits',
        name: 'No Commits Before Submission',
        description: 'Flag if no commits in final hours before submission',
        enabled: true,
        threshold: 12 // hours
    },
    inconsistentCommitTiming: {
        id: 'odd-timing',
        name: 'Inconsistent Commit Timing',
        description: 'Flag if all commits happen at unusual times (e.g., all at 3 AM)',
        enabled: false
    },
    emptyOrMinimalCommits: {
        id: 'minimal-commits',
        name: 'Empty or Minimal Commits',
        description: 'Flag if commits have very few actual code changes',
        enabled: true,
        threshold: 10 // min lines per commit on average
    }
};
