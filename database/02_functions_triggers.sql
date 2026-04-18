-- ===============================================================
-- 2. FONCTIONS, TRIGGERS & AUTOMATISATION
-- ===============================================================

-- ---------------------------------------------------------------
-- A. UTILITAIRES DE SESSION & RÔLES
-- ---------------------------------------------------------------

-- Fonction pour vérifier le rôle sans récursion (Fix 42P17)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_my_arrondissement_id()
RETURNS UUID AS $$
    SELECT arrondissement_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin_for_tenant(t_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (role IN ('super_admin', 'super-admin') OR (role IN ('admin', 'ca_admin') AND tenant_id = t_id))
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_staff_for_tenant(t_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (role IN ('super_admin', 'super-admin') OR (tenant_id = t_id AND role IN ('admin', 'agent', 'ca_admin')))
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------
-- B. TRIGGERS DE MISE À JOUR (updated_at)
-- ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers de mise à jour automatique
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_dossiers_updated_at ON dossiers;
CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON dossiers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ---------------------------------------------------------------
-- C. AUTOMATISATION DE L'INSCRIPTION (Profiles)
-- ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Insertion dans user_profiles
  INSERT INTO public.user_profiles (id, full_name, role, tenant_id, is_approved)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Citoyen'),
    'citizen',
    (new.raw_user_meta_data->>'tenant_id')::uuid,
    true
  );

  -- 2. Insertion dans citizen_profiles
  INSERT INTO public.citizen_profiles (id, npi)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'npi', 'PENDING')
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------
-- D. WORKFLOWS DOSSIERS & INITIALISATION
-- ---------------------------------------------------------------

-- Historique des dossiers automatique
CREATE OR REPLACE FUNCTION log_dossier_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND (OLD.status_id IS NULL OR OLD.status_id <> NEW.status_id)) THEN
        INSERT INTO dossier_history (tenant_id, dossier_id, status_id, agent_id, notes)
        VALUES (NEW.tenant_id, NEW.id, NEW.status_id, auth.uid(), 'Statut mis à jour de ' || COALESCE(OLD.status_id, 'NR') || ' à ' || NEW.status_id);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS dossier_status_log ON dossiers;
CREATE TRIGGER dossier_status_log AFTER UPDATE ON dossiers FOR EACH ROW EXECUTE PROCEDURE log_dossier_status_change();

-- Fonction pour initialiser une nouvelle commune
CREATE OR REPLACE FUNCTION initialize_tenant(t_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO tenant_features (tenant_id, feature_id)
    SELECT t_id, id FROM features ON CONFLICT DO NOTHING;

    INSERT INTO tenant_services (tenant_id, service_id, is_active, is_visible)
    SELECT t_id, id, true, true FROM public_services ON CONFLICT DO NOTHING;

    INSERT INTO page_sections (tenant_id, page_id, section_id, content) VALUES 
    (t_id, 'home', 'hero', '{"title": "Bienvenue", "subtitle": "Votre mairie à portée de clic", "badge": "Service Public Digital"}'),
    (t_id, 'home', 'stats', '[{"label": "Services", "value": "24/7"}, {"label": "Projets", "value": "0"}]'),
    (t_id, 'home', 'budget', '{"title": "Budget Participatif", "description": "Participez au développement de votre commune.", "amount": "En attente", "button_text": "En savoir plus"}'),
    (t_id, 'maire', 'biography', '{"name": "Maire de la Commune", "bio": "Biographie en attente de mise à jour.", "photo_url": "https://picsum.photos/seed/maire/400/400"}'),
    (t_id, 'tourisme', 'hero', '{"title": "Découvrez notre patrimoine", "subtitle": "Une commune riche en culture et en histoire.", "image_url": "https://picsum.photos/seed/tourisme/1920/1080"}'),
    (t_id, 'actualites', 'hero', '{"title": "Actualités Municipales", "subtitle": "Restez informé des dernières nouvelles de votre commune."}')
    ON CONFLICT (tenant_id, page_id, section_id) DO UPDATE SET content = EXCLUDED.content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- E. ADMINISTRATION & BOOTSTRAP
-- ---------------------------------------------------------------

-- Fonction pour s'auto-promouvoir super_admin (Utile pour le setup initial)
CREATE OR REPLACE FUNCTION bootstrap_super_admin()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET role = 'super_admin' 
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
