# 📋 RecipeBox App - Documentation Complète

> Une application desktop moderne pour gérer vos recettes, ingrédients et listes de courses localement.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📑 Table des matières

1. [Présentation](#-présentation)
2. [Architecture](#-architecture)
3. [Installation & Démarrage](#-installation--démarrage)
4. [Scripts disponibles](#-scripts-disponibles)
5. [Structure du projet](#-structure-du-projet)
6. [Configuration](#-configuration)
7. [Développement](#-développement)
8. [Tests & Qualité](#-tests--qualité)
9. [Déploiement](#-déploiement)
10. [FAQ & Dépannage](#-faq--dépannage)

---

## 🎯 Présentation

### Contexte

De nombreuses personnes souhaitent organiser leurs recettes de cuisine, planifier leurs repas ou gérer leurs courses, mais les solutions existantes présentent des limitations :

- **Solutions en ligne** : Nécessitent une connexion Internet, dépendent de services tiers
- **Absence de personnalisation** : Configuration rigide, données non privées
- **Complexité** : Interfaces surchargées, trop de fonctionnalités inutiles

**RecipeBox App** répond à ces besoins en offrant une **solution desktop locale, simple et moderne** :

✅ Fonctionne **hors ligne** - Aucune dépendance Internet  
✅ **Données privées** - Stockage local sur SQLite3  
✅ **Multi-plateforme** - Windows, macOS, Linux grâce à Electron  
✅ **Interface intuitive** - Moderne avec Material Design  
✅ **Performance** - Application native rapide et réactive  

### Description du Projet

RecipeBox App est une **application desktop complète** de gestion de recettes permettant de :

| Fonctionnalité | Description |
|---|---|
| 🍳 **Gérer les recettes** | Créer, modifier, supprimer, consulter des recettes avec ingrédients et étapes |
| 🥬 **Gérer les ingrédients** | Organiser les ingrédients par catégorie avec images, quantités et dates d'expiration |
| 🔍 **Rechercher** | Trouver rapidement une recette par nom, catégorie ou ingrédient disponible |
| 📦 **Stock des ingrédients** | Suivi des ingrédients en stock avec alertes de fraîcheur |
| 🛒 **Listes de courses** | Génération intelligente de listes de courses |
| 📱 **Interface réactive** | Moderne et fluide avec Material Design |

### Cas d'utilisation

#### UC1 — Gérer les recettes
- **Acteur** : Utilisateur
- **Résumé** : Créer, modifier, supprimer et visualiser des recettes
- **Scénario** :
  1. Clique sur "Créer une recette"
  2. Saisit nom, description, ingrédients, étapes
  3. Enregistre la recette
  4. La recette apparaît immédiatement dans la liste

#### UC2 — Gérer les ingrédients
- **Acteur** : Utilisateur
- **Résumé** : Gestion complète de la liste des ingrédients
- **Scénario** :
  1. Ouvre le module "Ingrédients"
  2. Ajoute/modifie/supprime un ingrédient
  3. Organise les ingrédients par catégorie
  4. Peut ajouter une image de l'ingrédient

#### UC3 — Rechercher une recette
- **Acteur** : Utilisateur
- **Résumé** : Recherche rapide de recettes
- **Scénario** :
  1. Utilise la barre de recherche
  2. Tape un mot-clé
  3. Les recettes correspondantes apparaissent en temps réel

#### UC4 — Gérer le stock
- **Acteur** : Utilisateur
- **Résumé** : Suivi des ingrédients disponibles
- **Scénario** :
  1. Ouvre le module "Stock"
  2. Ajoute des ingrédients avec quantité et date d'expiration
  3. Visualise en mode cartes ou tableau
  4. Filtre par catégorie

#### UC5 — Générer une liste de courses
- **Acteur** : Utilisateur
- **Résumé** : Création automatique d'une liste de courses
- **Scénario** :
  1. Sélectionne plusieurs recettes
  2. Clique sur "Générer la liste de courses"
  3. La liste fusionnée des ingrédients s'affiche

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (Angular 21)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Components                                      │   │
│  │ ├── Recipes (CRUD, Search)                     │   │
│  │ ├── Ingredients (Management, Images)          │   │
│  │ ├── Stock (Dashboard, Filtering)               │   │
│  │ └── ShoppingList (Generation, Checking)        │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │ IPC Communication             │
├─────────────────────────┴──────────────────────────────┤
│         Electron Main Process                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ IPC Handlers                                    │   │
│  │ ├── Recipe Service                             │   │
│  │ ├── Ingredient Service                         │   │
│  │ ├── Stock Service                              │   │
│  │ └── Shopping List Service                      │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │ Database Access              │
├─────────────────────────┴──────────────────────────────┤
│         Database Layer (SQLite3)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Database Connection & Queries                  │   │
│  │ ├── Recipe Table                               │   │
│  │ ├── Ingredient Table                           │   │
│  │ ├── RecipeIngredient Junction Table            │   │
│  │ ├── IngredientStock Table                      │   │
│  │ └── ShoppingList Tables                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Flux de communication IPC

```
Angular Service          Electron IPC Handler          SQLite3 Database
      │                        │                              │
      ├─ ipcRenderer.invoke ──>│                              │
      │   ('recipe:create')    │                              │
      │                        ├─ RecipeService.create ──────>│
      │                        │                              │
      │                        │<──── Promise<Recipe> ────────│
      │<── Promise<result> ────│                              │
      │                        │                              │
```

### Stack Technologique

| Layer | Technologies |
|-------|--------------|
| **Desktop Runtime** | Electron 34+, Electron Forge 7+ |
| **Frontend Framework** | Angular 21, TypeScript 5.5+ |
| **UI Components** | Angular Material 21 |
| **State Management** | Angular Signals |
| **Communication** | RxJS 7.8+, Electron IPC |
| **Styling** | SCSS, CSS Grid, Flexbox |
| **Database** | SQLite3 5.1+, Node.js sqlite3 module |
| **Build Tools** | Angular CLI, webpack, TypeScript compiler |
| **Testing** | Karma, Jasmine |
| **Code Quality** | ESLint, Prettier, HTMLHint |
| **Package Manager** | npm 11.1.0+ |

---

## 📋 Prérequis

| Composant | Version | Notes |
|-----------|---------|-------|
| **Node.js** | 18.0+ | Recommandé : 20+ LTS |
| **npm** | 9.0+ | Livré avec Node.js |
| **Git** | 2.0+ | Pour cloner le dépôt |
| **RAM** | 2 GB minimum | Recommandé : 4+ GB |
| **Espace disque** | 500 MB | Pour node_modules et build |

---

## 🚀 Installation & Démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/EnzoFB/RecipeBox.git
cd RecipeBox
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Vérifier l'environnement

```bash
# Vérifier Node.js
node --version    # v18.0.0 ou supérieur

# Vérifier npm
npm --version     # 9.0.0 ou supérieur

# Vérifier Git
git --version
```

### 4. Lancer en développement

```bash
# Mode développement avec rechargement automatique
npm start

# Ou avec Electron Forge directement
npm run start:dev
```

---

## 📦 Scripts disponibles

### Développement

```bash
# Lancer l'application en développement (rechargement auto)
npm start

# Lancer avec Electron Forge
npm run start:dev

# Build Angular en mode watch
npm run watch
```

### Build & Package

```bash
# Build Angular pour production
npm run build

# Compiler les sources TypeScript Electron
npm run build:electron

# Créer un package distributable
npm run package

# Créer les installeurs (Windows .exe, macOS .zip, Linux .deb/.rpm)
npm run make
```

### Tests & Qualité

```bash
# Lancer les tests unitaires
npm test

# Lancer les tests en mode CI (une seule exécution)
npm run test:ci

# Vérifier les fichiers HTML
npm run lint:html

# Formater les fichiers HTML
npm run lint:html:fix

# Linter Angular
npm run lint:angular

# Fixer les erreurs de linter Angular
npm run lint:angular:fix
```

### Linting complet

```bash
# Lancer tous les linters
npm run lint
```

---

## 📁 Structure du projet

```
RecipeBox/
├── src/                              # Code source Angular
│   ├── index.html                    # Page HTML principale
│   ├── main.ts                       # Bootstrap Angular
│   ├── styles-global.scss            # Styles globaux
│   ├── styles.scss                   # Styles additionnels
│   └── app/                          # Module principal Angular
│       ├── app.config.ts             # Configuration app (providers)
│       ├── app.ts                    # Composant root
│       ├── app.html                  # Template root avec navigation
│       ├── app.routes.ts             # Routes principales
│       ├── app.scss                  # Styles du composant root
│       ├── app.spec.ts               # Tests du composant root
│       ├── core/                     # Couche métier (services, modèles)
│       │   ├── models/               # Interfaces de données
│       │   │   ├── recipe.model.ts
│       │   │   ├── ingredient.model.ts
│       │   │   ├── ingredient-stock.model.ts
│       │   │   └── shopping-list.model.ts
│       │   └── services/             # Services métier
│       │       ├── recipe.service.ts
│       │       ├── ingredient.service.ts
│       │       ├── ingredient-stock.service.ts
│       │       ├── shopping-list.service.ts
│       │       └── ipc.service.ts
│       ├── features/                 # Modules métier (pages, composants)
│       │   ├── recipes/              # Gestion des recettes
│       │   │   ├── recipes.component.ts
│       │   │   ├── recipe-list/
│       │   │   ├── recipe-form/
│       │   │   ├── recipe-detail/
│       │   │   └── recipes-management/
│       │   ├── ingredients/          # Gestion des ingrédients
│       │   │   ├── ingredients.component.ts
│       │   │   ├── ingredient-form/
│       │   │   ├── ingredients-management/
│       │   │   ├── stock/            # Gestion du stock
│       │   │   └── stock-form/
│       │   └── shopping-list/        # Gestion des listes de courses
│       │       └── shopping-list.component.ts
│       └── shared/                   # Composants partagés
│           └── components/           # Composants réutilisables
│
├── electron/                         # Code Electron (processus principal)
│   ├── main.ts                       # Point d'entrée Electron
│   ├── preload.ts                    # Script de préchargement (sécurité IPC)
│   ├── config.ts                     # Configuration Electron
│   ├── db.ts                         # Gestion de la base de données
│   ├── logger.ts                     # Système de logging
│   ├── types.ts                      # Types TypeScript
│   ├── ipc/
│   │   └── handlers.ts               # Handlers des événements IPC
│   └── services/                     # Services Electron
│       ├── recipe.service.ts
│       ├── ingredient.service.ts
│       ├── shopping-list.service.ts
│       └── stock.service.ts
│
├── electron-dist/                    # Code compilé Electron (généré)
├── out/                              # Build Angular (généré)
├── public/                           # Ressources statiques (icons, assets)
├── .github/workflows/                # GitHub Actions CI/CD
│   └── ci.yml                        # Configuration CI
├── angular.json                      # Configuration Angular CLI
├── forge.config.js                   # Configuration Electron Forge
├── tsconfig.json                     # Configuration TypeScript global
├── tsconfig.app.json                 # Configuration TypeScript Angular
├── tsconfig.electron.json            # Configuration TypeScript Electron
├── package.json                      # Dépendances et scripts
└── README.md                         # Ce fichier
```

---

## 🔧 Configuration

### Fichiers de configuration importants

#### `forge.config.js` - Configuration Electron Forge

```javascript
// Packagers (créateurs d'installeurs)
makers: [
  '@electron-forge/maker-squirrel',  // Windows (.exe)
  '@electron-forge/maker-zip',       // macOS (.zip)
  '@electron-forge/maker-deb',       // Linux (.deb)
  '@electron-forge/maker-rpm',       // Linux (.rpm)
]

// Point d'entrée principal
extraMetadata: {
  main: 'electron-dist/main.js',
}
```

#### `tsconfig.electron.json` - Configuration TypeScript Electron

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./electron-dist",
    "rootDir": "./electron",
    "strict": true
  },
  "include": ["electron/**/*"],
  "exclude": ["node_modules"]
}
```

#### `angular.json` - Configuration Angular

- Build production: `ng build`
- Build développement: `ng build --configuration development`
- Build watch: `ng build --watch --configuration development`

### Styles

Le projet utilise **SCSS** pour les styles :

- `src/styles-global.scss` : Styles globaux, variables, mixins
- `src/styles.scss` : Imports et styles additionnels
- Chaque composant a son propre fichier `.scss` scopé au composant

---

## 💻 Développement

### Communication Frontend-Backend (IPC)

**Frontend (Angular)** :
```typescript
import { ipcRenderer } from 'electron';

export class RecipeService {
  async createRecipe(recipe: Recipe): Promise<Recipe> {
    return await ipcRenderer.invoke('recipe:create', recipe);
  }
}
```

**Backend (Electron)** :
```typescript
ipcMain.handle('recipe:create', async (event, recipe: Recipe) => {
  return await RecipeService.create(recipe);
});
```

### Debugging

#### Mode développement
```bash
npm start
```
L'application s'ouvre en mode développement avec l'inspecteur Electron disponible.

#### Logs
```typescript
// Frontend
console.log('Message');

// Backend
logger.info('Message');  // utilise electron/logger.ts
```

---

## 🧪 Tests & Qualité

### Tests Unitaires

```bash
# Lancer les tests
npm test

# Tests en mode CI
npm run test:ci
```

**Framework** : Karma + Jasmine

### Linting

```bash
# Vérifier la qualité du code
npm run lint:html        # HTML
npm run lint:angular     # TypeScript/Angular

# Formater
npm run lint:html:fix    # HTML
npm run lint:angular:fix # TypeScript/Angular
```

### Build Budgets

L'application a des limites de taille pour les bundles (configurées dans `angular.json`):
- Bundle initial : 550 KB max

---

## 📦 Déploiement

### Créer les distributables

```bash
# Build complet et création des installeurs
npm run make
```

Les fichiers générés se trouvent dans `out/make/` :

- **Windows** : `RecipeBox-Setup.exe` (Squirrel)
- **macOS** : `RecipeBox-darwin-x64-xxx.zip`
- **Linux (Debian)** : `recipe-box_x.x.x_amd64.deb`
- **Linux (RedHat)** : `recipe-box-x.x.x-1.x86_64.rpm`

### GitHub Actions CI/CD

Le projet inclut une configuration GitHub Actions (`.github/workflows/ci.yml`) qui :

- ✅ Teste sur Node.js 20 et 22
- ✅ Installe les dépendances (`npm ci`)
- ✅ Lance les linters (HTML, Angular)
- ✅ Exécute les tests unitaires
- ✅ Effectue les builds (Angular et Electron)

---

## 📚 Ressources et Documentation

### Documentation Complète
- **`README_COMPLET.md`** : Documentation technique détaillée avec modèle de données complet
- **`documentations/DOCUMENTATION_INDEX.md`** : Index de toute la documentation

### Documentation Externe
- [Documentation Electron](https://www.electronjs.org/docs)
- [Guide Electron Forge](https://www.electronforge.io/guides)
- [Documentation Angular](https://angular.dev/docs)
- [Guide Angular CLI](https://angular.io/cli)
- [Documentation SQLite3](https://github.com/mapbox/node-sqlite3/wiki)
- [Guide TypeScript](https://www.typescriptlang.org/docs/)

---

## 📊 Métriques de Performance

### Frontend
- **Bundle Size** : ~2-3 MB (non compressé)
- **Load Time** : < 2 secondes en développement
- **Memory** : ~150-300 MB en usage normal

### Backend
- **Database** : SQLite3 performante et légère
- **IPC Latency** : < 10ms pour requêtes simples
- **Stockage** : Base de données portable et distribuable

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

**Version** : 1.0.0  
**Date de mise à jour** : 28 novembre 2025  
**Auteur** : EnzoFB  
**Repository** : [github.com/EnzoFB/RecipeBox](https://github.com/EnzoFB/RecipeBox)
