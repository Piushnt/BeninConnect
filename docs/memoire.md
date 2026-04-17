# Mémoire Technique et Architectural - Bénin Connect

**Ce fichier est destiné aux développeurs, architectes et outils IA d'assistance (Anti Gravity) reprenant le code pour le modifier, le débugger ou le déployer localement.**

## 1. Description du Projet
Bénin Commune Connect est une plateforme GovTech monolithique dotée d'une architecture Multi-Tenant. L'application unifie 77 mairies sous la même infrastructure technique. Elle offre plusieurs portails selon le rôle de l'utilisateur :
- **Portail National (Public) :** Redirection vers les mairies locales.
- **Portail Citoyen :** Espace personnel des habitants.
- **Portail Admin (Mairie) :** Back-office pour la gestion d'une commune par ses agents locaux.
- **Tableau de Bord Ministériel :** Vues statistiques globales sur toute la base de données.
- **Tableau de Bord Super Admin :** Gestion de l'infrastructure, des instances communales, et des configurations cloud.

## 2. Modèle de Données et Relations (Supabase / PostgreSQL)
L'application repose fortement sur les politiques de **Row Level Security (RLS)** pour assurer l'isolement "Multi-Tenant" des données. 

*   `tenants` : La table maitresse représentant une entité communale. Forme l'Identifiant (tenant_id) de chaque ligne dans les autres tables.
*   `departments` : Répartition géographique nationale du Bénin.
*   `user_profiles` : Lie un compte Firebase/Supabase Auth (`auth.users`) à notre système.
    *   **Relation cruciale :** `tenant_id` force l'appartenance à une commune, et `role` (super_admin, admin, agent, citizen) définit les permissions.
*   `public_services` : Catalogue des services administratifs (Certificat de résidence, Actes) qui peuvent être activés globalement ou localement (`tenant_features`).
*   `dossiers` : Regroupe les démarches des citoyens (`citizen_id`) liées à un maire (`tenant_id`). Maintient une relation avec `dossier_history`.
*   **Modules Spécialisés :**
    *   `market_stands` : Catalogue du domaine foncier marchand.
    *   `land_dossiers` : Enregistrement et conventions de vente des terres.
    *   `transport_registrations` : Plateforme taxis/zemidjans.
*   **Logging / Tracker :**
    *   `audit_logs` : Enregistre les actions `CREATE`, `UPDATE`, `DELETE` effectuées par un `user_id` spécifique (particulièrement utilisé par le Super Admin).

### Les Fonctions RPC Critiques :
- `get_my_role()`, `is_admin_for_tenant()`, `is_staff_for_tenant()` : Fonctions PostgreSQL utilisées dans les déclarations RLS pour autoriser/rejeter les requêtes. Ne cassez pas ces fonctions car tout le backend sécuritaire en dépend.

## 3. Structure des Fichiers et Composants Clés
Le répositoire suit une structure standard de SPA React (Vite + TS) :

- `src/contexts/` :
  - `AuthContext.tsx` : Fournit les informations sur l'utilisateur (`user`), le profil étendu (`profile`), et les booléens de vérification (`isAdmin`, `isSuperAdmin`).
  - `TenantContext.tsx` : Capte l'URL (ex: `/cotonou/...`) et charge le `tenant` actif.
- `src/lib/` :
  - `supabase.ts` : Instanciation du client BDD.
- `src/pages/` (Pages Principales) :
  - `SuperAdminDashboard.tsx` : Contrôle global (Création des tenants, vision des logs, activation des services). Agnostique du backend local.
  - `MinisterialDashboard.tsx` : Requêtes d'agrégation massives (Statistiques, KPIs, Graphes Recharts).
  - `AdminPortal.tsx` : Back-office de la commune (Responsive, menu hamburger géré avec Framer Motion). Contient le chargement de `dossiers`, `actualites`, etc.
  - Modules "Sous-Pages" Admin : `MarketModule.tsx`, `LandModule.tsx`, `TransportModule.tsx`. Ils opèrent dans un espace RLS strict.
- `src/components/` : Composants réutilisables, incluant `AIAssistant.tsx` (Appels Google GenAI).

## 4. Points d'Attention Développeur (Ne pas casser !)
1. **Navigations Multi-Tenant :** Le routage dans React (`react-router-dom`) dépend de l'URL pour définir la commune (`/:slug/*`). Ne changez pas l'abstraction de `{ tenant } = useTenant();` – toutes les requêtes base de données s'y fient (`.eq('tenant_id', tenant.id)`).
2. **Types des Rôles :** Les rôles autorisés en base sont `'super_admin'`, `'admin'`, `'ca_admin'`, `'agent'`, `'citizen'`. N'introduisez pas `'super-admin'` avec un tiret, la DB le rejettera via un `CHECK constraint`.
3. **Changements UI :** Toute nouvelle page d'administration doit inclure le conteneur responsive défini dans `AdminPortal.tsx` afin de ne pas briser la vue mobile du Dashboard. Utilisez `motion/react` pour les animations d'entrée. 
4. **Appel IA :** L'API `AIAssistant.tsx` lit les `locations` de la base de données actuelle pour injecter le contexte local. Assurez-vous que l'API key (`GEMINI_API_KEY`) est présente dans `.env`.
