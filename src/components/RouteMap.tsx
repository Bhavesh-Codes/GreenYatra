'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
    className?: string;
}

export default function RouteMap({ origin, destination, geometry, className = '' }: RouteMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const destMarkerRef = useRef<mapboxgl.Marker | null>(null);

    // Keep ref to latest props for map lifecycle callbacks
    const propsRef = useRef({ origin, destination, geometry });
    propsRef.current = { origin, destination, geometry };

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

            // 1. Add emerald marker for origin
            const originMarker = new mapboxgl.Marker({ color: '#10b981' })
                .setLngLat(originCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Origin: ${currentOrigin.name}`))
                .addTo(map);
            originMarkerRef.current = originMarker;

            // 2. Add blue marker for destination
            const destMarker = new mapboxgl.Marker({ color: '#3b82f6' })
                .setLngLat(destCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Destination: ${currentDest.name}`))
                .addTo(map);
            destMarkerRef.current = destMarker;

            // 3. Add GeoJSON LineString (use highway geometry if provided, otherwise fallback to straight line)
            const routeCoords: [number, number][] =
                currentGeometry && currentGeometry.length > 0
                    ? currentGeometry
                    : [originCoords, destCoords];

            map.addSource('route-line-source', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: routeCoords
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

            // 4. Fit map bounds over all coordinates including highway geometry with padding
            const bounds = new mapboxgl.LngLatBounds(originCoords, destCoords);
            if (currentGeometry && currentGeometry.length > 0) {
                for (const pt of currentGeometry) {
                    bounds.extend(pt as [number, number]);
                }
            }

            map.fitBounds(bounds, {
                padding: 40,
                maxZoom: 14,
                duration: 800
            });
        } else if (currentOrigin) {
            const originCoords: [number, number] = [currentOrigin.lng, currentOrigin.lat];
            const originMarker = new mapboxgl.Marker({ color: '#10b981' })
                .setLngLat(originCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(currentOrigin.name))
                .addTo(map);
            originMarkerRef.current = originMarker;
            map.flyTo({ center: originCoords, zoom: 10 });
        } else if (currentDest) {
            const destCoords: [number, number] = [currentDest.lng, currentDest.lat];
            const destMarker = new mapboxgl.Marker({ color: '#3b82f6' })
                .setLngLat(destCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(currentDest.name))
                .addTo(map);
            destMarkerRef.current = destMarker;
            map.flyTo({ center: destCoords, zoom: 10 });
        } else {
            map.flyTo({ center: [78.9629, 20.5937], zoom: 4 });
        }
    };

    // Initialize Mapbox map instance
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [78.9629, 20.5937], // Geographical center of India [lng, lat]
            zoom: 4,
            attributionControl: false
        });

        // Add compact navigation controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        mapRef.current = map;

        map.on('load', () => {
            renderRouteAndMarkers();
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
        if (!map || !map.isStyleLoaded()) return;
        renderRouteAndMarkers();
    }, [origin, destination, geometry]);

    return (
        <div className={`relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
            <div ref={mapContainerRef} className="w-full h-full" />
            {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 text-center">
                    <div className="bg-white rounded-xl p-4 text-xs text-slate-700 shadow-md max-w-xs">
                        Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.
                    </div>
                </div>
            )}
        </div>
    );
}
