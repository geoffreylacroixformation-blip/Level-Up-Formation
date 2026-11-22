# Level Up — Stack Technique Complète
> Dernière mise à jour : 22 novembre 2026

---

## 🎯 Présentation du projet

**Nom** : Level Up  
**Type** : Plateforme de formation en ligne — systèmes et réseaux informatique et cybersécurité  
**Slogan** : "Montez en compétences, un niveau à la fois"  
**Langue** : Français + ANGLAIS

---

## Architecture générale

```
Navigateur (Apprenant)
        │
        ▼
Cloudflare Pages (site statique Astro)
        │
        ├──► Supabase (auth + base de données)
        │
        └──► Supabase Edge Functions
                    │
                    ├──► Stripe (paiement)
                    └──► Supabase DB (mise à jour accès cours)
```

---

## Stack technique
### Clone local du site
|C:\Users\Jo\Level-Up-Formation

### Frontend
| Élément | Détail |
|---|---|
| Framework | Astro (SSG — output static) |
| CSS | Tailwind CSS |
| Générateur | skill codex |
| Langue | TypeScript / Astro components |

### Hébergement
|| Élément | Détail ||
||---|---||
|| Plateforme | Cloudflare Pages (gratuit) ||
|| URL publique | `https://levelup-formation.pages.dev` ||
|| Déploiement | GitHub Actions (`cloudflare/pages-action@v1`) ||
|| Environment variables - SUPABASE_URL | https://snnswoqgneyuqofnyxgn.supabase.co
|| Environment variables - SUPABASE_ANON_KEY | [REDACTED]
|| CF_API_TOKEN | [REDACTED] — dans les secrets GitHub
|| CF_ACCOUNT_ID | [REDACTED] — dans les secrets GitHub
### Backend / Auth
| Élément | Détail |
|---|---|
| Plateforme | Supabase (plan Free) |
| Projet | `level-up` |
| Région | Europe West (Paris) |
| Auth | Email/password + magic link |
| Clé publique | Publishable Key (dans variables d'env frontend) |

### Paiement
| Élément | Détail |
|---|---|
| Plateforme | Stripe |
| Mode actuel | Test (`sk_test_...`) |
| Intégration | Via Supabase Edge Functions |

### Edge Functions (Supabase)
| Fonction | Rôle |
|---|---|
| `create-checkout-session` | Crée une session de paiement Stripe quand un apprenant achète un cours |
| `stripe-webhook` | Reçoit la confirmation de paiement Stripe et met à jour Supabase |

---

## Schéma base de données Supabase


## Table `progression`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `courses_id` | `uuid` | Primary |
| `module_id` | `text` | Primary |
| `completed` | `bool` |  Nullable |
| `quiz_score` | `numeric` |  Nullable |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  |
| `role` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `courses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `level` | `int4` |  |
| `price` | `numeric` |  |
| `image` | `text` |  Nullable |
| `modules` | `jsonb` |  Nullable |
| `stripe_product_id` | `text` |  Nullable |
| `stripe_price_id` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `courses_modules`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `course_slug` | `text` |  |
| `title` | `text` |  |
| `order_index` | `int4` |  |
| `content` | `text` |  Nullable |
| `quiz` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `users_courses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `course_slug` | `text` |  |
| `progress` | `int4` |  Nullable |
| `completed` | `bool` |  Nullable |
| `purchased_at` | `timestamptz` |  Nullable |

---

## Tarification

| Offre | Prix |
|---|---|
| LVL1 | 49€ pour 1 cours |
| LVL2 | 89€ pour 1 cours |
| LVL3 | 149€ pour 1 cours |
| 3 Formations LVL1 |  109€
| 3 Formations LVL2 |  199€
| 3 Formations LVL3 |  399€
| 1 Formation LVL1 + 1 Formation LVL2 | 119€
| 1 Formation LVL2 + 1 Formation LVL3 | 209€

---

## Variables d'environnement

### Secrets Supabase Edge Functions
```env
STRIPE_SECRET_KEY=sk_test_51TTTt4D1j69KRlZpMjKubuMy97apUe3XTeH8bU4odqUQH45XkIurvDX9CPmADffuoNUHWmjNZdhAZa9LFALAb7Mi00hfxU3dKqSITE_URL=https://geoffreylacroixformation-blip.github.io/Level-Up-Formation
STRIPE_WEBHOOK_SECRET=whsec_temporaire
SUPABASE_URL=https://geoffreylacroixformation-blip.github.io/Level-Up-Formation
SUPABASE_SERVICE_ROLE_KEY=[REDACTED_SERVICE_ROLE]GduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg3ODE2MywiZXhwIjoyMDk3NDU0MTYzfQ.YMbh77XipcWfsW8S2Osq4cTCP_8LtFtDii6XPKJuPRk```

### Frontend Astro (.env)
```env
TOKEN=[REDACTED_SUPABASE_TOKEN]
SUPABASE_SERVICE_ROLE_KEY=[REDACTED_SERVICE_ROLE]GduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg3ODE2MywiZXhwIjoyMDk3NDU0MTYzfQ.YMbh77XipcWfsW8S2Osq4cTCP_8LtFtDii6XPKJuPRk

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

sb_publishable_RkJTuRZy7c1ozpsyaGgG9g_Cmoh9a9_
https://snnswoqgneyuqofnyxgn.supabase.co

---

## Pages du site

| Page | Route |
|---|---|
| Accueil | `/` |
| Catalogue | `/catalogue` |
| Détail cours | `/cours/[slug]` |
| Espace admin dashboard | `/dashboard` |
| admin login | `/admin_login` |
| À propos | `/a-propos` |
| Contact | `/contact` |
| Mentions légales | `/mentions-legales` |
| CGV | `/cgv` |
| Confidentialité | `/confidentialite` |
| UNSUBSCRIBE | `/UNSUBSCRIBE` |
---
# | Espace admin dashboard | `/dashboard` |
** VIA un compte admin avec supabase **
** le compte admin est protégé par un mot de passe ** 
** droits admin en écriture ** : 
créer les cours
supprimer les cours
modifier les cours (titre, level, section, pitch, prix, durée, nombre de modules, vignette d'illustration, documents inclus, contenu).

## 🤖 Rôle de l'agent Webmaster

L'agent Webmaster est responsable de :

- Surveiller le bon fonctionnement du site (liens, pages, erreurs 404)
- Mettre à jour le contenu des cours (titres, modules, descriptions) via l'API Supabase
- Vérifier les déploiements GitHub Actions (succès / échec)
- Générer des rapports sur les inscriptions et progressions des apprenants
- Alerter en cas d'échec webhook Stripe
- Gérer les nouvelles pages ou modules de cours

---

## 🤖 Accès GitHub via Composio

L'agent dispose d'un accès GitHub complet via Composio (compte `geoffreylacroixformation-blip` connecté, status ACTIVE).

### Outils principaux
| Outil | Usage |
|---|---|
| `GITHUB_COMMIT_MULTIPLE_FILES` | Commiter des fichiers |
| `GITHUB_CREATE_A_BRANCH` | Créer des branches |
| `GITHUB_CREATE_A_PULL_REQUEST` | Créer des PRs |
| `GITHUB_MERGE_A_PULL_REQUEST` | Fusionner des PRs |
| `GITHUB_CREATE_AN_ISSUE` | Créer des tickets |
| `GITHUB_GET_A_REPOSITORY` | Infos repo |
| `GITHUB_LIST_COMMITS` | Lister les commits |
| `GITHUB_GET_CATALOG_MODELS` | Modèles AI GitHub |
| `GITHUB_CREATE_INFERENCE_CHAT_COMPLETIONS` | Inférence IA (GPT-4, Claude, Llama) |

### Compte connecté
- **Owner** : `geoffreylacroixformation-blip`
- **Repo** : `Level-Up-Formation`
- **Status** : ACTIVE
- **Account type** : PRIVATE

### Limitations
- `COMPOSIO_PROXY_EXECUTE` peut être bloqué par les Enhanced Controls → privilégier les outils `GITHUB_*`





