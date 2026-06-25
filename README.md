# Level Up - Plateforme de Formation en Cybersécurité

**Level Up** est une plateforme de formation en ligne spécialisée en cybersécurité et informatique, avec un design cyberpunk moderne et une progression par niveaux.

## Stack Technique

- **Framework**: Astro (SSG statique, compatible GitHub Pages)
- **CSS**: Tailwind CSS v4
- **Auth + Base de données**: Supabase
- **Paiement**: Stripe
- **i18n**: Multilingue fr/en (français par défaut)

## Structure du Projet

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── i18n/
│   │   ├── fr.json
│   │   └── en.json
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── courses.ts
│   │   ├── i18n.ts
│   │   └── supabase.ts
│   └── pages/
│       ├── index.astro
│       ├── catalogue.astro
│       ├── membre.astro
│       ├── a-propos.astro
│       ├── contact.astro
│       ├── mentions-legales.astro
│       ├── cgv.astro
│       ├── confidentialite.astro
│       ├── cours/
│       │   └── [slug].astro
│       └── en/
│           └── index.astro
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Variables d'Environnement

Copier `.env.example` vers `.env` et configurer:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Commandes

| Command            | Action                                          |
|:-------------------|:------------------------------------------------|
| `npm install`      | Installe les dépendances                        |
| `npm run dev`      | Démarre le serveur de dev sur `localhost:4321` |
| `npm run build`    | Build statique dans `./dist/`                   |
| `npm run preview`  | Prévisualise le build localement               |

## Déploiement GitHub Pages

### 1. Configurer le repository

1. Créer un nouveau repository sur GitHub
2. Initialiser git et pousser le code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

### 2. Configurer GitHub Pages

1. Aller dans Settings > Pages
2. Source: déployer depuis une branch
3. Selectionner `main` et dossier `/ (root)`

### 3. Configurer GitHub Actions (automatique)

Le projet inclut un workflow GitHub Actions pour le déploiement automatique.

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v2
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### 4. Configurer les Secrets

Dans Settings > Secrets and variables > Actions, ajouter:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 5. Configurer l'URL du site

Dans `astro.config.mjs`, mettre à jour `site` avec votre URL GitHub Pages:
```javascript
site: 'https://USERNAME.github.io/REPO'
```

## Configuration Stripe

### 1. Créer les produits dans Stripe

1. Accéder au Dashboard Stripe > Products
2. Créer un produit pour chaque niveau de formation
3. Noter les Price IDs

### 2. Configurer le Webhook

1. Dashboard Stripe > Developers > Webhooks
2. Ajouter endpoint: `https://your-site.com/api/stripe-webhook`
3. Selectionner les events: `checkout.session.completed`
4. Noter le Webhook Secret

### 3. Configurer les variables Stripe

Ajouter dans `.env`:
```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_LVL1=price_xxx
```

## Configuration Supabase

### 1. Créer le projet Supabase

1. Aller sur supabase.com
2. Créer un nouveau projet
3. Noter l'URL et les clés API

### 2. Appliquer le schéma de base de données

Le schéma SQL est disponible pour créer les tables:
- `users` - profils utilisateurs
- `courses` - catalogue des formations
- `progress` - progression par module
- `certificates` - certificats émis

### 3. Configurer l'authentification

1. Authentication > Providers
2. Activer Email provider
3. Désactiver "Confirm email" pour le développement

## Fonctionnalités

- **Design cyberpunk sombre** avec accents violet/cyan
- **3 niveaux de formation** (LVL1: 49EUR, LVL2: 89EUR, LVL3: 149EUR)
- **Bundles groupés** (Pack 1+2: 119EUR, All Access: 249EUR)
- **Module 0 gratuit** pour chaque formation
- **Quiz par module** avec badges à la completion
- **Certificats PDF** téléchargeables
- **Espace membre** avec tableau de bord
- **Multilingue** FR/EN

## Licence

Tous droits réservés - Level Up
