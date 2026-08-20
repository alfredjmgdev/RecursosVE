'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2, LocateFixed } from 'lucide-react';
import { useRecursosVE } from '../../application/context/recursosve-context';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onSelectLocation: (lat: number, lng: number) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  onSelectLocation,
}) => {
  const { selectedStateId, venezuelaStates } = useRecursosVE();
  const activeState = venezuelaStates.find((s) => s.id === selectedStateId);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = lat || activeState?.lat || 10.601;
      const initialLng = lng || activeState?.lng || -66.932;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: activeState?.zoom || 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Create initial marker
      const pinIcon = L.divIcon({
        className: 'location-picker-marker',
        html: `
          <div style="background:#dc2626; color:white; padding:6px; border-radius:50%; border:3px solid white; box-shadow:0 6px 16px rgba(0,0,0,0.4); display:flex; align-items:center; justify-center:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e: any) => {
        const position = e.target.getLatLng();
        onSelectLocation(position.lat, position.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync marker position if lat/lng props change from external inputs
  useEffect(() => {
    if (markerRef.current && lat && lng) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current?.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  // Search places via OpenStreetMap Nominatim
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data: SearchResult[] = await res.json();
        setSearchResults(data);
        setShowResults(data.length > 0);
      }
    } catch (err) {
      console.warn('Geocoding search failed gracefully:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: SearchResult) => {
    const selectedLat = parseFloat(place.lat);
    const selectedLng = parseFloat(place.lon);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLng]);
      mapInstanceRef.current.setView([selectedLat, selectedLng], 14);
      onSelectLocation(selectedLat, selectedLng);
    }

    setShowResults(false);
    setSearchQuery(place.display_name.split(',')[0]);
  };

  const handleRecenterState = () => {
    if (!activeState) return;
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([activeState.lat, activeState.lng]);
      mapInstanceRef.current.setView([activeState.lat, activeState.lng], activeState.zoom || 12);
      onSelectLocation(activeState.lat, activeState.lng);
    }
  };

  return (
    <div className="space-y-2">
      {/* Search Input Bar */}
      <div className="relative z-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Buscar ciudad, municipio o lugar de referencia..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs md:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-red-600 shadow-xs transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-red-600 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectPlace(result)}
                className="w-full text-left px-4 py-2.5 text-xs hover:bg-red-50 text-slate-800 transition-colors flex items-start gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2 font-medium">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
        <span className="flex items-center gap-1.5 text-red-600 font-bold">
          <MapPin className="w-4 h-4" />
          Buscá o hacé clic en el mapa para fijar la ubicación exacta
        </span>
        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>

      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-red-200 shadow-md">
        {activeState && (
          <button
            type="button"
            onClick={handleRecenterState}
            title={`Volver al centro de ${activeState.nombre}`}
            className="absolute top-3 right-3 z-[9999] bg-white/95 backdrop-blur-md border border-red-200 text-slate-800 hover:text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <LocateFixed className="w-4 h-4 text-red-600" />
            <span>Centrar en {activeState.nombre}</span>
          </button>
        )}
        <div ref={mapContainerRef} className="w-full h-full cursor-crosshair z-0" />
      </div>
    </div>
  );
};
