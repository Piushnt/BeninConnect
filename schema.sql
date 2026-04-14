-- ===============================================================
-- PLATEFORME "BÉNIN CONNECT" - ARCHITECTURE SAAS MULTI-TENANT
-- RESTRUCTURATION TOTALE (PRODUCTION-READY)
-- ===============================================================

-- 0. NETTOYAGE & EXTENSIONS
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
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notification_targets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================================
-- 1. STRUCTURE ADMINISTRATIVE & MULTI-TENANT (Piliers 1 & 2)
-- ===============================================================

-- Départements du Bénin
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    code_iso TEXT UNIQUE NOT NULL,
    history TEXT,
    images TEXT[],
    communes TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Communes (Tenants)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    theme_config JSONB DEFAULT '{
        "primaryColor": "#008751",
        "secondaryColor": "#EBB700",
        "accentColor": "#E30613"
    }',
    site_config JSONB DEFAULT '{
        "market_config": {},
        "stade_config": {},
        "tax_settings": {
            "tfu_rate": 0.001,
            "patente_base": 5000,
            "patente_rate": 0.1
        }
    }',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fonctionnalités (Feature Flags)
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

-- ===============================================================
-- 2. IDENTITÉ & PROFILS (Fix 403, 500)
-- ===============================================================

-- Profils de base (Intégration Auth)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id), -- NULLABLE pour citoyens nationaux (Fix 500)
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'agent', 'citizen')),
    full_name TEXT, -- Alignement React (Fix 500)
    avatar_url TEXT, -- Alignement React (Fix 500)
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- FONCTIONS DE SÉCURITÉ (Définies ici pour être utilisées dans les politiques RLS)
-- ===============================================================

-- Fonction pour vérifier le rôle sans récursion (Fix 42P17)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_for_tenant(t_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (role = 'super_admin' OR (role = 'admin' AND tenant_id = t_id))
    );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_staff_for_tenant(t_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (role = 'super_admin' OR (tenant_id = t_id AND role IN ('admin', 'agent')))
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profils Citoyens (Données Nationales)
CREATE TABLE citizen_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    npi TEXT UNIQUE, -- Numéro Personnel d'Identification
    phone TEXT,
    address TEXT,
    birth_date DATE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================================
-- 3. E-SERVICES & WORKFLOW (Piliers 3 & 4)
-- ===============================================================

-- Statuts des dossiers (Workflow exact)
CREATE TABLE dossier_statuses (
    id TEXT PRIMARY KEY, -- ex: 'BROUILLON', 'SOUMIS'
    label TEXT NOT NULL,
    color_code TEXT NOT NULL
);

-- Services Publics (Catalogue National)
CREATE TABLE public_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
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

-- Activation et Personnalisation par commune
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

-- Dossiers
CREATE TABLE dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES user_profiles(id), -- Nullable pour enregistrement direct par agent
    service_id UUID NOT NULL REFERENCES tenant_services(id),
    status_id TEXT NOT NULL REFERENCES dossier_statuses(id) DEFAULT 'BROUILLON',
    tracking_code TEXT UNIQUE NOT NULL,
    submission_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historique des dossiers
CREATE TABLE dossier_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    status_id TEXT NOT NULL REFERENCES dossier_statuses(id),
    agent_id UUID REFERENCES user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================================
-- 4. COFFRE-FORT NUMÉRIQUE (Pilier 4)
-- ===============================================================

-- Stockage central
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

-- Versions des fichiers
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES file_storage(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Coffre-fort citoyen
CREATE TABLE citizen_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES file_storage(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('identity', 'receipt', 'official_act')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================================
-- 5. NOTIFICATIONS & PAIEMENTS (Pilier 5 - Fix 400)
-- ===============================================================

-- Notifications (Campagnes)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    action_url TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cibles des notifications (Logique de ciblage Fix 400)
CREATE TABLE notification_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = National
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE, -- NULL = Broadcast
    role_target TEXT CHECK (role_target IN ('admin', 'agent', 'citizen')), -- NULL = Tous les rôles
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Paiements
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    gateway_ref TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================================
-- 6. IA & AUDIT (Piliers 6 & 7)
-- ===============================================================

-- Base de connaissances (Pilier 7)
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = National
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Interactions IA (Pilier 7)
CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    context_used UUID[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs (Pilier 6)
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

-- KPI & Statistiques
CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    metric_value DECIMAL(18,4) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================================
-- 7. ENGAGEMENT CITOYEN (Pilier 8)
-- ===============================================================

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Signalements
CREATE TABLE signalements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Actualités
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

-- Commentaires
CREATE TABLE news_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Likes
CREATE TABLE news_likes (
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (news_id, user_id)
);

-- Bookmarks (Favoris)
CREATE TABLE news_bookmarks (
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (news_id, user_id)
);

-- Flash News (Ticker)
CREATE TABLE flash_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sections de pages personnalisables (CMS)
CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL pour contenu national/global
    page_id TEXT NOT NULL, -- e.g., 'home', 'maire', 'actualites'
    section_id TEXT NOT NULL, -- e.g., 'hero', 'biography', 'vision'
    content JSONB NOT NULL DEFAULT '{}',
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, page_id, section_id)
);

-- ===============================================================
-- 8. MODULES COMPLÉMENTAIRES (Pages Spécifiques)
-- ===============================================================

-- Conseil Municipal
CREATE TABLE council_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rank INTEGER DEFAULT 10 -- Pour le tri par importance
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

-- Arrondissements
CREATE TABLE arrondissements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chef_arrondissement TEXT,
    population INTEGER,
    villages TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Adresses des arrondissements
CREATE TABLE arrondissement_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arrondissement_id UUID NOT NULL REFERENCES arrondissements(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Points d'Intérêt (POI)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'mairie', 'ecole', 'sante', 'marche'
    description TEXT,
    image_url TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Formulaires (Base documentaire)
CREATE TABLE formulaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audiences (RDV & Contact)
CREATE TABLE audiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id), -- Optionnel pour contact anonyme
    type TEXT CHECK (type IN ('rdv', 'contact')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    preferred_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Artisans
CREATE TABLE artisans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    trade TEXT NOT NULL, -- Métier
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunités (Emploi & Marchés)
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

-- Agenda
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

-- Réservations Stade
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

-- Rapports & Publications
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'budget', 'compte_rendu', 'rapport_annuel'
    file_url TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Partenaires Stratégiques
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

-- Sondages & Polls
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
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    label TEXT NOT NULL
);

CREATE TABLE poll_votes (
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (poll_id, user_id)
);

-- Budget Participatif
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
    project_id UUID NOT NULL REFERENCES budget_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

-- Activation RLS for new tables
ALTER TABLE budget_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Budget projects are viewable by everyone" ON budget_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can propose projects" ON budget_projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage budget projects" ON budget_projects FOR ALL USING (is_staff_for_tenant(tenant_id));

CREATE POLICY "Budget votes are viewable by everyone" ON budget_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON budget_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can remove their own votes" ON budget_votes FOR DELETE USING (auth.uid() = user_id);

-- ===============================================================
-- 9. SÉCURITÉ (RLS) - FIX 403
-- ===============================================================

-- Activation RLS
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
ALTER TABLE news_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrondissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrondissement_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations_stade ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- POLITIQUES USER_PROFILES (Fix 403, 42P17)
CREATE POLICY "Profiles viewable by owner or staff" ON user_profiles FOR SELECT USING (
    auth.uid() = id OR 
    is_admin_for_tenant(tenant_id)
);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id); -- Fix 403
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- POLITIQUES CITIZEN_PROFILES (Fix 42P17)
CREATE POLICY "Citizen profiles viewable by owner or staff" ON citizen_profiles FOR SELECT USING (
    auth.uid() = id OR 
    is_admin_for_tenant((SELECT tenant_id FROM user_profiles WHERE id = citizen_profiles.id))
);
CREATE POLICY "Users can insert their own citizen profile" ON citizen_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own citizen profile" ON citizen_profiles FOR UPDATE USING (auth.uid() = id);

-- POLITIQUES TENANTS & SERVICES (Public)
CREATE POLICY "Tenants are viewable by everyone" ON tenants FOR SELECT USING (true);
CREATE POLICY "Super admins can manage tenants" ON tenants FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Public services are viewable by everyone" ON public_services FOR SELECT USING (true);
CREATE POLICY "Super admins can manage public services" ON public_services FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Tenant services are viewable by everyone" ON tenant_services FOR SELECT USING (true);
CREATE POLICY "Staff can manage tenant services" ON tenant_services FOR ALL USING (
    is_staff_for_tenant(tenant_id)
);

CREATE POLICY "Council roles are viewable by everyone" ON council_roles FOR SELECT USING (true);
CREATE POLICY "Council members are viewable by everyone" ON council_members FOR SELECT USING (true);
CREATE POLICY "Arrondissements are viewable by everyone" ON arrondissements FOR SELECT USING (true);
CREATE POLICY "Arrondissement addresses are viewable by everyone" ON arrondissement_addresses FOR SELECT USING (true);
CREATE POLICY "Staff can manage arrondissement addresses" ON arrondissement_addresses FOR ALL USING (
    is_staff_for_tenant(tenant_id)
);

CREATE POLICY "Locations are viewable by everyone" ON locations FOR SELECT USING (true);
CREATE POLICY "Staff can manage locations" ON locations FOR ALL USING (
    is_staff_for_tenant(tenant_id)
);

CREATE POLICY "Formulaires are viewable by everyone" ON formulaires FOR SELECT USING (true);
CREATE POLICY "Artisans are viewable by everyone" ON artisans FOR SELECT USING (true);
CREATE POLICY "Opportunites are viewable by everyone" ON opportunites FOR SELECT USING (true);
CREATE POLICY "Agenda events are viewable by everyone" ON agenda_events FOR SELECT USING (true);
CREATE POLICY "Reports are viewable by everyone" ON reports FOR SELECT USING (true);
CREATE POLICY "Partners are viewable by everyone" ON partners FOR SELECT USING (true);
CREATE POLICY "Staff can manage partners" ON partners FOR ALL USING (
    is_staff_for_tenant(tenant_id)
);

CREATE POLICY "Flash news are viewable by everyone" ON flash_news FOR SELECT USING (true);
CREATE POLICY "Staff can manage flash news" ON flash_news FOR ALL USING (
    is_staff_for_tenant(tenant_id)
);

CREATE POLICY "Page sections are viewable by everyone" ON page_sections FOR SELECT USING (true);
CREATE POLICY "Polls are viewable by everyone" ON polls FOR SELECT USING (true);
CREATE POLICY "Staff can manage polls" ON polls FOR ALL USING (
    is_staff_for_tenant(tenant_id)
);

CREATE POLICY "Poll options are viewable by everyone" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Staff can manage poll options" ON poll_options FOR ALL USING (
    EXISTS (SELECT 1 FROM polls WHERE id = poll_id AND is_staff_for_tenant(tenant_id))
);

-- POLITIQUES AUDIENCES
CREATE POLICY "Users can view their own audiences" ON audiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert an audience" ON audiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view all audiences for their tenant" ON audiences FOR SELECT USING (
    is_staff_for_tenant(tenant_id)
);

-- POLITIQUES STADE
CREATE POLICY "Users can view their own reservations" ON reservations_stade FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can reserve" ON reservations_stade FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can view all reservations for their tenant" ON reservations_stade FOR SELECT USING (
    is_staff_for_tenant(tenant_id)
);

-- POLITIQUES DOSSIERS
CREATE POLICY "Dossiers viewable by owner or staff" ON dossiers FOR SELECT USING (
    citizen_id = auth.uid() OR 
    is_staff_for_tenant(tenant_id)
);
CREATE POLICY "Users can create their own dossiers" ON dossiers FOR INSERT WITH CHECK (auth.uid() = citizen_id OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Staff can update dossiers" ON dossiers FOR UPDATE USING (is_staff_for_tenant(tenant_id));

-- POLITIQUES NEWS (Public)
CREATE POLICY "News are viewable by everyone" ON news FOR SELECT USING (true);
CREATE POLICY "Staff can manage news" ON news FOR ALL USING (
    is_staff_for_tenant(tenant_id)
);

CREATE POLICY "Comments are viewable by everyone" ON news_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON news_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- POLITIQUES LIKES & BOOKMARKS
CREATE POLICY "Likes are viewable by everyone" ON news_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON news_likes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can unlike their own likes" ON news_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Bookmarks are private to owner" ON news_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can bookmark" ON news_bookmarks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can remove their own bookmarks" ON news_bookmarks FOR DELETE USING (auth.uid() = user_id);


-- ===============================================================
-- 9. TRIGGERS & AUTOMATISATION
-- ===============================================================

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
    IF (OLD.status_id IS NULL OR OLD.status_id <> NEW.status_id) THEN
        INSERT INTO dossier_history (dossier_id, status_id, notes)
        VALUES (NEW.id, NEW.status_id, 'Changement automatique de statut');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER dossier_status_log AFTER UPDATE ON dossiers FOR EACH ROW EXECUTE PROCEDURE log_dossier_status_change();

-- ===============================================================
-- 10. INITIALISATION (SEED)
-- ===============================================================

-- 12 Départements du Bénin
INSERT INTO departments (name, code_iso) VALUES
('Alibori', 'BJ-AL'),
('Atacora', 'BJ-AK'),
('Atlantique', 'BJ-AQ'),
('Borgou', 'BJ-BO'),
('Collines', 'BJ-CO'),
('Donga', 'BJ-DO'),
('Kouffo', 'BJ-KO'),
('Littoral', 'BJ-LI'),
('Mono', 'BJ-MO'),
('Ouémé', 'BJ-OU'),
('Plateau', 'BJ-PL'),
('Zou', 'BJ-ZO');

-- Statuts Workflow
INSERT INTO dossier_statuses (id, label, color_code) VALUES
('BROUILLON', 'Brouillon', '#6B7280'),
('SOUMIS', 'Soumis', '#3B82F6'),
('EN_INSTRUCTION', 'En cours d''instruction', '#F59E0B'),
('ATTENTE_PAIEMENT', 'Attente de paiement', '#EF4444'),
('PAYÉ', 'Payé', '#10B981'),
('TERMINÉ', 'Terminé', '#059669');

-- Features
INSERT INTO features (key, name, description) VALUES
('civil_registry', 'État Civil', 'Gestion des actes de naissance, mariage et décès'),
('tax_portal', 'Portail Fiscal', 'Paiement des taxes locales et TFU'),
('marketplace', 'Marché Local', 'Espace de vente pour les artisans locaux'),
('citizen_voice', 'Voix Citoyenne', 'Sondages et budgets participatifs');

-- Commune Modèle : Za-Kpota (Zou)
DO $$
DECLARE
    zou_id UUID;
    zakpota_id UUID;
BEGIN
    SELECT id INTO zou_id FROM departments WHERE name = 'Zou';
    
    INSERT INTO tenants (department_id, name, slug, theme_config)
    VALUES (zou_id, 'Mairie de Za-Kpota', 'zakpota', '{
        "primaryColor": "#008751",
        "secondaryColor": "#EBB700",
        "accentColor": "#E30613"
    }')
    RETURNING id INTO zakpota_id;

    -- Activation des features pour Za-Kpota
    INSERT INTO tenant_features (tenant_id, feature_id)
    SELECT zakpota_id, id FROM features;

    -- Insertion de quelques actualités pour Za-Kpota
    INSERT INTO news (tenant_id, title, content, category, image_url) VALUES
    (zakpota_id, 'Lancement de la campagne de reboisement 2026', 'La mairie de Za-Kpota, sous l''impulsion du Maire Félicien DANWOUIGNAN, lance officiellement sa campagne annuelle de reboisement. Cette initiative vise à planter plus de 10 000 arbres dans les arrondissements de Allahé et Assalin pour lutter contre l''érosion des sols et restaurer le couvert végétal de la commune.', 'Environnement', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1920'),
    (zakpota_id, 'Inauguration du nouveau marché moderne de Za-Kpota', 'Le nouveau marché couvert de Za-Kpota a été inauguré ce matin. Doté de plus de 200 places sécurisées, de sanitaires modernes et d''un système de gestion des déchets, ce marché va dynamiser l''économie locale et offrir de meilleures conditions de travail aux commerçants.', 'Économie', 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=1920'),
    (zakpota_id, 'Excellence Scolaire : Bourses pour les meilleurs bacheliers', 'Le conseil municipal a voté l''octroi de bourses d''excellence pour accompagner les 20 meilleurs bacheliers de la commune. Ces bourses couvriront les frais d''inscription à l''université et une allocation mensuelle pour soutenir nos futurs cadres.', 'Éducation', 'https://images.unsplash.com/photo-1523050335392-9bc56751d11a?auto=format&fit=crop&q=80&w=1920'),
    (zakpota_id, 'Modernisation de l''État Civil : Vos actes en 24h', 'Grâce au nouveau système numérique MairieConnect, les citoyens de Za-Kpota peuvent désormais obtenir leurs actes de naissance et certificats de résidence en moins de 24 heures. Une avancée majeure pour la transparence et l''efficacité administrative.', 'Administration', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1920'),
    (zakpota_id, 'Tournoi de Football de la Fraternité : Finale ce Dimanche', 'La grande finale du tournoi de football inter-arrondissements se tiendra ce dimanche au stade municipal. Venez nombreux soutenir vos équipes favorites dans une ambiance festive et sportive.', 'Sport', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1920');

    -- Flash News
    INSERT INTO flash_news (tenant_id, content) VALUES
    (zakpota_id, 'Alerte météo : Fortes pluies prévues pour ce weekend. Soyez prudents.'),
    (zakpota_id, 'Rappel : La date limite pour le paiement de la taxe foncière est le 30 juin.');

    -- Page Sections (CMS)
    INSERT INTO page_sections (tenant_id, page_id, section_id, content) VALUES
    (zakpota_id, 'home', 'hero', '{"title": "Bienvenue à Za-Kpota", "subtitle": "Une commune dynamique au cœur du Zou", "image_url": "https://picsum.photos/seed/zakpota_hero/1920/1080"}'),
    (zakpota_id, 'home', 'stats', '[{"label": "Habitants", "value": "135,000+"}, {"label": "Villages", "value": "54"}, {"label": "Services", "value": "24/7"}, {"label": "Projets", "value": "12"}]'),
    (zakpota_id, 'home', 'essentials', '[{"title": "ÉTAT CIVIL", "desc": "Demandez vos actes de naissance, mariage ou décès en ligne.", "category": "ADMINISTRATIF", "icon": "Users", "color": "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", "path_suffix": "/services?category=État Civil"}, {"title": "URBANISME & FONCIER", "desc": "Consultez le plan cadastral et demandez vos permis de construire.", "category": "SERVICES", "icon": "Building2", "color": "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400", "path_suffix": "/services?category=Urbanisme"}, {"title": "MARCHÉS PUBLICS", "desc": "Consultez les appels d''offres et opportunités d''affaires.", "category": "ÉCONOMIE", "icon": "Briefcase", "color": "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400", "path_suffix": "/opportunites?type=marche_public"}, {"title": "TAXES LOCALES", "desc": "Payez vos taxes de voirie et de développement local en toute sécurité.", "category": "FISCALITÉ", "icon": "Coins", "color": "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400", "path_suffix": "/simulateur"}]'),
    (zakpota_id, 'home', 'budget', '{"title": "Budget Participatif 2026", "description": "Proposez vos idées et votez pour les projets qui transformeront votre quartier. 500 millions de FCFA alloués aux projets citoyens.", "button_text": "Participer maintenant", "amount": "500 millions FCFA"}'),
    (zakpota_id, 'maire', 'biography', '{"name": "Félicien DANWOUIGNAN", "bio": "Élu maire en 2020, Félicien DANWOUIGNAN s''engage pour le développement durable et l''éducation de la jeunesse de Za-Kpota.", "photo_url": "https://picsum.photos/seed/maire_zakpota/400/400"}'),
    (zakpota_id, 'maire', 'vision', '{"title": "Notre Vision", "content": "Faire de Za-Kpota un pôle agro-industriel majeur du Bénin d''ici 2030."}'),
    (zakpota_id, 'tourisme', 'hero', '{"title": "Explorez les Trésors de Za-Kpota", "subtitle": "Une terre de culture, d''histoire et de paysages naturels époustouflants au cœur du Zou.", "image_url": "https://picsum.photos/seed/zakpota-tourism/1920/1080"}'),
    (zakpota_id, 'tourisme', 'attractions', '[{"title": "Forêt Sacrée", "desc": "Un site mystique chargé d''histoire et de traditions ancestrales.", "image": "https://picsum.photos/seed/forest/800/600", "category": "Culture"}, {"title": "Marché de Za-Kpota", "desc": "L''un des plus grands marchés de la région, vibrant de couleurs et de saveurs.", "image": "https://picsum.photos/seed/market-zak/800/600", "category": "Commerce"}, {"title": "Collines de Kpota", "desc": "Offrent une vue panoramique imprenable sur toute la vallée.", "image": "https://picsum.photos/seed/hills/800/600", "category": "Nature"}]');

    -- Arrondissements
    INSERT INTO arrondissements (tenant_id, name, chef_arrondissement, population, villages) VALUES
    (zakpota_id, 'Za-Kpota Centre', 'Jean DOSSOU', 15000, '{"Village A", "Village B"}'),
    (zakpota_id, 'Allahé', 'Marie SOGLO', 12000, '{"Village C", "Village D"}'),
    (zakpota_id, 'Assalin', 'Pierre AGOSSOU', 10000, '{"Village E", "Village F"}');

    -- Conseil Municipal Roles
    INSERT INTO council_roles (name, rank) VALUES
    ('Maire', 1),
    ('Premier Adjoint', 2),
    ('Deuxième Adjoint', 3),
    ('Conseiller', 4);

    -- Conseil Municipal Members
    INSERT INTO council_members (tenant_id, role_id, full_name, bio)
    SELECT zakpota_id, id, 'Félicien DANWOUIGNAN', 'Maire de Za-Kpota' FROM council_roles WHERE name = 'Maire';

    -- Sondages (Polls)
    INSERT INTO polls (tenant_id, question, description)
    VALUES (zakpota_id, 'Quel projet prioritaire pour 2026 ?', 'Aidez-nous à choisir le prochain grand chantier de la commune.')
    RETURNING id INTO zou_id; -- Reusing zou_id variable for poll_id

    INSERT INTO poll_options (poll_id, label) VALUES
    (zou_id, 'Nouveau centre de santé'),
    (zou_id, 'Éclairage public solaire'),
    (zou_id, 'Réfection des pistes rurales'),
    (zou_id, 'Extension du réseau d''eau');

    -- Partenaires
    INSERT INTO partners (tenant_id, name, logo_url, link) VALUES
    (zakpota_id, 'Banque Mondiale', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/World_Bank_logo.svg/1200px-World_Bank_logo.svg.png', 'https://www.worldbank.org'),
    (zakpota_id, 'PNUD', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/UNDP_logo.svg/1200px-UNDP_logo.svg.png', 'https://www.undp.org'),
    (zakpota_id, 'Union Européenne', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1200px-Flag_of_Europe.svg.png', 'https://european-union.europa.eu'),
    (zakpota_id, 'AFD', 'https://upload.wikimedia.org/wikipedia/fr/thumb/f/f3/Logo_AFD_2017.svg/1200px-Logo_AFD_2017.svg.png', 'https://www.afd.fr');
END $$;

-- Contenu Global (National)
INSERT INTO page_sections (tenant_id, page_id, section_id, content) VALUES
(NULL, 'national_home', 'stats', '[{"label": "Communes", "val": "77", "icon": "Building2"}, {"label": "Départements", "val": "12", "icon": "MapPin"}, {"label": "Services en ligne", "val": "150+", "icon": "Globe"}, {"label": "Citoyens connectés", "val": "2M+", "icon": "Users"}]');

-- Services Publics Standards
INSERT INTO public_services (name, description, category, base_price, required_documents, procedure_steps, global_status) VALUES
('Acte de Naissance', 'Établissement de l''acte de naissance.', 'État Civil', 0, '["Déclaration de naissance", "Pièces d''identité"]', '1. Déclaration\n2. Enregistrement\n3. Retrait', 'partial'),
('Certificat de Résidence', 'Attestation de domicile.', 'Administratif', 2000, '["Pièce d''identité", "Preuve de domicile"]', '1. Demande\n2. Vérification\n3. Signature', 'online');
