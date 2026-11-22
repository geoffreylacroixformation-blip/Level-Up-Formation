# Level Up Formation — Workflow de développement

## Objectif
Ce document définit le workflow de développement pour le projet Level Up.

## Environnement de développement

### Prérequis
- Node.js 20+
- npm ou pnpm
- Git

### Installation
```bash
npm install
```

### Démarrage
```bash
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

## Flux de travail

### 1. Développement local
1. Créer une branche `feature/nom-de-la-fonctionnalite`
2. Développer et tester localement
3. Commit avec des messages clairs
4. Push et créer une PR vers `main`

### 2. Déploiement
- Push sur `main` → GitHub Actions automatique
- Vérifier le déploiement sur GitHub Pages

### 3. Base de données
- Migrations dans `supabase/migrations/`
- Appliquer : `supabase db push`
- Ne jamais modifier manuellement la BDD en production

## Conventions

### Nommage
- Fichiers : kebab-case (`header-component.astro`)
- Composants : PascalCase (`Header.astro`)
- Variables : camelCase
- Constantes : UPPER_SNAKE_CASE

### Structure des pages
- Routes statiques : `nom-de-la-page.astro`
- Routes dynamiques : `[slug].astro`
- Routes catch-all : `[...slug].astro`

### Styles
- Tailwind CSS v4 avec classes utilitaires
- Variables CSS personnalisées pour le thème cyberpunk
- Pas de CSS inline sauf exception

## Déploiement

### Cloudflare Pages
- Branche : `main`
- Dossier : `dist`
- URL : `https://levelup-formation.pages.dev`
- Déploiement : GitHub Actions (`cloudflare/pages-action@v1`)
- Secrets : `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Variables d'environnement (GitHub)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY` (Edge Functions uniquement)

## Sécurité

### Secrets
- **JAMAIS** dans le code ou les commits
- Variables d'environnement GitHub / Supabase
- `.env` ignoré par Git

### Authentification
- Supabase Auth (Email + Magic Link)
- RLS sur toutes les tables sensibles
- Vérification côté serveur + RLS

## Documentation

### Avant de modifier
1. Consulter `docs-reference/INDEX.md`
2. Identifier les docs pertinentes
3. Lire les docs correspondantes
4. Vérifier la compatibilité avec le code existant

### Mise à jour des docs
- Modifier les docs de référence AVANT de coder
- Signaler les contradictions
- Ne pas modifier sans validation de Geoffrey
