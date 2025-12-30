import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Vibe Coding 2026 - The Ultimate 24H Hackathon';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#020617', // brand-dark
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                {/* Glow Effects */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '600px',
                        height: '600px',
                        background: '#0ea5e9', // brand-primary
                        borderRadius: '50%',
                        opacity: '0.2',
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-10%',
                        width: '600px',
                        height: '600px',
                        background: '#82d4fa', // brand-secondary
                        borderRadius: '50%',
                        opacity: '0.2',
                        filter: 'blur(100px)',
                    }}
                />

                {/* Content Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        textAlign: 'center',
                    }}
                >
                    {/* Badge */}
                    <div
                        style={{
                            display: 'flex',
                            padding: '8px 24px',
                            borderRadius: '50px',
                            background: 'rgba(14, 165, 233, 0.15)',
                            border: '1px solid rgba(14, 165, 233, 0.3)',
                            color: '#38bdf8',
                            fontSize: 20,
                            fontWeight: 600,
                            marginBottom: 24,
                        }}
                    >
                        ANITS • Jan 5-6, 2026
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            backgroundImage: 'linear-gradient(to bottom, #ffffff, #94a3b8)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontSize: 84,
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: 12,
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <span>Ignite Your</span>
                        <span style={{ color: '#0ea5e9' }}>Creative Code.</span>
                    </div>

                    {/* Subtitle */}
                    <div
                        style={{
                            color: '#94a3b8',
                            fontSize: 32,
                            maxWidth: '800px',
                            marginBottom: 48,
                            lineHeight: 1.4,
                        }}
                    >
                        Join 500+ developers for a 24-hour hackathon to build, innovate, and win 60K+ in prizes.
                    </div>

                    {/* CTA Button */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#0ea5e9',
                            color: '#0f172a',
                            padding: '20px 48px',
                            borderRadius: '24px',
                            fontSize: 36,
                            fontWeight: 800,
                            boxShadow: '0 0 40px rgba(14, 165, 233, 0.4)',
                        }}
                    >
                        Register Now
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
