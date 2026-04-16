import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Download, 
  Search,
  Filter,
  User,
  Shield,
  CreditCard,
  Bell,
  Store,
  Building2,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Dossier, CitizenDocument } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const CitizenSpace: React.FC = () => {
  const { user, profile } = useAuth();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [documents, setDocuments] = useState<CitizenDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dossiers' | 'documents' | 'payments' | 'services' | 'profile'>('dossiers');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dossiersRes, docsRes, paymentsRes] = await Promise.all([
        supabase
          .from('dossiers')
          .select('*, status:dossier_statuses(*), tenant_service:tenant_services(*, service:public_services(*)), tenant:tenants(name)')
          .eq('citizen_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('citizen_documents')
          .select('*, file:file_storage(*)')
          .eq('citizen_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*, dossier:dossiers!inner(tracking_code, citizen_id, tenant_service:tenant_services(service:public_services(name)))')
          .eq('dossiers.citizen_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      if (dossiersRes.error) throw dossiersRes.error;
      if (docsRes.error) throw docsRes.error;

      setDossiers(dossiersRes.data || []);
      setDocuments(docsRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (err) {
      console.error('Error fetching citizen data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDossiers = dossiers.filter(d => 
    d.tracking_code.toLowerCase().includes(search.toLowerCase()) ||
    d.tenant_service?.service?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="bento-card p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Mon Espace Personnel</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Bienvenue, {profile?.full_name}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut Compte</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Vérifié</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'dossiers', label: 'Mes Dossiers', icon: FileText },
            { id: 'services', label: 'Services Spécialisés', icon: MapPin },
            { id: 'documents', label: 'Coffre-fort', icon: Shield },
            { id: 'payments', label: 'Paiements', icon: CreditCard },
            { id: 'profile', label: 'Mon Profil', icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-white dark:bg-[#131B2B] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/50 dark:border-white/10" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'dossiers' && (
                <motion.div
                  key="dossiers"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Search & Filter */}
                  <div className="flex gap-3">
                    <div className="relative flex-grow">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="Rechercher par code ou service..."
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-xl text-sm font-medium outline-none dark:text-white transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <button className="p-3.5 bg-gray-50 dark:bg-white/5 border border-transparent rounded-xl text-gray-400 hover:text-emerald-500 transition-colors">
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Dossiers List */}
                  {loading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : filteredDossiers.length > 0 ? (
                    <div className="space-y-4">
                      {filteredDossiers.map((dossier) => (
                        <div 
                          key={dossier.id}
                          className="bento-card p-6 group hover:border-emerald-500/30 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                                  {dossier.tracking_code} • {dossier.tenant?.name}
                                </div>
                                <h3 className="text-base font-display font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                  {dossier.tenant_service?.service?.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dossier.status?.color_code }} />
                                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    {dossier.status?.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                                Détails
                              </button>
                              <button className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bento-card border-dashed">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">Aucun dossier trouvé</h3>
                      <p className="text-xs text-gray-500 font-medium mt-2">Commencez une démarche pour voir vos dossiers ici</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {documents.length > 0 ? documents.map((doc) => (
                    <div key={doc.id} className="bento-card p-6 group hover:border-blue-500/30 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Shield className="w-5 h-5" />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{doc.file?.original_name}</h3>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{doc.category}</div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-20 bento-card border-dashed">
                      <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">Votre coffre-fort est vide</h3>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {payments.length > 0 ? payments.map((payment) => (
                    <div key={payment.id} className="bento-card p-6 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white">
                            {payment.dossier?.tenant_service?.service?.name}
                          </h3>
                          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                            Réf: {payment.gateway_ref || 'N/A'} • {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-display font-bold text-gray-900 dark:text-white">{payment.amount} {payment.currency}</div>
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mt-1",
                          payment.status === 'success' ? 'text-emerald-500' : 'text-amber-500'
                        )}>
                          {payment.status}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 bento-card border-dashed">
                      <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">Aucun paiement trouvé</h3>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {[
                    { title: 'Marchés & Stands', desc: 'Gestion des étalages et baux commerciaux.', icon: Store, path: 'mon-marche', color: 'bg-orange-50 text-orange-600' },
                    { title: 'Foncier (GUFU)', desc: 'Guichet unique pour vos dossiers fonciers.', icon: Building2, path: 'foncier', color: 'bg-blue-50 text-blue-600' },
                    { title: 'Transport Pro', desc: 'Immatriculation Zemidjan et Taxis.', icon: ShieldCheck, path: 'transport', color: 'bg-emerald-50 text-emerald-600' },
                    { title: 'Localité', desc: 'Démarches au niveau de l\'arrondissement.', icon: MapPin, path: 'arrondissement', color: 'bg-purple-50 text-purple-600' }
                  ].map((s, i) => (
                    <div key={i} className="bento-card p-6 group cursor-pointer hover:border-emerald-500/30 transition-all" onClick={() => navigate(`/cotonou/services/${s.path}`)}>
                       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", s.color)}>
                          <s.icon className="w-6 h-6" />
                       </div>
                       <h3 className="font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{s.title}</h3>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{s.desc}</p>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          Ouvrir le guichet
                          <ChevronRight className="w-3 h-3" />
                       </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bento-card p-8"
                >
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <User className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{profile?.full_name}</h3>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">{profile?.role}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                       <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-sm font-medium dark:text-white">{user?.email}</div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identifiant Unique (NPI)</label>
                       <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-sm font-medium dark:text-white">Non renseigné</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bento-card p-8 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-transparent relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold mb-4 group-hover:scale-105 transition-transform origin-left">Besoin d'aide ?</h3>
                <p className="text-xs text-emerald-50/80 font-medium leading-relaxed mb-6">
                  Notre assistant IA est disponible 24/7 pour vous accompagner dans vos démarches administratives.
                </p>
                <button className="w-full py-4 bg-white text-emerald-700 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-50 transition-all shadow-lg shadow-black/10">
                  Lancer l'assistant
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </div>

            {/* Stats Card */}
            <div className="bento-card p-6 md:p-8 space-y-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aperçu</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">En cours</span>
                  </div>
                  <span className="text-sm font-display font-bold text-gray-900 dark:text-white">{dossiers.filter(d => d.status_id !== 'TERMINÉ' && d.status_id !== 'REJETÉ').length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Terminés</span>
                  </div>
                  <span className="text-sm font-display font-bold text-gray-900 dark:text-white">{dossiers.filter(d => d.status_id === 'TERMINÉ').length}</span>
                </div>
              </div>
            </div>

            {/* Metropolitan Services Quick Links */}
            <div className="bento-card p-6 md:p-8 space-y-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Services Métropole</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Marchés', icon: Store, path: 'mon-marche', color: 'bg-orange-50 text-orange-600' },
                  { label: 'Foncier (GUFU)', icon: Building2, path: 'foncier', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Transport', icon: ShieldCheck, path: 'transport', color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Décentralisation', icon: MapPin, path: 'arrondissement', color: 'bg-purple-50 text-purple-600' },
                ].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => window.location.href = `/${profile?.tenant_id}/services/${s.path}`}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", s.color)}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">{s.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
