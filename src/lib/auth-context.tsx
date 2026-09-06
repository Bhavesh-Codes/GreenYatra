'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: 'traveler' | 'hotel';
}

export interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSessionToProfile(session: Session | null): UserProfile | null {
    if (!session?.user) return null;
    const u = session.user;
    const email = u.email || '';
    const emailPrefix = email ? email.split('@')[0] : 'User';
    const metadata = u.user_metadata || {};
    const fullName =
        (metadata.full_name as string) ||
        (metadata.name as string) ||
        emailPrefix;
    const rawRole = (metadata.role as string)?.toLowerCase();
    const role: 'traveler' | 'hotel' = rawRole === 'hotel' ? 'hotel' : 'traveler';

    return {
        id: u.id,
        email,
        fullName,
        role
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let mounted = true;

        // 1. Fetch active session on mount
        supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
            if (error) {
                console.warn('[Auth] Error getting session:', error.message);
            }
            if (mounted) {
                setSession(initialSession);
                setUser(mapSessionToProfile(initialSession));
                setIsLoading(false);
            }
        });

        // 2. Subscribe to auth state changes
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            if (mounted) {
                setSession(currentSession);
                setUser(mapSessionToProfile(currentSession));
                setIsLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('[Auth] Error signing out:', err);
        } finally {
            setSession(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
