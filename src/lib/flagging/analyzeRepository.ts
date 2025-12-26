
import { FlaggingConfig, DEFAULT_FLAGGING_CONFIG } from '@/types/flagging';

interface Commit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
    author: {
        login: string;
    };
}

interface AnalysisResult {
    isFlagged: boolean;
    flags: string[];
}

export async function analyzeRepository(
    owner: string,
    repo: string,
    config: FlaggingConfig = DEFAULT_FLAGGING_CONFIG
): Promise<AnalysisResult> {
    const flags: string[] = [];

    try {
        // Fetch Commits
        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`);

        if (!commitsRes.ok) {
            return { isFlagged: true, flags: ['Failed to fetch commit history. Private repo?'] };
        }

        const commits: Commit[] = await commitsRes.json();

        // 1. Minimum Commits (Low Commit Count)
        if (config.tooFewCommits.enabled && config.tooFewCommits.threshold && commits.length < config.tooFewCommits.threshold) {
            flags.push(`Low commit count (${commits.length} commits). Minimum required: ${config.tooFewCommits.threshold}.`);
        }

        // 2. Single Author (or predominantly single author) (Optional Check)
        const authors = new Set(commits.map(c => c.commit.author.email));
        if (config.singleAuthorInTeam.enabled && authors.size === 1) {
            // flags.push('Single author detected.'); // Valid for hackathons, maybe just a warning internally?
            // Keeping it quiet for now unless strictly required, or we can flag it.
            // User requirement said: "Single author in team" is a flag.
            flags.push('Repository has only one contributor in commit history.');
        }

        // 3. No Commits Before Submission (or before hackathon start)
        // Check if all commits are very recent (e.g., all within last 1 hour)
        if (commits.length > 0) {
            const firstCommit = new Date(commits[commits.length - 1].commit.author.date);
            const lastCommit = new Date(commits[0].commit.author.date);
            const durationHours = (lastCommit.getTime() - firstCommit.getTime()) / (1000 * 60 * 60);

            // If the entire project history is compressed into a very short time
            // Example: 10 commits all within 10 minutes
            // This suggests "code dump" or "uploading existing project"
            if (config.inconsistentCommitTiming.enabled && durationHours < 0.5 && commits.length > 5) {
                flags.push('Suspicious commit timing: All commits created within 30 minutes.');
            }
        }

        // 4. Large Code Dumps (Large additions in single commit)
        // Requires fetching individual commits, which might be rate limited.
        // Skipping for MVP to avoid API limits, unless we use GraphQL.

        // 5. Commit Message Quality
        const poorMessages = commits.filter(c => {
            const msg = c.commit.message.toLowerCase();
            return msg === 'update' || msg === '.' || msg === 'fix' || msg === 'upload';
        }).length;

        if (config.emptyOrMinimalCommits.enabled && poorMessages > (commits.length * 0.5)) {
            flags.push('Low quality commit messages detected (e.g. "update", ".", "fix").');
        }

    } catch (error) {
        console.error('Error analyzing repo:', error);
        flags.push('Error analyzing repository history.');
    }

    return {
        isFlagged: flags.length > 0,
        flags
    };
}
