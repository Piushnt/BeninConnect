# 🌍 Guide de Test : Mairie Connect (Bénin)

Ce guide vous explique comment tester la plateforme d'e-gouvernance en local.

## 🚀 Installation Rapide

1.  **Cloner le projet** (ou copier les fichiers).
2.  **Installer les dépendances** :
    ```bash
    npm install
    ```
3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

## 🗄️ Configuration Supabase (Crucial)

Pour que l'application fonctionne, vous devez initialiser votre base de données Supabase avec le fichier `schema.sql` fourni.

1.  Créez un projet sur [Supabase](https://supabase.com).
2.  Allez dans le **SQL Editor** et collez le contenu de `schema.sql`. Exécutez-le.
    - **Note** : Si vous rencontrez une erreur `function is_staff_for_tenant(uuid) does not exist`, assurez-vous de copier l'intégralité du fichier `schema.sql`. Les fonctions de sécurité sont désormais définies au début du script pour éviter ce problème.
3.  Récupérez vos clés API dans **Project Settings > API**.
4.  Créez un fichier `.env` (ou utilisez le panneau Secrets dans AI Studio) :
    ```env
    VITE_SUPABASE_URL=votre_url_supabase
    VITE_SUPABASE_ANON_KEY=votre_cle_anon
    GEMINI_API_KEY=votre_cle_gemini
    ```

## 🧪 Scénarios de Test

### 1. Portail National & PWA
- Accédez à `http://localhost:3000/`.
- **PWA** : Sur mobile (Chrome/Safari), vous pouvez "Ajouter à l'écran d'accueil". L'application se comportera comme une application native grâce au `manifest.json`.
- **Reordonnancement** : Vérifiez que la section "Accéder au portail de votre commune" apparaît bien **avant** la section "Découvrez nos Départements".
- **Départements** : Cliquez sur un département pour voir son histoire, son diaporama d'images fluide et ses communes.
- **Accès Direct** : Utilisez la section "Accéder au portail de votre commune" pour filtrer les communes par département ou recherche.

### 2. Portail Local & Notifications
- Accédez à `http://localhost:3000/za-kpota`.
- **Notifications** : Cliquez sur la cloche dans la barre de navigation pour voir les alertes en temps réel.
- **Marquer comme lu** : Testez la fonctionnalité pour marquer une notification comme lue ou tout marquer d'un coup.
- **Abonnement** : Utilisez le bouton flottant en bas à gauche pour vous abonner aux notifications.

### 3. Espace Citoyen & Coffre-fort
- Connectez-vous en tant que citoyen (`role: citizen`).
- Accédez à `/mon-espace`.
- **Dossiers** : Vérifiez la liste de vos demandes en cours avec les badges de statut colorés.
- **Documents** : Testez la visualisation de vos documents personnels (Citizen Documents).
- **Profil** : Vérifiez que vos informations personnelles sont correctement affichées.

### 4. Thémisation (Mode Sombre/Clair)
- Utilisez le bouton Lune/Soleil dans la barre de navigation.
- Vérifiez que le thème est persisté après rafraîchissement de la page.
- Vérifiez que les couleurs institutionnelles (Vert Bénin, Jaune, Rouge) sont respectées dans les deux modes.
- **Readability** : Assurez-vous que tous les textes restent lisibles, particulièrement sur les fonds sombres.

### 5. Administration & Super Admin
- **Inscription** : Inscrivez-vous sur `/auth/register`.
- **Élévation de Privilèges** : Allez dans votre console Supabase -> Table Editor -> `user_profiles`. Modifiez votre rôle en `super_admin` ou `admin`.
- **Portail Admin** : Accédez à `/:slug/admin-portal` (ex: `/za-kpota/admin-portal`).
- **Fonctionnalités** :
    - Gestion des dossiers et changement de statuts.
    - Gestion des utilisateurs (suppression avec confirmation).
    - Configuration des services communaux.
    - Envoi de notifications.

### 6. Assistant IA (Gemini)
- Cliquez sur l'icône de message en bas à droite.
- Posez une question comme : "Comment obtenir un acte de naissance à Za-Kpota ?"
- L'IA utilise désormais la `knowledge_base` pour fournir des réponses basées sur les textes officiels.

### 7. Marketplace (Feature Flag)
- (Via SQL) Activez la feature `marketplace` pour un tenant dans `tenant_features`.
- Vérifiez que l'onglet Marketplace apparaît sur le portail de la commune.

## 📱 Performance & Mobile-First
- L'application utilise le **Code Splitting** (`React.lazy`).
- Le menu mobile est un **Side Drawer** professionnel qui ne recouvre pas tout l'écran.
- L'interface est optimisée pour le tactile avec des cibles de clic de 44px minimum.

---
*Développé pour la modernisation des communes du Bénin.*
