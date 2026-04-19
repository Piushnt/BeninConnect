🔥 PROMPT ULTIME — PLATEFORME GOVTECH NATIONALE (BÉNIN)
🎯 OBJECTIF

Tu dois concevoir, implémenter et livrer une plateforme nationale d’e-gouvernance pour le Bénin, couvrant :

77 communes
Portail national + portails communaux
E-services complets (workflow réel)
Gestion des rôles (Super Admin / Admin / Agent / Citoyen)
IA assistant contextuel
Paiement Mobile Money
Notifications Rich Media
Multi-tenant strict avec isolation totale

👉 Le résultat doit être directement exploitable en production, pas un prototype.

🧠 1. ARCHITECTURE GLOBALE
Stack imposée :
Frontend : React + TypeScript + Vite
Backend : Supabase (PostgreSQL + Auth + RLS + Storage)
API sécurisée : Node.js (pour paiement + création utilisateurs)
IA : Google Gemini (RAG obligatoire)
Déploiement : Ubuntu Server (Nginx + PM2)
Multi-tenant : sous-domaines dynamiques
🌐 2. MULTI-TENANT PAR SOUS-DOMAINE
Format :
https://{commune}.mairie.bj
Règles :
Détection automatique du tenant via hostname
Table tenants obligatoire
Isolation stricte via tenant_id (RLS)
Cas à gérer :
Tenant inexistant → 404
Tenant désactivé → accès bloqué
🏛️ 3. PORTAIL NATIONAL
URL :
https://mairie.bj
Contenu :
Présentation du Bénin
Liste des 77 communes
Recherche intelligente (nom, département)
Carte interactive (Leaflet)
12 dernières actualités nationales
Catalogue des services publics
Navigation :
Redirection vers :
https://{commune}.mairie.bj
🏘️ 4. PORTAIL COMMUNAL

Chaque commune doit avoir :

Identité visuelle personnalisée (logo, couleurs, images)
Pages dynamiques activables :
Accueil
Services
Actualités
Suivi dossier
Rendez-vous
Carte
Publications
Artisans
Sondages
🛠️ 5. MODULE E-SERVICES (CRITIQUE)

Tu dois implémenter un workflow réel, pas un simple formulaire.

États :
DRAFT
SUBMITTED
UNDER_REVIEW
PENDING_PAYMENT
PAID
COMPLETED
REJECTED
Fonctionnalités :
Formulaire dynamique
Upload de documents
Génération PDF (récépissé)
Historique complet
Code de suivi unique
👤 6. ESPACE CITOYEN
Dashboard personnel
Historique des dossiers
Coffre-fort numérique (documents PDF)
Notifications
Profil avec NPI / téléphone
💳 7. PAIEMENT MOBILE MONEY
À intégrer :
MTN MoMo
Moov Money
FedaPay
Contraintes :
Utiliser variables d’environnement (placeholders)
Backend obligatoire
Flux :
Création paiement
Redirection utilisateur
Webhook confirmation
Mise à jour dossier → PAID
🔔 8. NOTIFICATIONS RICH MEDIA
Temps réel
Image + texte + lien
Catégories :
URGENT
INFO
SERVICE
Ciblage :
National
Commune
Utilisateur
🤖 9. IA (OBLIGATOIRE — NON GÉNÉRIQUE)
Type :
RAG (Retrieval-Augmented Generation)
Sources :
Services
Procédures
Actualités
Comportement :
Réponse contextuelle (commune / national)
Si info absente → recherche externe + suggestion
🔐 10. GESTION DES RÔLES
Rôles :
super_admin (toi)
admin (DSI mairie)
agent
citizen
Règles :
Super Admin :
crée admins
contrôle tout
Admin :
crée agents
gère sa commune
Agent :
traite dossiers
Citoyen :
fait demandes
🎨 11. UI / UX
Contraintes :
Design moderne (Bento UI)
Responsive complet
Mode sombre / clair (obligatoire)
Animations fluides
Personnalisation :
Chaque mairie modifie :
logo
couleurs
images
contenu
🧩 12. MODULE SERVICES (IMPORTANT)
PORTAIL NATIONAL :
Liste des services par commune
Vue expandable par mairie
PORTAIL LOCAL :
Services activés uniquement
Chaque service contient :
description
pièces à fournir
tarif
lien externe (si existe)
ou prise de rendez-vous
Gestion :
Activable/désactivable via dashboard
Géré par admin + agent + super admin
🗄️ 13. BASE DE DONNÉES (CRITIQUE)

Tu dois générer :

SQL COMPLET :
Tables
Relations
Index
RLS (sécurité stricte)
Triggers
Seed data
Tables minimales :
departments
tenants
users_profiles
citizen_profiles
services
dossiers
documents
payments
notifications
audit_logs
knowledge_base
features_flags
📦 14. SEED DATA (OBLIGATOIRE)

Tu dois :

Faire des recherches réelles
Intégrer :
services publics du Bénin
procédures
pièces à fournir
tarifs réalistes
liens officiels (si existants)

👉 Injecter tout ça directement dans le SQL

🖥️ 15. DÉPLOIEMENT

Tu dois fournir :

Config Nginx (wildcard sous-domaines)
Script Ubuntu (installation)
PM2 config
.env template
🔐 16. SÉCURITÉ
RLS strict sur toutes les tables
Aucune fuite cross-tenant
Backend obligatoire pour actions sensibles
Audit logs obligatoires
📊 17. PERFORMANCE
Pagination
Lazy loading
Limite requêtes
Cache minimal
🧪 18. LIVRABLE FINAL

Tu dois fournir :

Code frontend complet
Backend API sécurisé
SQL complet prêt à exécuter
Données réelles injectées
Instructions déploiement
Architecture claire
🚨 19. CONTRAINTE FINALE

❌ Pas de prototype
❌ Pas de pseudo-code
❌ Pas d’approximation

✅ Tout doit être fonctionnel, cohérent et directement déployable

🎯 MISSION

Construire une plateforme :

Nationale
Scalable
Sécurisée
Monétisable
Prête à être vendue au gouvernement