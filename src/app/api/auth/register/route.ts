import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, fullName, role } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Attempt to create user with auto-confirmed email via Supabase Admin API
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName || email.split('@')[0],
                role: role || 'traveler'
            }
        });

        if (error) {
            const errLower = (error.message || '').toLowerCase();
            // If user already exists, find user, auto-confirm and update password
            if (
                errLower.includes('already registered') ||
                errLower.includes('already exists') ||
                errLower.includes('already') ||
                errLower.includes('unique')
            ) {
                const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (listError) {
                    return NextResponse.json(
                        { success: false, error: listError.message },
                        { status: 400 }
                    );
                }

                const existingUser = usersData.users.find(
                    u => u.email?.toLowerCase() === email.trim().toLowerCase()
                );

                if (existingUser) {
                    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                        existingUser.id,
                        {
                            email_confirm: true,
                            password,
                            user_metadata: {
                                ...(existingUser.user_metadata || {}),
                                ...(fullName ? { full_name: fullName } : {}),
                                ...(role ? { role } : {})
                            }
                        }
                    );

                    if (updateError) {
                        return NextResponse.json(
                            { success: false, error: updateError.message },
                            { status: 400 }
                        );
                    }

                    return NextResponse.json({ success: true, user: updateData.user });
                }
            }

            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, user: data.user });
    } catch (err: unknown) {
        const e = err as Error;
        console.error('Registration API error:', e);
        return NextResponse.json(
            { success: false, error: e.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
