import { useState, useEffect, useRef, useCallback } from 'react';
import { stationModel } from '../models/stationModel.js';
import { tomtomModel } from '../models/tomtomModel.js';

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

export function useMapController() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sheetOpen, setSheetOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    stationModel.getAll()
      .then(data => { setStations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

  const handleSearch = useCallback((value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await tomtomModel.search(value);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
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

  return {
    activeFilter, setActiveFilter,
    sheetOpen, setSheetOpen,
    menuOpen, setMenuOpen,
    loading, mapCenter, setMapCenter, mapZoom, setMapZoom,
    query, setQuery, suggestions, searching, searchCenter, setSearchCenter,
    locateMe, handleSearch, handleSelect, clearSearch,
    filteredStations
  };
}
