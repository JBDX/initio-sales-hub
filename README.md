# Initio — Outil technico-commercial

Application interne (CRM) pour l'équipe commerciale IT : suivi des devis, du
portefeuille clients, de la campagne MFA M365 et d'une base de connaissance
produits. Front React (Vite + TypeScript + Tailwind CSS v4), branché sur un
backend Supabase déjà en place (projet `initio-sales-hub`).

## Lancer en local

```bash
npm install
npm run dev
```

Les identifiants Supabase réels sont déjà dans `.env` (non versionné) pour
pouvoir tester immédiatement. Pour un nouvel environnement, copiez
`.env.example` vers `.env` et renseignez :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Déployer sur Netlify

1. Poussez ce dépôt sur GitHub/GitLab/Bitbucket, puis connectez-le dans
   Netlify ("Add new site" → "Import an existing project").
2. Build command : `npm run build`
3. Publish directory : `dist`
4. Variables d'environnement (Site settings → Environment variables) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Le fichier `netlify.toml` à la racine configure déjà la commande de build,
   le dossier de publication et la redirection SPA (`/* → /index.html`)
   nécessaire au bon fonctionnement de React Router en production.

## Choix techniques

- **Vite + React + TypeScript** : template officiel `react-ts`.
- **Tailwind CSS v4** via le plugin `@tailwindcss/vite` (pas de
  `postcss.config.js` nécessaire). Les tokens de design (couleurs, polices)
  sont définis dans `src/index.css` via `@theme`.
- **React Router v7** pour le routing, avec une route protégée
  (`ProtectedRoute`) qui redirige vers `/login` si l'utilisateur n'est pas
  authentifié.
- **TanStack Query** pour la gestion des requêtes Supabase (cache, états de
  chargement/erreur, invalidation après mutation). Chaque écran fait de
  vraies requêtes `select`/`insert`/`update` via `@supabase/supabase-js` — il
  n'y a aucune donnée mockée en dur. La base étant vide au démarrage (la
  migration des données tourne en parallèle), chaque liste gère un état vide
  explicite et se remplira automatiquement une fois les données migrées.
- **Typage de la base** : les tables sont décrites à la main dans
  `src/types/database.ts` (pas de génération automatique disponible dans cet
  environnement). Le client Supabase (`src/lib/supabase.ts`) n'est
  volontairement pas généré avec le générique strict `Database` de
  `createClient` — le schéma évolue encore côté backend et ce générique est
  très sensible au moindre écart de forme. Chaque requête annote son propre
  type de retour à partir des interfaces de `database.ts`.
- **Authentification** : `AuthProvider` (`src/context/AuthContext.tsx`)
  expose la session Supabase, l'utilisateur et sa ligne `profils` associée
  (commercial, rôle, nom affiché).
- **Design** : palette sobre encre/sarcelle sur fond papier froid, typographie
  IBM Plex Sans (texte) / IBM Plex Mono (montants, codes, KPI), sidebar de
  navigation fixe et système de badges de statut cohérent (un badge =
  une paire couleur de fond/texte désaturée par valeur d'enum métier).
- **Librairie de composants UI** : pas de librairie externe (Material UI,
  shadcn, etc.) — composants internes légers (`src/components/ui.tsx`) pour
  garder le contrôle total sur le design et éviter l'esthétique « SaaS
  générique » par défaut.

## Structure du projet

```
src/
  components/      Layout (sidebar), ProtectedRoute, StatusBadge, ui.tsx (primitives)
  context/         AuthContext (session + profil utilisateur)
  lib/             Client Supabase
  pages/           Un fichier par écran (Ma journée, Pipeline devis, Clients,
                   Détail client, Campagne MFA, Tableau de bord, Base de
                   connaissance, Login)
  types/           Types TypeScript du schéma Postgres
```

## Écrans

- **Ma journée** (`/`) — devis urgents/à relancer + clients à rappeler
  aujourd'hui, avec changement rapide de statut.
- **Pipeline devis** (`/devis`) — vue groupée par statut, filtre par
  commercial, marge/taux de marge, formulaire de création/édition.
- **Clients** (`/clients`) — liste filtrable (statut, priorité,
  portefeuille) + fiche client 360° (`/clients/:id`) avec devis liés et
  statut MFA.
- **Campagne MFA** (`/mfa`) — liste filtrable par portefeuille/statut +
  compteurs de progression.
- **Tableau de bord** (`/dashboard`) — KPI calculés côté client à partir des
  devis (répartition par statut, CA gagné, taux de transformation), avec vue
  par commercial pour les managers.
- **Base de connaissance** (`/base-savoir`) — recherche produit/catégorie/
  fournisseur avec prix et taux de marque.

## Sécurité

Aucune clé n'est en dur dans le code : `VITE_SUPABASE_URL` et
`VITE_SUPABASE_ANON_KEY` sont lues depuis les variables d'environnement
(`.env` en local, variables d'environnement Netlify en production). La
sécurité des données repose sur les politiques RLS déjà en place côté
Supabase (un commercial ne voit que son portefeuille, un manager voit tout).
