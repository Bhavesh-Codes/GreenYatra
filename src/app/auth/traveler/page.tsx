'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Leaf,
    Building2,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Sparkles,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { signInUser, signUpUser } from '@/lib/auth';

function TravelerAuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get('redirect');
    const redirectUrl = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/traveler';

    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Quick 1-Click Demo Guest Login
    const handleDemoLogin = async () => {
        setIsDemoLoading(true);
        setError(null);
        setSuccessMessage(null);

        const demoEmail = 'guest.demo@greenyatra.com';
        const demoPassword = 'DemoGuest123!';
        const demoName = 'Aarav Sharma';

        try {
            const { data, error: authError } = await signUpUser(
                demoEmail,
                demoPassword,
                demoName,
                'traveler'
            );

            if (authError) {
                throw new Error(authError.message);
            }

            if (data?.user || data?.session) {
                setSuccessMessage('Logged in as Aarav Sharma! Redirecting...');
                setTimeout(() => {
                    router.push(redirectUrl);
                }, 400);
            }
        } catch (err: unknown) {
            const e = err as Error;
            console.error('Demo login error:', e);
            setError(e.message || 'Demo guest login failed. Please try again.');
        } finally {
            setIsDemoLoading(false);
        }
    };

    // Standard Form Submit (Sign In or Sign Up)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        if (!password) {
            setError('Please enter your password.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (activeTab === 'signup' && !fullName.trim()) {
            setError('Please enter your full name.');
            return;
        }

        setIsLoading(true);

        try {
            if (activeTab === 'signin') {
                const { data, error: signInErr } = await signInUser(email.trim(), password);
                if (signInErr) {
                    throw new Error(signInErr.message || 'Invalid email or password.');
                }

                if (data?.user) {
                    setSuccessMessage('Signed in successfully! Redirecting...');
                    setTimeout(() => {
                        router.push(redirectUrl);
                    }, 400);
                }
            } else {
                const { data, error: signUpErr } = await signUpUser(
                    email.trim(),
                    password,
                    fullName.trim(),
                    'traveler'
                );

                if (signUpErr) {
                    throw new Error(signUpErr.message || 'Failed to create account.');
                }

                if (data?.user || data?.session) {
                    setSuccessMessage('Account created successfully! Redirecting...');
                    setTimeout(() => {
                        router.push(redirectUrl);
                    }, 400);
                }
            }
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/traveler" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Leaf className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-slate-900 tracking-tight">GreenYatra</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Traveler Portal
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 hidden sm:block">Sustainable & Accessible Journeys</p>
                        </div>
                    </Link>

                    {/* Switch to Hotel Login Link */}
                    <Link
                        href="/auth/hotel"
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors shadow-2xs"
                    >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Are you a hotel operator? Go to Hotel Login →</span>
                    </Link>
                </div>
            </header>

            {/* Main Content Card */}
            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-md w-full bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-slate-200/60 p-6 sm:p-8 space-y-6 relative overflow-hidden">
                    {/* Top emerald gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

                    {/* Card Header */}
                    <div className="text-center space-y-2 pt-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified Green Member Access</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {activeTab === 'signin' ? 'Welcome Back' : 'Join GreenYatra'}
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            {activeTab === 'signin'
                                ? 'Sign in to access your green itineraries and eco-stay rewards'
                                : 'Create your account to start planning audited low-carbon trips'}
                        </p>
                    </div>

                    {/* Quick Demo Guest Login */}
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/90 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                                <span>1-Click Evaluator Demo</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                                Instant
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Evaluate the complete traveler experience instantly as verified guest <strong>Aarav Sharma</strong> without manual registration.
                        </p>
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={isDemoLoading || isLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isDemoLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Entering as Aarav Sharma...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continue as Demo Guest (Aarav Sharma)</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-slate-200 w-full" />
                        <span className="bg-white px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                            Or with credentials
                        </span>
                    </div>

                    {/* Tabs for Sign In and Create Account */}
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-sm font-semibold">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('signin');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className={`py-2 rounded-lg transition-all text-center cursor-pointer ${
                                activeTab === 'signin'
                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('signup');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className={`py-2 rounded-lg transition-all text-center cursor-pointer ${
                                activeTab === 'signup'
                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{successMessage}</span>
                        </div>
                    )}

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name field (Create Account only) */}
                        {activeTab === 'signup' && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. Bhavesh Sharma"
                                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. bhavesh@example.com"
                                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={activeTab === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || isDemoLoading}
                            className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>{activeTab === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                                </>
                            ) : (
                                <span>{activeTab === 'signin' ? 'Sign In to Traveler Portal' : 'Create Free Account'}</span>
                            )}
                        </button>
                    </form>

                    {/* Bottom Features Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-center text-center">
                        <p className="text-[11px] text-slate-500">
                            Audited Footprints • Zero Greenwashing • Certified Stays
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function TravelerAuthPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            }
        >
            <TravelerAuthForm />
        </Suspense>
    );
}
