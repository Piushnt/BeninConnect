import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';

export interface PageSectionContent {
  id: string;
  page_id: string;
  section_id: string;
  content: any;
  is_visible: boolean;
}

export const usePageContent = (pageId: string) => {
  const { tenant } = useTenant();
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let query = supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageId)
          .eq('is_visible', true);

        if (tenant) {
          query = query.eq('tenant_id', tenant.id);
        } else {
          query = query.is('tenant_id', null);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const contentMap = (data || []).reduce((acc: any, section: any) => {
          acc[section.section_id] = section.content;
          return acc;
        }, {});

        setSections(contentMap);
      } catch (err: any) {
        console.error(`Error fetching page content for ${pageId}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [tenant, pageId]);

  return { sections, loading, error };
};
