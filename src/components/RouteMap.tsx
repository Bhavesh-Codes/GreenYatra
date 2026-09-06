'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Compass, Loader2 } from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export interface LocationPoint {
    lat: number;
    lng: number;
    name: string;
}

export interface RouteMapProps {
    origin: LocationPoint | null;
    destination: LocationPoint | null;
    geometry?: [number, number][];
    selectingMode?: 'origin' | 'destination' | null;
    onPickLocation?: (target: 'origin' | 'destination', location: { name: string; lat: number; lng: number }) => void;
    className?: string;
}

// Reverse geocodes coordinates to a human-readable location name via Mapbox API
async function reverseGeocodeCoords(lng: number, lat: number): Promise<string> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&country=IN&limit=1`;
        const res = await fetch(url);
        if (!res.ok) return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

        const data = await res.json();
        const feature = data.features?.[0];
        if (!feature) return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

        return feature.place_name || feature.text || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    } catch (err) {
        console.warn('[RouteMap] Reverse geocode error:', err);
        return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    }
}

export default function RouteMap({
    origin,
    destination,
    geometry,
    selectingMode = null,
    onPickLocation,
    className = ''
}: RouteMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const [isResolving, setIsResolving] = useState<boolean>(false);

    // Keep ref to latest props for map lifecycle callbacks
    const propsRef = useRef({ origin, destination, geometry, selectingMode, onPickLocation });
    propsRef.current = { origin, destination, geometry, selectingMode, onPickLocation };

    const renderRouteAndMarkers = () => {
        const map = mapRef.current;
        if (!map) return;

        const currentOrigin = propsRef.current.origin;
        const currentDest = propsRef.current.destination;
        const currentGeometry = propsRef.current.geometry;

        // Clear previous markers
        if (originMarkerRef.current) {
            originMarkerRef.current.remove();
            originMarkerRef.current = null;
        }
        if (destMarkerRef.current) {
            destMarkerRef.current.remove();
            destMarkerRef.current = null;
        }

        // Remove existing route layer & source if any
        if (map.getLayer('route-line')) {
            map.removeLayer('route-line');
        }
        if (map.getSource('route-line-source')) {
            map.removeSource('route-line-source');
        }

        if (currentOrigin && currentDest) {
            const originCoords: [number, number] = [currentOrigin.lng, currentOrigin.lat];
            const destCoords: [number, number] = [currentDest.lng, currentDest.lat];

            // 1. Add emerald marker for origin (draggable)
            const originMarker = new mapboxgl.Marker({ color: '#10b981', draggable: true })
                .setLngLat(originCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Origin: ${currentOrigin.name}`))
                .addTo(map);

            originMarker.on('dragend', async () => {
                setIsResolving(true);
                const lngLat = originMarker.getLngLat();
                const placeName = await reverseGeocodeCoords(lngLat.lng, lngLat.lat);
                originMarker.getPopup()?.setText(`Origin: ${placeName}`);
                setIsResolving(false);

                if (propsRef.current.onPickLocation) {
                    propsRef.current.onPickLocation('origin', {
                        name: placeName,
                        lat: lngLat.lat,
                        lng: lngLat.lng
                    });
                }
            });
            originMarkerRef.current = originMarker;

            // 2. Add blue marker for destination (draggable)
            const destMarker = new mapboxgl.Marker({ color: '#3b82f6', draggable: true })
                .setLngLat(destCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Destination: ${currentDest.name}`))
                .addTo(map);

            destMarker.on('dragend', async () => {
                setIsResolving(true);
                const lngLat = destMarker.getLngLat();
                const placeName = await reverseGeocodeCoords(lngLat.lng, lngLat.lat);
                destMarker.getPopup()?.setText(`Destination: ${placeName}`);
                setIsResolving(false);

                if (propsRef.current.onPickLocation) {
                    propsRef.current.onPickLocation('destination', {
                        name: placeName,
                        lat: lngLat.lat,
                        lng: lngLat.lng
                    });
                }
            });
            destMarkerRef.current = destMarker;

            // 3. Add GeoJSON LineString only if geometry is provided (highway contour mode)
            if (currentGeometry && currentGeometry.length > 0) {
                map.addSource('route-line-source', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: currentGeometry
                        }
                    }
                });

                map.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route-line-source',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#10b981',
                        'line-width': 4,
                        'line-opacity': 0.85
                    }
                });
            }

            // 4. Fit map bounds over all coordinates including highway geometry with padding
            const bounds = new mapboxgl.LngLatBounds(originCoords, destCoords);
            if (currentGeometry && currentGeometry.length > 0) {
                for (const pt of currentGeometry) {
                    bounds.extend(pt as [number, number]);
                }
            }

            map.fitBounds(bounds, {
                padding: 60,
                maxZoom: 13,
                duration: 800
            });
        } else if (currentOrigin) {
            const originCoords: [number, number] = [currentOrigin.lng, currentOrigin.lat];
            const originMarker = new mapboxgl.Marker({ color: '#10b981', draggable: true })
                .setLngLat(originCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(currentOrigin.name))
                .addTo(map);

            originMarker.on('dragend', async () => {
                setIsResolving(true);
                const lngLat = originMarker.getLngLat();
                const placeName = await reverseGeocodeCoords(lngLat.lng, lngLat.lat);
                originMarker.getPopup()?.setText(`Origin: ${placeName}`);
                setIsResolving(false);

                if (propsRef.current.onPickLocation) {
                    propsRef.current.onPickLocation('origin', {
                        name: placeName,
                        lat: lngLat.lat,
                        lng: lngLat.lng
                    });
                }
            });
            originMarkerRef.current = originMarker;
            map.flyTo({ center: originCoords, zoom: 10, duration: 800 });
        } else if (currentDest) {
            const destCoords: [number, number] = [currentDest.lng, currentDest.lat];
            const destMarker = new mapboxgl.Marker({ color: '#3b82f6', draggable: true })
                .setLngLat(destCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(currentDest.name))
                .addTo(map);

            destMarker.on('dragend', async () => {
                setIsResolving(true);
                const lngLat = destMarker.getLngLat();
                const placeName = await reverseGeocodeCoords(lngLat.lng, lngLat.lat);
                destMarker.getPopup()?.setText(`Destination: ${placeName}`);
                setIsResolving(false);

                if (propsRef.current.onPickLocation) {
                    propsRef.current.onPickLocation('destination', {
                        name: placeName,
                        lat: lngLat.lat,
                        lng: lngLat.lng
                    });
                }
            });
            destMarkerRef.current = destMarker;
            map.flyTo({ center: destCoords, zoom: 10, duration: 800 });
        } else {
            map.flyTo({ center: [78.9629, 20.5937], zoom: 4.2, duration: 800 });
        }
    };

    // Initialize Mapbox map instance
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [78.9629, 20.5937], // Geographical center of India [lng, lat]
            zoom: 4.2,
            attributionControl: false
        });

        // Add compact navigation controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        mapRef.current = map;

        map.on('load', () => {
            map.resize();
            renderRouteAndMarkers();
        });

        // Handle interactive map click for point selection & reverse geocoding
        map.on('click', async (e) => {
            const { onPickLocation: onPick, selectingMode: mode, origin: currOrigin } = propsRef.current;
            if (!onPick) return;

            // Determine target: active selectingMode or infer
            const target: 'origin' | 'destination' = mode || (!currOrigin ? 'origin' : 'destination');

            setIsResolving(true);
            const { lng, lat } = e.lngLat;
            const placeName = await reverseGeocodeCoords(lng, lat);
            setIsResolving(false);

            onPick(target, {
                name: placeName,
                lat,
                lng
            });
        });

        // Cleanup on unmount
        return () => {
            if (originMarkerRef.current) {
                originMarkerRef.current.remove();
            }
            if (destMarkerRef.current) {
                destMarkerRef.current.remove();
            }
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update map dynamically when origin, destination, or geometry props change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (map.isStyleLoaded()) {
            renderRouteAndMarkers();
        } else {
            map.once('load', () => {
                renderRouteAndMarkers();
            });
        }
    }, [origin, destination, geometry]);

    // Update map canvas cursor when selectingMode changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        try {
            const canvas = map.getCanvas();
            if (canvas) {
                canvas.style.cursor = selectingMode ? 'crosshair' : '';
            }
        } catch {
            // Safe ignore
        }
    }, [selectingMode]);

    return (
        <div className={`relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${selectingMode ? 'cursor-crosshair ring-2 ring-emerald-500/20' : ''} ${className}`}>
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Interactive Selection Mode Indicator Badge */}
            {selectingMode && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/60 text-xs font-semibold flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-ping ${selectingMode === 'origin' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                        <span>
                            📍 Click anywhere on the map to set{' '}
                            <strong className={selectingMode === 'origin' ? 'text-emerald-300' : 'text-blue-300'}>
                                {selectingMode === 'origin' ? 'Origin' : 'Destination'}
                            </strong>
                        </span>
                    </div>
                </div>
            )}

            {/* Reverse Geocoding Resolving Indicator */}
            {isResolving && (
                <div className="absolute bottom-3 right-3 z-20 pointer-events-none bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 animate-in fade-in duration-100">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Resolving location...</span>
                </div>
            )}

            {/* Empty / Initial State Overlay (only when not actively picking) */}
            {!origin && !destination && !selectingMode && (
                <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center p-4 pointer-events-none z-10">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2.5">
                        <Compass className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                        <span>Enter origin and destination above or select a popular route to preview.</span>
                    </div>
                </div>
            )}

            {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 text-center z-20">
                    <div className="bg-white rounded-xl p-4 text-xs text-slate-700 shadow-md max-w-xs">
                        Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.
                    </div>
                </div>
            )}
        </div>
    );
}
