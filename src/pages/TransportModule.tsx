import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Car, 
  Bike, 
  Truck, 
  Search, 
  Plus, 
  User, 
  CreditCard, 
  FileCheck,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  Printer
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const TransportModule: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: 'ZEMIDJAN',
    licensePlate: '',
    ownerName: '',
    phone: ''
  });

  useEffect(() => {
    if (tenant) {
      fetchData();
    }
  }, [tenant, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('transport_registrations')
        .select('*')
        .eq('tenant_id', tenant?.id);
      
      if (!isAdmin) {
        query.eq('citizen_id', user?.id);
      }

      const { data } = await query.order('created_at', { ascending: false });
      setRegistrations(data || []);
    } catch (error) {
      console.error('Erreur data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const { error } = await supabase
        .from('transport_registrations')
        .insert({
          tenant_id: tenant?.id,
          citizen_id: user?.id,
          vehicle_type: formData.vehicleType,
          license_plate: formData.licensePlate,
          status: 'EFFECTUÉ'
        });
      
      if (error) throw error;
      alert('Immatriculation professionnelle enregistrée !');
      setShowRegisterModal(false);
      fetchData();
    } catch (error) {
      alert('Erreur enregistrement');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold tracking-widest text-xs uppercase text-gray-500">Connexion au registre des transports...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bento-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              {isAdmin ? 'Regie des Transports' : 'Mon Espace Conducteur'}
            </h1>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mt-1">
              Urban Mobility & Transport Management
            </p>
          </div>
        </div>

        {!isAdmin && (
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Immatriculation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Conducteur</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Plaque</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Statut</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {r.license_plate}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {r.vehicle_type === 'ZEMIDJAN' ? <Bike className="w-4 h-4 text-blue-500" /> : <Car className="w-4 h-4 text-emerald-500" />}
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{r.vehicle_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">
                        {r.license_plate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {r.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all">
                          <QrCode className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all">
                          <Printer className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bento-card p-6 bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-6 flex items-center gap-2">
              <CreditCard className="w-3 h-3" />
              Taxe Professionnelle
            </h4>
            <div className="space-y-6">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[10px] text-blue-100 mb-1">Dernier paiement le 12/03</p>
                <p className="text-2xl font-display font-bold">À jour</p>
              </div>
              <button className="w-full bg-white text-blue-600 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                Payer maintenant
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bento-card p-6 bg-gray-50/50 dark:bg-white/5">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Sécurité Routière
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                "N'oubliez pas votre casque homologué et celui de votre passager."
              </li>
              <li className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                "Votre gilet professionnel doit être visible en tout temps."
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Immatriculation</h3>
              <button onClick={() => setShowRegisterModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, vehicleType: 'ZEMIDJAN'})}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                    formData.vehicleType === 'ZEMIDJAN' ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "border-gray-100 dark:border-white/5 text-gray-400"
                  )}
                >
                  <Bike className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Zémidjan</span>
                </button>
                <button 
                  onClick={() => setFormData({...formData, vehicleType: 'TAXI'})}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                    formData.vehicleType === 'TAXI' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "border-gray-100 dark:border-white/5 text-gray-400"
                  )}
                >
                  <Car className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Taxi / Bus</span>
                </button>
              </div>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Numéro de Plaque</span>
                <input 
                  type="text" 
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  placeholder="ex: BH 1234 RB"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-mono uppercase"
                />
              </label>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowRegisterModal(false)} className="flex-1 btn-ghost py-4">Annuler</button>
              <button onClick={handleRegister} className="flex-1 btn-primary py-4">Valider</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
