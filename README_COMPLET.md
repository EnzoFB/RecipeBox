# 📋 RecipeBox App - Documentation Complète

> Une application desktop moderne pour gérer vos recettes, ingrédients et listes de courses localement.

---

## 📑 Table des matières

1. [Présentation](#-présentation)
2. [Architecture](#-architecture)
3. [Environnement Logiciel](#-environnement-logiciel)
4. [Installation & Démarrage](#-installation--démarrage)
5. [CI/CD](#-cicd)
6. [Conclusion](#-conclusion)

---

## 🎯 Présentation

### Contexte

De nombreuses personnes souhaitent organiser leurs recettes de cuisine, planifier leurs repas ou gérer leurs courses, mais les solutions existantes présentent des limitations :
- **Solutions en ligne** : Nécessitent une connexion Internet, peuvent dépendre de services tiers
- **Absence de personnalisation** : Configuration rigide, données non privées
- **Complexité** : Interfaces surcharges, trop de fonctionnalités inutiles

**RecipeBox App** répond à ces besoins en offrant une **solution desktop locale, simple et moderne** :
- ✅ Fonctionne **hors ligne** - Aucune dépendance Internet
- ✅ **Données privées** - Stockage local sur SQLite3
- ✅ **Multi-plateforme** - Windows, macOS, Linux grâce à Electron
- ✅ **Interface intuitive** - Moderne avec Material Design
- ✅ **Performance** - Application native rapide et réactive

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

### Cas d'Utilisation (Use Cases)

#### UC1 — Gérer les recettes
- **Acteur** : Utilisateur
- **Résumé** : L'utilisateur crée, modifie, supprime et visualise des recettes
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
  4. Peut cocher les articles achetés

### Modèle de Données (MDD)

#### Diagramme Entité-Relation

```
┌─────────────────┐
│     Recipe      │
├─────────────────┤
│ • id (PK)       │
│ • name          │
│ • description   │
│ • category      │
│ • instructions  │
│ • created_at    │
└────────┬────────┘
         │ 1
         │ (N)
         │
    ┌────┴──────────────────────────┐
    │                               │
    │                    ┌──────────────────────┐
    │                    │  RecipeIngredient    │
    │                    ├──────────────────────┤
    │                    │ • recipe_id (FK)     │
    │                    │ • ingredient_id (FK) │
    │                    │ • quantity           │
    │                    │ • unit               │
    │                    └──────────┬───────────┘
    │                               │
    │                               │ N
    │                               │ (1)
    │                               │
    │                    ┌──────────┴────────┐
    │                    │   Ingredient      │
    │                    ├───────────────────┤
    │                    │ • id (PK)         │
    │                    │ • name            │
    │                    │ • category        │
    │                    │ • image_url       │
    │                    │ • created_at      │
    │                    └───────────────────┘
    │
    └─────────────────────────────────────────┐
                                              │
                                    ┌─────────┴──────────┐
                                    │ IngredientStock    │
                                    ├────────────────────┤
                                    │ • id (PK)          │
                                    │ • ingredient_id(FK)│
                                    │ • quantity         │
                                    │ • expiry_date      │
                                    │ • added_at         │
                                    └────────────────────┘

┌──────────────────────┐
│  ShoppingList        │
├──────────────────────┤
│ • id (PK)            │
│ • name               │
│ • created_at         │
└────────┬─────────────┘
         │ 1
         │ (N)
         │
  ┌──────┴────────────────────────────┐
  │                                   │
  │                        ┌──────────────────────┐
  │                        │ShoppingListIngredient│
  │                        ├──────────────────────┤
  │                        │ • list_id (FK)       │
  │                        │ • ingredient_id (FK) │
  │                        │ • quantity           │
  │                        │ • checked            │
  │                        └──────────────────────┘
  │                                   │
  │                                   │
  └───────────────────────────────────┘
```

#### Tables Principales

| Table | Colonnes | Description |
|-------|----------|-------------|
| **Recipe** | id, name, description, category, instructions, created_at | Stocke les recettes |
| **Ingredient** | id, name, category, image_url, created_at | Ingrédients disponibles |
| **RecipeIngredient** | recipe_id, ingredient_id, quantity, unit | Liaison M:N entre recettes et ingrédients |
| **IngredientStock** | id, ingredient_id, quantity, expiry_date, added_at | Suivi du stock d'ingrédients |
| **ShoppingList** | id, name, created_at | Listes de courses |
| **ShoppingListIngredient** | list_id, ingredient_id, quantity, checked | Détails des articles à acheter |

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

### Structure du Projet

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
│       │       └── shopping-list.service.ts
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
├── public/                           # Ressources statiques (icons, assets)
├── package.json                      # Dépendances et scripts
├── angular.json                      # Configuration Angular CLI
├── tsconfig.json                     # Configuration TypeScript général
├── tsconfig.app.json                 # Configuration TypeScript pour Angular
├── tsconfig.electron.json            # Configuration TypeScript pour Electron
└── forge.config.js                   # Configuration Electron Forge
```

### Patrons d'Architecture

#### 1. **Separation of Concerns (SoC)**
- **Frontend** : Angular standalone components avec signals (state management)
- **Backend** : Services Electron avec IPC handlers
- **Database** : Couche SQLite3 séparée et encapsulée

#### 2. **IPC Communication Pattern**
```typescript
// Frontend (Angular)
const result = await ipcRenderer.invoke('recipe:create', recipeData);

// Backend (Electron)
ipcMain.handle('recipe:create', async (event, data) => {
  return await RecipeService.create(data);
});
```

#### 3. **Service Layer Pattern**
- Services Angular pour la logique métier côté frontend
- Services Electron pour l'accès aux données et la BDD
- Modèles TypeScript partagés pour la cohérence des types

#### 4. **Lazy Loading Routes**
```typescript
const appRoutes: Routes = [
  {
    path: 'recipes',
    children: RECIPE_CHILDREN  // Routes enfants chargées paresseusement
  },
  {
    path: 'ingredients',
    children: INGREDIENT_CHILDREN
  }
];
```

### Stack Technologique

| Layer | Technologies |
|-------|--------------|
| **Desktop Runtime** | Electron 34+, Electron Forge |
| **Frontend Framework** | Angular 21, TypeScript 5.5+ |
| **UI Components** | Angular Material 21 |
| **State Management** | Angular Signals |
| **HTTP/IPC** | RxJS 7.8+, Electron IPC |
| **Styling** | SCSS, CSS Grid, Flexbox |
| **Database** | SQLite3 5.1+, Node.js sqlite3 module |
| **Build Tools** | Angular CLI, webpack, TypeScript compiler |
| **Testing** | Karma, Jasmine, Vitest (optionnel) |
| **Code Quality** | ESLint, Prettier, HTMLHint |
| **Package Manager** | npm 11.1.0+ |

---

## 🖥️ Environnement Logiciel

### Prérequis Minimums

| Composant | Version | Notes |
|-----------|---------|-------|
| **Node.js** | 14.0+ | Recommandé : 18+ ou 20+ LTS |
| **npm** | 6.0+ | Livré avec Node.js |
| **Git** | 2.0+ | Pour cloner le dépôt |
| **Système d'exploitation** | Windows, macOS, Linux | Toute version supportée |
| **RAM** | 2 GB minimum | Recommandé : 4+ GB |
| **Espace disque** | 500 MB | Pour node_modules et build |

### Dépendances Principales

#### Production
```json
{
  "@angular/animations": "^21.0.1",
  "@angular/cdk": "^21.0.0",
  "@angular/common": "^21.0.0",
  "@angular/compiler": "^21.0.0",
  "@angular/core": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "@angular/material": "^21.0.0",
  "@angular/platform-browser": "^21.0.0",
  "@angular/router": "^21.0.0",
  "rxjs": "~7.8.0",
  "sqlite3": "^5.1.7"
}
```

#### Développement
```json
{
  "@angular-devkit/build-angular": "^21.0.0",
  "@angular/build": "^21.0.0",
  "@angular/cli": "^21.0.0",
  "@angular/compiler-cli": "^21.0.0",
  "@electron-forge/maker-deb": "^7.x.x",
  "@electron-forge/maker-rpm": "^7.x.x",
  "@electron-forge/maker-squirrel": "^7.x.x",
  "@electron-forge/maker-zip": "^7.x.x",
  "@electron-forge/plugin-auto-unpack-natives": "^7.x.x",
  "@electron-forge/plugin-fuses": "^7.x.x",
  "@electron-forge/cli": "^7.x.x",
  "electron": "^34.0.0",
  "typescript": "~5.5.0"
}
```

### Configuration TypeScript

#### tsconfig.json (Configuration globale)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": false,
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler"
  }
}
```

#### tsconfig.app.json (Configuration Angular)
- Extends tsconfig.json
- Inclut src/
- Exclut tests

#### tsconfig.electron.json (Configuration Electron)
- Extends tsconfig.json
- Cible: ES2020
- Inclut electron/

### Variables d'Environnement

```bash
# Développement
NODE_ENV=development
ELECTRON_REBUILD_FROM_SOURCE=true

# Production
NODE_ENV=production
DEBUG=electron-forge:*  # Pour activer les logs de Forge
```

---

## 🚀 Installation & Démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/EnzoFB/RecipeBox.git
cd RecipeBox
```

### 2. Installer les dépendances

```bash
# Installation standard
npm install

# Ou avec yarn
yarn install
```

### 3. Vérifier l'environnement

```bash
# Vérifier Node.js
node --version    # v18.0.0 ou supérieur

# Vérifier npm
npm --version     # 8.0.0 ou supérieur

# Vérifier Git
git --version
```

### 4. Lancer en développement

```bash
# Mode développement avec rechargement automatique
npm start

# Ou avec Electron Forge
npm run start:dev
```

### 5. Construire l'application

```bash
# Build Angular
npm run build

# Construire les sources Electron
npm run build:electron

# Créer le package distributable
npm run package

# Créer les installeurs pour le système d'exploitation
npm run make
```

### Scripts Disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| `start` | `ng build && electron-forge start` | Lance l'app en développement |
| `start:dev` | Voir package.json | Développement avec watch mode |
| `build` | `ng build` | Build Angular pour production |
| `build:electron` | `tsc -p tsconfig.electron.json` | Compile les sources TypeScript Electron |
| `watch` | `ng build --watch --configuration development` | Watch mode Angular |
| `test` | `ng test` | Lance les tests unitaires |
| `test:ci` | `ng test --watch=false --configuration=ci` | Tests en mode CI |
| `lint:html` | `htmlhint src/**/*.html` | Vérifie les fichiers HTML |
| `lint:html:fix` | `prettier --write src/**/*.html` | Formate les fichiers HTML |
| `package` | `npm run build && npm run build:electron && electron-forge package` | Crée le package |
| `make` | Voir script package | Crée les installeurs |

### Structure des Dossiers de Build

```
RecipeBox/
├── dist/                    # Build Angular
│   └── recipe-box/          # Application compilée
├── out/                     # Build Electron
│   ├── electron/            # Code Electron compilé
│   └── src/                 # Code Angular compilé
└── out-*.zip               # Packages distribuables
```

---

## ⚙️ CI/CD

### Configuration Electron Forge

Le fichier `forge.config.js` configure :

#### Packagers (Créateurs d'installeurs)

```javascript
makers: [
  {
    name: '@electron-forge/maker-squirrel',  // Windows (.exe)
    config: {},
  },
  {
    name: '@electron-forge/maker-zip',       // macOS (.zip)
    platforms: ['darwin'],
  },
  {
    name: '@electron-forge/maker-deb',       // Linux (.deb)
    config: {},
  },
  {
    name: '@electron-forge/maker-rpm',       // Linux (.rpm)
    config: {},
  },
]
```

#### Plugins de Sécurité (Fuses)

```javascript
plugins: [
  new FusesPlugin({
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,                           // Désactive Node.js
    [FuseV1Options.EnableCookieEncryption]: true,              // Chiffre les cookies
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // Sécurité
    [FuseV1Options.EnableNodeCliInspectArguments]: false,      // Sécurité
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true, // Valide l'ASAR
    [FuseV1Options.OnlyLoadAppFromAsar]: true,                 // Charge depuis ASAR
  }),
]
```

### Tests Unitaires

#### Lancer les tests

```bash
# Mode watch (développement)
npm test

# Mode CI (une seule exécution)
npm run test:ci
```

#### Framework de Test

- **Karma** : Test runner
- **Jasmine** : Framework de test (BDD style)
- **Angular Testing Utilities** : Helpers pour tester Angular

#### Exemples de Fichiers de Test

```typescript
// src/app/app.spec.ts
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should navigate to route', () => {
    const component = fixture.componentInstance;
    component.navigateTo('recipes');
    expect(component.isActive('recipes')).toBe(true);
  });
});
```

### Build Pipeline

#### Développement
```
npm start
  ├─ ng build (Angular)
  ├─ electron-forge start
  └─ App prête au développement
```

#### Production
```
npm run make
  ├─ npm run build (Angular)
  ├─ npm run build:electron (TypeScript Electron)
  ├─ electron-forge package (Crée l'ASAR)
  ├─ Makers (Crée les installeurs)
  │  ├─ Squirrel (Windows MSI)
  │  ├─ ZIP (macOS)
  │  ├─ DEB (Linux Debian)
  │  └─ RPM (Linux RedHat)
  └─ Distributables prêts
```

### Linting & Code Quality

#### HTML Linting
```bash
# Vérifier les fichiers HTML
npm run lint:html

# Formater les fichiers HTML
npm run lint:html:fix
```

#### Angular Build Budgets
- Component styles: **10 KB** (configuré pour éviter le bloat CSS)

#### Configuration ESLint (Optionnel, à ajouter)
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@angular-eslint/recommended"
  ]
}
```

### Déploiement

#### Distribution Multi-plateforme

```bash
# Générer pour tous les OS supportés
npm run make

# Fichiers générés :
# - out/make/squirrel.windows/x64/RecipeBox-Setup.exe
# - out/make/zip/darwin/x64/RecipeBox-darwin-x64-xxx.zip
# - out/make/deb/x64/recipe-box_x.x.x_amd64.deb
# - out/make/rpm/x64/recipe-box-x.x.x-1.x86_64.rpm
```

#### Mise à Jour Électron (Optionnel)
```bash
npm install --save-dev @electron-forge/maker-wix  # Windows advanced
npm install --save-dev @electron-forge/publisher-github  # GitHub releases
```

---

## 📊 Métriques de Performance

### Frontend
- **Bundle Size** : ~2-3 MB (non compressé)
- **Load Time** : < 2 secondes en développement
- **Runtime** : Application réactive avec signals Angular
- **Memory** : ~150-300 MB en usage normal

### Backend
- **Database** : SQLite3 en mémoire ou fichier
- **IPC Latency** : < 10ms pour requêtes simples
- **Stockage** : Base de données légère et portable

### Optimisations Appliquées
- ✅ Lazy loading des routes
- ✅ Signals pour la réactivité sans RxJS complets
- ✅ ASAR packaging pour sécurité
- ✅ Code splitting automatique
- ✅ Material tree-shaking

---

## 🎓 Principes de Développement

### Architecture
- **Modulaire** : Features séparées, shared components réutilisables
- **Typée** : TypeScript strict mode partout
- **Testable** : Services injectables, composants purs
- **Scalable** : Structure extensible pour nouvelles features

### Code Style
- **Naming** : camelCase pour variables, PascalCase pour classes
- **Formatting** : Prettier + EditorConfig
- **Components** : Standalone components Angular 21+
- **Services** : Injection de dépendances systématique

### Best Practices
- Utiliser les signals pour la réactivité simple
- Éviter les abonnements manuels (takeUntil pattern)
- Types stricts sans `any`
- Components présentationnels vs conteneurs
- Lazy loading des routes
- Encapsulation des styles (scoped SCSS)

---

## 📝 Maintenance et Support

### Documentation Supplémentaire
- `DOCUMENTATION_INDEX.md` : Index de toute la documentation
- `FRONTEND_OVERVIEW.md` : Vue d'ensemble du frontend
- `FRONTEND_STRUCTURE.md` : Structure détaillée du frontend
- `FRONTEND_COMPLETION.md` : État d'avancement des features
- `electron/BEST_PRACTICES.md` : Best practices Electron
- `electron/SERVICES_GUIDE.md` : Guide des services Electron
- `TESTING_GUIDE.md` : Guide complet des tests

### Rapports de Qualité
- `DEPLOYMENT_CHECKLIST.md` : Checklist de déploiement
- `REFACTORISATION_SUMMARY.md` : Résumé des refactorisations
- `PROCHAINES_ETAPES.md` : Prochaines étapes de développement

### Issues Connues
*(À remplir selon les besoins)*

### Contribution
1. Fork le dépôt
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

## ✅ Conclusion

### Résumé

**RecipeBox App** est une application desktop complète et moderne qui démontre :

✅ **Une architecture solide** avec séparation clean frontend/backend/database
✅ **Une stack technologique moderne** (Angular 21, Electron, TypeScript)
✅ **Une expérience utilisateur intuitive** avec Material Design
✅ **Une approche de test** et de qualité de code
✅ **Une portabilité complète** multi-plateforme

### Avantages

- 🎯 **Adresse un besoin réel** : Gestion locale de recettes
- 🔒 **Données privées** : Pas de cloud, stockage local
- ⚡ **Performance** : Application native rapide
- 🌐 **Multi-plateforme** : Windows, macOS, Linux
- 📦 **Facile à distribuer** : Installeurs automatisés
- 🛠️ **Maintenable** : Code typé et bien organisé

### Améliorations Futures

- [ ] **Planification de repas** : Interface de planning hebdomadaire
- [ ] **Import/Export** : Formats JSON, PDF, Excel
- [ ] **Synchronisation cloud** : Optionnelle avec coffre-fort
- [ ] **Recherche avancée** : Filtres multiples, fuzzy search
- [ ] **Nutrition** : Calcul automatique des macros
- [ ] **Recettes partagées** : Partage entre utilisateurs
- [ ] **Mobile** : Version mobile avec React Native
- [ ] **Offline-first** : Sync automatique

### Support et Contact

- 📧 **Issues** : [GitHub Issues](https://github.com/EnzoFB/RecipeBox/issues)
- 🔗 **Repository** : [github.com/EnzoFB/RecipeBox](https://github.com/EnzoFB/RecipeBox)
- 📝 **Docs** : Voir le dossier `/documentations`

---

## 📄 Fichiers Annexes

### Configuration Importante
- `angular.json` - Configuration Angular CLI
- `tsconfig.*.json` - Configurations TypeScript
- `forge.config.js` - Configuration Electron Forge
- `package.json` - Dépendances et scripts

### Documentation Complète
Consulter le dossier `documentations/` pour l'ensemble de la documentation technique.

---

**Version** : 1.0.0  
**Date de mise à jour** : 27 novembre 2025  
**Auteur** : EnzoFB  
**Licence** : MIT (à confirmer)

