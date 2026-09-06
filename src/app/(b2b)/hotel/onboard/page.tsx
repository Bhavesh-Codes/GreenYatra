'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AppNavbar from '@/components/AppNavbar';
import {
    Building2,
    ArrowLeft,
    ArrowRight,
    Check,
    Sparkles,
    ShieldCheck,
    Sun,
    Droplets,
    Recycle,
    Utensils,
    Footprints,
    Accessibility,
    Eye,
    Ear,
    Loader2,
    AlertCircle,
    CheckCircle2,
    MapPin,
    IndianRupee,
    Image as ImageIcon
} from 'lucide-react';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-72 rounded-xl bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Initializing interactive property map...</span>
        </div>
    )
});

export default function HotelOnboardPage() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Property Details & Geolocation
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState<number>(15.5808);
    const [longitude, setLongitude] = useState<number>(73.7427);
    const [pricePerNight, setPricePerNight] = useState('6500');
    const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80');
    const [description, setDescription] = useState('');

    const isFromMapRef = useRef(false);

    // Debounce geocode via Mapbox when user types City or Address to fly the map marker
    useEffect(() => {
        if (isFromMapRef.current) {
            isFromMapRef.current = false;
            return;
        }

        const trimmedCity = city.trim();
        const trimmedAddress = address.trim();
        if (!trimmedCity && !trimmedAddress) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) return;

        const query = [trimmedAddress, trimmedCity, 'India'].filter(Boolean).join(', ');

        const timer = setTimeout(async () => {
            try {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`;
                const res = await fetch(url);
                if (!res.ok) return;

                const data = await res.json();
                const feature = data.features?.[0];
                if (feature?.center && Array.isArray(feature.center)) {
                    const [lng, lat] = feature.center;
                    setLatitude(lat);
                    setLongitude(lng);
                }
            } catch (geoErr) {
                console.warn('[Onboard] Debounced geocoding failed:', geoErr);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [city, address]);

    // Step 2: Resource Baseline Audit
    const [renewableEnergyPct, setRenewableEnergyPct] = useState(35);
    const [lowFlowFixtures, setLowFlowFixtures] = useState(true);
    const [wasteSorting, setWasteSorting] = useState(true);
    const [buffetPortionControl, setBuffetPortionControl] = useState(false);

    // Step 3: Accessibility Audit
    const [stepFreeAccess, setStepFreeAccess] = useState(true);
    const [wheelchairAccessible, setWheelchairAccessible] = useState(true);
    const [visualAssistance, setVisualAssistance] = useState(false);
    const [hearingAssistance, setHearingAssistance] = useState(false);

    // Live Estimated Cold-Start Green Score calculation
    const basePts = 25;
    const renewablePts = Math.min(15, Math.round((renewableEnergyPct / 100) * 15));
    const policyPts = (lowFlowFixtures ? 5 : 0) + (wasteSorting ? 5 : 0) + (buffetPortionControl ? 5 : 0);
    const accCount = (stepFreeAccess ? 1 : 0) + (wheelchairAccessible ? 1 : 0) + (visualAssistance ? 1 : 0) + (hearingAssistance ? 1 : 0);
    const accPts = Math.round(accCount * 2.5);
    const estimatedScore = Math.min(100, basePts + renewablePts + policyPts + accPts);

    const getEstimatedTag = (score: number) => {
        if (score >= 80) return { tag: 'Gold', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
        if (score >= 65) return { tag: 'Silver', color: 'bg-slate-100 text-slate-800 border-slate-300' };
        if (score >= 40) return { tag: 'Bronze', color: 'bg-amber-100 text-amber-800 border-amber-300' };
        return { tag: 'None', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (currentStep === 1) {
            if (!name.trim()) {
                setError('Please enter your property name.');
                return;
            }
            if (!city.trim()) {
                setError('Please enter the property city.');
                return;
            }
            if (!address.trim()) {
                setError('Please provide the full street address.');
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        }
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                name: name.trim(),
                city: city.trim(),
                address: address.trim(),
                latitude,
                longitude,
                price_per_night: Number(pricePerNight) || 5000,
                image_url: imageUrl.trim(),
                description: description.trim() || undefined,
                baseline_audit: {
                    renewable_energy_pct: renewableEnergyPct,
                    low_flow_fixtures: lowFlowFixtures,
                    waste_sorting: wasteSorting,
                    buffet_portion_control: buffetPortionControl
                },
                accessibility_features: {
                    step_free_access: stepFreeAccess,
                    wheelchair_accessible: wheelchairAccessible,
                    visual_assistance: visualAssistance,
                    hearing_assistance: hearingAssistance
                }
            };

            const res = await fetch('/api/hotel/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to complete property onboarding.');
            }

            // Redirect directly to the newly created hotel dashboard
            router.push(`/hotel/${data.hotel_id}`);
        } catch (err: unknown) {
            const e = err as Error;
            console.error('Onboarding submission error:', e);
            setError(e.message || 'An error occurred during submission. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Top Shared Navigation Bar */}
            <AppNavbar />

            {/* Main Content Area */}
            <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Wizard Stepper Progress Bar */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider">
                        <span className={currentStep >= 1 ? 'text-emerald-700' : 'text-slate-400'}>
                            1. Property Details
                        </span>
                        <span className={currentStep >= 2 ? 'text-emerald-700' : 'text-slate-400'}>
                            2. Resource Baseline
                        </span>
                        <span className={currentStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}>
                            3. Accessibility Audit
                        </span>
                    </div>

                    {/* Visual Progress Track */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300 ease-out"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Inline Error Message */}
                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{error}</span>
                    </div>
                )}

                {/* Step 1: Property Details Form */}
                {currentStep === 1 && (
                    <form onSubmit={handleNextStep} className="bg-white border border-emerald-100 shadow-xl shadow-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                        {/* Top emerald accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Step 1 of 3 • Property Profile</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Property Specifications & Location
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Enter your hotel details. We will automatically geocode your coordinates for traveler route discovery.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Property Name */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Hotel / Resort Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Whispering Pines Eco-Resort"
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                                />
                            </div>

                            {/* City and Nightly Rate in 2-Col Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        City / Destination *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="e.g. Manali, Goa, or Jaipur"
                                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Base Nightly Rate (₹) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <IndianRupee className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min={500}
                                            value={pricePerNight}
                                            onChange={(e) => setPricePerNight(e.target.value)}
                                            placeholder="6500"
                                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Full Address */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Full Street Address *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="e.g. Hadimba Temple Road, Dhungri Village, Manali, HP 175131"
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                                />
                            </div>

                            {/* Interactive Location Picker Map */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Property Coordinates &amp; Entrance Location
                                    </label>
                                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                                    </span>
                                </div>
                                <LocationPickerMap
                                    initialLat={latitude}
                                    initialLng={longitude}
                                    onLocationSelect={({ lat, lng, address: geocodedAddress }) => {
                                        isFromMapRef.current = true;
                                        setLatitude(lat);
                                        setLongitude(lng);
                                        if (geocodedAddress) {
                                            setAddress(geocodedAddress);
                                        }
                                    }}
                                />
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                                    <span>📍 Click or drag the green pin to set your exact resort entrance.</span>
                                </p>
                            </div>

                            {/* Cover Image URL */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Cover Image URL
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://images.unsplash.com/photo-..."
                                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Short Description (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. A serene mountain eco-resort with local pine architecture, solar heating, and farm-to-table organic dining."
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Form Action */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                            >
                                <span>Continue to Resource Audit</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Resource Baseline Audit */}
                {currentStep === 2 && (
                    <form onSubmit={handleNextStep} className="bg-white border border-emerald-100 shadow-xl shadow-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                        {/* Top emerald accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                <Sun className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Step 2 of 3 • Resource Baseline</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Energy, Water & Waste Policies
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Declare your operational resource conservation systems to establish your baseline green score.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Renewable Energy Slider */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <Sun className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Renewable Energy Coverage</h3>
                                            <p className="text-xs text-slate-500">On-site solar, hydro, or green tariff contracts</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-extrabold text-emerald-700">
                                        {renewableEnergyPct}% ({renewablePts}/15 pts)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={renewableEnergyPct}
                                    onChange={(e) => setRenewableEnergyPct(Number(e.target.value))}
                                    className="w-full accent-emerald-600 cursor-pointer"
                                />
                            </div>

                            {/* Resource Policy Toggles */}
                            <div className="space-y-3">
                                {/* Low-flow fixtures */}
                                <div
                                    onClick={() => setLowFlowFixtures(!lowFlowFixtures)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                        lowFlowFixtures
                                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lowFlowFixtures ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            <Droplets className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Low-Flow Water Fixtures</h4>
                                            <p className="text-xs text-slate-500">Aerated faucets & dual-flush toilets across all guest rooms (+5 pts)</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${lowFlowFixtures ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                        {lowFlowFixtures && <Check className="w-4 h-4 stroke-[3]" />}
                                    </div>
                                </div>

                                {/* Waste sorting */}
                                <div
                                    onClick={() => setWasteSorting(!wasteSorting)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                        wasteSorting
                                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${wasteSorting ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            <Recycle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Waste Sorting & Composting Program</h4>
                                            <p className="text-xs text-slate-500">Organic composting unit and zero-landfill recyclables segregation (+5 pts)</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${wasteSorting ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                        {wasteSorting && <Check className="w-4 h-4 stroke-[3]" />}
                                    </div>
                                </div>

                                {/* Buffet portion control */}
                                <div
                                    onClick={() => setBuffetPortionControl(!buffetPortionControl)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                        buffetPortionControl
                                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${buffetPortionControl ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            <Utensils className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Buffet Portion Control Protocol</h4>
                                            <p className="text-xs text-slate-500">Cook-to-order live stations & food waste minimization scale telemetry (+5 pts)</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${buffetPortionControl ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                        {buffetPortionControl && <Check className="w-4 h-4 stroke-[3]" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="pt-2 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Step 1</span>
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                            >
                                <span>Continue to Accessibility Audit</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Accessibility Audit & Final Submission */}
                {currentStep === 3 && (
                    <div className="bg-white border border-emerald-100 shadow-xl shadow-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                        {/* Top emerald accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                <Accessibility className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Step 3 of 3 • Inclusive Travel</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Accessibility Verification Audit
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Verify inclusive infrastructure. Certified features appear as interactive accessibility filters for B2C travelers.
                            </p>
                        </div>

                        {/* Accessibility 4-Pillar Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Step-Free Access */}
                            <div
                                onClick={() => setStepFreeAccess(!stepFreeAccess)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                    stepFreeAccess
                                        ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stepFreeAccess ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Footprints className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Step-Free Access</h4>
                                        <p className="text-xs text-slate-500">Ramps or flat entry paths (+2.5 pts)</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${stepFreeAccess ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                    {stepFreeAccess && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                            </div>

                            {/* Wheelchair Accessible */}
                            <div
                                onClick={() => setWheelchairAccessible(!wheelchairAccessible)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                    wheelchairAccessible
                                        ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${wheelchairAccessible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Accessibility className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Wheelchair Accessible</h4>
                                        <p className="text-xs text-slate-500">Wide doors & roll-in showers (+2.5 pts)</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${wheelchairAccessible ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                    {wheelchairAccessible && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                            </div>

                            {/* Visual Assistance */}
                            <div
                                onClick={() => setVisualAssistance(!visualAssistance)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                    visualAssistance
                                        ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${visualAssistance ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Eye className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Visual Assistance</h4>
                                        <p className="text-xs text-slate-500">High-contrast signs & Braille (+2.5 pts)</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${visualAssistance ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                    {visualAssistance && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                            </div>

                            {/* Hearing Assistance */}
                            <div
                                onClick={() => setHearingAssistance(!hearingAssistance)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                    hearingAssistance
                                        ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hearingAssistance ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Ear className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Hearing Assistance</h4>
                                        <p className="text-xs text-slate-500">Visual alarms & hearing loops (+2.5 pts)</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${hearingAssistance ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                    {hearingAssistance && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                            </div>
                        </div>

                        {/* Cold-Start Green Score Preview Card */}
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/90 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                                    <span>Estimated Cold-Start Green Score</span>
                                </div>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getEstimatedTag(estimatedScore).color}`}>
                                    {getEstimatedTag(estimatedScore).tag} Certified
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{estimatedScore}</span>
                                <span className="text-slate-500 text-sm font-semibold">/ 100 Initial Score</span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                Upon submission, GreenYatra will immediately provision your property dashboard with <strong>30 days of baseline telemetry</strong> and <strong>2 starter decarbonization recommendations</strong>.
                            </p>
                        </div>

                        {/* Submission Buttons */}
                        <div className="pt-2 flex items-center justify-between">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setCurrentStep(2)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200 disabled:opacity-50"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Step 2</span>
                            </button>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleFinalSubmit}
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Provisioning Property Dashboard...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                        <span>Submit Property & Generate Green Score</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
