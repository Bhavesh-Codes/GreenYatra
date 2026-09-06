'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';

export interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelectLocation: (location: { name: string; lat: number; lng: number }) => void;
    placeholder: string;
    icon: React.ReactNode;
    label: string;
    isSelectingOnMap?: boolean;
    onToggleMapSelect?: () => void;
    className?: string;
}

interface SuggestionItem {
    id: string;
    primaryText: string;
    secondaryText: string;
    fullName: string;
    lat: number;
    lng: number;
}

export default function LocationAutocomplete({
    value,
    onChange,
    onSelectLocation,
    placeholder,
    icon,
    label,
    isSelectingOnMap = false,
    onToggleMapSelect,
    className = ''
}: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const skipNextSearchRef = useRef<boolean>(false);

    // Debounced Mapbox Geocoding search (250ms)
    useEffect(() => {
        if (skipNextSearchRef.current) {
            skipNextSearchRef.current = false;
            return;
        }

        const trimmed = value.trim();
        if (!trimmed || trimmed.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) return;

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    trimmed
                )}.json?access_token=${token}&autocomplete=true&types=place,locality,neighborhood,address,poi&limit=5`;

                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                if (Array.isArray(data.features)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mapped: SuggestionItem[] = data.features.map((f: any) => {
                        const primary = f.text || f.place_name?.split(',')[0] || trimmed;
                        let secondary = '';
                        if (f.place_name && f.place_name.includes(primary)) {
                            secondary = f.place_name.replace(primary, '').replace(/^,\s*/, '').trim();
                        } else if (f.place_name) {
                            secondary = f.place_name;
                        }

                        return {
                            id: f.id,
                            primaryText: primary,
                            secondaryText: secondary,
                            fullName: f.place_name || primary,
                            lat: f.center[1],
                            lng: f.center[0]
                        };
                    });

                    setSuggestions(mapped);
                    setShowDropdown(mapped.length > 0);
                }
            } catch (err) {
                console.warn('[LocationAutocomplete] Geocoding suggestion error:', err);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [value]);

    // Close suggestions dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (item: SuggestionItem) => {
        skipNextSearchRef.current = true;
        onChange(item.fullName);
        onSelectLocation({
            name: item.fullName,
            lat: item.lat,
            lng: item.lng
        });
        setShowDropdown(false);
        setSuggestions([]);
    };

    return (
        <div ref={containerRef} className={`relative w-full space-y-1.5 ${className}`}>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                {label}
            </label>

            <div className="relative">
                {/* Left Input Icon */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    {icon}
                </div>

                {/* Main Text Input */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowDropdown(true);
                    }}
                    placeholder={placeholder}
                    className={`w-full pl-10 ${
                        onToggleMapSelect ? 'pr-28' : 'pr-10'
                    } py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm transition-all ${
                        isSelectingOnMap
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-xs'
                            : 'border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                    }`}
                />

                {/* Right-Side Action Controls */}
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600 mr-1 shrink-0" />}

                    {onToggleMapSelect && (
                        <button
                            type="button"
                            onClick={onToggleMapSelect}
                            title={isSelectingOnMap ? 'Map picking active - Click map to drop pin' : 'Pick location on map'}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                isSelectingOnMap
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300'
                            }`}
                        >
                            <Crosshair className={`w-3.5 h-3.5 ${isSelectingOnMap ? 'animate-pulse' : ''}`} />
                            <span className="hidden sm:inline">Pick on Map</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Floating Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-100">
                    {suggestions.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="w-full px-4 py-2.5 text-left flex items-start gap-2.5 hover:bg-emerald-50/60 transition-colors cursor-pointer group"
                        >
                            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5 transition-colors" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900 truncate">
                                    {item.primaryText}
                                </p>
                                {item.secondaryText && (
                                    <p className="text-xs text-slate-500 group-hover:text-emerald-700 truncate">
                                        {item.secondaryText}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
