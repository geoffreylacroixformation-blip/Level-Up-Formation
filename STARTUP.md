# Level Up Formation — Skills liés au projet

Quand tu reçois une tâche, charge automatiquement le skill pertinent :

## Développement
- **gestion-site-levelup** → Toute question sur le site, la DB, l'architecture
- **claude-code** → Tâches de coding intensif
- **github** → PR, issues, déploiement
- **plan** → Planification de tâches

## Contenu & Marketing
- **google-workspace** → Google Docs, Sheets, Slides, Drive via Composio
- **pdf** → Gestion des PDF
- **google-nano-banana** → Génération d'images
- **presentation-creator** → Présentations

## Agency
- **agency-agents** → Multi-agent (prospection, contenu, cours, dev, admin, design)
  - 6 agents spécialisés : Commercial, Contenu, Pédagogique, Développement, Admin, Design
  - Workflow intégré pour lancement de cours et prospection B2B

## Productivité
- **document-to-action-items** → Extraction de tâches depuis documents
- **weekly-review-planning** → Revue hebdomadaire
- **email-inbox-triage** → Gestion des emails
- **competitor-news-monitor** → Suivi concurrence
- **google-drive-sync** → Sync Drive

## Règles
1. Charger le skill AVANT d'agir
2. Demander confirmation avant toute publication
3. Respecter le Brand Book
4. French uniquement
5. Jamais de secrets en clair

## Accès GitHub via Composio
L'agent dispose d'un accès GitHub via Composio (compte `geoffreylacroixformation-blip` connecté, status ACTIVE).

### Outils principaux
- **`GITHUB_COMMIT_MULTIPLE_FILES`** — Commiter des fichiers
- **`GITHUB_CREATE_A_BRANCH`** — Créer des branches
- **`GITHUB_CREATE_A_PULL_REQUEST`** — Créer des PRs
- **`GITHUB_MERGE_A_PULL_REQUEST`** — Fusionner des PRs
- **`GITHUB_CREATE_AN_ISSUE`** — Créer des tickets
- **`GITHUB_GET_A_REPOSITORY`** — Infos repo
- **`GITHUB_LIST_COMMITS`** — Lister les commits
- **`GITHUB_GET_CATALOG_MODELS`** — Modèles AI GitHub
- **`GITHUB_CREATE_INFERENCE_CHAT_COMPLETIONS`** — Inférence IA (GPT-4, Claude, Llama)

### Repo
- **Owner** : `geoffreylacroixformation-blip`
- **Repo** : `Level-Up-Formation`

### Limitations
- `COMPOSIO_PROXY_EXECUTE` peut être bloqué par les Enhanced Controls → privilégier les outils `GITHUB_*`
