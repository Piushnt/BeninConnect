import React, { useState, useEffect } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMarkerRef } from '@vis.gl/react-google-maps';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, X, Filter, Navigation } from 'lucide-react';

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
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (tenant) {
      fetchPois();
    }
  }, [tenant]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPois(pois);
    } else {
      setFilteredPois(pois.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, pois]);

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
      {/* Category Filters */}
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

      {/* Map Container */}
      <div className="h-[600px] rounded-[48px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl relative">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: 6.4911, lng: 2.3614 }} // Default to Benin center
            defaultZoom={13}
            mapId="bf50473b272551c" // Optional map ID for styling
            gestureHandling={'greedy'}
            disableDefaultUI={true}
          >
            {filteredPois.map(poi => (
              <PoiMarker
                key={poi.id}
                poi={poi}
                onClick={() => setSelectedPoi(poi)}
              />
            ))}

            {selectedPoi && (
              <InfoWindow
                position={{ lat: Number(selectedPoi.latitude), lng: Number(selectedPoi.longitude) }}
                onCloseClick={() => setSelectedPoi(null)}
              >
                <div className="p-2 max-w-[200px] space-y-2">
                  {selectedPoi.image_url && (
                    <img 
                      src={selectedPoi.image_url} 
                      alt={selectedPoi.name} 
                      className="w-full h-24 object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <h4 className="font-black text-xs uppercase tracking-tight">{selectedPoi.name}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{selectedPoi.description}</p>
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
