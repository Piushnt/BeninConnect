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
  MapPin,
  Upload,
  Plus,
  RefreshCcw,
  LogOut,
  Camera,
  Trash2,
  Save,
  Pencil,
  Loader2
} from 'lucide-react';
import { Dossier, CitizenDocument, Tenant } from '../types';
import { cn, formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const CitizenSpace: React.FC = () => {
  const { user, profile } = useAuth();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [documents, setDocuments] = useState<CitizenDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'dossiers' | 'documents' | 'payments' | 'services' | 'profile'>('dossiers');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('identity');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [citizenProfile, setCitizenProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    npi: ''
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showTenantModal, setShowTenantModal] = useState<{isOpen: boolean, targetPath: string}>({isOpen: false, targetPath: ''});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenants = async () => {
      const { data } = await supabase.from('tenants').select('*').eq('is_active', true).order('name');
      if (data) setTenants(data);
    };
    fetchTenants();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchCitizenProfile();
    }
  }, [user]);

  const fetchCitizenProfile = async () => {
    const { data } = await supabase
      .from('citizen_profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      setCitizenProfile(data);
      setProfileForm({
        full_name: profile?.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        npi: data.npi || ''
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dossiersRes, docsRes, paymentsRes, notificationsRes] = await Promise.all([
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
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      if (dossiersRes.error) throw dossiersRes.error;
      if (docsRes.error) throw docsRes.error;

      setDossiers(dossiersRes.data || []);
      setDocuments(docsRes.data || []);
      setPayments(paymentsRes.data || []);
      setNotifications(notificationsRes.data || []);
    } catch (err) {
      console.error('Error fetching citizen data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update basic profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ full_name: profileForm.full_name })
        .eq('id', user?.id);
      
      if (profileError) throw profileError;

      // Update citizen specific profile
      const { error: citizenError } = await supabase
        .from('citizen_profiles')
        .upsert({
          id: user?.id,
          phone: profileForm.phone,
          address: profileForm.address,
          npi: profileForm.npi
        });
      
      if (citizenError) throw citizenError;

      alert('Profil mis à jour avec succès !');
      setIsEditingProfile(false);
      fetchData();
      fetchCitizenProfile();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setIsUploading(true);
      // 1. Upload to Storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `citizen-docs/${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // 2. Create entry in file_storage
      const { data: storageData, error: storageError } = await supabase
        .from('file_storage')
        .insert({
          original_name: uploadFile.name,
          mime_type: uploadFile.type,
          size_bytes: uploadFile.size,
          storage_path: filePath,
          public_url: publicUrl
        })
        .select()
        .single();

      if (storageError) throw storageError;

      // 3. Link to citizen_documents
      const { error: linkError } = await supabase
        .from('citizen_documents')
        .insert({
          tenant_id: null, // Rendre le document globalement accessible à toutes les mairies
          citizen_id: user?.id,
          file_id: storageData.id,
          category: uploadCategory
        });

      if (linkError) throw linkError;

      setShowUploadModal(false);
      setUploadFile(null);
      fetchData();
    } catch (err: any) {
      alert('Erreur upload: ' + err.message);
    } finally {
      setIsUploading(false);
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
          
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-900 dark:text-white">Notifications</h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{notifications.filter(n => !n.is_read).length} non lues</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-500 uppercase font-bold tracking-widest">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={async () => {
                            if (!notif.is_read) {
                              await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
                              fetchData();
                            }
                          }}
                          className={cn(
                            "p-4 border-b border-gray-50 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                            !notif.is_read ? "bg-emerald-50/30 dark:bg-emerald-500/5" : ""
                          )}
                        >
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{notif.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{notif.content}</p>
                          <span className="text-[9px] text-gray-400 font-bold mt-2 block">{formatDate(notif.created_at)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mes Documents Officiels</h3>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#008751] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006b40] transition-all shadow-lg shadow-[#008751]/10"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter un document
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.length > 0 ? documents.map((doc) => (
                      <div key={doc.id} className="bento-card p-6 group hover:border-blue-500/30 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex gap-2">
                              <a 
                                href={doc.file?.public_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            </div>
                          </div>
                          <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{doc.file?.original_name}</h3>
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{doc.category}</div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(doc.created_at).toLocaleDateString()}</span>
                           <button className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline">Supprimer</button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-20 bento-card border-dashed">
                        <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">Votre coffre-fort est vide</h3>
                        <p className="text-xs text-gray-500 font-medium mt-2">Uploadez vos documents d'identité pour faciliter vos démarches</p>
                      </div>
                    )}
                  </div>
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
                    <div key={i} className="bento-card p-6 group cursor-pointer hover:border-emerald-500/30 transition-all" onClick={() => setShowTenantModal({isOpen: true, targetPath: s.path})}>
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
                  className="bento-card p-8 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-[32px] flex items-center justify-center text-emerald-600 dark:text-emerald-400 overflow-hidden">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12" />
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl text-gray-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{profile?.full_name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Niveau d'accès : {profile?.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isEditingProfile ? "bg-gray-100 dark:bg-white/5 text-gray-600" : "bg-[#008751] text-white shadow-lg shadow-[#008751]/10"
                      )}
                    >
                      {isEditingProfile ? 'Annuler' : 'Modifier le profil'}
                    </button>
                  </div>
                  
                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nom Complet</label>
                          <input 
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none text-sm transition-all dark:text-white"
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                          <input 
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none text-sm transition-all dark:text-white"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Adresse Résidentielle</label>
                          <input 
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none text-sm transition-all dark:text-white"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Identifiant Unique (NPI)</label>
                          <input 
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none text-sm font-mono tracking-widest transition-all dark:text-white uppercase"
                            value={profileForm.npi}
                            onChange={(e) => setProfileForm({...profileForm, npi: e.target.value})}
                            placeholder="Ex: 123456789"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button type="submit" className="px-8 py-4 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-[#008751]/20 hover:scale-105 active:scale-95 transition-all">
                          <Save className="w-4 h-4" />
                          Enregistrer les modifications
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                         { label: 'Email', value: user?.email, icon: Bell },
                         { label: 'Téléphone', value: citizenProfile?.phone || 'Non renseigné', icon: Bell },
                         { label: 'NPI', value: citizenProfile?.npi || 'Non renseigné', icon: Shield },
                         { label: 'Adresse', value: citizenProfile?.address || 'Non renseignée', icon: MapPin },
                       ].map((item, i) => (
                         <div key={i} className="p-6 bg-gray-50 dark:bg-white/5 rounded-[28px] border border-gray-100 dark:border-white/5 group hover:border-emerald-500/20 transition-all">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <item.icon className="w-3 h-3 text-emerald-500" />
                               {item.label}
                            </h4>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                         </div>
                       ))}
                    </div>
                  )}
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
                    onClick={() => setShowTenantModal({isOpen: true, targetPath: s.path})}
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

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#131B2B] rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Nouveau Document</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Coffre-fort numérique sécurisé</p>
                  </div>
                  <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
                    <XCircle className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleFileUpload} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Catégorie</label>
                    <select 
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none text-sm font-bold transition-all dark:text-white appearance-none"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                    >
                      <option value="identity">Pièce d'Identité (CNI / Passeport)</option>
                      <option value="residence">Certificat de Résidence</option>
                      <option value="birth">Acte de Naissance</option>
                      <option value="tax">Justificatif Fiscal</option>
                      <option value="other">Autre Document</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fichier</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover:border-emerald-500/50 transition-all bg-gray-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {uploadFile ? uploadFile.name : "Cliquez ou glissez un fichier"}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium mt-1">PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUploading || !uploadFile}
                    className="w-full py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-[#008751]/20 disabled:opacity-50 hover:bg-[#006b40] transition-all"
                  >
                    {isUploading ? (
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Uploader en sécurité
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tenant Selector Modal */}
      <AnimatePresence>
        {showTenantModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTenantModal({isOpen: false, targetPath: ''})}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-white/5 z-10 shrink-0">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Choisir une Mairie</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Où souhaitez-vous effectuer cette démarche ?</p>
                </div>
                <button onClick={() => setShowTenantModal({isOpen: false, targetPath: ''})} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto overflow-x-hidden space-y-3">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                        setShowTenantModal({isOpen: false, targetPath: ''});
                        navigate(`/${t.slug}/services/${showTenantModal.targetPath}`);
                    }}
                    className="w-full bento-card p-4 hover:border-emerald-500/30 flex items-center justify-between group transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      {t.logo_url ? (
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center p-2 shrink-0 border border-gray-100 dark:border-white/5 overflow-hidden">
                          <img src={t.logo_url} alt={t.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{t.name}</h4>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Commune active</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
                
                {tenants.length === 0 && (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Chargement des communes disponibles...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
