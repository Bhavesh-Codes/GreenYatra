'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Leaf,
    Building2,
    Compass,
    PlusCircle,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AppNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoading, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [signingOut, setSigningOut] = useState<boolean>(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await signOut();
            router.push('/');
        } catch (err) {
            console.error('Sign out error:', err);
        } finally {
            setSigningOut(false);
            setMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { name: 'Trip Planner', href: '/traveler', icon: Compass },
        { name: 'Hotel ESG OS', href: '/hotel', icon: Building2 },
        { name: 'Onboard Property', href: '/hotel/onboard', icon: PlusCircle }
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
                {/* Left side: GreenYatra Brand Logo linking to / */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">GreenYatra</span>
                            <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                ESG Platform
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block leading-none">
                            Smart Sustainable &amp; Accessible Hospitality
                        </p>
                    </div>
                </Link>

                {/* Middle Links: Trip Planner, Hotel ESG OS, Onboard Property */}
                <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side: Auth State (Desktop) */}
                <div className="hidden sm:flex items-center gap-3">
                    {isLoading ? (
                        <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-xl" />
                    ) : user ? (
                        <div className="flex items-center gap-3 bg-slate-50/90 border border-slate-200/90 rounded-2xl py-1.5 px-3 shadow-2xs">
                            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="text-left hidden lg:block">
                                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                                    {user.fullName || user.email}
                                </p>
                                <span
                                    className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                        user.role === 'hotel'
                                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    }`}
                                >
                                    {user.role === 'hotel' ? 'Hotel Operator' : 'Traveler'}
                                </span>
                            </div>
                            <Link
                                href={user.role === 'hotel' ? '/hotel' : '/traveler'}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleSignOut}
                                disabled={signingOut}
                                title="Sign Out"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/auth/traveler"
                                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors"
                            >
                                Traveler Sign In
                            </Link>
                            <Link
                                href="/auth/hotel"
                                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                            >
                                Hotel Portal
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <div className="flex sm:hidden items-center gap-2">
                    {user && (
                        <button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            title="Sign Out"
                            className="p-2 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none cursor-pointer"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    {user && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user.fullName || user.email}</p>
                                <span
                                    className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${
                                        user.role === 'hotel'
                                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    }`}
                                >
                                    {user.role === 'hotel' ? 'Hotel Operator' : 'Traveler'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-emerald-50 text-emerald-800'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 text-emerald-600" />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                        {user ? (
                            <button
                                onClick={handleSignOut}
                                disabled={signingOut}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/auth/traveler"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-center px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl border border-slate-200"
                                >
                                    Traveler Sign In
                                </Link>
                                <Link
                                    href="/auth/hotel"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-center px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl"
                                >
                                    Hotel Portal
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
