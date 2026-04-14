import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Users, Home, ChevronRight, Plus, Pencil, Trash2, X, Loader2, Save } from 'lucide-react';
import { cn } from '../lib/utils';

interface Arrondissement {
  id: string;
  name: string;
  chef_arrondissement: string;
  population: number;
  villages: string[];
}

interface Address {
  id: string;
  arrondissement_id: string;
  label: string;
  value: string;
}

export const Arrondissements: React.FC = () => {
  const { tenant } = useTenant();
  const { profile } = useAuth();
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);
  const [addresses, setAddresses] = useState<Record<string, Address[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingArr, setEditingArr] = useState<Arrondissement | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  
  // Address Form State
  const [newAddress, setNewAddress] = useState({ label: '', value: '' });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (tenant) {
      fetchData();
    }
  }, [tenant]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: arrData, error: arrError } = await supabase
        .from('arrondissements')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('name');

      if (arrError) throw arrError;
      setArrondissements(arrData || []);

      // Fetch addresses
      const { data: addrData, error: addrError } = await supabase
        .from('arrondissement_addresses')
        .select('*');
      
      if (!addrError && addrData) {
        const addrMap: Record<string, Address[]> = {};
        addrData.forEach(addr => {
          if (!addrMap[addr.arrondissement_id]) addrMap[addr.arrondissement_id] = [];
          addrMap[addr.arrondissement_id].push(addr);
        });
        setAddresses(addrMap);
      }
    } catch (err) {
      console.error('Error fetching arrondissements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (arrId: string) => {
    if (!newAddress.label || !newAddress.value) return;

    try {
      const { data, error } = await supabase
        .from('arrondissement_addresses')
        .insert({
          arrondissement_id: arrId,
          label: newAddress.label,
          value: newAddress.value
        })
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => ({
        ...prev,
        [arrId]: [...(prev[arrId] || []), data]
      }));
      setNewAddress({ label: '', value: '' });
    } catch (err) {
      console.error('Error adding address:', err);
    }
  };

  const handleDeleteAddress = async (arrId: string, addrId: string) => {
    try {
      const { error } = await supabase
        .from('arrondissement_addresses')
        .delete()
        .eq('id', addrId);

      if (error) throw error;

      setAddresses(prev => ({
        ...prev,
        [arrId]: prev[arrId].filter(a => a.id !== addrId)
      }));
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-12 h-12 text-[#008751] animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-20">
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nos Arrondissements</h1>
            <div className="w-24 h-1.5 bg-[#EBB700] mx-auto md:mx-0" />
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
              La commune de {tenant?.name} est divisée en plusieurs arrondissements pour une administration plus proche des citoyens.
            </p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsManaging(!isManaging)}
              className={cn(
                "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center gap-3",
                isManaging ? "bg-red-500 text-white" : "bg-[#008751] text-white hover:bg-[#006b40]"
              )}
            >
              {isManaging ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              {isManaging ? "Quitter la gestion" : "Gérer les adresses"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arrondissements.map((arr, i) => (
            <motion.div
              key={arr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 p-10 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400">
                  <Home className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Population</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{arr.population?.toLocaleString()}</p>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight group-hover:text-[#008751] dark:group-hover:text-green-400 transition-colors">
                {arr.name}
              </h3>

              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Chef d'Arrondissement (CA)</p>
                    <p className="font-bold text-gray-700 dark:text-gray-300">{arr.chef_arrondissement}</p>
                  </div>
                </div>
                
                {/* Addresses List */}
                <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <p className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.2em]">Adresses & Contacts</p>
                  <div className="space-y-3">
                    {addresses[arr.id]?.map(addr => (
                      <div key={addr.id} className="flex justify-between items-center group/addr">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{addr.label}</span>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{addr.value}</span>
                        </div>
                        {isManaging && (
                          <button 
                            onClick={() => handleDeleteAddress(arr.id, addr.id)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover/addr:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {(!addresses[arr.id] || addresses[arr.id].length === 0) && !isManaging && (
                      <p className="text-[10px] text-gray-400 italic">Aucune adresse répertoriée</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Address Form (Admin Only) */}
              {isManaging && (
                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 space-y-3">
                  <input 
                    type="text"
                    placeholder="Label (ex: Bureau)"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 dark:text-white"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                  />
                  <input 
                    type="text"
                    placeholder="Valeur (ex: Rue 123)"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 dark:text-white"
                    value={newAddress.value}
                    onChange={(e) => setNewAddress({...newAddress, value: e.target.value})}
                  />
                  <button 
                    onClick={() => handleAddAddress(arr.id)}
                    className="w-full py-2 bg-[#008751] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006b40] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                </div>
              )}

              {!isManaging && (
                <button className="mt-auto w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all flex items-center justify-center gap-2">
                  Contacter l'arrondissement
                  <Phone className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Map CTA */}
        <div className="mt-24 relative h-[400px] rounded-[60px] overflow-hidden shadow-2xl group cursor-pointer">
          <img 
            src="https://picsum.photos/seed/map/1920/1080" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            alt="Carte de la commune"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-12">
            <h3 className="text-4xl font-black text-white uppercase tracking-tight mb-6">Voir la carte communale</h3>
            <p className="text-white/80 font-medium max-w-xl mb-10">
              Localisez précisément les services publics, les écoles, les centres de santé et les points d'intérêt de chaque arrondissement.
            </p>
            <button className="px-10 py-5 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all flex items-center gap-3">
              Ouvrir la carte interactive
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
