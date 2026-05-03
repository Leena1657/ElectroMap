import { useState, useRef, useCallback, useEffect } from 'react';
import { Navigation, ArrowRight, Battery, Clock, Zap, MapPin, X, Search, AlertCircle, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { stationModel } from '../../models/stationModel.js';
import { tomtomModel } from '../../models/tomtomModel.js';

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function interpolateLine(start, end, n = 30) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
  });
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], animate: true, duration: 1 });
    }
  }, [points, map]);
  return null;
}

function LocationInput({ label, value, onChange, onSelect, placeholder, dotColor, onLocate }) {
  const [suggestions, setSuggestions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timer = useRef(null);

  const handleChange = useCallback((v) => {
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (!v.trim()) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await fetch(`https://api.tomtom.com/search/2/search/${encodeURIComponent(v)}.json?key=${TOMTOM_KEY}&countrySet=IN&limit=5`);
        const d = await r.json();
        setSuggestions(d.results ?? []);
      } catch { setSuggestions([]); }
      finally { setBusy(false); }
    }, 350);
  }, [onChange]);

  return (
    <div style={{ position: 'relative', zIndex: isFocused ? 50 : 10 }}>
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${dotColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Search size={13} className={busy ? 'text-primary animate-pulse shrink-0' : 'text-gray-300 shrink-0'} />
            <input type="text" value={value} onChange={e => handleChange(e.target.value)} placeholder={placeholder}
              onFocus={() => setIsFocused(true)}
              onClick={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              className="flex-1 bg-transparent text-sm font-medium text-gray-800 focus:outline-none placeholder:text-gray-300 min-w-0" />
            
            {value && (
              <button onClick={() => { onChange(''); setSuggestions([]); setIsFocused(true); }} className="text-gray-300 hover:text-gray-500 p-1.5">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {(isFocused && (onLocate || suggestions.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" style={{ zIndex: 9999 }}>
          {onLocate && (
            <button onMouseDown={(e) => { e.preventDefault(); onLocate(); setSuggestions([]); setIsFocused(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left border-b border-gray-100 transition-colors bg-blue-50/30">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <LocateFixed size={16} className="text-blue-600" />
              </div>
              <span className="text-sm text-blue-700 font-bold leading-snug">📍 Use My Current Location</span>
            </button>
          )}
          {suggestions.map(s => (
            <button key={s.id} onMouseDown={(e) => { e.preventDefault(); onSelect(s); setSuggestions([]); setIsFocused(false); }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/5 text-left border-b border-gray-50 last:border-0 transition-colors">
              <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-gray-800 font-medium leading-snug">{s.address.freeformAddress}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoutePage() {
  const location = useLocation();
  const [startLabel, setStartLabel] = useState('');
  const [destLabel, setDestLabel] = useState(location.state?.destLabel || '');
  const [startPos, setStartPos] = useState(null);
  const [destPos, setDestPos] = useState(location.state?.destPos || null);
  const [route, setRoute] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // If we came from another page with a destination but no start position, get current location
    if (location.state?.destPos && !startPos && !startLabel) {
      if (navigator.geolocation) {
        setStartLabel('Locating...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setStartPos([pos.coords.latitude, pos.coords.longitude]);
            setStartLabel('My Location');
          },
          () => {
            setStartLabel(''); // Fallback if user denies location
          }
        );
      }
    }
  }, [location.state, startPos, startLabel]);

  useEffect(() => {
    if (!startPos || !destPos) { setRoute(null); setNearbyStations([]); setIsNavigating(false); return; }

    const calc = async () => {
      setCalcLoading(true);
      let routeData;

      try {
        const data = await tomtomModel.calculateRoute(startPos, destPos);
        const leg = data?.routes?.[0]?.legs?.[0];

        if (leg && leg.points && leg.points.length > 1) {
          const points = leg.points.map(p => [p.latitude, p.longitude]);
          routeData = {
            distanceKm: Math.round(leg.summary.lengthInMeters / 100) / 10,
            durationMin: Math.round(leg.summary.travelTimeInSeconds / 60),
            points,
            instructions: data?.routes?.[0]?.guidance?.instructions || [],
            isEstimate: false,
          };
        } else throw new Error('No route');
      } catch {
        const straightKm = Math.round(haversineKm(startPos[0], startPos[1], destPos[0], destPos[1]) * 10) / 10;
        const roadKm = Math.round(straightKm * 1.35 * 10) / 10;
        routeData = {
          distanceKm: roadKm,
          durationMin: Math.round((roadKm / 60) * 60),
          points: interpolateLine(startPos, destPos),
          instructions: [],
          isEstimate: true,
        };
      }

      setRoute(routeData);

      try {
        const mid = routeData.points[Math.floor(routeData.points.length / 2)];
        const stations = await stationModel.getAll();
        const sorted = stations
          .map(s => ({ ...s, d: haversineKm(mid[0], mid[1], s.lat, s.lng) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        setNearbyStations(sorted);
      } catch { /* optional */ }

      setCalcLoading(false);
    };

    calc();
  }, [startPos, destPos]);

  const fmtDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const startIcon = L.divIcon({ className: '', html: `<div style="width:14px;height:14px;border-radius:50%;background:#1E5631;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
  const destIcon = L.divIcon({ className: '', html: `<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
  const evIcon = L.divIcon({ className: '', html: `<div style="width:30px;height:30px;border-radius:50%;background:#1E5631;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.25)">⚡</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 shadow-sm border-b border-gray-100" style={{ zIndex: 20, position: 'relative' }}>
        <h1 className="text-xl font-extrabold text-gray-900 mb-3">Plan Route</h1>
        <div className="flex flex-col gap-2">
          <LocationInput label="From" value={startLabel} onChange={setStartLabel}
            onSelect={s => { setStartLabel(s.address.freeformAddress); setStartPos([s.position.lat, s.position.lon]); }}
            onLocate={() => {
              if (navigator.geolocation) {
                setStartLabel('Locating...');
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setStartPos([pos.coords.latitude, pos.coords.longitude]);
                    setStartLabel('My Location');
                  },
                  () => setStartLabel('')
                );
              }
            }}
            placeholder="Search starting point…" dotColor="bg-green-500" />
          <LocationInput label="To" value={destLabel} onChange={setDestLabel}
            onSelect={s => { setDestLabel(s.address.freeformAddress); setDestPos([s.position.lat, s.position.lon]); }}
            onLocate={() => {
              if (navigator.geolocation) {
                setDestLabel('Locating...');
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setDestPos([pos.coords.latitude, pos.coords.longitude]);
                    setDestLabel('My Location');
                  },
                  () => setDestLabel('')
                );
              }
            }}
            placeholder="Search destination…" dotColor="bg-red-400" />
        </div>
      </div>

      {/* Map */}
      <div style={{ height: '280px', position: 'relative', zIndex: 0 }}>
        {calcLoading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="bg-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              <span className="font-bold text-sm text-gray-700">Calculating route…</span>
            </div>
          </div>
        )}
        <MapContainer center={[20.5937, 78.9629]} zoom={4} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://developer.tomtom.com/">TomTom</a>'
            url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`}
          />
          {route && route.points.length > 1 && (<><FitBounds points={route.points} /><Polyline positions={route.points} color="#1E5631" weight={5} opacity={0.9} /></>)}
          {startPos && <Marker position={startPos} icon={startIcon}><Popup><b style={{ fontSize: '12px' }}>📍 Start</b></Popup></Marker>}
          {destPos && <Marker position={destPos} icon={destIcon}><Popup><b style={{ fontSize: '12px' }}>🏁 Destination</b></Popup></Marker>}
          {nearbyStations.map(s => s.lat && s.lng && (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={evIcon}>
              <Popup><p style={{ fontWeight: 'bold', fontSize: '13px', margin: 0 }}>{s.name}</p><p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{s.price}</p></Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Empty state */}
      {(!startPos || !destPos) && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Navigation size={24} className="text-primary" />
          </div>
          <p className="font-bold text-gray-700 mb-1 text-base">Plan your EV journey</p>
          <p className="text-sm text-gray-400 leading-relaxed">Type a starting point and destination above.<br />We'll find the route and nearest charging stops.</p>
        </div>
      )}

      {/* Route summary or Navigation */}
      {route && !calcLoading && (
        <div className="px-5 pt-4 pb-28">
          {isNavigating ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-gray-900">Turn-by-turn Directions</h2>
                <button onClick={() => setIsNavigating(false)} className="text-gray-500 hover:text-gray-800 bg-gray-100 p-2 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>

              <a 
                href={`https://www.google.com/maps/dir/?api=1&origin=${startPos[0]},${startPos[1]}&destination=${destPos[0]},${destPos[1]}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 mb-4 hover:bg-blue-700 transition-colors"
              >
                <Navigation size={16} className="fill-current" />
                <span>Start Live Navigation in Google Maps</span>
              </a>
              
              {route.instructions && route.instructions.length > 0 ? (
                <div className="space-y-3">
                  {route.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Navigation size={14} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-snug">{inst.message}</p>
                        {inst.routeOffsetInMeters > 0 && (
                          <p className="text-xs text-gray-400 mt-1 font-medium">
                            After {inst.routeOffsetInMeters}m
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">No detailed directions available for this route.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {route.isEstimate && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                  <AlertCircle size={15} className="text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">Showing estimated data.</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { icon: Clock, label: 'Est. Time', value: fmtDuration(route.durationMin), bg: 'bg-blue-50', color: 'text-blue-500' },
                  { icon: Navigation, label: 'Distance', value: `${route.distanceKm} km`, bg: 'bg-green-50', color: 'text-green-500' },
                  { icon: Battery, label: 'Stops', value: `${nearbyStations.length}`, bg: 'bg-orange-50', color: 'text-orange-500' },
                ].map(({ icon: Icon, label, value, bg, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
                    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                      <Icon size={16} className={color} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {nearbyStations.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Suggested Charging Stops</p>
                  <div className="space-y-2">
                    {nearbyStations.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Zap size={17} className="text-primary fill-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.price} · {s.isFast ? '⚡ DC Fast' : 'AC Regular'}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setDestLabel(s.name);
                            setDestPos([s.lat, s.lng]);
                            setIsNavigating(true);
                          }}
                          className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform"
                        >
                          Navigate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
