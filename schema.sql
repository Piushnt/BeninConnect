-- ===============================================================
-- PLATEFORME "BÉNIN CONNECT" - ARCHITECTURE SAAS MULTI-TENANT
-- RESTRUCTURATION TOTALE (PRODUCTION-READY) CONSOLIDÉE
-- ===============================================================

-- 1. NETTOYAGE & EXTENSIONS
-- ===============================================================
DROP TABLE IF EXISTS news_likes CASCADE;
DROP TABLE IF EXISTS news_comments CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS signalements CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS kpi_metrics CASCADE;
DROP TABLE IF EXISTS ai_interactions CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS notification_targets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS citizen_documents CASCADE;
DROP TABLE IF EXISTS file_versions CASCADE;
DROP TABLE IF EXISTS file_storage CASCADE;
DROP TABLE IF EXISTS dossier_history CASCADE;
DROP TABLE IF EXISTS dossiers CASCADE;
DROP TABLE IF EXISTS tenant_services CASCADE;
DROP TABLE IF EXISTS public_services CASCADE;
DROP TABLE IF EXISTS dossier_statuses CASCADE;
DROP TABLE IF EXISTS citizen_profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS tenant_features CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS budget_projects CASCADE;
DROP TABLE IF EXISTS budget_votes CASCADE;
DROP TABLE IF EXISTS market_stands CASCADE;
DROP TABLE IF EXISTS market_registrations CASCADE;
DROP TABLE IF EXISTS land_dossiers CASCADE;
DROP TABLE IF EXISTS field_visits CASCADE;
DROP TABLE IF EXISTS transport_registrations CASCADE;
DROP TABLE IF EXISTS council_roles CASCADE;
DROP TABLE IF EXISTS council_members CASCADE;
DROP TABLE IF EXISTS arrondissements CASCADE;
DROP TABLE IF EXISTS arrondissement_addresses CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS formulaires CASCADE;
DROP TABLE IF EXISTS audiences CASCADE;
DROP TABLE IF EXISTS artisans CASCADE;
DROP TABLE IF EXISTS opportunites CASCADE;
DROP TABLE IF EXISTS agenda_events CASCADE;
DROP TABLE IF EXISTS reservations_stade CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS flash_news CASCADE;
DROP TABLE IF EXISTS page_sections CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STRUCTURE DES TABLES
-- ===============================================================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    code_iso TEXT UNIQUE NOT NULL,
    history TEXT,
    images TEXT[],
    communes TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    theme_config JSONB DEFAULT '{"primaryColor": "#008751", "secondaryColor": "#EBB700", "accentColor": "#E30613"}',
    site_config JSONB DEFAULT '{"market_config": {}, "stade_config": {}, "tax_settings": {"tfu_rate": 0.001, "patente_base": 5000, "patente_rate": 0.1}}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE tenant_features (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    PRIMARY KEY (tenant_id, feature_id)
);

CREATE TABLE council_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rank INTEGER DEFAULT 10
);

CREATE TABLE arrondissements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chef_arrondissement TEXT,
    population INTEGER,
    villages TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE arrondissement_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    arrondissement_id UUID NOT NULL REFERENCES arrondissements(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE council_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id UUID REFERENCES council_roles(id),
    full_name TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    arrondissement_id UUID REFERENCES arrondissements(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    arrondissement_id UUID REFERENCES arrondissements(id) ON DELETE SET NULL,
    role TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    signature_url TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE citizen_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    npi TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    birth_date DATE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE dossier_statuses (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color_code TEXT NOT NULL
);

CREATE TABLE public_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    base_price DECIMAL(12,2) DEFAULT 0,
    required_documents JSONB DEFAULT '[]',
    procedure_steps TEXT,
    global_status TEXT CHECK (global_status IN ('online', 'partial', 'physical')),
    external_link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenant_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public_services(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    custom_price DECIMAL(12,2),
    custom_documents JSONB,
    custom_procedure TEXT,
    custom_status TEXT,
    custom_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, service_id)
);

CREATE TABLE dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES user_profiles(id),
    service_id UUID NOT NULL REFERENCES tenant_services(id),
    status_id TEXT NOT NULL REFERENCES dossier_statuses(id) DEFAULT 'BROUILLON',
    tracking_code TEXT UNIQUE NOT NULL,
    submission_data JSONB NOT NULL,
    document_url TEXT,
    signature_hash TEXT,
    signed_at TIMESTAMPTZ,
    signed_by_id UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE dossier_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    status_id TEXT NOT NULL REFERENCES dossier_statuses(id),
    agent_id UUID REFERENCES user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    gateway_ref TEXT,
    reference TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE file_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES user_profiles(id),
    original_name TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    current_version_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES file_storage(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE citizen_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES file_storage(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('identity', 'receipt', 'official_act')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('info', 'alert', 'news', 'event', 'low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- notification_targets (Optionnel: pour le suivi des lectures de broadcasts)
CREATE TABLE notification_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    context_used UUID[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES user_profiles(id),
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    metric_value DECIMAL(18,4) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    role TEXT NOT NULL,
    full_name TEXT,
    token TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    invited_by UUID REFERENCES user_profiles(id),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{"news": true, "alerts": true, "events": true, "services": true}',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, tenant_id)
);

CREATE TABLE signalements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    arrondissement_id UUID REFERENCES arrondissements(id) ON DELETE SET NULL,
    citizen_id UUID REFERENCES user_profiles(id),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'assigned', 'resolved', 'rejected')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES user_profiles(id),
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT,
    author_id UUID REFERENCES user_profiles(id),
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE news_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE news_likes (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (news_id, user_id)
);

CREATE TABLE news_bookmarks (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (news_id, user_id)
);

CREATE TABLE flash_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    page_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, page_id, section_id)
);

CREATE TABLE market_stands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    market_name TEXT NOT NULL,
    stand_number TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'LIBRE',
    monthly_rent DECIMAL(12,2),
    location_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE market_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    stand_id UUID REFERENCES market_stands(id),
    status TEXT DEFAULT 'EN_ATTENTE',
    requested_market TEXT,
    requested_category TEXT,
    contract_url TEXT,
    last_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE land_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'ADC' CHECK (type IN ('ADC', 'PLU', 'BORNAGE')),
    parcel_number TEXT,
    location_description TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'field_visit', 'approved', 'rejected', 'completed')),
    documents JSONB,
    attestation_url TEXT,
    signature_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE field_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    land_dossier_id UUID NOT NULL REFERENCES land_dossiers(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ NOT NULL,
    assigned_agents UUID[],
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transport_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('zemidjan', 'taxi', 'transport_marchandises')),
    vehicle_make TEXT,
    vehicle_model TEXT,
    chassis_number TEXT UNIQUE NOT NULL,
    license_plate TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'active', 'expired')),
    license_url TEXT,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE formulaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    type TEXT CHECK (type IN ('rdv', 'contact')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    preferred_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE artisans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    trade TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE opportunites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('emploi', 'marche_public')),
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agenda_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reservations_stade (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    activity_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',
    total_price DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    file_url TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    link TEXT,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    description TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    label TEXT NOT NULL
);

CREATE TABLE poll_votes (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (poll_id, user_id)
);

CREATE TABLE budget_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost DECIMAL(15,2),
    status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'selected', 'in_progress', 'completed', 'rejected')),
    author_id UUID REFERENCES user_profiles(id),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE budget_votes (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES budget_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Avis', 'Décret', 'Recrutement', 'Information', 'Urgent')),
    image_url TEXT,
    document_url TEXT,
    author_id UUID REFERENCES user_profiles(id),
    published_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcements_tenant ON announcements(tenant_id);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_published ON announcements(published_at DESC);

-- 3. FONCTIONS & TRIGGERS
-- ===============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $body$
    SELECT role FROM user_profiles WHERE id = auth.uid();
$body$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $body$
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid();
$body$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin_for_tenant(t_id UUID)
RETURNS BOOLEAN AS $body$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (role IN ('super_admin', 'super-admin') OR (role IN ('admin', 'ca_admin') AND tenant_id = t_id))
    );
$body$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_staff_for_tenant(t_id UUID)
RETURNS BOOLEAN AS $body$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (role IN ('super_admin', 'super-admin') OR (tenant_id = t_id AND role IN ('admin', 'agent', 'ca_admin')))
    );
$body$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_dossiers_updated_at ON dossiers;
CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON dossiers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $body$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, tenant_id, is_approved)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Citoyen'),
    'citizen',
    (new.raw_user_meta_data->>'tenant_id')::uuid,
    true
  );

  INSERT INTO public.citizen_profiles (id, npi)
  VALUES (
    new.id,
    (new.raw_user_meta_data->>'npi')
  );

  RETURN new;
END;
$body$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION initialize_tenant(v_t_id UUID)
RETURNS void AS $body$
BEGIN
    INSERT INTO tenant_features (tenant_id, feature_id)
    SELECT v_t_id, id FROM features ON CONFLICT DO NOTHING;

    INSERT INTO tenant_services (tenant_id, service_id, is_active, is_visible)
    SELECT v_t_id, id, true, true FROM public_services ON CONFLICT DO NOTHING;

    INSERT INTO page_sections (tenant_id, page_id, section_id, content) VALUES 
    (v_t_id, 'home', 'hero', '{"title": "Bienvenue", "subtitle": "Votre mairie à portée de clic", "badge": "Service Public Digital"}'),
    (v_t_id, 'home', 'stats', '[{"label": "Services", "value": "24/7"}, {"label": "Projets", "value": "0"}]'),
    (v_t_id, 'home', 'budget', '{"title": "Budget Participatif", "description": "Participez au développement de votre commune.", "amount": "En attente", "button_text": "En savoir plus"}'),
    (v_t_id, 'maire', 'biography', '{"name": "Maire de la Commune", "bio": "Biographie en attente de mise à jour.", "photo_url": "https://picsum.photos/seed/maire/400/400"}'),
    (v_t_id, 'tourisme', 'hero', '{"title": "Découvrez notre patrimoine", "subtitle": "Une commune riche en culture et en histoire.", "image_url": "https://picsum.photos/seed/tourisme/1920/1080"}'),
    (v_t_id, 'actualites', 'hero', '{"title": "Actualités Municipales", "subtitle": "Restez informé des dernières nouvelles de votre commune."}')
    ON CONFLICT (tenant_id, page_id, section_id) DO UPDATE SET content = EXCLUDED.content;
END;
$body$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION bootstrap_super_admin()
RETURNS void AS $body$
BEGIN
    UPDATE user_profiles 
    SET role = 'super_admin' 
    WHERE id = auth.uid();
END;
$body$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================
-- 4. POLITIQUES DE SÉCURITÉ (RLS)
-- ===============================================================


ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Staff can view profiles for their tenant" ON user_profiles FOR SELECT USING (get_my_role() IN ('super_admin', 'super-admin') OR (get_my_role() IN ('admin', 'agent', 'ca_admin') AND tenant_id = get_my_tenant_id()));
CREATE POLICY "Super admins can manage everything" ON user_profiles FOR ALL USING (get_my_role() IN ('super_admin', 'super-admin')) WITH CHECK (get_my_role() IN ('super_admin', 'super-admin'));
CREATE POLICY "Self-registration" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Self-update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read access to tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Public read access to services" ON public_services FOR SELECT USING (true);
CREATE POLICY "Public read access to tenant services" ON tenant_services FOR SELECT USING (true);

CREATE POLICY "Polls are public" ON polls FOR SELECT USING (true);
CREATE POLICY "Poll options are public" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Votes are public for counting" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Anyone authenticated can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM polls WHERE id = poll_id));
CREATE POLICY "Users can manage their own votes" ON poll_votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can check dossier status" ON dossiers FOR SELECT USING (true);
CREATE POLICY "Dossier owners can view their files" ON dossiers FOR SELECT USING (citizen_id = auth.uid());
CREATE POLICY "Staff can manage dossiers for their tenant" ON dossiers FOR ALL USING (is_staff_for_tenant(tenant_id));

CREATE POLICY "News are public" ON news FOR SELECT USING (true);
CREATE POLICY "News comments are public" ON news_comments FOR SELECT USING (true);
CREATE POLICY "News likes are public" ON news_likes FOR SELECT USING (true);
CREATE POLICY "Auth users can engage with news" ON news_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can like news" ON news_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bookmarks are public" ON news_bookmarks FOR SELECT USING (true);
CREATE POLICY "Users manage their own bookmarks" ON news_bookmarks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Announcements are public" ON announcements FOR SELECT USING (true);
CREATE POLICY "Staff manage announcements" ON announcements FOR ALL USING (is_staff_for_tenant(tenant_id));

CREATE POLICY "Locations are public" ON locations FOR SELECT USING (true);
CREATE POLICY "Staff manage locations" ON locations FOR ALL USING (is_staff_for_tenant(tenant_id));

CREATE POLICY "Budget projects are viewable by everyone" ON budget_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can propose projects" ON budget_projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage budget projects" ON budget_projects FOR ALL USING (is_staff_for_tenant(tenant_id));

CREATE POLICY "Budget votes are viewable by everyone" ON budget_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON budget_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: un utilisateur ne voit que ses propres notifications
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff can insert notifications" ON notifications FOR INSERT WITH CHECK (
    is_staff_for_tenant(tenant_id) OR get_my_role() IN ('super_admin', 'super-admin')
);

-- notification_targets policies
CREATE POLICY "Users read own targets" ON notification_targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff manage targets" ON notification_targets FOR ALL USING (is_staff_for_tenant(tenant_id));

-- Payments: le citoyen voit ses paiements via la jointure dossier
CREATE POLICY "Citizens can view their payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = payments.dossier_id AND dossiers.citizen_id = auth.uid())
);
CREATE POLICY "Staff can manage payments" ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = payments.dossier_id AND is_staff_for_tenant(dossiers.tenant_id))
);

-- Marchés: lecture publique des stands, gestion par staff
CREATE POLICY "Stands are viewable by everyone" ON market_stands FOR SELECT USING (true);
CREATE POLICY "Staff manage stands" ON market_stands FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Citizens read registrations" ON market_registrations FOR SELECT USING (
    citizen_id = auth.uid() OR is_staff_for_tenant(tenant_id)
);
CREATE POLICY "Citizens can apply for stands" ON market_registrations FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Staff can manage registrations" ON market_registrations FOR UPDATE USING (is_staff_for_tenant(tenant_id));

-- Analytics RPC for Ministerial Dashboard (Performance Fix)
CREATE OR REPLACE FUNCTION get_national_statistics()
RETURNS json AS $body$
DECLARE
    v_total_tenants INT;
    v_total_users INT;
    v_total_dossiers INT;
    v_total_revenue DECIMAL;
    v_active_services INT;
    v_pending_signalements INT;
BEGIN
    v_total_tenants := (SELECT count(*) FROM tenants);
    v_total_users := (SELECT count(*) FROM user_profiles);
    v_total_dossiers := (SELECT count(*) FROM dossiers);
    v_total_revenue := (SELECT COALESCE(sum(amount), 0) FROM payments WHERE status = 'success');
    v_active_services := (SELECT count(*) FROM public_services WHERE is_active = true);
    v_pending_signalements := (SELECT count(*) FROM signalements WHERE status = 'pending');

    RETURN json_build_object(
        'totalTenants', v_total_tenants,
        'totalUsers', v_total_users,
        'totalDossiers', v_total_dossiers,
        'totalRevenue', v_total_revenue,
        'activeServices', v_active_services,
        'pendingSignalements', v_pending_signalements
    );
END;
$body$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. DONNÉES DE DÉMONSTRATION (SEED)
-- ===============================================================

INSERT INTO departments (name, code_iso) VALUES
('Alibori', 'BJ-AL'), ('Atacora', 'BJ-AK'), ('Atlantique', 'BJ-AQ'), ('Borgou', 'BJ-BO'),
('Collines', 'BJ-CO'), ('Donga', 'BJ-DO'), ('Kouffo', 'BJ-KO'), ('Littoral', 'BJ-LI'),
('Mono', 'BJ-MO'), ('Ouémé', 'BJ-OU'), ('Plateau', 'BJ-PL'), ('Zou', 'BJ-ZO')
ON CONFLICT (name) DO NOTHING;

INSERT INTO dossier_statuses (id, label, color_code) VALUES
('BROUILLON', 'Brouillon', '#6B7280'), ('SOUMIS', 'Soumis', '#3B82F6'),
('EN_REVISION', 'En révision', '#F59E0B'), ('EN_INSTRUCTION', 'En cours d''instruction', '#F59E0B'),
('ATTENTE_PAIEMENT', 'Attente de paiement', '#EF4444'), ('APPROUVÉ', 'Approuvé', '#10B981'),
('PAYÉ', 'Payé', '#10B981'), ('REJETÉ', 'Rejeté', '#EF4444'), ('TERMINÉ', 'Terminé', '#059669')
ON CONFLICT (id) DO NOTHING;

INSERT INTO features (key, name, description) VALUES
('civil_registry', 'État Civil', 'Gestion des actes de naissance, mariage et décès'),
('tax_portal', 'Portail Fiscal', 'Paiement des taxes locales et TFU'),
('marketplace', 'Marché Local', 'Espace de vente pour les artisans locaux'),
('citizen_voice', 'Voix Citoyenne', 'Sondages et budgets participatifs')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public_services (name, description, category, base_price, required_documents, procedure_steps, global_status) VALUES
('Acte de Naissance', 'Établissement de l''acte de naissance.', 'État Civil', 0, '["Déclaration de naissance", "Pièces d''identité"]', '1. Déclaration\n2. Enregistrement\n3. Retrait', 'partial'),
('Certificat de Résidence', 'Attestation de domicile.', 'Administratif', 2000, '["Pièce d''identité", "Preuve de domicile"]', '1. Demande\n2. Vérification\n3. Signature', 'online')
ON CONFLICT (name) DO NOTHING;

-- Seed : Département du Zou
INSERT INTO departments (name, code_iso) VALUES ('Zou', 'BJ-ZO') ON CONFLICT (name) DO NOTHING;

-- Seed : Mairie de Za-Kpota
INSERT INTO tenants (department_id, name, slug, theme_config)
VALUES 
((SELECT id FROM departments WHERE name = 'Zou' LIMIT 1), 'Mairie de Za-Kpota', 'zakpota', '{"primaryColor": "#008751", "secondaryColor": "#EBB700", "accentColor": "#E30613"}')
ON CONFLICT (slug) DO NOTHING;

-- Initialisation des services pour Za-Kpota
-- Note: On utilise une fonction existante, mais on peut aussi le faire manuellement si besoin.
-- Pour la démo, on s'assure que initialize_tenant est appelé pour le tenant 'zakpota'.
SELECT initialize_tenant(id) FROM tenants WHERE slug = 'zakpota';

