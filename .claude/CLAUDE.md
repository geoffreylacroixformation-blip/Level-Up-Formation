# Level Up Formation — Instructions pour Claude Code

## Contexte du projet
Level Up est une plateforme de formation en ligne spécialisée en systèmes, réseaux, cybersécurité et IA.
Marque : Level Up — esthétique cyberpunk-chic (neon-glow, dark-mode).
Slogan : "Montez en compétences, un niveau à la fois".

## Stack technique
- **Framework** : Astro 5.x avec Tailwind CSS v4
- **Backend** : Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Paiement** : Stripe (via Edge Functions)
- **Hébergement** : Cloudflare Pages (branche main)
- **Langage** : TypeScript, Astro Components
- **CSS** : Tailwind CSS v4 (via @tailwindcss/vite)

## Règles de développement

### Avant de coder
1. **TOUJOURS** consulter `docs-reference/INDEX.md` pour identifier les docs pertinentes
2. Consulter les documents de référence correspondants AVANT toute modification
3. Examiner le code existant pour vérifier la compatibilité
4. En cas de contradiction entre docs et code, **signaler la contradiction** avant de modifier

### Priorité des sources (en cas de divergence)
1. Instructions explicites du propriétaire (Geoffrey)
2. Documents de référence dans `docs-reference/`
3. Code et configuration actuels dans le repo
4. Décisions documentées précédemment
5. Historique des conversations
6. Hypothèses de l'agent

### Règles de sécurité
- **JAMAIS** exposer de secrets (clés API, tokens, mots de passe) dans le code ou la sortie
- **JAMAIS** commit de `.env` ou de fichiers contenant des secrets
- Les secrets doivent être dans les variables d'environnement de GitHub Actions / Cloudflare
- Ne pas modifier la stack technique sans validation explicite

### Règles de design
- Respecter le Brand Book (`docs-reference/Brandbook/level_up_brand_book_by_pomelli.pdf`)
- Ne pas déformer les logos existants
- Utiliser les ressources graphiques existantes avant d'en créer de nouvelles
- Maintenir l'esthétique cyberpunk-chic (neon-glow, dark-mode)

### Règles de code
- TypeScript strict
- Composants Astro pour le frontend
- Pas de dépendances supplémentaires sans validation
- Respecter les conventions de nommage existantes
- Les prix sont en centimes (`price_cents`) — standard monétaire

## Structure du projet
```
Level-Up-Formation/
├── docs-reference/     # Documentation de référence (source de vérité)
│   ├── Brandbook/      # Identité visuelle
│   ├── db/             # Migrations et docs DB
│   ├── LOGO/           # Ressources graphiques
│   └── md/             # Architecture fonctionnelle/technique
├── src/
│   ├── components/     # Composants Astro
│   ├── layouts/        # Layouts
│   ├── lib/            # Utilitaires (supabase, i18n, courses)
│   ├── pages/          # Routes du site
│   ├── styles/         # CSS global
│   └── i18n/           # Traductions
├── supabase/
│   ├── migrations/     # Migrations SQL
│   └── functions/      # Edge Functions
├── public/             # Assets statiques
└── dist/               # Build output
```

## Commandes
```bash
npm install          # Installer les dépendances
npm run dev          # Dev server (localhost:4321)
npm run build        # Build production
npm run preview      # Preview du build
```

## Déploiement
Push sur `main` → Cloudflare Pages → déploiement automatique.
URL : `https://levelup-formation.pages.dev`

## Secrets GitHub nécessaires
- `CF_API_TOKEN` : Token API Cloudflare (voir étape 1)
- `CF_ACCOUNT_ID` : Account ID Cloudflare (voir étape 1)
- `SUPABASE_URL` : URL Supabase
- `SUPABASE_ANON_KEY` : Clé anon Supabase

## Accès GitHub via Composio
L'agent dispose d'un accès GitHub via Composio (compte `geoffreylacroixformation-blip` connecté).

### Outils disponibles
| Outil | Usage |
|---|---|
| `GITHUB_COMMIT_MULTIPLE_FILES` | Créer/mettre à jour/supprimer des fichiers dans un commit |
| `GITHUB_CREATE_A_BRANCH` / `GITHUB_CREATE_A_REFERENCE` | Créer des branches |
| `GITHUB_GET_A_REPOSITORY` | Récupérer les infos du repo |
| `GITHUB_GET_A_BRANCH` | Récupérer le SHA d'une branche |
| `GITHUB_GET_A_REFERENCE` | Récupérer une ref git |
| `GITHUB_LIST_COMMITS` | Lister les commits |
| `GITHUB_CREATE_A_PULL_REQUEST` | Créer une PR |
| `GITHUB_LIST_PULL_REQUESTS` | Lister les PRs |
| `GITHUB_GET_A_PULL_REQUEST` | Récupérer une PR |
| `GITHUB_MERGE_A_PULL_REQUEST` | Fusionner une PR |
| `GITHUB_CREATE_AN_ISSUE` | Créer un ticket |
| `GITHUB_LIST_ISSUES` | Lister les tickets |
| `GITHUB_UPDATE_ISSUE_TYPE` | Modifier un type de ticket |
| `GITHUB_LIST_ISSUE_TYPES` | Lister les types de ticket |
| `GITHUB_LIST_AVAILABLE_MACHINE_TYPES_FOR_A_REPOSITORY` | Machines Codespaces |
| `GITHUB_GET_DEFAULT_ATTRIBUTES_FOR_A_CODESPACE` | Config Codespaces |
| `GITHUB_CREATE_A_CODESPACE_IN_A_REPOSITORY` | Créer un Codespace |
| `GITHUB_GET_CATALOG_MODELS` | Modèles AI GitHub |
| `GITHUB_CREATE_INFERENCE_CHAT_COMPLETIONS` | Inférence IA (GPT-4, Claude, Llama) |
| `GITHUB_CREATE_INFERENCE_EMBEDDINGS` | Embeddings IA |

### Compte connecté
- **Owner** : `geoffreylacroixformation-blip`
- **Repo** : `Level-Up-Formation`
- **Status** : ACTIVE
- **Account type** : PRIVATE

### Exemple : Commit via Composio
```
Tool: GITHUB_COMMIT_MULTIPLE_FILES
Args:
  owner: "geoffreylacroixformation-blip"
  repo: "Level-Up-Formation"
  branch: "main"
  message: "feat: description du changement"
  base_branch: "main"  # si la branche n'existe pas
  upserts:
    - path: "chemin/du/fichier.md"
      content: "contenu du fichier"
```

### Limitations connues
- `COMPOSIO_PROXY_EXECUTE` peut être bloqué par les Enhanced Controls → utiliser les outils spécifiques `GITHUB_*` à la place
- Les Enhanced Controls peuvent empêcher les appels directs → privilégier les outils Composio dédiés

## Base de données
- URL Supabase : `https://snnswoqgneyuqofnyxgn.supabase.co`
- 9 migrations SQL dans `supabase/migrations/`
- Tables principales : profiles, courses, modules, enrollments, progress, orders
- RLS activé sur toutes les tables sensibles

## Tarification
- LVL1 : 49€ | LVL2 : 89€ | LVL3 : 149€
- Bundles disponibles (voir docs pour détails)

## Modèles de formation
- 3 niveaux : Découverte → Approfondissement → Expert
- 4 catégories : Systèmes, Réseaux, Cybersécurité, IA
- Chaque cours = achat unique (pas d'abonnement)
- Module 0 gratuit par formation
