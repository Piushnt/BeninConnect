# 🇧🇯 Bénin Commune Connect

**Bénin Commune Connect** est une plateforme GovTech de pointe conçue pour transformer la gouvernance locale au Bénin. Elle offre un guichet numérique unique pour les 77 communes, permettant aux citoyens d'accéder aux services publics, de suivre leurs dossiers et de participer à la vie démocratique de leur commune.

## 🌟 Points Forts

- **Multi-tenant Natif** : Une seule plateforme gérant 77 portails communaux isolés et personnalisables.
- **E-Services Complets** : Digitalisation des actes d'état civil, certificats de résidence, et plus encore.
- **Espace Citoyen Sécurisé** : Suivi des dossiers en temps réel et coffre-fort numérique pour les documents officiels.
- **IA Souveraine** : Assistant intelligent basé sur la technologie Gemini, alimenté par une base de connaissances officielle.
- **Notifications Multi-canal** : Système d'alerte en temps réel pour les informations communales et nationales.
- **Design Institutionnel** : Interface moderne, responsive et accessible, respectant les couleurs nationales du Bénin.

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS, Framer Motion.
- **Backend/Base de données** : Supabase (PostgreSQL, Auth, Storage, Realtime).
- **IA** : Google Gemini API (@google/genai).
- **Icônes** : Lucide React.
- **Animations** : Motion (motion/react).

## 📂 Structure du Projet

- `/src/contexts` : Gestion de l'état global (Auth, Tenant).
- `/src/pages` : Pages principales (National, Local, Admin, Citoyen).
- `/src/components` : Composants UI réutilisables.
- `/schema.sql` : Schéma de base de données complet avec politiques RLS.
- `/fonctionnalite.md` : Liste détaillée des modules développés.
- `/TEST_GUIDE.md` : Guide pour tester les différentes fonctionnalités.

## 🚀 Démarrage Rapide

1. Installez les dépendances : `npm install`
2. Configurez vos variables d'environnement (Supabase & Gemini).
3. Initialisez la base de données avec `schema.sql` (Copiez-collez le contenu dans le SQL Editor de Supabase).
   - **Note importante** : Assurez-vous d'exécuter le script complet pour créer les fonctions de sécurité (`is_staff_for_tenant`, etc.) avant que les politiques RLS ne soient appliquées.
4. Lancez l'application : `npm run dev`

## 🛠️ Dépannage SQL

Si vous rencontrez l'erreur `function is_staff_for_tenant(uuid) does not exist` :
- Cela signifie que les fonctions de sécurité n'ont pas été créées correctement.
- **Solution** : Ré-exécutez le fichier `schema.sql` dans son intégralité. Le fichier a été mis à jour pour définir les fonctions au début du script afin d'éviter les erreurs de dépendance lors de la création des politiques.

## 👑 Administration & Super Admin

Pour accéder au portail d'administration :
1. **Inscription** : Créez un compte via `/auth/register`. 
   - **Code PIN Spécial** : Utilisez le code `1234` lors de l'inscription pour obtenir automatiquement le rôle **Admin**.
2. **Accès aux Dashboards** :
   - **Admin Local** : `/{votre-commune}/admin-portal` (ex: `/za-kpota/admin-portal`)
   - **Super Admin** : `/super-admin` (nécessite le rôle `super_admin`)
3. **Gestion des Rôles** : Vous pouvez modifier manuellement le rôle d'un utilisateur dans la table `user_profiles` de Supabase (`super_admin`, `admin`, `agent`, `citizen`).

## 🛡️ Sécurité

La plateforme utilise **Row Level Security (RLS)** sur Supabase pour garantir une isolation stricte des données entre les communes et protéger la vie privée des citoyens. Les rôles (`super_admin`, `admin`, `agent`, `citizen`) définissent précisément les permissions d'accès.

---
*Bénin Commune Connect - Pour une administration moderne, transparente et proche du citoyen.*
