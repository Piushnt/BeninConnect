# Guide d'Accès et de Test des Tableaux de Bord

Ce guide explique comment accéder et tester les différents tableaux de bord de la plateforme Bénin Connect, qui ont été récemment mis à jour avec le nouveau design "Bento Box" et "Neo-Glassmorphism".

## 1. Prérequis : Élévation de Privilèges
Pour accéder aux tableaux de bord administratifs, vous devez avoir le rôle approprié.

### Devenir Super Administrateur (Mode Développement)
1. Connectez-vous à l'application.
2. Accédez à la page de configuration système : `/[slug]/system-setup` (ex: `/zakpota/system-setup`).
3. Cliquez sur le bouton **"Devenir Super Administrateur"**.
4. Rechargez la page.

---

## 2. Les Différents Tableaux de Bord

### A. Tableau de Bord Ministériel (National)
*   **URL** : `/ministere`
*   **Rôle requis** : `super_admin` ou rôle ministériel spécifique.
*   **Design** : Utilise le nouveau design Bento Box avec des cartes de statistiques et des graphiques Recharts.
*   **Fonctionnalités à tester** :
    *   Vue d'ensemble des statistiques nationales (Communes, Utilisateurs, Dossiers, Revenus).
    *   Graphiques Recharts (Évolution des dossiers, Répartition par catégorie).
    *   Liste des communes avec leur état de santé système.
    *   Isolation des données : Vérifiez que les statistiques agrègent bien les données de toutes les communes.

### B. Console de Gestion Globale (Super Admin)
*   **URL** : `/[slug]/super-admin` (ex: `/zakpota/super-admin`)
*   **Rôle requis** : `super_admin`.
*   **Design** : Interface Neo-Glassmorphism avec sidebar translucide et cartes Bento Box.
*   **Fonctionnalités à tester** :
    *   **Déployer une Mairie** : Cliquez sur "Déployer une Mairie", remplissez le formulaire (Nom, Slug, Département). Vérifiez que la nouvelle instance apparaît dans la liste et que le déploiement fonctionne sans erreur.
    *   **Gestion des Instances** : Modifiez le logo ou le statut d'une mairie existante.
    *   **Points d'Intérêt** : Gérez les lieux publics affichés sur la carte.

### C. Portail Administration & Agent (Local)
*   **URL** : `/[slug]/admin-portal` (ex: `/zakpota/admin-portal`)
*   **Rôle requis** : `admin`, `agent`, ou `super_admin`.
*   **Design** : Entièrement refondu avec le design Bento Box pour une expérience utilisateur moderne et épurée.
*   **Fonctionnalités à tester** :
    *   **Tableau de Bord** : Statistiques locales de la commune avec les nouvelles cartes Bento.
    *   **Gestion des Dossiers** : 
        *   Cliquez sur "Nouveau Dossier" pour enregistrer un citoyen et créer un dossier en direct via la nouvelle modale Bento.
        *   Vérifiez la pagination (10 éléments par page).
    *   **Signalements** : Visualisez et gérez les problèmes rapportés par les citoyens.
    *   **Actualités & Flash News** : Créez et supprimez des actualités locales.
    *   **Sondages & Partenaires** : Gérez la participation citoyenne et les partenaires locaux.
    *   **Utilisateurs** : Liste des citoyens inscrits dans la commune.
    *   **Configuration** : Modifiez les paramètres de la commune (logo, couleurs).

---

## 3. Test de l'Isolation des Données
L'isolation des données est cruciale pour une architecture multi-tenant.

1.  **Test de séparation** :
    *   Créez une actualité ou un dossier dans la commune `zakpota`.
    *   Accédez au portail d'une autre commune (ex: créez-en une nouvelle avec le slug `cotonou` via le Super Admin).
    *   Vérifiez que les données de `zakpota` ne sont **PAS** visibles dans `cotonou`.
2.  **Test RLS (Row Level Security)** :
    *   Les politiques de sécurité dans Supabase garantissent que même via l'API, un agent d'une mairie ne peut pas modifier les données d'une autre mairie.

## 4. Support et Maintenance
*   **Scripts SQL** : Le fichier `schema.sql` contient toutes les définitions de tables et les politiques RLS. Il doit être mis à jour après chaque modification du schéma.
*   **Logs** : En cas d'erreur, vérifiez la console du navigateur pour les erreurs de permissions Supabase.
