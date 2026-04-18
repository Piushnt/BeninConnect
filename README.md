# 🇧🇯 Bénin Connect - Plateforme e-Administration Multi-Tenant

**Bénin Connect** est une plateforme GovTech de pointe conçue pour transformer la gouvernance locale au Bénin. Elle offre un guichet numérique pour les 77 communes, permettant aux citoyens d'accéder aux services publics, de suivre leurs dossiers et de participer à la vie démocratique de leur commune via un portail complet et réactif.

## 🌟 Fonctionnalités Déployées

- **Portail Administration (Dashboard Mairie) Full-Responsive**
  - **Gestion des Dossiers** : Traitement et signature électronique (PDF officiel) avec génération de QR code.
  - **Modules Sectoriels** : Régie des marchés, Gestion du Foncier, Service de Transport, Paramétrages des Taux et Fiscalité.
  - **Communication & Engagement** : Publication des Actualités Locales, Flash Info (bandeaux urgents), Agenda Municipal, Sondages Citoyens et Budgets Participatifs.
  - **CMS de Mairie** : Éditeur pour la Personnalisation des pages Histoire, Transparence et Conseil Municipal.
  - **Signalements** : Modération et résolution des alertes émises par les citoyens.

- **Portail Citoyen & E-Services National**
  - Catalogue National et personnalisation locale de tous les services avec simulateur fiscal inclus.
  - Suivi des démarches en temps réel avec notifications et coffre-fort numérique sécurisé.
  - Découverte touristique (carte POI) et engagement citoyen direct.

- **Infrastructure & Multi-Tenant Natif**
  - Déploiement unique (SaaS) isolant de façon stricte les données (Row Level Security - RLS) de chaque sous-domaine/commune.
  - SEO Dynamique (React Helmet) : Chaque page de mairie porte ses propres balises Meta pour le référencement naturel.

## 🛠️ Stack Technique & Architecture

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Query, React Helmet Async.
- **Backend/Data** : Supabase (PostgreSQL, Authentification par Magic Link OTP exclusif, Storage, Realtime).
- **Assistance IA** : Google Gemini API (Modèle de connaissances Gouvernementales).

## 🚀 Démarrage & Déploiement

1. Installez les dépendances : `npm install`
2. Configurez vos variables d'environnement (`.env`) contenant les clés Supabase & Gemini.
3. **Synchronisation Base de données** :
   - Exécutez le script contenu dans `/schema.sql`. Il est garanti stable et inclut la suppression des contraintes sur le système de Rôles pour éviter les blocages lors de la gestion manuelle depuis la console Supabase (GUI).
   - Les scripts sont aussi découpés dans `/database/` (`01_tables.sql`, `02_functions_triggers.sql`, `03_rls_policies.sql`) pour une exécution séquentielle ou un diagnostic asynchrone modulaire.
4. Lancez le serveur local : `npm run dev` ou build pour production : `npm run build`

## 👑 Rôles & Accès Sécurisés

L'utilisation du compte classique d'inscription bascule sur le statut "Citoyen".
Pour obtenir des privilèges avancés (ex: **Agent**, **Admin** ou **Super Admin**) :
1. Créez un compte par OTP (Magic Link).
2. Rendez-vous dans la table `user_profiles` depuis l'interface d'administration de Supabase.
3. Modifiez directement la colonne `role` du compte cible (Aucune contrainte d'interface stricte n'entravera la modification : le mot `super_admin` peut être inséré à la main).
4. Le Super Admin peut par la suite inviter et modifier sereinement les rôles depuis le **Dashboard de la Mairie** (`/admin-portal`) via la section Utilisateurs.

## 🛡️ Sécurité
Le codebase a subi un audit garantissant la protection Multi-Tenant, empêchant formellement tout croisement des dossiers. L'accès direct aux requêtes SQL depuis le frontend applicatif pour les fonctions vitales a été migré sur un protocole d'interrogation sécurisée RLS.

---
*Bénin Connect - Le futur de l'administration, du suivi et de la proximité.*
