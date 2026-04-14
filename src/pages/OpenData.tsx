import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Database, TrendingUp, PieChart as PieIcon, Download, Info, Filter } from 'lucide-react';

const COLORS = ['#008751', '#EBB700', '#E30613', '#3B82F6', '#6B7280'];

export const OpenData: React.FC = () => {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'budget' | 'services' | 'demographics'>('budget');

  const budgetData = [
    { name: 'Éducation', value: 35000000 },
    { name: 'Santé', value: 25000000 },
    { name: 'Voirie', value: 45000000 },
    { name: 'Culture', value: 15000000 },
    { name: 'Social', value: 20000000 },
  ];

  const servicesData = [
    { month: 'Jan', count: 450 },
    { month: 'Fév', count: 520 },
    { month: 'Mar', count: 610 },
    { month: 'Avr', count: 580 },
    { month: 'Mai', count: 720 },
    { month: 'Juin', count: 850 },
  ];

  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <Database className="w-3.5 h-3.5" />
              Transparence & Open Data
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              Observatoire <br />
              <span className="text-blue-500">Communal</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl font-medium">
              Accédez aux données ouvertes de la mairie de {tenant?.name}. Suivez l'évolution des services et l'utilisation des ressources publiques.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="px-6 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white hover:bg-gray-50 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'budget', label: 'Budget & Dépenses', icon: TrendingUp },
            { id: 'services', label: 'Performance Services', icon: Database },
            { id: 'demographics', label: 'Démographie', icon: PieIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 p-10 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-black uppercase tracking-tight dark:text-white">
                {activeTab === 'budget' ? 'Répartition des Dépenses 2024' : 'Évolution des Demandes de Services'}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Info className="w-4 h-4" />
                Dernière mise à jour: Hier
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'budget' ? (
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={servicesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Résumé Global</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Budget Total</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">1.2B FCFA</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Taux d'Exécution</span>
                  <span className="text-sm font-black text-blue-500">65%</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500 p-8 rounded-[40px] text-white shadow-xl shadow-blue-500/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Note de Transparence</h4>
              <div className="text-5xl font-black mb-2">A+</div>
              <p className="text-xs font-medium opacity-80">
                La mairie de {tenant?.name} respecte les standards internationaux d'Open Data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
