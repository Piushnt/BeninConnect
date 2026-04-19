-- ===============================================================
-- DONNÉES DE DÉMONSTRATION COMPLÈTES - MAIRIE DE ZA-KPOTA (VERSION ULTIME 6x6)
-- ===============================================================

-- 1. ARRONDISSEMENTS (8)
INSERT INTO arrondissements (tenant_id, name, chef_arrondissement, population, villages)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Za-Kpota Centre', 'M. Tossou Jean', 15200, '{"Houégbo", "Tindji", "Agon"}'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Allahé', 'Mme. Dossou Marie', 8400, '{"Kandé", "Zoungou"}'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Assalin', 'M. Soglo Pierre', 7100, '{"Dovi", "Agonlin"}'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Houngomey', 'M. Gbahoué Félicien', 9200, '{"Kpota", "Houngo"}'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Kpakpamè', 'M. Ayi Luc', 6500, '{"Kinto", "Zouma"}'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Kpèkouté', 'Mme. Adonon Claire', 5800, '{"Kouté", "Aglangou"}'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Kpingni', 'M. Fanou Moïse', 11400, '{"Zalin", "Houédou"}'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Za-Tanta', 'M. Kodjo Sylvain', 7900, '{"Tanta", "Dodo"}')
ON CONFLICT DO NOTHING;

-- 2. SERVICES PUBLICS (6)
INSERT INTO public_services (name, description, category, base_price, required_documents, procedure_steps, global_status) VALUES
('Acte de Naissance', 'Établissement du certificat de naissance.', 'État Civil', 0, '["Déclaration"]', '1, 2, 3', 'online'),
('Acte de Mariage', 'Certificat de mariage.', 'État Civil', 5000, '["ID", "Temoin"]', '1, 2, 3', 'partial'),
('Certificat de Résidence', 'Attestation de domicile.', 'Administratif', 2000, '["Preuve"]', '1, 2, 3', 'online'),
('Légalisation', 'Certification de signature.', 'Administratif', 500, '["ID"]', '1, 2', 'online'),
('Permis de Construire', 'Autorisation urbanisme.', 'Urbanisme', 50000, '["Plans"]', '1, 2, 3, 4', 'partial'),
('Taxe Foncière (TFU)', 'Impôts locaux.', 'Fiscalité', 0, '["Avis"]', '1, 2', 'online')
ON CONFLICT (name) DO NOTHING;

SELECT initialize_tenant(id) FROM tenants WHERE slug = 'zakpota';

-- 3. FLASH NEWS (6)
INSERT INTO flash_news (tenant_id, content, is_active, starts_at)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '⚠️ Date limite TFU : 31 mai 2024.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '🏗️ Travaux routiers sur l''axe Za-Kpota Centre.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '🎉 Nouveau portail digital disponible !', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '💧 Coupure d''eau jeudi matin à Za-Kpota.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '👮 Recrutement de brigadiers municipaux ouvert.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '🗳️ Conférence budgétaire demain à 10h.', true, NOW())
ON CONFLICT DO NOTHING;

-- 4. ACTUALITÉS (6)
INSERT INTO news (tenant_id, title, content, category, image_url, published_at)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Marché Moderne', 'Inauguration réussie.', 'Économie', 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800', NOW() - INTERVAL '1 day'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Santé : Vaccination', 'Succès de la campagne.', 'Santé', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', NOW() - INTERVAL '2 days'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Route Bitumée', 'Infrastructures en progrès.', 'Infrastructure', 'https://images.unsplash.com/photo-1515162816999-a0ca49e112a1?w=800', NOW() - INTERVAL '3 days'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Kits Scolaires', 'Appui à l''éducation.', 'Éducation', 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800', NOW() - INTERVAL '5 days'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Ville Propre', 'Journée de salubrité.', 'Environnement', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800', NOW() - INTERVAL '1 week'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Culture Vivante', 'Festival annuel à venir.', 'Culture', 'https://images.unsplash.com/photo-1514525253361-b930d5ad1cba?w=800', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- 5. PARTENAIRES (3)
INSERT INTO partners (tenant_id, name, logo_url, link, "order")
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Ministère Digital', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Coat_of_arms_of_Benin.svg/100px-Coat_of_arms_of_Benin.svg.png', 'https://numerique.gouv.bj', 1),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'ANCB', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6f97f8_N8fB0H6xJshzV6q_Z_g5V6C9X_yA&s', 'http://ancb.bj', 2),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Banque Mondiale', 'https://upload.wikimedia.org/wikipedia/fr/6/6f/Banque_mondiale_logo.png', 'https://worldbank.org', 3)
ON CONFLICT DO NOTHING;

-- 6. AGENDA (6)
INSERT INTO agenda_events (tenant_id, title, description, event_date, location, category)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Conseil Municipal', 'Budget 2024.', NOW() + INTERVAL '2 days', 'Hôtel de Ville', 'Administratif'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Foire Artisans', 'Expo locale.', NOW() + INTERVAL '5 days', 'Place Publique', 'Culture'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Permanence Aide', 'Aide sociale.', NOW() + INTERVAL '1 week', 'Mairie', 'Social'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Forum Jeunesse', 'Entreprenariat.', NOW() + INTERVAL '8 days', 'Foyer', 'Loisirs'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Course Santé', 'Marathon.', NOW() + INTERVAL '10 days', 'Centre', 'Sport'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Formation Bio', 'Jardinage.', NOW() + INTERVAL '12 days', 'Jardin', 'Environnement')
ON CONFLICT DO NOTHING;

-- 7. OPPORTUNITÉS (6)
INSERT INTO opportunites (tenant_id, type, title, description, deadline, status)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'emploi', 'Agents Fiscaux', '10 postes.', NOW() + INTERVAL '15 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'marche_public', 'Réfection Mairie', 'Appel d''offres.', NOW() + INTERVAL '1 month', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'emploi', 'Secrétaire CDI', 'Expérience requise.', NOW() + INTERVAL '10 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'marche_public', 'Kits Solaires', 'Arrondissements.', NOW() + INTERVAL '25 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'emploi', 'Chauffeur', 'Permis C.', NOW() + INTERVAL '5 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'marche_public', 'Caniveaux', 'Entretien.', NOW() + INTERVAL '20 days', 'open')
ON CONFLICT DO NOTHING;

-- 8. FORMULAIRES (6)
INSERT INTO formulaires (tenant_id, title, category, file_url, file_size)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Demande d''acte de naissance', 'État Civil', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '245 KB'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Permis de construire', 'Urbanisme', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '1.2 MB'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Déclaration de perte', 'Administratif', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '150 KB'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Autorisation de manifestation', 'Culture', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '320 KB'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Demande branchement SONEB', 'Services', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '410 KB'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Registre des artisans', 'Économie', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '190 KB')
ON CONFLICT DO NOTHING;

-- 9. ARTISANS (6)
INSERT INTO artisans (tenant_id, full_name, trade, phone, address, photo_url, is_verified)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Koffi Azon', 'Menuisier', '97010101', 'Depot', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Sika Biaou', 'Couturière', '95020202', 'Marché', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Gontran Houénou', 'Électricien', '90030303', 'Ruelle', 'https://images.unsplash.com/photo-1540560085022-b8b2843e7c76?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Paul Assogba', 'Mécanicien', '61040404', 'Bohicon', 'https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Alice Kponou', 'Coiffeuse', '96050505', 'Centre', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Luc Vignon', 'Soudeur', '94060606', 'Zone', 'https://images.unsplash.com/photo-1504917595217-d4dc5f649771?w=400', true)
ON CONFLICT DO NOTHING;

-- 10. SONDAGE
INSERT INTO polls (tenant_id, question, description, expires_at)
VALUES ((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Nom du stade ?', 'Choix citoyen.', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- 11. HISTOIRE
INSERT INTO page_sections (tenant_id, page_id, section_id, content) VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'histoire', 'timeline', '[
    {"year": "1940", "event": "Fondation."},
    {"year": "1978", "event": "Santé."},
    {"year": "2003", "event": "Décentralisation."},
    {"year": "2024", "event": "Digitalisation."}
]')
ON CONFLICT (tenant_id, page_id, section_id) DO UPDATE SET content = EXCLUDED.content;
