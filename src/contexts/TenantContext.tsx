import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Tenant } from '../types';

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  setTenantBySlug: (slug: string) => Promise<void>;
  isNational: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setTenantBySlug = async (slug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          departments (
            name
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setTenant(data);
    } catch (err: any) {
      setError(err.message);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const isNational = !tenant;

  return (
    <TenantContext.Provider value={{ tenant, loading, error, setTenantBySlug, isNational }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
