import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Category, Complaint, Status } from "@/types";
import { cn } from "@/utils/cn";
import {
  CAMPUS_BUILDINGS,
  CAMPUS_PRESETS,
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLES,
  CampusPreset,
  MapboxStyleOption,
  CampusBuilding
} from '@/lib/mapConstants';
import {
  MapPin as MapPinIcon,
  Navigation,
  CheckCircle,
  Sparkles,
  Compass,
  Info,
} from 'lucide-react';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  color?: string;
  status?: Status;
  category?: Category;
  label?: string;
  weight?: number;
}

interface Props {
  mode?: "pick" | "view" | "heatmap";
  pins?: MapPin[];
  complaints?: Complaint[];
  value?: { lat: number; lng: number } | null;
  onChange?: (v: { lat: number; lng: number; building?: string }) => void;
  onSelectPin?: (id: string) => void;
  onRequestReport?: () => void;
  className?: string;
  height?: number | string;
}

export function CampusMap({
  mode = "view",
  complaints = [],
  pins = [],
  value,
  onChange,
  onSelectPin,
  onRequestReport,
  className,
  height = "560px",
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Mapbox Style controls
  const [selectedMapboxStyle, setSelectedMapboxStyle] = useState<MapboxStyleOption>(() => {
    const saved = localStorage.getItem('fmc_mapbox_style');
    const found = MAPBOX_STYLES.find((s) => s.id === saved);
    return found || MAPBOX_STYLES[0]; 
  });
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  // Campus location presets
  const [currentCampus, setCurrentCampus] = useState<CampusPreset>(() => {
    const found = CAMPUS_PRESETS.find((p) => p.id === 'bannari-amman');
    return found || CAMPUS_PRESETS[0];
  });

  const getMapboxTileUrl = (styleId: string) => {
    if (MAPBOX_ACCESS_TOKEN) {
      return `https://api.mapbox.com/styles/v1/${styleId}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
    }
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  const adaptedPins = useMemo(() => {
    let finalPins: Array<{id: string, lat: number, lng: number, title?: string, status?: string, building?: string, desc?: string, color?: string}> = [];
    if (complaints && complaints.length > 0) {
      finalPins = complaints.map((c) => ({
        id: c.id,
        lat: c.latitude || 11.4984,
        lng: c.longitude || 77.2766,
        title: c.title,
        status: c.status,
        building: c.building,
        desc: c.description,
      }));
    } else if (pins && pins.length > 0) {
      finalPins = pins.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        title: p.label || "Issue Pin",
        status: p.status,
        color: p.color
      }));
    }
    return finalPins;
  }, [complaints, pins]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = value?.lat || 20.5937;
      const initialLng = value?.lng || 78.9629;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: value?.lat ? (currentCampus.zoom || 16) : 5,
        zoomControl: false,
      });

      tileLayerRef.current = L.tileLayer(getMapboxTileUrl(selectedMapboxStyle.styleId), {
        attribution: '© Mapbox © OpenStreetMap',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 22,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      markerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      if (mode === 'pick') {
        map.on('click', (e: L.LeafletMouseEvent) => {
          handlePinPlacement(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getMapboxTileUrl(selectedMapboxStyle.styleId));
    localStorage.setItem('fmc_mapbox_style', selectedMapboxStyle.id);
  }, [selectedMapboxStyle]);

  const activeBuildings = currentCampus.buildings || CAMPUS_BUILDINGS;

  const getNearestBuilding = (lat: number, lng: number): CampusBuilding => {
    let minDistance = Infinity;
    let closest = activeBuildings[0];

    activeBuildings.forEach((bld) => {
      const dist = Math.hypot(bld.latitude - lat, bld.longitude - lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = bld;
      }
    });
    return closest || activeBuildings[0];
  };

  const handlePinPlacement = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const closest = getNearestBuilding(lat, lng);
    setSelectedBuilding(closest?.name || "");

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const customPinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `<div style="width: 34px; height: 34px; background: #ccf763; border: 3px solid #0f172a; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center;"><div style="width: 10px; height: 10px; background: #0f172a; border-radius: 50%;"></div></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([lat, lng], { icon: customPinIcon, draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handlePinPlacement(pos.lat, pos.lng);
      });
      pickerMarkerRef.current = marker;
    }

    if (onChange) {
      onChange({ lat, lng, building: closest?.name });
    }
  };

  const handleSelectCampus = (preset: CampusPreset) => {
    setCurrentCampus(preset);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.latitude, preset.longitude], preset.zoom || 16.5, {
        duration: 1.2,
      });
    }
    if (mode === 'pick') {
      handlePinPlacement(preset.latitude, preset.longitude);
    }
    setLocationStatus(`Centered on ${preset.name}`);
    setTimeout(() => setLocationStatus(null), 3000);
  };

  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;
    const group = markerGroupRef.current;
    group.clearLayers();

    if (mode === 'pick') {
      if (value?.lat && value?.lng) {
        handlePinPlacement(value.lat, value.lng);
        // Center the map if the new pin is outside the current view bounds
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          const p = L.latLng(value.lat, value.lng);
          if (!map.getBounds().contains(p)) {
            map.flyTo(p, 17, { duration: 1.5 });
          }
        }
      }
      return;
    }

    // Filter out pins that are far from the current campus (e.g., mock data in Delhi when viewing TN campus)
    const localPins = adaptedPins.filter((c) => {
      const dist = Math.hypot(c.lat - currentCampus.latitude, c.lng - currentCampus.longitude);
      return dist < 0.5; // Roughly within 55km
    });

    localPins.forEach((c) => {
      const getStatusColor = (status?: string) => {
        switch (status) {
          case 'submitted':
          case 'under_review': return '#3b82f6';
          case 'assigned':
          case 'in_progress': return '#f59e0b';
          case 'resolved_pending_verification':
          case 'closed_verified': return '#10b981';
          case 'rejected':
          case 'reopened': return '#f43f5e';
          default: return c.color || '#6366f1';
        }
      };

      const color = getStatusColor(c.status);

      const markerHtml = `<div style="position: relative; width: 30px; height: 30px; cursor: pointer;">
          <div style="position: absolute; inset: -4px; background: ${color}; opacity: 0.3; border-radius: 9999px; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <div style="position: relative; width: 30px; height: 30px; background: #0f172a; border: 2px solid ${color}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            <div style="width: 10px; height: 10px; border-radius: 9999px; background: ${color};"></div>
          </div>
        </div>`;

      const icon = L.divIcon({
        className: 'custom-complaint-marker',
        html: markerHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([c.lat, c.lng], { icon }).addTo(group);

      if (c.title) {
        const popupHtml = `<div style="background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #334155; min-width: 230px; font-family: inherit;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; color: ${color}; font-weight: 600; text-transform: uppercase;">${c.status || 'Reported'}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px; line-height: 1.3;">${c.title}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">📍 ${c.building || 'Campus'}</div>
          ${c.desc ? `<div style="font-size: 11px; color: #cbd5e1; line-height: 1.4; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${c.desc}</div>` : ''}
          <button id="inspect-cmp-${c.id}" style="width: 100%; background: #ccf763; color: #0f172a; border: none; padding: 6px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; transition: opacity 0.2s;">View Full Details</button>
        </div>`;

        marker.bindPopup(popupHtml, {
          className: 'custom-leaflet-popup',
          maxWidth: 280,
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`inspect-cmp-${c.id}`);
          if (btn) {
            btn.onclick = () => onSelectPin?.(c.id);
          }
        });
      }
    });
  }, [adaptedPins, mode, value, activeBuildings]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      setTimeout(() => setLocationStatus(null), 3500);
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
        }
        handlePinPlacement(latitude, longitude);
        setLocationStatus('Device location centered on Mapbox.');
        setTimeout(() => setLocationStatus(null), 3000);
      },
      (err) => {
        setLocatingUser(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([currentCampus.latitude, currentCampus.longitude], 17);
        }
        handlePinPlacement(currentCampus.latitude, currentCampus.longitude);
        setLocationStatus(`Centered on ${currentCampus.shortName} coordinates.`);
        setTimeout(() => setLocationStatus(null), 3000);
      },
      { timeout: 8000 }
    );
  };

  const computedHeightStyle = height ? (typeof height === "number" ? `${height}px` : height) : "560px";

  return (
    <div 
      className={cn("relative w-full flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-[#07090e] overflow-hidden", className)}
      style={computedHeightStyle ? { height: computedHeightStyle } : undefined}
    >
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 text-xs shadow-xl">
          <button
            type="button"
            onClick={() => {
              const bit = CAMPUS_PRESETS.find((p) => p.id === 'bannari-amman');
              if (bit) handleSelectCampus(bit);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentCampus.id === 'bannari-amman'
                ? 'bg-[#ccf763] text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🏫</span>
            <span>Bannari Amman</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const kpr = CAMPUS_PRESETS.find((p) => p.id === 'kpr-college');
              if (kpr) handleSelectCampus(kpr);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentCampus.id === 'kpr-college'
                ? 'bg-[#ccf763] text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🏛️</span>
            <span>KPR College</span>
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
            className="px-3 py-1.5 bg-[#0f172a]/95 hover:bg-[#1e293b] backdrop-blur-md border border-slate-700 hover:border-slate-500 text-xs text-white rounded-xl flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            title="Switch Mapbox visual style"
          >
            <span>{selectedMapboxStyle.icon}</span>
            <span className="font-semibold">{selectedMapboxStyle.name}</span>
          </button>

          {isStyleMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-60 bg-[#0d0d26] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Mapbox Visual Styles
              </div>
              <div className="space-y-1 mt-1">
                {MAPBOX_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setSelectedMapboxStyle(style);
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      selectedMapboxStyle.id === style.id
                        ? 'bg-[#ccf763] text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{style.icon}</span>
                      <div>
                        <div>{style.name}</div>
                        <div
                          className={`text-[10px] ${
                            selectedMapboxStyle.id === style.id ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {style.description}
                        </div>
                      </div>
                    </div>
                    {selectedMapboxStyle.id === style.id && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {mode === 'pick' && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locatingUser}
            className="px-3 py-1.5 bg-[#0f172a]/90 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-xs text-white rounded-xl flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 text-[#ccf763] ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Detecting GPS...' : 'Use My Location'}</span>
          </button>
        )}
      </div>

      <div className="absolute bottom-12 left-3 z-[1000] pointer-events-none flex items-center gap-1.5 bg-[#0f172a]/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-mono">
        <Sparkles className="w-3 h-3 text-[#ccf763]" />
        <span>Mapbox Vector Active · {currentCampus.shortName}</span>
      </div>

      {locationStatus && (
        <div className="absolute top-14 left-3 z-[1000] px-3 py-1.5 bg-slate-900/95 border border-slate-700 rounded-lg text-xs text-slate-200 shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
          <Info className="w-3.5 h-3.5 text-[#ccf763]" />
          <span>{locationStatus}</span>
        </div>
      )}

      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="z-10 flex-1" />

      <div className="p-3 bg-[#0d0d26] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPinIcon className="w-4 h-4 text-[#ccf763] shrink-0" />
          <div>
            <span className="text-slate-400">Current Campus: </span>
            <strong className="text-white font-medium">
              {currentCampus.name}
            </strong>
            {selectedBuilding && (
              <span className="text-slate-400 ml-1.5 font-normal">
                · Selected Landmark: <span className="text-[#ccf763] font-semibold">{selectedBuilding}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
            <Compass className="w-3 h-3 text-[#ccf763]" />
            <span>Mapbox: {selectedMapboxStyle.name}</span>
          </span>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Lat/Lng: {(value?.lat || currentCampus.latitude).toFixed(4)}, {(value?.lng || currentCampus.longitude).toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}
