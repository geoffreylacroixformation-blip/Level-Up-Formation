# Level Up Formation

## 🚀 Installation

```bash
npm install
```

## 🔧 Développement

```bash
npm run dev
```

Serveur de développement sur `http://localhost:4321`

## 📦 Build

```bash
npm run build
npm run preview
```

## 🌐 Déploiement

Push sur `main` → GitHub Actions automatique → GitHub Pages.

## 📁 Structure

- `src/` — Code source (Astro components, pages, layouts, lib)
- `docs-reference/` — Documentation de référence (source de vérité)
- `supabase/` — Migrations et Edge Functions
- `public/` — Assets statiques

## 📚 Documentation

**Avant toute modification**, consulter `docs-reference/INDEX.md` pour identifier les docs pertinentes.

## 🔒 Secrets

Copier `.env.example` vers `.env` et remplir les variables.
**Ne jamais commit de `.env` ou de secrets.**

## 🤖 Accès GitHub via Composio

L'agent dispose d'un accès GitHub complet via Composio (compte `geoffreylacroixformation-blip` connecté).

### Outils principaux
| Outil | Usage |
|---|---|
| `GITHUB_COMMIT_MULTIPLE_FILES` | Commiter des fichiers |
| `GITHUB_CREATE_A_BRANCH` | Créer des branches |
| `GITHUB_CREATE_A_PULL_REQUEST` | Créer des PRs |
| `GITHUB_MERGE_A_PULL_REQUEST` | Fusionner des PRs |
| `GITHUB_CREATE_AN_ISSUE` | Créer des tickets |
| `GITHUB_GET_A_REPOSITORY` | Infos repo |

### Repo
- **Owner** : `geoffreylacroixformation-blip`
- **Repo** : `Level-Up-Formation`
- **Status** : ACTIVE

### Limitations
- `COMPOSIO_PROXY_EXECUTE` peut être bloqué par les Enhanced Controls → privilégier les outils `GITHUB_*`

## 🎨 Design

Respecter le Brand Book dans `docs-reference/Brandbook/`.
Esthétique cyberpunk-chic : neon-glow, dark-mode.
