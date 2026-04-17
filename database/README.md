# Scripts de Base de Données "Bénin Connect"

Ces scripts ont été séparés pour faciliter la maintenance et la localisation des erreurs.

## Ordre d'Exécution Recommandé

1.  **`01_tables.sql`** : Création de toutes les tables, extensions et nettoyage initial.
2.  **`02_functions_triggers.sql`** : Définition des fonctions de calcul, de sécurité (Fix récursion RLS) et des triggers d'automatisation.
3.  **`03_rls_policies.sql`** : Activation de la sécurité au niveau des lignes (RLS) pour toutes les tables.
4.  **`04_seed_basics.sql`** : Données de base indispensables (Départements, Statuts de dossiers, Features nationales, Services publics standards).
5.  **`05_seed_super_admin.sql`** : Fonction permettant de promouvoir un utilisateur au rang de Super Admin par son email.
6.  **`06_seed_sample_tenant.sql`** : Exemple complet d'initialisation d'une mairie (Za-Kpota) avec son contenu CMS, ses arrondissements et ses membres du conseil.

## Notes de Sécurité
- Le fichier `02_functions_triggers.sql` contient les correctifs pour l'erreur `42P17` (infinite recursion).
- Le fichier `05_seed_super_admin.sql` doit être modifié avec votre email pour fonctionner.
