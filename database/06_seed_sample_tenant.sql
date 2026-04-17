-- ===============================================================
-- 11. INITIALISATION COMMUNE MODÈLE (ZA-KPOTA)
-- ===============================================================

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
    PERFORM initialize_tenant(zakpota_id);

    -- Insertion de quelques actualités pour Za-Kpota
    INSERT INTO news (tenant_id, title, content, category, image_url) VALUES
    (zakpota_id, 'Lancement de la campagne de reboisement 2026', 'La mairie de Za-Kpota lance sa campagne annuelle de reboisement.', 'Environnement', 'https://picsum.photos/seed/forest/1920/1080'),
    (zakpota_id, 'Inauguration du nouveau marché moderne de Za-Kpota', 'Le nouveau marché couvert de Za-Kpota a été inauguré ce matin.', 'Économie', 'https://picsum.photos/seed/market/1920/1080');

    -- Flash News
    INSERT INTO flash_news (tenant_id, content) VALUES
    (zakpota_id, 'Alerte météo : Fortes pluies prévues pour ce weekend.'),
    (zakpota_id, 'Rappel : La date limite pour le paiement de la taxe foncière est le 30 juin.');

    -- Configuration spécifique CMS
    UPDATE page_sections SET content = '{"title": "Bienvenue à Za-Kpota", "subtitle": "Une commune dynamique au cœur du Zou"}'
    WHERE tenant_id = zakpota_id AND page_id = 'home' AND section_id = 'hero';

    -- Arrondissements
    INSERT INTO arrondissements (tenant_id, name, chef_arrondissement, population, villages) VALUES
    (zakpota_id, 'Za-Kpota Centre', 'Jean DOSSOU', 15000, '{"Village A", "Village B"}'),
    (zakpota_id, 'Allahé', 'Marie SOGLO', 12000, '{"Village C", "Village D"}'),
    (zakpota_id, 'Assalin', 'Pierre AGOSSOU', 10000, '{"Village E", "Village F"}');

    -- Conseil Municipal
    INSERT INTO council_roles (name, rank) VALUES ('Maire', 1), ('Premier Adjoint', 2);
    INSERT INTO council_members (tenant_id, role_id, full_name, bio)
    SELECT zakpota_id, id, 'Félicien DANWOUIGNAN', 'Maire de Za-Kpota' FROM council_roles WHERE name = 'Maire';

END $$;
