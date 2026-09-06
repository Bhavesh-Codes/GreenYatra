'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export interface LocationPickerMapProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
    className?: string;
}

const DEFAULT_LAT = 15.5808;
const DEFAULT_LNG = 73.7427;

export default function LocationPickerMap({
    initialLat,
    initialLng,
    onLocationSelect,
    className = ''
}: LocationPickerMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    // Keep ref to latest onLocationSelect callback to avoid re-binding map listeners
    const onLocationSelectRef = useRef(onLocationSelect);
    onLocationSelectRef.current = onLocationSelect;

    // Active coordinates state for badge display
    const startLat = typeof initialLat === 'number' && !isNaN(initialLat) ? initialLat : DEFAULT_LAT;
    const startLng = typeof initialLng === 'number' && !isNaN(initialLng) ? initialLng : DEFAULT_LNG;

    const [coords, setCoords] = useState<{ lat: number; lng: number }>({
        lat: startLat,
        lng: startLng
    });
    const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

    // Track internal coordinates to differentiate user interaction from external prop updates
    const lastReportedCoordsRef = useRef<{ lat: number; lng: number }>({
        lat: startLat,
        lng: startLng
    });

    // Reverse geocode coordinate into human-readable place name
    const reverseGeocode = useCallback(async (lng: number, lat: number): Promise<string | undefined> => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) return undefined;

        setIsGeocoding(true);
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`;
            const res = await fetch(url);
            if (!res.ok) return undefined;

            const data = await res.json();
            const placeName = data.features?.[0]?.place_name;
            return placeName;
        } catch (err) {
            console.warn('[LocationPickerMap] Reverse geocode error:', err);
            return undefined;
        } finally {
            setIsGeocoding(false);
        }
    }, []);

    // Handle updating location and triggering callback
    const handleLocationChange = useCallback(async (lat: number, lng: number) => {
        setCoords({ lat, lng });
        lastReportedCoordsRef.current = { lat, lng };

        const address = await reverseGeocode(lng, lat);
        onLocationSelectRef.current({ lat, lng, address });
    }, [reverseGeocode]);

    // Initialize Mapbox map instance
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [startLng, startLat],
            zoom: 12,
            attributionControl: false
        });

        // Add compact zoom navigation controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        mapRef.current = map;

        // Initialize Draggable Marker (emerald: #10b981)
        const marker = new mapboxgl.Marker({
            color: '#10b981',
            draggable: true
        })
            .setLngLat([startLng, startLat])
            .addTo(map);

        markerRef.current = marker;

        // Handle Marker Drag End
        marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            handleLocationChange(lngLat.lat, lngLat.lng);
        });

        // Handle Map Click
        map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            marker.setLngLat([lng, lat]);
            handleLocationChange(lat, lng);
        });

        return () => {
            marker.remove();
            markerRef.current = null;
            map.remove();
            mapRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Watch external initialLat & initialLng prop changes (e.g. user typed a city in text input)
    useEffect(() => {
        const map = mapRef.current;
        const marker = markerRef.current;
        if (!map || !marker) return;

        if (typeof initialLat !== 'number' || typeof initialLng !== 'number' || isNaN(initialLat) || isNaN(initialLng)) {
            return;
        }

        // Avoid infinite loop if props match the coordinates already reported
        const deltaLat = Math.abs(initialLat - lastReportedCoordsRef.current.lat);
        const deltaLng = Math.abs(initialLng - lastReportedCoordsRef.current.lng);
        if (deltaLat < 0.0001 && deltaLng < 0.0001) {
            return;
        }

        lastReportedCoordsRef.current = { lat: initialLat, lng: initialLng };
        setCoords({ lat: initialLat, lng: initialLng });

        // Update marker position
        marker.setLngLat([initialLng, initialLat]);

        // Fly map smoothly to new coordinates
        map.flyTo({
            center: [initialLng, initialLat],
            zoom: 13,
            duration: 900
        });
    }, [initialLat, initialLng]);

    return (
        <div className={`w-full h-72 rounded-xl overflow-hidden border border-slate-200 relative shadow-2xs ${className}`}>
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Coordinates and Status Badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                    {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                </span>
                {isGeocoding ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pl-1 border-l border-slate-200">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Resolving...</span>
                    </span>
                ) : (
                    <span className="text-[10px] text-slate-400 font-normal pl-1 border-l border-slate-200 hidden sm:inline">
                        Click map or drag pin
                    </span>
                )}
            </div>

            {/* Mapbox Token Missing Warning */}
            {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-center z-20">
                    <div className="bg-white rounded-xl p-4 text-xs text-slate-700 shadow-md max-w-xs space-y-1">
                        <p className="font-bold text-slate-900">Mapbox Token Not Configured</p>
                        <p className="text-slate-500">Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment to render the interactive location picker.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
