-- ===============================================================
-- DONNÉES DE DÉMONSTRATION COMPLÈTES - MAIRIE DE ZA-KPOTA (ULTIME SYNCHRO)
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

-- 2. SERVICES PUBLICS SUPPLÉMENTAIRES (POUR TOTAL 6)
INSERT INTO public_services (name, description, category, base_price, required_documents, procedure_steps, global_status) VALUES
('Acte de Mariage', 'Établissement du certificat de mariage.', 'État Civil', 5000, '["Actes de naissance", "Pièces d''identité des témoins"]', '1. Dépôt\n2. Célébration\n3. Retrait', 'partial'),
('Légalisation de Signature', 'Certification conforme de signature.', 'Administratif', 500, '["Pièce d''identité", "Document à signer"]', '1. Signature devant l''officier\n2. Tampon', 'online'),
('Permis de Construire', 'Autorisation de bâtir.', 'Urbanisme', 50000, '["Plan de masse", "Titre de propriété"]', '1. Étude dossier\n2. Visite terrain\n3. Approbation', 'partial'),
('Taxe Foncière (TFU)', 'Paiement de la taxe foncière unique.', 'Fiscalité', 0, '["Avis d''imposition"]', '1. Vérification\n2. Paiement\n3. Quittance', 'online')
ON CONFLICT (name) DO NOTHING;

-- Initialisation des services pour Za-Kpota (Sync des nouveaux services)
SELECT initialize_tenant(id) FROM tenants WHERE slug = 'zakpota';

-- 3. FLASH NEWS (6 ITEMS)
INSERT INTO flash_news (tenant_id, content, is_active, starts_at)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '⚠️ RAPPEL : Date limite de paiement du TFU fixée au 31 mai 2024.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '🏗️ TRAVAUX : Axe Za-Kpota - Allahé en cours de bitumage.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '🎉 BIENVENUE : Découvrez le nouveau portail digital !', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '💧 MAINTENANCE : Coupure d''eau prévue à Za-Kpota Centre ce jeudi.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '👮 SÉCURITÉ : Recrutement de 10 brigadiers municipaux.', true, NOW()),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), '🗳️ DÉMOCRATIE : Conférence budgétaire ouverte demain à 10h.', true, NOW())
ON CONFLICT DO NOTHING;

-- 4. ACTUALITÉS (6 ARTICLES)
INSERT INTO news (tenant_id, title, content, category, image_url, published_at)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Nouveau Marché Moderne', 'Inauguration du complexe commercial.', 'Économie', 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800', NOW() - INTERVAL '1 day'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Vaccination Gratuite', 'Campagne de santé pour les 0-5 ans.', 'Santé', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', NOW() - INTERVAL '2 days'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Infrastructures Routières', 'Bitumage accéléré dans le centre-ville.', 'Infrastructure', 'https://images.unsplash.com/photo-1515162816999-a0ca49e112a1?w=800', NOW() - INTERVAL '3 days'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Kits Scolaires', 'Distribution aux meilleurs élèves.', 'Éducation', 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800', NOW() - INTERVAL '5 days'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Za-Kpota Propre', 'Opération salubrité réussie.', 'Environnement', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800', NOW() - INTERVAL '1 week'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Art et Culture', 'Préparation du festival annuel.', 'Culture', 'https://images.unsplash.com/photo-1514525253361-b930d5ad1cba?w=800', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- 5. PARTENAIRES
INSERT INTO partners (tenant_id, name, logo_url, link, "order")
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Ministère du Digital', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Coat_of_arms_of_Benin.svg/100px-Coat_of_arms_of_Benin.svg.png', 'https://numerique.gouv.bj', 1),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'ANCB Bénin', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6f97f8_N8fB0H6xJshzV6q_Z_g5V6C9X_yA&s', 'http://ancb.bj', 2),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Banque Mondiale', 'https://upload.wikimedia.org/wikipedia/fr/6/6f/Banque_mondiale_logo.png', 'https://worldbank.org', 3)
ON CONFLICT DO NOTHING;

-- 6. AGENDA (6)
INSERT INTO agenda_events (tenant_id, title, description, event_date, location, category)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Conseil Municipal', 'Vote du budget.', NOW() + INTERVAL '2 days', 'Hôtel de Ville', 'Administratif'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Foire Artisanale', 'Vente directe.', NOW() + INTERVAL '5 days', 'Place Publique', 'Culture'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Permanence Juridique', 'Aide gratuite.', NOW() + INTERVAL '1 week', 'Annexe Mairie', 'Social'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Ciné-débat', 'Thème Entreprenariat.', NOW() + INTERVAL '8 days', 'Foyer Jeunes', 'Loisirs'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Marathon Communal', 'Course santé.', NOW() + INTERVAL '10 days', 'Centre-ville', 'Sport'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Atelier Jardinage', 'Potager urbain.', NOW() + INTERVAL '12 days', 'Jardin Public', 'Environnement')
ON CONFLICT DO NOTHING;

-- 7. OPPORTUNITÉS (6)
INSERT INTO opportunites (tenant_id, type, title, description, deadline, status)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'emploi', 'Agents Fiscaux', '10 postes.', NOW() + INTERVAL '15 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'marche_public', 'Réfection Mairie', 'Appel d''offres.', NOW() + INTERVAL '1 month', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'emploi', 'Secrétaire', 'CDI.', NOW() + INTERVAL '10 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'marche_public', 'Kits solaires', 'Équipement.', NOW() + INTERVAL '25 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'emploi', 'Chauffeur', 'Permis C.', NOW() + INTERVAL '5 days', 'open'),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'marche_public', 'Curage caniveaux', 'Entretien.', NOW() + INTERVAL '20 days', 'open')
ON CONFLICT DO NOTHING;

-- 8. ARTISANS (6)
INSERT INTO artisans (tenant_id, full_name, trade, phone, address, photo_url, is_verified)
VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'M. Koffi Azon', 'Menuisier', '+229 97 01 01 01', 'Depot', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Mme. Sika Biaou', 'Couturière', '+229 95 02 02 02', 'Marché', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'M. Gontran Houénou', 'Électricien', '+229 90 03 03 03', 'Ruelle Stade', 'https://images.unsplash.com/photo-1540560085022-b8b2843e7c76?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'M. Paul Assogba', 'Mécanicien', '+229 61 04 04 04', 'Bohicon', 'https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Mme. Alice Kponou', 'Coiffeuse', '+229 96 05 05 05', 'Centre', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400', true),
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'M. Luc Vignon', 'Soudeur', '+229 94 06 06 06', 'Zone Ind', 'https://images.unsplash.com/photo-1504917595217-d4dc5f649771?w=400', true)
ON CONFLICT DO NOTHING;

-- 9. SONDAGE OPTIONS
INSERT INTO polls (tenant_id, question, description, expires_at)
VALUES ((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'Quel nom pour le nouveau complexe sportif ?', 'Choix citoyen.', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

INSERT INTO poll_options (tenant_id, poll_id, label)
SELECT (SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), id, 'Stade de la Fraternité' FROM polls WHERE question = 'Quel nom pour le nouveau complexe sportif ?' ON CONFLICT DO NOTHING;
INSERT INTO poll_options (tenant_id, poll_id, label)
SELECT (SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), id, 'Arena du Zou' FROM polls WHERE question = 'Quel nom pour le nouveau complexe sportif ?' ON CONFLICT DO NOTHING;

-- 10. HISTOIRE
INSERT INTO page_sections (tenant_id, page_id, section_id, content) VALUES 
((SELECT id FROM tenants WHERE slug = 'zakpota' LIMIT 1), 'histoire', 'timeline', '[
    {"year": "1940", "event": "Fondation."},
    {"year": "1978", "event": "Inauguration Centre de Santé."},
    {"year": "2003", "event": "Décentralisation."},
    {"year": "2024", "event": "Transformation Digitale."}
]')
ON CONFLICT (tenant_id, page_id, section_id) DO UPDATE SET content = EXCLUDED.content;
