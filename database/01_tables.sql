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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================================
-- 1. STRUCTURE ADMINISTRATIVE & MULTI-TENANT
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

-- ===============================================================
-- 2. UNITÉS STRUCTURELLES & ÉLUS
-- ===============================================================

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

-- ===============================================================
-- 3. UTILISATEURS & IDENTITÉS
-- ===============================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    arrondissement_id UUID REFERENCES arrondissements(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'agent', 'citizen', 'ca_admin')),
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
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    action_url TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('info', 'alert', 'news', 'event', 'low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role_target TEXT CHECK (role_target IN ('admin', 'agent', 'citizen')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

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
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
    monthly_rent DECIMAL(12,2),
    location_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE market_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    stand_id UUID REFERENCES market_stands(id),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'terminated')),
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
