import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { motion } from 'motion/react';
import { FileMinus, Trash2, Loader2, CheckCircle2, AlertCircle, Upload, Settings2, Palette } from 'lucide-react';

export const ConfigTab: React.FC = () => {
  const { tenant, setTenantBySlug } = useTenant();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: tenant?.theme_config?.primaryColor || '#008751',
    secondaryColor: tenant?.theme_config?.secondaryColor || '#EBB700',
    accentColor: tenant?.theme_config?.accentColor || '#E30613',
  });

  // Site Config (tax settings)
  const { data: taxSettings, isLoading: loadingConfig } = useQuery({
    queryKey: ['tenant_config', tenant?.id],
    queryFn: async () => {
      if (!tenant) return null;
      const { data } = await supabase
        .from('tenants')
        .select('site_config, theme_config')
        .eq('id', tenant.id)
        .single();
      if (data?.theme_config) setThemeConfig(data.theme_config);
      return data?.site_config?.tax_settings || { tfu_rate: 0.001, patente_base: 5000, patente_rate: 0.1 };
    },
    enabled: !!tenant
  });

  const [tfu, setTfu] = useState<string>('');
  const [patenteBase, setPatenteBase] = useState<string>('');

  // Sync state when data loads
  React.useEffect(() => {
    if (taxSettings) {
      setTfu(String((taxSettings.tfu_rate * 100).toFixed(3)));
      setPatenteBase(String(taxSettings.patente_base));
    }
  }, [taxSettings]);

  // Formulaires (PDF)
  const { data: formulaires = [], isLoading: loadingForms } = useQuery({
    queryKey: ['formulaires', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data } = await supabase.from('formulaires').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!tenant
  });

  // Save Tax Settings
  const saveTaxMutation = useMutation({
    mutationFn: async () => {
      if (!tenant) throw new Error('Tenant non défini');
      const { data: current } = await supabase.from('tenants').select('site_config').eq('id', tenant.id).single();
      const updatedSiteConfig = {
        ...(current?.site_config || {}),
        tax_settings: {
          tfu_rate: parseFloat(tfu) / 100,
          patente_base: parseInt(patenteBase),
          patente_rate: taxSettings?.patente_rate || 0.1
        }
      };
      const { error } = await supabase.from('tenants').update({ site_config: updatedSiteConfig }).eq('id', tenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant_config'] });
      setFeedback({ type: 'success', msg: 'Tarifs enregistrés avec succès.' });
    },
    onError: (err: any) => setFeedback({ type: 'error', msg: err.message })
  });

  // Save Theme
  const saveThemeMutation = useMutation({
    mutationFn: async () => {
      if (!tenant) throw new Error('Tenant non défini');
      const { error } = await supabase.from('tenants').update({ theme_config: themeConfig }).eq('id', tenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      if (tenant) setTenantBySlug(tenant.slug); // Reload tenant to apply new theme
      setFeedback({ type: 'success', msg: 'Thème mis à jour. Rechargez pour voir les changements.' });
    },
    onError: (err: any) => setFeedback({ type: 'error', msg: err.message })
  });

  // Delete Form
  const deleteFormMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formulaires').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formulaires'] })
  });

  // Upload Form PDF
  const handleFormUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;
    try {
      const filePath = `formulaires/${tenant.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      const { error } = await supabase.from('formulaires').insert({
        tenant_id: tenant.id,
        title: file.name.replace('.pdf', ''),
        file_url: publicUrl,
        file_size: `${(file.size / 1024).toFixed(1)} Ko`,
        category: 'Administratif'
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['formulaires'] });
      setFeedback({ type: 'success', msg: 'Formulaire ajouté avec succès.' });
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Configuration & Tarifs</h2>
        <div className="h-1 w-12 bg-primary rounded-full" />
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {feedback.msg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Tax Settings */}
        <div className="card-glass p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
            <Settings2 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase text-primary tracking-widest">Taux & Fiscalité</h3>
          </div>
          {loadingConfig ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Taux TFU (Taxe Foncière Unique) %</label>
                <input
                  type="number"
                  step="0.001"
                  value={tfu}
                  onChange={e => setTfu(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm font-bold dark:text-white outline-none focus:border-primary/50 transition-all"
                  placeholder="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patente (Base Minimum, en XOF)</label>
                <input
                  type="number"
                  value={patenteBase}
                  onChange={e => setPatenteBase(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm font-bold dark:text-white outline-none focus:border-primary/50 transition-all"
                  placeholder="5000"
                />
              </div>
              <button
                onClick={() => saveTaxMutation.mutate()}
                disabled={saveTaxMutation.isPending}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saveTaxMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Enregistrer les Tarifs
              </button>
            </div>
          )}
        </div>

        {/* Theme Config */}
        <div className="card-glass p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase text-primary tracking-widest">Identité Visuelle</h3>
          </div>
          <div className="space-y-6">
            {[
              { key: 'primaryColor', label: 'Couleur Principale' },
              { key: 'secondaryColor', label: 'Couleur Secondaire' },
              { key: 'accentColor', label: 'Couleur Accent' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-gray-500">{themeConfig[key as keyof typeof themeConfig]}</span>
                  <input
                    type="color"
                    value={themeConfig[key as keyof typeof themeConfig]}
                    onChange={e => setThemeConfig({ ...themeConfig, [key]: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            ))}
            {/* Preview */}
            <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex gap-3">
              {Object.values(themeConfig).map((color, i) => (
                <div key={i} className="flex-1 h-8 rounded-lg shadow-inner" style={{ backgroundColor: color }} />
              ))}
            </div>
            <button
              onClick={() => saveThemeMutation.mutate()}
              disabled={saveThemeMutation.isPending}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveThemeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
              Appliquer le Thème
            </button>
          </div>
        </div>

      </div>

      {/* PDF Forms Management */}
      <div className="card-glass p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4 w-full">
            <FileMinus className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase text-primary tracking-widest">Formulaires Officiels PDF</h3>
          </div>
        </div>

        <div className="space-y-4">
          {loadingForms ? (
            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : formulaires.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-widest">Aucun formulaire ajouté</p>
          ) : (
            formulaires.map((form: any) => (
              <div key={form.id} className="flex justify-between items-center p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <FileMinus className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{form.title}</span>
                    <span className="text-[9px] text-gray-400 font-mono">{form.file_size || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <a href={form.file_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary hover:underline">Voir</a>
                  <button
                    onClick={() => { if (window.confirm('Supprimer ce formulaire ?')) deleteFormMutation.mutate(form.id); }}
                    className="text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Upload Button */}
          <label className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            Ajouter un PDF officiel
            <input type="file" accept=".pdf" className="hidden" onChange={handleFormUpload} />
          </label>
        </div>
      </div>
    </div>
  );
};
