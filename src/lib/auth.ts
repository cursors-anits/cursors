import { cookies } from 'next/headers';

export async function getServerSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('vibe_session');

        if (!sessionCookie) return null;

        const user = JSON.parse(decodeURIComponent(sessionCookie.value));
        return user;
    } catch (error) {
        return null;
    }
}

export async function isAdmin() {
    const session = await getServerSession();
    return session?.role === 'admin';
}
