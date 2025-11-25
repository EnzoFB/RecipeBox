# RecipeBox App 📋

## 🎯 Contexte

De nombreuses personnes souhaitent organiser leurs recettes de cuisine, planifier leurs repas ou gérer leurs courses, mais les solutions existantes sont souvent en ligne, nécessitent une connexion Internet ou ne permettent pas une gestion locale et personnalisée des données.

RecipeBox App répond à ce besoin en proposant une application desktop locale, simple, moderne et efficace, permettant à chaque utilisateur de gérer recettes, ingrédients, listes de courses et éventuellement son planning de repas.
Grâce à Electron, Angular et SQLite3, l'application fonctionne sur toutes les plateformes (Windows, Mac, Linux) avec une base de données directement embarquée et une interface utilisateur moderne et réactive.

## 📝 Description du projet

RecipeBox App est une application desktop construite avec Electron Forge et SQLite3, permettant de :

- Gérer ses recettes (création, édition, suppression, consultation).
- Gérer ses ingrédients (nom, catégorie, propriétés, nutriments…).
- Rechercher des recettes par nom, catégorie ou ingrédients.
- (Optionnel) Planifier ses repas hebdomadaires.
- (Optionnel) Générer automatiquement une liste de courses.

L’objectif principal est de proposer une interface intuitive, rapide et organisée, adaptée à un usage personnel quotidien.

## 📚 Use Cases (Cas d’utilisation)
### UC1 — Gérer les recettes

Acteur : Utilisateur
Description : L’utilisateur peut créer, modifier, supprimer et visualiser des recettes.
Scénario :
- Il clique sur “Ajouter une recette”.
- Il saisit le nom, la description, les ingrédients, les étapes.
- Il enregistre la recette.
- La recette apparaît dans la liste.

### UC2 — Gérer les ingrédients

Acteur : Utilisateur
Description : L’utilisateur gère la liste des ingrédients disponibles.
Scénario :
- Il ouvre le module Ingrédients.
- Il ajoute/modifie/supprime un ingrédient.
- Il peut organiser les ingrédients par catégorie.

### UC3 — Rechercher une recette

Acteur : Utilisateur
Description : L’utilisateur peut rechercher une recette par nom, catégorie ou ingredient.
Scénario :
- Il tape un mot-clé dans la barre de recherche.
- Les recettes correspondantes apparaissent.

### UC4 — (Optionnel) Planifier ses repas

Acteur : Utilisateur
Description : L’utilisateur planifie ses repas sur une semaine.
Scénario :
- Il ouvre le module “Repas de la semaine”.
- Il ajoute des recettes aux jours souhaités.

### UC5 — (Optionnel) Générer une liste de courses

Acteur : Utilisateur
Description : Création automatique d’une liste de courses en fonction des recettes sélectionnées.
Scénario :

- Il sélectionne plusieurs recettes.
- Il clique sur “Générer la liste de courses”.
- La liste fusionnée des ingrédients s’affiche.

## 🛠️ Stack Technologique

- **Desktop Framework** : [Electron](https://www.electronjs.org/) - Créer des applications desktop multi-plateforme
- **Build Tool** : [Electron Forge](https://www.electronforge.io/) - Workflow moderne pour Electron
- **Frontend Framework** : [Angular](https://angular.dev/) - Framework TypeScript pour une interface utilisateur moderne et réactive (v21)
- **Frontend Build** : [Angular CLI](https://angular.io/cli) - Outils de compilation et développement
- **Database** : [SQLite3](https://www.sqlite.org/) - Base de données embarquée fiable et performante
- **Langage** : [TypeScript](https://www.typescriptlang.org/) - JavaScript typé pour une meilleure expérience développeur
- **Styling** : [SCSS](https://sass-lang.com/) - Préprocesseur CSS pour des styles modulaires
- **Runtime** : Node.js
- **Testing** : [Vitest](https://vitest.dev/) - Framework de test unitaire moderne

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Git

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/EnzoFB/RecipeBoxApp.git
cd RecipeBoxApp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer l'application en développement

```bash
npm start
```

## 📦 Scripts disponibles

```bash
# Lancer l'application en mode développement
npm start

# Construire l'application Angular
npm run build

# Lancer l'application en mode watch (recompilation automatique)
npm run watch

# Exécuter les tests unitaires
npm test

# Construire l'application packagée
npm run package

# Générer les installeurs pour différentes plateformes
npm run make
```

## 📁 Structure du projet

```
RecipeBox/
├── src/
│   ├── index.html              # Page HTML principale
│   ├── main.ts                 # Point d'entrée Angular (bootstrap)
│   ├── styles.scss             # Styles globaux
│   ├── app/                    # Module principal Angular
│   │   ├── app.ts              # Composant root
│   │   ├── app.html            # Template root
│   │   ├── app.scss            # Styles du composant root
│   │   ├── core/               # Services et modèles core
│   │   │   ├── models/         # Interfaces et types de données
│   │   │   └── services/       # Services (recettes, ingrédients, BDD)
│   │   └── features/           # Modules métier
│   │       ├── recipes/        # Module de gestion des recettes
│   │       └── ingredients/    # Module de gestion des ingrédients
│   └── public/                 # Ressources statiques
├── electron/                   # Code du processus principal Electron
│   ├── main.ts                 # Point d'entrée Electron
│   ├── preload.ts              # Préchargement pour sécurité IPC
│   └── db.ts                   # Gestion de la base de données SQLite3
├── angular.json                # Configuration Angular CLI
├── forge.config.js             # Configuration Electron Forge
├── tsconfig.json               # Configuration TypeScript globale
├── tsconfig.app.json           # Configuration TypeScript pour l'app
├── tsconfig.electron.json      # Configuration TypeScript pour Electron
├── package.json                # Dépendances et scripts du projet
└── README.md                   # Ce fichier
```

## 🏗️ Architecture

### Architecture Electron + Angular

L'application suit une architecture hybride combinant Electron et Angular :

- **Main Process (Electron)** : Gère le cycle de vie de l'application, la création des fenêtres et les accès à la base de données SQLite3
- **Renderer Process (Angular)** : Affiche l'interface utilisateur moderne et réactive avec Angular 21

### Flux de données

1. **Interface Angular** → Requêtes IPC vers le Main Process
2. **Main Process** → Requêtes SQL à la base de données SQLite3
3. **SQLite3** → Retour des données
4. **Main Process** → Réponse IPC vers Angular
5. **Angular** → Mise à jour de l'interface utilisateur

### Base de données

Les données sont persistées localement avec SQLite3, ce qui offre :
- Zéro infrastructure serveur requise
- Données sauvegardées localement sur le disque de l'utilisateur
- Accès rapide et fiable aux données
- Portabilité des données avec l'application

## 🔧 Configuration

### Configurations importantes

- `forge.config.js` : Configuration générale de Electron Forge
- `angular.json` : Configuration Angular CLI et build options
- `tsconfig.json` : Options de compilation TypeScript globale
- `tsconfig.app.json` : Configuration TypeScript pour l'application Angular
- `tsconfig.electron.json` : Configuration TypeScript pour le processus Electron

### Styles

Le projet utilise SCSS pour les styles. Chaque composant Angular peut avoir son propre fichier SCSS qui sera scopé au composant.

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Nettoyer et réinstaller les dépendances
rm -r node_modules package-lock.json
npm install
npm start
```

### Erreurs de compilation TypeScript

```bash
# Vérifier la configuration TypeScript
npx tsc --noEmit
```

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

## 📚 Ressources utiles

- [Documentation Electron](https://www.electronjs.org/docs)
- [Guide Electron Forge](https://www.electronforge.io/guides)
- [Documentation Angular](https://angular.dev/docs)
- [Guide Angular CLI](https://angular.io/cli)
- [Documentation SQLite3 pour Node.js](https://github.com/mapbox/node-sqlite3/wiki)
- [Guide TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation Vitest](https://vitest.dev/guide/)