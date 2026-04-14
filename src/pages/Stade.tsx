import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, Users, MapPin, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTenant } from '../contexts/TenantContext';

export const Stade: React.FC = () => {
  const { tenant } = useTenant();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const stadeConfig = tenant?.site_config?.stade_config || {
    hourly_rate: 5000,
    lighting_rate: 2000
  };

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const slots = ['08:00 - 10:00', '10:00 - 12:00', '15:00 - 17:00', '17:00 - 19:00', '19:00 - 21:00'];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="relative h-[400px] rounded-[60px] overflow-hidden mb-12 shadow-2xl">
          <img 
            src="https://picsum.photos/seed/stadium/1920/1080" 
            className="w-full h-full object-cover"
            alt="Stade Municipal"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EBB700] text-black rounded-full text-[10px] font-black uppercase tracking-widest">
                <Trophy className="w-3 h-3" />
                Infrastructure Sportive
              </div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tight">Stade Municipal</h1>
              <p className="text-gray-200 font-medium text-lg">
                Réservez vos créneaux pour vos matchs, entraînements ou événements sportifs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info & Booking */}
          <div className="lg:col-span-2 space-y-12">
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Users, label: 'Capacité', val: '5,000 places' },
                { icon: MapPin, label: 'Surface', val: 'Gazon Synthétique' },
                { icon: CheckCircle2, label: 'Éclairage', val: 'Projecteurs LED' },
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.label}</p>
                    <p className="font-black text-gray-900 dark:text-white">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Disponibilités</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <Calendar className="w-4 h-4" />
                  Avril 2026
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 mb-10">
                {days.map((day, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedDay(i)}
                    className={cn(
                      "p-4 rounded-2xl flex flex-col items-center gap-2 transition-all",
                      selectedDay === i ? "bg-[#008751] text-white shadow-lg shadow-[#008751]/20" : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{day}</span>
                    <span className="text-xl font-black">{10 + i}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Créneaux horaires</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.map((slot, i) => (
                    <button 
                      key={i}
                      className="p-6 rounded-2xl border-2 border-gray-50 dark:border-gray-800 hover:border-[#008751] dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-[#008751] dark:group-hover:text-green-400" />
                        <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#008751] dark:group-hover:text-green-400">{slot}</span>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-[#008751] dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Libre</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-gray-900 dark:bg-black p-10 rounded-[40px] text-white shadow-2xl sticky top-24 border border-white/5">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Réservation</h3>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tarif / Heure</span>
                  <span className="font-black">{stadeConfig.hourly_rate.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Éclairage</span>
                  <span className="font-black">+{stadeConfig.lighting_rate.toLocaleString()} FCFA</span>
                </div>
              </div>
              <button className="w-full py-6 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-500 transition-all active:scale-95 flex items-center justify-center gap-3">
                Réserver maintenant
                <ChevronRight className="w-5 h-5" />
              </button>
              <p className="mt-6 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Toute réservation doit être validée par le service des sports de la mairie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
