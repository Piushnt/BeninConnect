-- ===============================================================
-- 11. INITIALISATION COMMUNE MODÈLE (ZA-KPOTA)
-- Idempotent : peut être réexécuté sans erreur ni doublon.
-- ===============================================================

DO $$
DECLARE
    zou_id      UUID;
    zakpota_id  UUID;
    maire_role_id UUID;
BEGIN
    -- Récupérer le département Zou (créé dans 04_seed_basics.sql)
    SELECT id INTO zou_id FROM departments WHERE name = 'Zou';
    IF zou_id IS NULL THEN
        RAISE EXCEPTION 'Département "Zou" introuvable. Lancez 04_seed_basics.sql en premier.';
    END IF;

    -- Créer le tenant Za-Kpota (idempotent via ON CONFLICT)
    INSERT INTO tenants (department_id, name, slug, theme_config)
    VALUES (
        zou_id,
        'Mairie de Za-Kpota',
        'zakpota',
        '{"primaryColor": "#008751", "secondaryColor": "#EBB700", "accentColor": "#E30613"}'
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Récupérer l'ID (qu'il vienne d'être créé ou existait déjà)
    SELECT id INTO zakpota_id FROM tenants WHERE slug = 'zakpota';

    -- Initialiser les features et services pour Za-Kpota
    PERFORM initialize_tenant(zakpota_id);

    -- Actualités de démonstration (idempotent via ON CONFLICT sur le titre+tenant)
    INSERT INTO news (tenant_id, title, content, category, image_url) VALUES
    (zakpota_id, 'Lancement de la campagne de reboisement 2026',
     'La mairie de Za-Kpota lance sa campagne annuelle de reboisement pour protéger les forêts locales.',
     'Environnement', 'https://picsum.photos/seed/forest/1920/1080'),
    (zakpota_id, 'Inauguration du nouveau marché moderne de Za-Kpota',
     'Le nouveau marché couvert de Za-Kpota a été inauguré ce matin en présence des autorités.',
     'Économie', 'https://picsum.photos/seed/market/1920/1080')
    ON CONFLICT DO NOTHING;

    -- Flash News (idempotent)
    INSERT INTO flash_news (tenant_id, content, is_active) VALUES
    (zakpota_id, 'Alerte météo : Fortes pluies prévues ce weekend. Évitez les zones inondables.', true),
    (zakpota_id, 'Rappel : La date limite pour le paiement de la taxe foncière est le 30 juin.', true)
    ON CONFLICT DO NOTHING;

    -- Mise à jour CMS Hero
    UPDATE page_sections
    SET content = '{"title": "Bienvenue à Za-Kpota", "subtitle": "Une commune dynamique au cœur du Zou", "badge": "Service Public Digital"}'
    WHERE tenant_id = zakpota_id AND page_id = 'home' AND section_id = 'hero';

    -- Arrondissements (idempotent : ON CONFLICT sur tenant_id + name si UNIQUE, sinon insert protégé)
    INSERT INTO arrondissements (tenant_id, name, chef_arrondissement, population, villages)
    SELECT zakpota_id, 'Za-Kpota Centre', 'Jean DOSSOU', 15000, ARRAY['Village A', 'Village B']
    WHERE NOT EXISTS (SELECT 1 FROM arrondissements WHERE tenant_id = zakpota_id AND name = 'Za-Kpota Centre');

    INSERT INTO arrondissements (tenant_id, name, chef_arrondissement, population, villages)
    SELECT zakpota_id, 'Allahé', 'Marie SOGLO', 12000, ARRAY['Village C', 'Village D']
    WHERE NOT EXISTS (SELECT 1 FROM arrondissements WHERE tenant_id = zakpota_id AND name = 'Allahé');

    INSERT INTO arrondissements (tenant_id, name, chef_arrondissement, population, villages)
    SELECT zakpota_id, 'Assalin', 'Pierre AGOSSOU', 10000, ARRAY['Village E', 'Village F']
    WHERE NOT EXISTS (SELECT 1 FROM arrondissements WHERE tenant_id = zakpota_id AND name = 'Assalin');

    -- Rôles du Conseil Municipal (idempotent via WHERE NOT EXISTS)
    INSERT INTO council_roles (name, rank)
    SELECT 'Maire', 1
    WHERE NOT EXISTS (SELECT 1 FROM council_roles WHERE name = 'Maire');

    INSERT INTO council_roles (name, rank)
    SELECT 'Premier Adjoint', 2
    WHERE NOT EXISTS (SELECT 1 FROM council_roles WHERE name = 'Premier Adjoint');

    -- Récupérer l'ID du rôle Maire
    SELECT id INTO maire_role_id FROM council_roles WHERE name = 'Maire';

    -- Membre du conseil (idempotent)
    INSERT INTO council_members (tenant_id, role_id, full_name, bio)
    SELECT zakpota_id, maire_role_id, 'Félicien DANWOUIGNAN', 'Maire élu de Za-Kpota, engagé pour le développement local.'
    WHERE NOT EXISTS (
        SELECT 1 FROM council_members WHERE tenant_id = zakpota_id AND role_id = maire_role_id
    );

END $$;
