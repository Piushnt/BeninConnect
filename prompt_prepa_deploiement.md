🎯 PROMPT — OBJECTIFS TECHNIQUES (AVEC SOUS-DOMAINES + AUTO-HÉBERGEMENT)

Tu dois faire évoluer la plateforme GovTech vers une architecture production robuste, scalable et auto-hébergée, en intégrant multi-tenant par sous-domaines et déploiement serveur Linux (Ubuntu).

🧱 1. ARCHITECTURE MULTI-TENANT PAR SOUS-DOMAINE

Le système doit fonctionner avec des sous-domaines dynamiques :

Format :

https://{commune}.emairie.bj

Exemple :

cotonou.emairie.bj
zakpota.emairie.bj
⚙️ Comportement attendu :
Le frontend doit :
Lire automatiquement le sous-domaine depuis window.location.hostname
Extraire {commune}
Résoudre dynamiquement le tenant correspondant en base de données
Backend (Supabase/PostgreSQL) :
Table tenants doit contenir :
id
name
slug (ex: cotonou)
domain (optionnel)
is_active

Résolution :

const subdomain = hostname.split('.')[0]
SELECT * FROM tenants WHERE slug = subdomain AND is_active = true
🧠 Contraintes :
Si tenant inexistant → page 404 custom
Si tenant désactivé → accès bloqué
Isolation stricte via RLS (tenant_id obligatoire partout)
🌐 2. PORTAIL NATIONAL

Domaine principal :

https://emairie.bj
Fonction :
Présenter :
Le Bénin (hero section)
Liste des 77 communes
Recherche intelligente (nom / département)
Services globaux
Navigation :

Chaque commune → redirection vers :

https://{commune}.emairie.bj
🖥️ 3. DÉPLOIEMENT AUTO-HÉBERGÉ (UBUNTU SERVER)

Tu dois proposer une architecture complète pour déploiement sur :

OS : Ubuntu Server 24.04 LTS
Accès : SSH
⚙️ Stack attendue :
Reverse proxy : Nginx
Frontend : React build (Vite)
Backend :
Supabase (hosted OU self-hosted optionnel)
ou API Node.js (si nécessaire pour logique sensible)
Process manager : PM2
SSL : Let's Encrypt (Certbot)
🔧 4. CONFIGURATION NGINX (OBLIGATOIRE)

Tu dois générer :

A. Wildcard subdomain config :

Support de :

*.emairie.bj
Exemple attendu :
Server block avec :
server_name *.emairie.bj
redirection vers app React
gestion SPA (try_files $uri /index.html)
B. HTTPS :
Certificat wildcard ou multi-domaines via Let's Encrypt
🔐 5. GESTION DES VARIABLES D’ENVIRONNEMENT

Tu dois implémenter :

.env pour :
Supabase URL
Supabase ANON KEY
API keys paiement (placeholders)
Gemini API key
⚠️ Règle stricte :
AUCUNE clé sensible dans le frontend
Backend obligatoire pour :
paiements
création utilisateurs (service role)
💳 6. PRÉPARATION INTÉGRATION MOBILE MONEY

Même si les clés ne sont pas fournies :

Implémenter avec placeholders :

process.env.MTN_MOMO_API_KEY
process.env.MOOV_API_KEY
process.env.FEDAPAY_API_KEY
Créer endpoints backend :
/api/payment/init
/api/payment/webhook
📦 7. STRUCTURE LIVRABLE ATTENDUE

Tu dois fournir :

A. Code :
Frontend React multi-tenant (subdomain-aware)
Backend API sécurisé
Gestion auth + rôles
B. Infra :
Script installation serveur :
Node.js
Nginx
PM2
Certbot
C. Config :
Fichier Nginx complet
Exemple .env
Script de build & déploiement
🧪 8. TESTS OBLIGATOIRES

Le système doit permettre :

Accès portail national → OK
Accès sous-domaine valide → OK
Accès sous-domaine invalide → 404
Isolation données entre communes → OK
Création tenant → accessible instantanément via sous-domaine
🚨 9. CONTRAINTES CRITIQUES
Multi-tenant strict (aucune fuite possible)
Sécurité RLS obligatoire
Performance :
lazy loading
pagination
SEO minimum pour portail national
🎯 OBJECTIF FINAL

Obtenir une plateforme :

Nationale (mairie.bj)
Décentralisée (77 sous-domaines)
Sécurisée (RLS + backend)
Déployable sur serveur privé Ubuntu
Prête pour intégration paiement Mobile Money