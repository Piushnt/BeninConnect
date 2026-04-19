# 🌍 Guide Complet : Création BDD, Déploiement & Tests — BeninConnect

> **Version** : Production v2.5 | **Branches** : `vercel` (démo/staging) · `dev` (VM Ubuntu nationale)

---

## 📋 Table des matières

1. [Création & Initialisation de la Base de Données](#1-création--initialisation-de-la-base-de-données)
2. [Déploiement Vercel (Démo/Staging)](#2-déploiement-vercel-démostaging)
3. [Déploiement Ubuntu VM Nationale (Production)](#3-déploiement-ubuntu-vm-nationale-production)
4. [Tests Fonctionnels par Rôle](#4-tests-fonctionnels-par-rôle)
5. [Audit des Modules Admin/Tenant](#5-audit-des-modules-admintenant)
6. [Checklist Production](#6-checklist-production)

---

## 1. Création & Initialisation de la Base de Données

### 1.1 Créer le Projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New Project**
2. Choisir une **région** proche du Bénin (ex: `eu-west-1` Europe pour la démo, ou self-hosted pour la prod nationale)
3. Retenir le **mot de passe** de la base

### 1.2 Exécuter les Scripts SQL dans l'Ordre

Dans **SQL Editor** de Supabase, exécuter les fichiers **dans cet ordre exact** :

```sql
-- ÉTAPE 1 : Tables & Schéma
-- Copier-coller le contenu de : database/01_tables.sql
```

```sql
-- ÉTAPE 2 : Fonctions, Triggers & RPC
-- Copier-coller le contenu de : database/02_functions_triggers.sql
```

```sql
-- ÉTAPE 3 : Politiques RLS (Sécurité)
-- Copier-coller le contenu de : database/03_rls_policies.sql
```

```sql
-- ÉTAPE 4 : Données de Démonstration (Seed)
-- Copier-coller le contenu de : database/04_seed_data.sql
```

> [!IMPORTANT]
> Exécuter chaque script séparément et attendre la confirmation `Success` avant de passer au suivant. Ne jamais mélanger les scripts.

### 1.3 Vérifications Post-Setup BDD

Après exécution, vérifier dans **Table Editor** que les tables suivantes sont peuplées :

| Table | Vérification |
|---|---|
| `departments` | 12 lignes (12 départements du Bénin) |
| `dossier_statuses` | 9 statuts workflow (BROUILLON → TERMINÉ) |
| `features` | 4 features (civil_registry, marketplace, etc.) |
| `public_services` | ≥ 2 services publics |
| `tenants` | 1 ligne : `Mairie de Za-Kpota` (slug: `zakpota`) |
| `arrondissements` | 2 arrondissements pour zakpota |

### 1.4 Configurer Authentication Supabase

Dans **Authentication > Settings** :
- ✅ Enable Email Confirmations : **OFF** (pour les tests), ON en production
- ✅ Email OTP : activer si besoin
- **Site URL** : `https://votre-domaine.com` ou l'URL Vercel
- **Redirect URLs** ajouter : `https://*.emairie.bj/**` et l'URL Vercel

### 1.5 Créer le Premier Super Admin

```sql
-- Dans SQL Editor, après avoir créé un compte via /auth/register :
UPDATE user_profiles
SET role = 'super_admin', is_approved = true
WHERE id = 'VOTRE_UUID_UTILISATEUR';
```

> [!TIP]
> Trouver l'UUID dans **Authentication > Users** dans le dashboard Supabase.

---

## 2. Déploiement Vercel (Démo/Staging)

### Branche à déployer : `vercel`

### 2.1 Pré-requis
- Compte [Vercel](https://vercel.com)
- Repository GitHub/GitLab connecté

### 2.2 Configuration du Projet Vercel

1. **New Project** → Importer le repository
2. **Branch** : sélectionner `vercel`
3. **Framework Preset** : `Vite`
4. **Build Command** : `npm run build`
5. **Output Directory** : `dist`

### 2.3 Variables d'Environnement Vercel

Dans **Project Settings > Environment Variables**, ajouter :

| Variable | Valeur | Scope |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | All |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | All |
| `VITE_BASE_DOMAIN` | `beninconnect.vercel.app` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` *(secret)* | Production |
| `FEDAPAY_SECRET_KEY` | `sk_live_...` | Production |
| `MTN_MOMO_API_KEY` | `votre_cle` | Production |

> [!CAUTION]
> `SUPABASE_SERVICE_ROLE_KEY` ne doit **jamais** être préfixé `VITE_`. Elle ne doit exister que dans les Serverless Functions côté serveur.

### 2.4 Configuration des Sous-domaines Vercel (Pour les Tenants)

Pour la démo Vercel avec sous-domaines communaux :
1. Aller dans **Project Settings > Domains**
2. Ajouter un domaine wildcard : `*.beninconnect.vercel.app` *(payant sur Vercel Pro)*
3. **Alternative gratuite** : Utiliser les routes par chemin `beninconnect.vercel.app/zakpota`

### 2.5 Déploiement

```bash
# Depuis votre machine locale sur la branche vercel
git push origin vercel
# Vercel déploie automatiquement
```

### 2.6 Tests Post-Déploiement Vercel

```bash
# Test 1 : Health Check API
curl https://beninconnect.vercel.app/api/health
# Réponse attendue : {"status":"ok","environment":"vercel"}

# Test 2 : Portail National
# Ouvrir : https://beninconnect.vercel.app
# Vérifier : Liste des communes, recherche, hero section

# Test 3 : Portail Communal
# Ouvrir : https://beninconnect.vercel.app/zakpota
# Vérifier : Chargement tenant, thème vert, actualités
```

---

## 3. Déploiement Ubuntu VM Nationale (Production)

### Branche à déployer : `dev`

### 3.1 Pré-requis Serveur

- Ubuntu Server **24.04 LTS**
- RAM : minimum **2 Go** (4 Go recommandé)
- Stockage : minimum **20 Go**
- DNS : Wildcard `*.emairie.bj` → IP du serveur

### 3.2 Installation Automatique

```bash
# Connexion SSH
ssh user@votre-ip-serveur

# Cloner le repository
git clone https://github.com/votre-repo/beninconnect.git /var/www/beninconnect
cd /var/www/beninconnect

# Checkout branche dev (production)
git checkout dev

# Exécuter le script d'installation
chmod +x deploy/setup_server.sh
sudo bash deploy/setup_server.sh
```

### 3.3 Configurer les Variables d'Environnement

```bash
cd /var/www/beninconnect
cp .env.example .env
nano .env
```

Remplir le fichier `.env` :

```env
# ===== FRONTEND (exposées dans le build Vite) =====
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...votre_cle_anon
VITE_GEMINI_API_KEY=AIzaSy...
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
VITE_BASE_DOMAIN=emairie.bj

# ===== BACKEND SÉCURISÉ (jamais dans le frontend) =====
PORT=3001
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...votre_service_role
APP_URL=https://emairie.bj

# ===== PAIEMENTS MOBILE MONEY =====
FEDAPAY_SECRET_KEY=sk_live_votre_cle_fedapay
FEDAPAY_WEBHOOK_SECRET=whsec_votre_secret
MTN_MOMO_API_KEY=votre_cle_mtn
MTN_MOMO_USER_ID=votre_uuid_mtn
MOOV_API_KEY=votre_cle_moov
```

### 3.4 Build & Lancement

```bash
cd /var/www/beninconnect

# Installer les dépendances
npm install

# Build du frontend
npm run build

# Démarrer le backend API avec PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Pour démarrage automatique au reboot
```

### 3.5 Configuration Nginx

```bash
# Copier la config Nginx
sudo cp deploy/nginx/emairie.conf /etc/nginx/sites-available/emairie.conf
sudo ln -s /etc/nginx/sites-available/emairie.conf /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

**Contenu du fichier `deploy/nginx/emairie.conf`** (à vérifier) :

```nginx
server {
    listen 80;
    server_name emairie.bj www.emairie.bj *.emairie.bj;

    root /var/www/beninconnect/dist;
    index index.html;

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy (PM2 sur port 3001)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.6 Certificat SSL Wildcard (Let's Encrypt)

```bash
# Méthode DNS Challenge (requis pour wildcard)
sudo certbot certonly --manual --preferred-challenges dns \
  -d emairie.bj -d *.emairie.bj

# Suivre les instructions : ajouter le record TXT DNS
# Puis mettre à jour la config Nginx avec les certificats SSL

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 3 * * * certbot renew --quiet
```

### 3.7 Tests Post-Déploiement Ubuntu

```bash
# Test 1 : Nginx opérationnel
curl -I http://emairie.bj
# Attendu : HTTP/1.1 200 OK

# Test 2 : Sous-domaine
curl -I http://zakpota.emairie.bj
# Attendu : HTTP/1.1 200 OK (SPA should load)

# Test 3 : API Backend PM2
curl http://localhost:3001/api/health
# Attendu : {"status":"ok","message":"BeninConnect National API..."}

# Test 4 : PM2 Status
pm2 status
# Attendu : beninconnect-backend-api | online
```

---

## 4. Tests Fonctionnels par Rôle

### 4.1 Test Rôle : Citoyen

**URL** : `http://localhost:3000/zakpota` (local) ou `https://zakpota.emairie.bj` (prod)

| Scénario | Action | Résultat Attendu |
|---|---|---|
| Inscription | `/auth/register` | Email de confirmation reçu |
| Connexion | `/auth/login` | Redirection vers l'accueil de la commune |
| Soumettre dossier | Services → Acte de Naissance → Formulaire | Tracking code unique généré ex: `ZKP-2026-XXXX` |
| Suivre dossier | `/zakpota/suivi-dossier` + code | Statut visible + historique |
| Sondage | `/zakpota/sondages` | Vote possible, résultats en temps réel |
| Signalement | `/zakpota/signalement` | Formulaire envoyé, statut `pending` |
| Espace citoyen | `/mon-espace` | Dossiers, documents, profil visibles |
| Assistant IA | Bouton flottant | Répond sur les services de la commune |

### 4.2 Test Rôle : Agent de Mairie

**Prérequis** : Compte avec `role=agent`, `is_approved=true`, `tenant_id=<id_zakpota>`

**URL** : `http://localhost:3000/zakpota/admin-portal`

| Module | Action | Résultat Attendu |
|---|---|---|
| Dashboard | Accès | Stats: dossiers, signalements, utilisateurs, sondages |
| Dossiers | Clic "Détails" sur un dossier | Modal détail avec info citoyen + historique |
| Dossiers | Changer statut → EN_REVISION | Notification envoyée au citoyen |
| Dossiers | Bouton "Signer l'Acte" (statut APPROUVÉ) | Pad de signature → PDF généré & archivé |
| Signalements | Changer statut → under_review | État mis à jour |
| Annonces | Créer une annonce | Visible côté citoyen |

### 4.3 Test Rôle : Admin de Mairie

**Prérequis** : Compte avec `role=admin`, `is_approved=true`

| Module | Action | Résultat Attendu |
|---|---|---|
| Utilisateurs | Lister | Agents + citoyens de la commune |
| Utilisateurs | Approuver un agent | `is_approved` passe à `true` |
| Services | Activer/désactiver un service | Service visible/masqué côté citoyen |
| Actualités | Créer un article | Publié sur `/zakpota/actualites` |
| CMS | Modifier section Hero | Titre homepage modifié |
| Communication | Flash News | Ticker mis à jour en temps réel |
| Sondages | Créer un poll | Visible sur `/zakpota/sondages` |
| Marché | Gérer les stands | Table des stands mise à jour |

### 4.4 Test Rôle : Super Admin

**URL** : `http://localhost:3000/zakpota/super-admin`

| Module | Action | Résultat Attendu |
|---|---|---|
| Overview | Affichage | Stats globales toutes mairies |
| Town Halls | Lister | Toutes communes avec statut |
| Town Halls | Créer une mairie | Formulaire → `initialize_tenant()` appelée |
| Town Halls | Modifier | Nom/logo/statut mis à jour |
| Users | Lister | Tous utilisateurs toutes communes |
| Users | Changer rôle | Dropdown → mise à jour immédiate |
| System Logs | Consulter | Audit log des actions |
| Ministère | Accès | `/ministere` — Dashboard national KPIs |

---

## 5. Audit des Modules Admin/Tenant

### 5.1 État des Modules (Vérification Réelle)

| Module | Fichier | Statut BDD | Statut UI | Note |
|---|---|---|---|---|
| **Dashboard** | `DashboardTab.tsx` | ✅ React Query live | ✅ Complet | Stats + envoi notification |
| **Dossiers** | `DossiersTab.tsx` | ✅ CRUD + historique | ✅ Complet | Signature PDF + workflow 7 statuts |
| **Actualités** | `NewsTab.tsx` | ✅ Table `news` | ✅ Complet | CRUD avec image |
| **Signalements** | `SignalementsTab.tsx` | ✅ Table `signalements` | ✅ Complet | Gestion priorité/statut |
| **Utilisateurs** | `UsersTab.tsx` | ✅ Table `user_profiles` | ✅ Complet | Approbation + rôles |
| **Annonces** | `AnnouncementsTab.tsx` | ✅ Table `announcements` | ✅ Complet | CRUD officiel |
| **Services** | `ServicesTab.tsx` | ✅ `tenant_services` | ✅ Complet | Activer/désactiver |
| **Marché** | `MarketTab.tsx` | ✅ `market_stands` | ✅ Complet | Gestion stands/inscriptions |
| **Foncier** | `LandModule.tsx` | ✅ `land_dossiers` | ✅ Complet | ADC/PLU/Bornage + visites |
| **Transport** | `TransportModule.tsx` | ✅ `transport_registrations` | ✅ Complet | Zemidjan/Taxi/Marchandises |
| **Arrondissements** | `ArrondissementModule.tsx` | ✅ `arrondissements` | ✅ Complet | Gestion quartiers |
| **Sondages** | `SondageModule.tsx` | ✅ `polls` + `poll_votes` | ✅ Complet | Création + résultats live |
| **CMS** | `CMSModule.tsx` | ✅ `page_sections` | ✅ Complet | Éditeur inline |
| **Communication** | `AgendaFlashModule.tsx` | ✅ `flash_news` | ✅ Complet | Ticker + agenda |
| **Configuration** | `ConfigTab.tsx` | ⚠️ Partiel | ⚠️ Désactivé | Tarifs statiques — TODO en prod |
| **Paiement API** | `server/index.js` | ⚠️ Mock | ⚠️ Simulation | À brancher FedaPay/MTN |
| **Super Admin** | `SuperAdminDashboard.tsx` | ✅ React Query | ✅ Complet | Global command + create tenant |

### 5.2 Points Restants à Finaliser pour la Production

> [!WARNING]
> Ces éléments sont des **stubs** fonctionnels mais nécessitent une intégration réelle avant la go-live nationale :

1. **ConfigTab** : Les champs "Taux TFU" et "Patente" sont désactivés (`disabled`). Il faut connecter à `tenant.site_config.tax_settings` dans Supabase pour les rendre éditables.

2. **Paiement Mobile Money** : `server/index.js` et `api/payment/init.js` retournent un mock. Intégrer les SDK :
   - FedaPay : `npm install fedapay`
   - MTN MoMo : API REST avec Bearer token

3. **Storage Supabase** : Créer le bucket `documents` dans **Storage** avant de tester la génération PDF :
   ```sql
   -- Dans Supabase Storage, créer le bucket "documents" (public = false)
   ```

4. **Push Notifications** : La table `push_subscriptions` existe mais le service web-push n'est pas encore branché au backend PM2.

---

## 6. Checklist Production

### ✅ Avant Go-Live Vercel

- [ ] Variables d'environnement configurées dans Vercel
- [ ] BDD Supabase initialisée (4 scripts SQL)
- [ ] Bucket Storage `documents` créé dans Supabase
- [ ] Premier `super_admin` créé manuellement en SQL
- [ ] Auth Supabase : Email Confirmations activées
- [ ] Test tous les rôles effectué
- [ ] Health check API OK : `/api/health`

### ✅ Avant Go-Live Ubuntu VM Nationale

- [ ] DNS wildcard `*.emairie.bj` → IP serveur configuré
- [ ] Script `deploy/setup_server.sh` exécuté
- [ ] Fichier `.env` rempli avec vraies clés
- [ ] `npm run build` réussi
- [ ] `pm2 start ecosystem.config.cjs` → status `online`
- [ ] Nginx config copiée et rechargée
- [ ] SSL wildcard Let's Encrypt installé
- [ ] Test `curl https://emairie.bj` → 200 OK
- [ ] Test `curl https://zakpota.emairie.bj` → 200 OK
- [ ] Test API : `curl https://emairie.bj/api/health` → OK
- [ ] PM2 survie au reboot : `pm2 startup` + `pm2 save`

### ✅ Tests Sécurité

- [ ] Route `/system-setup` inaccessible sans être `super_admin`
- [ ] Isolation entre communes : un agent de zakpota NE VOIT PAS les dossiers de cotonou
- [ ] Tentative de cross-tenant → redirection `/`
- [ ] Clés `SUPABASE_SERVICE_ROLE_KEY` absentes du bundle frontend (inspecter le JS compilé avec `grep "service_role" dist/`)

---

*Guide généré pour BeninConnect — Plateforme Nationale d'E-Gouvernance du Bénin.*
*Maintenu par l'équipe technique — Version 2.5 (Avril 2026)*
