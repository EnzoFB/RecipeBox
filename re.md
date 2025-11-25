# 🍽️ Application de Gestion de Recettes & Stocks  
**Tech Stack : Angular · Electron · SQLite3 · GitHub · CI (HTML Linter)**

---

## 📖 Description du projet

Cette application vise à **gérer des recettes, des ingrédients et des stocks alimentaires** dans un foyer.  
Elle permet :

- de suivre les ingrédients disponibles ;
- de proposer automatiquement des recettes réalisables selon le stock ;
- de générer des menus pour la semaine ;
- de créer des listes de courses basées sur le menu ou les recettes choisies ;
- de réduire le gaspillage grâce à des alertes de péremption.

Le tout fonctionne en **application desktop multiplateforme**, via **Angular** (front-end) et **Electron** (packaging desktop), avec une base locale **SQLite3**.

---

## 🧰 Technologies utilisées

### **👨‍💻 Frontend**
- Angular 17+
- TypeScript  
- HTML / SCSS

### **🖥️ Desktop**
- Electron 28+  
- Intégration Angular–Electron

### **🗂️ Base de données**
- SQLite3 (via `sqlite3` ou `better-sqlite3`)
- ORM optionnel (Drizzle / Prisma / TypeORM)

### **🛠️ DevOps**
- GitHub pour le versioning
- GitHub Actions pour la CI
  - Exécution d’un **HTML Linter** automatique

---

## 🚀 Démarrage du projet

### 1. **Cloner le repository**
```bash
git clone https://github.com/ton-compte/ton-projet.git
cd ton-projet
2. Installer les dépendances
bash
Copier le code
npm install
3. Démarrer Angular en mode dev
bash
Copier le code
npm run start
4. Lancer Electron avec Angular
(Pour démarrer l'application desktop avec hot-reload)

bash
Copier le code
npm run electron:start
5. Build de l'application desktop
bash
Copier le code
npm run electron:build
📚 Use cases
🧺 Gestion du stock
Ajouter / éditer / consommer un ingrédient

Alerte de péremption

Tri par catégorie / date / emplacement

Scan code-barres (optionnel)

🍳 Gestion des recettes
Recherche par ingrédients disponibles

Ajustement des portions

Substitutions automatiques d’ingrédients

Filtre par temps, difficulté, régime alimentaire

📅 Planification & menus
Génération automatique de menu hebdomadaire

Vérification du stock pour un menu

Mise en avant du repas du jour

🛒 Liste de courses
Génération automatique depuis un menu

Synchronisation avec le stock

Vue “checklist” pour les courses

🙌 Collaboration (optionnel)
Multi-utilisateurs via un foyer partagé

Synchronisation via cloud (option)

🧱 Modèle de données (MDD)
1. Product
Champ	Type	Description
id	integer	Identifiant
name	string	Nom du produit
category	string	Catégorie (légume, céréale…)
default_unit	string	Unité par défaut
barcode	string	Optionnel
nutritional_info	JSON	Infos nutritionnelles

2. PantryItem
(Ingrédients réellement présents dans le stock)

Champ	Type	Description
id	integer	Identifiant
product_id	FK(Product)	Type d’ingrédient
quantity	float	Quantité dispo
unit	string	Unité
expiration_date	date	Optionnel
location	string	Placard / frigo / congélateur

3. Recipe
Champ	Type
id	integer
title	string
description	string
prep_time_minutes	number
cook_time_minutes	number
difficulty	number (1–5)
servings	number
tags	string[]

4. RecipeIngredient
Champ	Type
id	integer
recipe_id	FK(Recipe)
product_id	FK(Product)
quantity	number
unit	string
optional	boolean

5. Menu
Champ	Type
id	integer
start_date	date
end_date	date
name	string

6. MenuItem
Champ	Type
id	integer
menu_id	FK(Menu)
date	date
meal_type	enum
recipe_id	FK(Recipe)
servings	number

7. ShoppingList
Champ	Type
id	integer
name	string
source	string
created_at	date

8. ShoppingListItem
Champ	Type
id	integer
shopping_list_id	FK
product_id	FK
required_quantity	number
fulfilled_quantity	number
unit	string
is_checked	boolean

🏗️ Architecture du projet
graphql
Copier le code
project/
│
├── angular/                     # Code Angular (frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/         # Modules fonctionnels
│   │   │   ├── components/      # Composants UI
│   │   │   ├── services/        # Services (API, DB, stock, recettes…)
│   │   │   ├── pages/           # Pages principales
│   │   │   └── models/          # Interfaces & modèles TS
│   │   └── assets/
│   └── angular.json
│
├── electron/                    # Code Electron
│   ├── main.js                  # Processus principal
│   ├── preload.js               # Bridge sécurisé
│   └── electron-builder.yml     # Config build desktop
│
├── database/
│   ├── schema.sql               # Schéma de la base SQLite
│   ├── migrations/              # Migration SQL
│   └── seed.sql                 # Données initiales
│
├── scripts/
│   └── lint-html.sh             # Linter HTML (utilisé par la CI)
│
├── .github/
│   └── workflows/
│       └── ci.yml               # CI GitHub Actions
│
├── package.json
└── README.md
🤖 CI GitHub (HTML Linter)
La CI permet de garantir la qualité du code HTML Angular.

Exemple de workflow ci.yml
yaml
Copier le code
name: CI

on:
  push:
  pull_request:

jobs:
  lint-html:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Run HTML Linter
        run: ./scripts/lint-html.sh
📌 Roadmap
 Intégration du scan de code-barres

 Algorithme de génération automatique de menus

 Alertes de péremption via notification système

 Mode multi-utilisateurs

 Synchronisation cloud (optionnelle)

📜 Licence
MIT (modifiable selon besoins)