import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from './TenantContext';

interface FeatureContextType {
  features: Record<string, boolean>;
  loading: boolean;
  isFeatureEnabled: (key: string) => boolean;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      fetchFeatures();
    } else {
      setLoading(false);
    }
  }, [tenant]);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_features')
        .select(`
          is_enabled,
          features (
            key
          )
        `)
        .eq('tenant_id', tenant?.id);

      if (error) throw error;
      
      const featureMap = (data || []).reduce((acc, f: any) => ({
        ...acc,
        [f.features.key]: f.is_enabled
      }), {});
      
      setFeatures(featureMap);
    } catch (err) {
      console.error('Error fetching features:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (key: string) => {
    // Default to true if not explicitly disabled in DB
    return features[key] !== false;
  };

  return (
    <FeatureContext.Provider value={{ features, loading, isFeatureEnabled }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
};
