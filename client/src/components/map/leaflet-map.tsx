import { useEffect, useRef, useState } from "react";
import type { GpsTrackingResponse } from "@/lib/gps-api";
import { convertCoordinates } from "@/lib/gps-api";

// Leaflet imports for client-side only
let L: any = null;

interface LeafletMapProps {
  data: GpsTrackingResponse | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

export default function LeafletMap({ data, isLoading, error }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Load Leaflet only on client side
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        
        return new Promise((resolve) => {
          script.onload = () => {
            L = (window as any).L;
            resolve(L);
          };
          document.head.appendChild(script);
        });
      }
    };

    loadLeaflet().then(() => {
      if (L && mapRef.current && !mapInstanceRef.current) {
        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current).setView([37.7749, -122.4194], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!L || !mapInstanceRef.current || !data) return;

    // Clear existing layers
    if (polylineRef.current) {
      mapInstanceRef.current.removeLayer(polylineRef.current);
    }
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Find LineString feature
    const lineStringFeature = data.features?.find(f => f.geometry.type === 'LineString');
    if (!lineStringFeature || !lineStringFeature.geometry.coordinates.length) return;

    // Convert coordinates from [lng, lat] to [lat, lng]
    const coordinates = convertCoordinates(lineStringFeature.geometry.coordinates);
    
    if (coordinates.length === 0) return;

    // Create polyline
    polylineRef.current = L.polyline(coordinates, {
      color: '#2563EB',
      weight: 4,
      opacity: 0.8
    }).addTo(mapInstanceRef.current);

    // Add start marker (green)
    const startMarker = L.circleMarker(coordinates[0], {
      color: 'white',
      fillColor: '#10B981',
      fillOpacity: 1,
      weight: 3,
      radius: 8
    }).addTo(mapInstanceRef.current);
    markersRef.current.push(startMarker);

    // Add live position marker at the end point (blue, pulsing)
    if (coordinates.length > 1) {
      const livePoint = coordinates[coordinates.length - 1];
      const liveMarker = L.circleMarker(livePoint, {
        color: 'white',
        fillColor: '#2563EB',
        fillOpacity: 1,
        weight: 3,
        radius: 10,
        interactive: false // Prevent interaction issues
      }).addTo(mapInstanceRef.current);
      
      // Add pulsing animation class with proper error handling
      setTimeout(() => {
        if (liveMarker._path) {
          liveMarker._path.classList.add('animate-pulse');
          // Fix positioning by ensuring the marker stays in place
          liveMarker._path.style.pointerEvents = 'none';
          liveMarker._path.style.transformOrigin = 'center';
        }
      }, 100);
      
      markersRef.current.push(liveMarker);
    }

    // Fit bounds only on first load
    if (isFirstLoad && polylineRef.current) {
      mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [20, 20] });
      setIsFirstLoad(false);
    }
  }, [data, isFirstLoad]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full bg-gray-100"
      data-testid="map-container"
    />
  );
}
