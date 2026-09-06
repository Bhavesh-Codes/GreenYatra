import { supabase } from '@/lib/supabase';
import type { AuthTokenResponsePassword } from '@supabase/supabase-js';

export type UserRole = 'traveler' | 'hotel';

/**
 * Registers a user server-side via Supabase Admin API with auto-confirmed email,
 * then immediately signs in to establish a valid client session.
 */
export async function signUpUser(
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'traveler'
): Promise<AuthTokenResponsePassword> {
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, role })
        });

        const regData = await res.json();
        if (!res.ok || !regData.success) {
            return {
                data: { user: null, session: null },
                error: new Error(regData.error || 'Failed to register account') as any
            };
        }
    } catch (err: unknown) {
        const e = err as Error;
        return {
            data: { user: null, session: null },
            error: e as any
        };
    }

    // Immediately sign in to establish client session with confirmed user
    return await supabase.auth.signInWithPassword({
        email,
        password
    });
}

/**
 * Signs in an existing user with email and password.
 */
export async function signInUser(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
        email,
        password
    });
}

/**
 * Logs out the current user session.
 */
export async function logoutUser() {
    return await supabase.auth.signOut();
}
