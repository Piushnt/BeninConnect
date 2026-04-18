-- ===============================================================
-- 11. INITIALISATION (SEED CORE)
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
('Zou', 'BJ-ZO')
ON CONFLICT (name) DO NOTHING;

-- Statuts Workflow
INSERT INTO dossier_statuses (id, label, color_code) VALUES
('BROUILLON',         'Brouillon',                '#6B7280'),
('SOUMIS',            'Soumis',                   '#3B82F6'),
('EN_REVISION',       'En révision',              '#F59E0B'),
('EN_INSTRUCTION',    'En cours d''instruction',  '#F59E0B'),
('ATTENTE_PAIEMENT',  'Attente de paiement',      '#EF4444'),
('APPROUVÉ',          'Approuvé',                 '#10B981'),
('PAYÉ',              'Payé',                     '#10B981'),
('REJETÉ',            'Rejeté',                   '#EF4444'),
('TERMINÉ',           'Terminé',                  '#059669')
ON CONFLICT (id) DO NOTHING;

-- Features
INSERT INTO features (key, name, description) VALUES
('civil_registry', 'État Civil', 'Gestion des actes de naissance, mariage et décès'),
('tax_portal', 'Portail Fiscal', 'Paiement des taxes locales et TFU'),
('marketplace', 'Marché Local', 'Espace de vente pour les artisans locaux'),
('citizen_voice', 'Voix Citoyenne', 'Sondages et budgets participatifs')
ON CONFLICT (key) DO NOTHING;

-- Services Publics Standards
INSERT INTO public_services (name, description, category, base_price, required_documents, procedure_steps, global_status) VALUES
('Acte de Naissance', 'Établissement de l''acte de naissance.', 'État Civil', 0, '["Déclaration de naissance", "Pièces d''identité"]', '1. Déclaration\n2. Enregistrement\n3. Retrait', 'partial'),
('Certificat de Résidence', 'Attestation de domicile.', 'Administratif', 2000, '["Pièce d''identité", "Preuve de domicile"]', '1. Demande\n2. Vérification\n3. Signature', 'online');

-- Contenu Global (National)
INSERT INTO page_sections (tenant_id, page_id, section_id, content) VALUES
(NULL, 'national_home', 'stats', '[{"label": "Communes", "val": "77", "icon": "Building2"}, {"label": "Départements", "val": "12", "icon": "MapPin"}, {"label": "Services en ligne", "val": "150+", "icon": "Globe"}, {"label": "Citoyens connectés", "val": "2M+", "icon": "Users"}]');
