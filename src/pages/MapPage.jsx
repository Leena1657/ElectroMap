import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Search, ChevronUp, X, MapPin, LocateFixed, LogOut, User, Route, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StationCard from '../components/StationCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

const filters = ['All', 'Fast Charging', 'Available'];

const CITIES = [
  { name: 'Bengaluru', center: [12.9716, 77.5946] },
  { name: 'Mumbai',    center: [19.0760, 72.8777] },
  { name: 'Delhi',     center: [28.6139, 77.2090] },
  { name: 'Hyderabad', center: [17.3850, 78.4867] },
  { name: 'Chennai',   center: [13.0827, 80.2707] },
  { name: 'Pune',      center: [18.5204, 73.8567] },
];

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.2 }); }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sheetOpen, setSheetOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  const { user, logout } = useAuth();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  const debounceRef = useRef(null);

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const center = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(center);
          setSearchCenter(center);
          setMapZoom(14);
          setQuery('My Location');
        },
        () => alert('Could not get your location. Please check your permissions.')
      );
    }
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/stations')
      .then(res => res.json())
      .then(data => { setStations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://api.tomtom.com/search/2/search/${encodeURIComponent(value)}.json?key=${TOMTOM_KEY}&countrySet=IN&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 400);
  }, []);

  const handleSelect = (suggestion) => {
    const center = [suggestion.position.lat, suggestion.position.lon];
    setMapCenter(center);
    setSearchCenter(center);
    setMapZoom(14);
    setQuery(suggestion.address.freeformAddress);
    setSuggestions([]);
  };

  const clearSearch = () => { setQuery(''); setSuggestions([]); setSearchCenter(null); };

  const sortedStations = searchCenter
    ? [...stations].sort((a, b) =>
        getDistanceKm(searchCenter[0], searchCenter[1], a.lat, a.lng) -
        getDistanceKm(searchCenter[0], searchCenter[1], b.lat, b.lng))
    : stations;

  const filteredStations = sortedStations.filter(s => {
    if (activeFilter === 'Fast Charging') return s.isFast;
    if (activeFilter === 'Available') return s.status === 'available';
    return true;
  });

  const createCustomIcon = (price, fast) =>
    L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position:relative;cursor:pointer">
          <div style="padding:4px 10px;border-radius:999px;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:2px solid white;background:${fast ? '#1E5631' : '#fff'};color:${fast ? '#fff' : '#111'}">
            ${price}
          </div>
          <div style="position:absolute;left:50%;bottom:-7px;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${fast ? '#1E5631' : '#fff'}"></div>
        </div>
      `,
      iconSize: [70, 44],
      iconAnchor: [35, 44],
    });

  return (
    <div className="h-full w-full relative">
      {/* Map */}
      <div className="absolute inset-0 z-0 bg-gray-100">
        <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <FlyTo center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://developer.tomtom.com/">TomTom</a>'
            url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`}
          />

          {searchCenter && (
            <Marker position={searchCenter} icon={L.divIcon({
              className: '',
              html: `<div style="width:16px;height:16px;border-radius:50%;background:#1E5631;border:3px solid white;box-shadow:0 0 0 4px rgba(30,86,49,0.25)"></div>`,
              iconSize: [16, 16], iconAnchor: [8, 8],
            })}>
              <Popup><span style={{ fontWeight: 'bold', fontSize: '13px' }}>📍 Searched Location</span></Popup>
            </Marker>
          )}

          {filteredStations.map(station =>
            station.lat && station.lng && (
              <Marker key={station.id} position={[station.lat, station.lng]} icon={createCustomIcon(station.price, station.isFast)}>
                <Popup>
                  <div style={{ fontFamily: 'sans-serif', padding: '4px' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>{station.name}</strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>{station.availableConnectors}/{station.totalConnectors} Connectors · {station.price}</span>
                  </div>
                </Popup>
              </Marker>
            )
          )}
        </MapContainer>
        
        <button 
          onClick={locateMe}
          className="absolute bottom-[52%] right-4 z-[1000] w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition-all border border-gray-100"
          title="Locate me"
        >
          <LocateFixed size={24} />
        </button>
      </div>

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 px-4 pt-2 pb-3 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 mt-1">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm text-sm">E</div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">ElectroMap</h1>
          <button onClick={() => setMenuOpen(true)} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700">
            <Menu size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className={clsx('transition-colors', searching ? 'text-primary animate-pulse' : 'text-gray-400')} />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search any place in India…"
            className="w-full bg-white pl-11 pr-10 py-3 rounded-2xl shadow-sm border border-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
          {query && (
            <button onClick={clearSearch} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {suggestions.map(s => (
                <button key={s.id} onClick={() => handleSelect(s)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-800 font-medium leading-tight">{s.address.freeformAddress}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 mb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={clsx('whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm',
                activeFilter === f ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-100')}>
              {f}
            </button>
          ))}
        </div>

        {/* City buttons */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          {CITIES.map(city => (
            <button key={city.name}
              onClick={() => { setMapCenter(city.center); setSearchCenter(null); setMapZoom(12); setQuery(''); setSuggestions([]); }}
              className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-white/80 text-gray-700 border border-gray-200 shadow-sm hover:bg-primary hover:text-white transition-colors">
              📍 {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className={clsx(
        'absolute left-0 w-full bg-gray-50/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-300 z-20 border-t border-white/50',
        sheetOpen ? 'bottom-0 h-[48%]' : 'bottom-0 translate-y-[calc(100%-76px)]'
      )}>
        <div className="w-full flex flex-col items-center pt-3 pb-1 cursor-pointer" onClick={() => setSheetOpen(!sheetOpen)}>
          <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
          <div className="flex justify-between w-full px-5 items-center">
            <h2 className="text-base font-extrabold text-gray-900">
              {searchCenter ? 'Nearest Stations' : 'All Stations'}
              <span className="text-gray-400 text-xs font-medium ml-2">{filteredStations.length} found</span>
            </h2>
            <ChevronUp size={18} className={clsx('text-gray-400 transition-transform duration-300', sheetOpen && 'rotate-180')} />
          </div>
        </div>

        <div className="px-4 pb-6 overflow-y-auto h-[calc(100%-60px)] space-y-3 pb-24">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">No stations found.</div>
          ) : (
            filteredStations.map(station => (
              <StationCard 
                key={station.id} 
                station={station} 
                onClick={() => {
                  setMapCenter([station.lat, station.lng]);
                  setMapZoom(15);
                  setSheetOpen(false);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Side Menu Drawer */}
      {menuOpen && (
        <div className="absolute inset-0 z-[200] flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setMenuOpen(false)} 
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-72 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-primary px-5 pt-10 pb-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <button 
                onClick={() => setMenuOpen(false)} 
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>

              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold mb-3">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-white font-extrabold text-lg leading-tight">{user?.name || 'User'}</h2>
              <p className="text-white/70 text-sm font-medium mt-0.5">{user?.email || ''}</p>
            </div>

            {/* Menu Items */}
            <div className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Account</p>

              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={17} className="text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="px-4 pb-8 pt-2 border-t border-gray-100">
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors"
              >
                <LogOut size={17} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
