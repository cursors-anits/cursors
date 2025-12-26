// Shared problem statements data for both public display and allocation

export const PROBLEM_STATEMENTS = [
    {
        domain: 'Artificial Intelligence & Machine Learning',
        problems: [
            'Build an AI system to detect plagiarism in academic submissions with explainable results',
            'Develop a chatbot for college student support (admissions, exams, placements)',
            'Create a model to predict student dropout risk using historical data',
            'Design an AI agent for resume screening and skill-gap analysis',
            'Build a fake news detection platform for regional languages',
            'AI agents for daily automation'
        ]
    },
    {
        domain: 'Sustainability & Green Tech',
        problems: [
            'Smart waste segregation system using IoT + AI',
            'Carbon footprint tracker for individuals and institutions',
            'AI-based crop disease detection using mobile images',
            'Energy optimization system for smart campuses',
            'Water leakage detection and monitoring system'
        ]
    },
    {
        domain: 'Healthcare & BioTech',
        problems: [
            'Remote patient monitoring dashboard using wearable data',
            'AI tool for early detection of diabetes/heart disease',
            'Hospital queue & appointment management system',
            'Mental health support chatbot for students',
            'Drug reminder & adherence mobile app'
        ]
    },
    {
        domain: 'Smart Cities & IoT',
        problems: [
            'Smart traffic signal system to reduce congestion',
            'IoT-based streetlight automation for energy saving',
            'Smart parking solution with real-time availability',
            'Flood monitoring and early warning system',
            'Air quality monitoring and alert platform'
        ]
    },
    {
        domain: 'EdTech & Skill Development',
        problems: [
            'Personalized learning platform using AI recommendations',
            'Virtual lab for engineering experiments',
            'LMS with analytics for faculty performance tracking',
            'Skill assessment & certification platform for colleges',
            'Peer-to-peer doubt solving app for students',
            'Tools improving campus life or student productivity'
        ]
    },
    {
        domain: 'FinTech & Blockchain',
        problems: [
            'Expense tracker with AI-based financial insights',
            'Fraud detection system for online transactions',
            'Blockchain-based certificate verification system',
            'Digital wallet for campus transactions',
            'Credit scoring model for underserved users'
        ]
    },
    {
        domain: 'Cybersecurity',
        problems: [
            'Phishing detection browser plugin',
            'Secure file sharing platform with encryption',
            'Intrusion detection dashboard for networks',
            'Password strength & breach alert system',
            'Cyber awareness training simulator'
        ]
    },
    {
        domain: 'AgriTech',
        problems: [
            'Smart irrigation system using sensors and weather data',
            'Crop price prediction platform for farmers',
            'Marketplace app connecting farmers directly to buyers',
            'AI chatbot for farming advisory in local languages',
            'Soil health analysis tool'
        ]
    },
    {
        domain: 'Industry 4.0 & Automation',
        problems: [
            'Predictive maintenance system for machinery',
            'Robotic process automation (RPA) for office workflows',
            'Digital twin for manufacturing units',
            'Supply chain optimization dashboard',
            'Quality inspection using computer vision'
        ]
    },
    {
        domain: 'Social Impact & Governance',
        problems: [
            'Grievance redressal platform for citizens',
            'Missing person identification using AI',
            'Donation & NGO transparency platform',
            'Women safety app with real-time alerts',
            'Accessibility tool for visually/hearing impaired users',
            'Apps supporting local community needs'
        ]
    },
    {
        domain: 'AR/VR & Metaverse',
        problems: [
            'VR-based campus tour for admissions',
            'AR learning app for engineering concepts',
            'Virtual job fair platform',
            'VR safety training for industries',
            'Metaverse collaboration space for teams'
        ]
    },
    {
        domain: 'Open Innovation / Student Choice',
        problems: [
            'Any innovative solution addressing a real-world problem'
        ]
    }
];

export function getAllProblems() {
    const problems: { domainIndex: number; problemIndex: number; domain: string; problem: string }[] = [];
    PROBLEM_STATEMENTS.forEach((domain, dIdx) => {
        domain.problems.forEach((problem, pIdx) => {
            problems.push({
                domainIndex: dIdx,
                problemIndex: pIdx,
                domain: domain.domain,
                problem
            });
        });
    });
    return problems;
}

export function getProblem(domainIndex: number, problemIndex: number) {
    const domain = PROBLEM_STATEMENTS[domainIndex];
    if (!domain) return null;

    const problem = domain.problems[problemIndex];
    if (!problem) return null;

    return {
        domainIndex,
        problemIndex,
        domain: domain.domain,
        problem
    };
}

export function randomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
