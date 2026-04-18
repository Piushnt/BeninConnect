import React, { useState, useEffect } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMarkerRef } from '@vis.gl/react-google-maps';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, X, Filter, Navigation, Search } from 'lucide-react';

interface POI {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

const CATEGORIES = [
  { id: 'all', label: 'Tous', icon: MapPin },
  { id: 'mairie', label: 'Mairie', icon: Navigation },
  { id: 'tourisme', label: 'Tourisme', icon: Info },
  { id: 'sante', label: 'Santé', icon: MapPin },
  { id: 'ecole', label: 'Écoles', icon: MapPin },
  { id: 'marche', label: 'Marchés', icon: MapPin },
];

export const InteractiveMap: React.FC<{ initialCategory?: string }> = ({ initialCategory = 'all' }) => {
  const { tenant } = useTenant();
  const [pois, setPois] = useState<POI[]>([]);
  const [filteredPois, setFilteredPois] = useState<POI[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMode, setIsAddMode] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const handleMapClick = (e: any) => {
    if (isAddMode) {
      setClickedCoords(e.detail.latLng);
      setSelectedPoi(null);
    }
  };

  useEffect(() => {
    if (tenant) {
      fetchPois();
    }
  }, [tenant]);

  useEffect(() => {
    let result = pois;
    
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    
    setFilteredPois(result);
  }, [selectedCategory, searchQuery, pois]);

  const fetchPois = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('tenant_id', tenant?.id);

      if (error) throw error;
      setPois(data || []);
    } catch (err) {
      console.error('Error fetching POIs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="p-12 text-center bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-xs">
          Clé API Google Maps manquante (VITE_GOOGLE_MAPS_API_KEY)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-grow w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Rechercher un lieu (ex: Marché, Mairie...)"
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-[#008751] rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none dark:text-white transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-[#008751] text-white shadow-lg shadow-[#008751]/20'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-[#008751]'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Point Toggle */}
        <button
          onClick={() => setIsAddMode(!isAddMode)}
          className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
            isAddMode 
              ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20' 
              : 'bg-white dark:bg-gray-900 border-[#008751] text-[#008751] hover:bg-[#008751] hover:text-white shadow-lg shadow-black/5'
          }`}
        >
          {isAddMode ? (
            <>
              <X className="w-4 h-4" />
              Annuler
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Ajouter un point
            </>
          )}
        </button>
      </div>

      {isAddMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Mode Interactif Activé</p>
            <p className="text-xs text-red-500 dark:text-red-300 font-medium">Cliquez n'importe où sur la carte pour signaler un problème ou suggérer un point d'intérêt.</p>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="h-[600px] rounded-[48px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl relative group/map">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: 6.4911, lng: 2.3614 }}
            defaultZoom={13}
            mapId="bf50473b272551c"
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            onClick={handleMapClick}
            className={isAddMode ? 'cursor-crosshair' : ''}
          >
            {filteredPois.map(poi => (
              <PoiMarker
                key={poi.id}
                poi={poi}
                onClick={() => setSelectedPoi(poi)}
              />
            ))}

            {clickedCoords && (
              <Marker 
                position={clickedCoords}
                icon={isAddMode ? "https://maps.google.com/mapfiles/ms/icons/red-pushpin.png" : undefined}
                animation={2} 
              />
            )}

            {(selectedPoi || clickedCoords) && (
              <InfoWindow
                position={selectedPoi ? { lat: Number(selectedPoi.latitude), lng: Number(selectedPoi.longitude) } : clickedCoords}
                onCloseClick={() => {
                  setSelectedPoi(null);
                  setClickedCoords(null);
                }}
              >
                <div className="p-4 max-w-[280px] space-y-4">
                  {selectedPoi ? (
                    <>
                      {selectedPoi.image_url && (
                        <img 
                          src={selectedPoi.image_url} 
                          alt={selectedPoi.name} 
                          className="w-full h-32 object-cover rounded-2xl shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-[#008751] uppercase tracking-[0.2em]">{selectedPoi.category}</span>
                        <h4 className="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-gray-100">{selectedPoi.name}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{selectedPoi.description}</p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-tight">Soumettre ici ?</h4>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium font-medium">Vous avez sélectionné ce point. Voulez-vous signaler un problème ou suggérer un nouveau lieu ?</p>
                      <button 
                        onClick={() => {
                          const slug = window.location.pathname.split('/')[1];
                          window.location.href = `/${slug}/signalement?lat=${clickedCoords?.lat}&lng=${clickedCoords?.lng}`;
                        }}
                        className="w-full py-3 bg-[#008751] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#006d41] transition-all shadow-lg shadow-[#008751]/20"
                      >
                        Signaler à la mairie
                      </button>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Overlay for loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="w-12 h-12 border-4 border-[#008751] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PoiMarker = ({ poi, onClick }: { poi: POI; onClick: () => void; key?: string | number }) => {
  const [markerRef] = useMarkerRef();

  return (
    <Marker
      ref={markerRef}
      position={{ lat: Number(poi.latitude), lng: Number(poi.longitude) }}
      onClick={onClick}
      title={poi.name}
    />
  );
};
