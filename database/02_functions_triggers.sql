-- ===============================================================
-- 9. TRIGGERS & AUTOMATISATION
-- ===============================================================

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
        AND (role = 'super_admin' OR (role IN ('admin', 'ca_admin') AND tenant_id = t_id))
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_staff_for_tenant(t_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (role = 'super_admin' OR (tenant_id = t_id AND role IN ('admin', 'agent', 'ca_admin')))
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON dossiers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

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
