# 🎤 Présentation RecipeBox - Cours Electron (10 minutes)

---

## 📋 Plan de Présentation

### **1. Introduction (1 minute)**

#### Slide 1 : Titre
- **RecipeBox** : Application desktop de gestion de recettes
- Technologies : **Electron + Angular + SQLite**
- Étudiant : Enzo Ferreira-Bastos

#### Slide 2 : Problématique
> "Comment créer une application desktop **multi-plateforme** avec des technologies web ?"

**Besoins identifiés :**
- ❌ Applications web nécessitent Internet
- ❌ Données stockées sur des serveurs tiers
- ✅ Solution : Application **locale** et **privée**

---

### **2. Pourquoi Electron ? (1,5 minutes)**

#### Avantages clés d'Electron

| Avantage | Explication |
|----------|-------------|
| 🌐 **Multi-plateforme** | Un seul code → Windows, macOS, Linux |
| 🎨 **Technologies Web** | HTML/CSS/JavaScript (Angular) |
| 🔧 **Accès système** | Node.js → fichiers, base de données |
| 📦 **Écosystème npm** | Réutilisation de librairies existantes |
| ⚡ **Performances** | Chromium + V8 engine |

#### Exemples d'apps célèbres
- **VS Code** (Microsoft)
- **Discord**
- **Slack**
- **Notion**

---

### **3. Architecture RecipeBox (2 minutes)**

#### Diagramme de l'architecture

```
┌─────────────────────────────────────────┐
│   FRONTEND (Angular 21)                 │
│   ┌─────────────────────────────────┐   │
│   │ - Components (Recipes, Stock)   │   │
│   │ - Services (HTTP/IPC)           │   │
│   │ - Material Design UI            │   │
│   └──────────────┬──────────────────┘   │
│                  │ IPC Communication    │
├──────────────────┴──────────────────────┤
│   MAIN PROCESS (Electron)               │
│   ┌─────────────────────────────────┐   │
│   │ - IPC Handlers                  │   │
│   │ - Services Backend              │   │
│   │ - Database Connection           │   │
│   └──────────────┬──────────────────┘   │
│                  │ SQL Queries          │
├──────────────────┴──────────────────────┤
│   DATABASE (SQLite3)                    │
│   - Recettes, Ingrédients, Stock        │
└─────────────────────────────────────────┘
```

#### Composants clés Electron

**1. Main Process (`electron/main.ts`)**
- Crée la fenêtre de l'application
- Gère le cycle de vie
- Point d'entrée Electron

**2. Preload Script (`electron/preload.ts`)**
- **Sécurité** : Expose uniquement les API nécessaires
- Bridge entre frontend et backend
- Context Isolation activé

**3. IPC Communication (`electron/ipc/handlers.ts`)**
- Communication bidirectionnelle
- Pattern : `ipcMain.handle()` / `ipcRenderer.invoke()`

**4. Services Backend (`electron/services/*.ts`)**
- Accès à SQLite
- Logique métier côté serveur

---

### **4. Points Techniques Importants (2 minutes)**

#### A. Communication IPC (Inter-Process Communication)

**Frontend → Backend :**
```typescript
// Frontend (Angular)
async createRecipe(recipe: Recipe) {
  return await window.electronAPI.recipe.create(recipe);
}
```

**Sécurité avec Preload :**
```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  recipe: {
    create: (data) => ipcRenderer.invoke('recipe:create', data)
  }
});
```

**Backend :**
```typescript
// Electron IPC Handler
ipcMain.handle('recipe:create', async (event, data) => {
  return await RecipeService.create(data);
});
```

#### B. Base de Données Locale

**SQLite3 embarqué :**
- Fichier local : `~/.config/recipe-box/recipes.db`
- Pas de serveur à installer
- Requêtes SQL classiques

```typescript
// electron/db.ts
db.run(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

#### C. Packaging Multi-plateforme

**Electron Forge :**
```javascript
// forge.config.js
makers: [
  { name: '@electron-forge/maker-squirrel' },  // Windows
  { name: '@electron-forge/maker-zip' },       // macOS
  { name: '@electron-forge/maker-deb' },       // Linux Debian
  { name: '@electron-forge/maker-rpm' }        // Linux RedHat
]
```

**Commande de build :**
```bash
npm run make
# → Génère les installeurs pour chaque OS
```

---

### **5. Démonstration Live (3 minutes)**

> **Route de démonstration détaillée ci-dessous** ⬇️

---

### **6. Conclusion & Avantages (0,5 minute)**

#### Bilan de l'utilisation d'Electron

✅ **Avantages exploités :**
- Application desktop complète avec des technos web
- Multi-plateforme sans code spécifique
- Base de données locale (privacy)
- UI moderne avec Angular Material
- Packaging automatisé

⚠️ **Inconvénients assumés :**
- Taille de l'app (~150 MB avec Chromium)
- Consommation mémoire (~200 MB)
- Mais : acceptable pour une app desktop moderne

---

## 🎬 Route de Démonstration (3 minutes)

### **PRÉREQUIS AVANT LA DÉMO**
```bash
# S'assurer que l'app est lancée
cd RecipeBox
npm start

# Attendre que la fenêtre s'ouvre
```

---

### **Étape 1 : Vue d'ensemble (20 secondes)**

**Action :**
1. Montrer la **fenêtre de l'application** ouverte
2. Pointer la navigation :
   - 🍳 Recettes
   - 🥬 Ingrédients
   - 📦 Stock
   - 🛒 Liste de courses

**Script :**
> "Voici RecipeBox, une application Electron complète. On a 4 modules principaux accessibles via la navigation."

---

### **Étape 2 : Module Recettes - Liste (30 secondes)**

**Action :**
1. Cliquer sur **"Recettes"**
2. Montrer la liste des recettes existantes
3. Utiliser la **barre de recherche** pour filtrer
4. Montrer les **catégories** (Entrée, Plat principal, Dessert...)

**Script :**
> "Le module Recettes permet de gérer toutes mes recettes. Je peux les rechercher, les filtrer par catégorie, et voir leurs détails."

**Points techniques à mentionner :**
- 💾 Données chargées depuis SQLite via IPC
- 🔍 Recherche en temps réel (Angular signals)

---

### **Étape 3 : Créer une Recette (45 secondes)**

**Action :**
1. Cliquer sur **"Nouvelle recette"** (bouton +)
2. Remplir le formulaire :
   - Nom : "Pâtes Carbonara"
   - Catégorie : "Plat principal"
   - Description : "Recette italienne authentique"
3. **Section Ingrédients :**
   - Ajouter "Pâtes" (500g)
   - Ajouter "Lardons" (200g)
   - Ajouter "Parmesan" (100g)
4. **Section Étapes :**
   - Étape 1 : "Cuire les pâtes al dente"
   - Étape 2 : "Faire revenir les lardons"
   - Étape 3 : "Mélanger avec le parmesan"
5. **Drag & Drop :** Réordonner les étapes pour montrer la fonctionnalité
6. Cliquer sur **"Enregistrer"**

**Script :**
> "Je crée une nouvelle recette. Le formulaire utilise Angular Reactive Forms. J'ajoute des ingrédients avec leurs quantités, et je définis les étapes. Regardez : je peux réorganiser les étapes par drag & drop grâce à Angular CDK. Quand je sauvegarde, l'IPC envoie les données au Main Process qui les insère dans SQLite."

**Points techniques à mentionner :**
- 📝 Formulaire Angular réactif
- ↔️ Drag & Drop (Angular CDK)
- 💾 IPC : `recipe:create` → SQLite INSERT

---

### **Étape 4 : Afficher les Détails (20 secondes)**

**Action :**
1. Revenir à la liste des recettes
2. Cliquer sur la recette "Pâtes Carbonara" créée
3. Montrer :
   - Les ingrédients listés
   - Les étapes numérotées
   - L'image (si ajoutée)

**Script :**
> "Voici ma recette créée. Toutes les données sont stockées localement dans SQLite. Aucune connexion Internet nécessaire."

---

### **Étape 5 : Module Stock (30 secondes)**

**Action :**
1. Naviguer vers **"Stock"**
2. Montrer la liste des ingrédients en stock avec :
   - Quantités
   - Dates d'expiration
   - Catégories
3. **Filtrer** par catégorie (ex: "Viande")
4. Montrer les **alertes de fraîcheur** (ingrédients proches de l'expiration)

**Script :**
> "Le module Stock me permet de suivre mes ingrédients disponibles. Les données sont synchronisées avec la base SQLite. Je peux filtrer par catégorie et voir les alertes de fraîcheur."

**Points techniques à mentionner :**
- 🔄 Requêtes SQL avec JOINs
- 🎨 Angular Material cards
- 📊 Calcul des dates (JavaScript Date)

---

### **Étape 6 : DevTools Electron (25 secondes)**

**Action :**
1. Ouvrir les **DevTools** (F12 ou Menu → Affichage → DevTools)
2. Onglet **Console** :
   - Taper : `window.electronAPI`
   - Montrer les méthodes exposées (recipe, ingredient, stock)
3. Onglet **Network** :
   - Montrer qu'il n'y a **aucun appel HTTP** (tout en local)
4. Onglet **Application** → **IndexedDB/SQLite** (si visible)

**Script :**
> "Grâce aux DevTools Chromium intégrés, je peux déboguer mon app comme une app web classique. Regardez : `window.electronAPI` expose uniquement les méthodes sécurisées via le preload script. Aucun appel réseau : tout est local."

**Points techniques à mentionner :**
- 🔍 DevTools Chromium intégrés
- 🔒 Context Isolation (preload.ts)
- 🚫 Pas de requêtes HTTP

---

### **Étape 7 : Code Source (30 secondes - BONUS si temps)**

**Action :**
1. Ouvrir **VS Code** avec le projet
2. Montrer rapidement :
   - `electron/main.ts` : Création de la fenêtre
   - `electron/ipc/handlers.ts` : IPC handlers
   - `electron/preload.ts` : Exposition sécurisée
   - `src/app/core/services/recipe.service.ts` : Appel IPC depuis Angular

**Script :**
> "Voici le code source. Le main.ts crée la fenêtre Electron, le preload.ts expose les API de manière sécurisée avec contextBridge, et les handlers.ts gèrent les appels IPC. Du côté Angular, les services appellent window.electronAPI."

**Points techniques à mentionner :**
- 📁 Structure modulaire
- 🔗 IPC pattern clair
- 🛡️ Sécurité avec preload

---

## 🎯 Script Complet Condensé (à lire pendant la démo)

### **Intro (pendant le lancement)** :
> "RecipeBox est une application desktop créée avec Electron qui permet de gérer ses recettes localement. J'utilise Angular pour le frontend, SQLite pour les données, et Electron pour créer l'app multi-plateforme."

### **Pendant la navigation** :
> "L'application communique via IPC : le renderer process (Angular) envoie des événements au main process (Electron) qui interroge SQLite. Tout est local, aucune connexion Internet nécessaire."

### **Pendant la création de recette** :
> "Le formulaire Angular réactif valide les données, puis envoie un événement IPC `recipe:create`. Le main process insère dans SQLite et retourne le résultat. Le drag & drop des étapes utilise Angular CDK."

### **Pendant l'affichage du stock** :
> "Les données sont chargées avec des requêtes SQL JOIN pour lier ingrédients et stock. Angular Material fournit l'UI moderne avec les cards et les filtres."

### **DevTools** :
> "Electron intègre Chromium, donc j'ai accès aux DevTools classiques pour déboguer. Le preload script expose uniquement les API sécurisées via contextBridge."

### **Conclusion** :
> "Electron permet de créer des apps desktop complètes avec des technos web, tout en ayant accès au système (fichiers, base de données). Le packaging est automatisé pour Windows, macOS et Linux. C'est une solution idéale pour des apps qui nécessitent un accès local ou qui doivent fonctionner offline."

---

## 📊 Slides Recommandées (Support Visuel)

### Slide 1 : Titre
- Titre : **RecipeBox - Application Electron**
- Sous-titre : Gestion de recettes desktop avec Angular + SQLite
- Technologies : Electron 34, Angular 21, TypeScript, SQLite3

### Slide 2 : Problématique
- Besoin d'une app desktop moderne
- Multi-plateforme sans code natif
- Stockage local et privé

### Slide 3 : Pourquoi Electron ?
- Tableau comparatif : Web app vs Desktop app vs Electron
- Logos : VS Code, Discord, Slack, Notion

### Slide 4 : Architecture
- Diagramme : Frontend ↔️ IPC ↔️ Main Process ↔️ SQLite
- 3 processus principaux : Main, Renderer, Preload

### Slide 5 : Communication IPC
- Code snippet : Frontend → IPC → Backend
- Schéma de sécurité avec contextBridge

### Slide 6 : Packaging Multi-plateforme
- Liste des makers Electron Forge
- Commande `npm run make`
- Logos : Windows, macOS, Linux

### Slide 7 : Démo
- Capture d'écran de l'app
- Texte : "Live Demo" 🎬

### Slide 8 : Conclusion
- Avantages d'Electron
- Cas d'usage adaptés
- Limites et alternatives (Tauri, Flutter)

---

## ⏱️ Timing Détaillé

| Section | Temps | Cumul |
|---------|-------|-------|
| Introduction + Problématique | 1 min | 1 min |
| Pourquoi Electron ? | 1,5 min | 2,5 min |
| Architecture RecipeBox | 2 min | 4,5 min |
| Points Techniques | 2 min | 6,5 min |
| **Démonstration Live** | 3 min | 9,5 min |
| Conclusion | 0,5 min | 10 min |

---

## 💡 Conseils pour la Présentation

### Avant la Démo
- ✅ **Lancer l'app AVANT** de commencer
- ✅ Préparer une recette test à créer
- ✅ S'assurer que la BDD contient quelques données
- ✅ Fermer les apps inutiles (notifications)
- ✅ Mettre le téléphone en silencieux

### Pendant la Démo
- 🎤 Parler clairement et lentement
- 👁️ Regarder l'audience, pas l'écran
- ⏸️ Faire des pauses pour laisser le temps de comprendre
- 🔊 Mentionner les points techniques au bon moment
- 📝 Avoir un "cheat sheet" avec les commandes importantes

### En Cas de Problème
- 🔄 Si l'app plante : Relancer rapidement
- ⚠️ Si erreur SQL : Expliquer que c'est normal en dev
- 🎥 Avoir une **vidéo de backup** (screen recording)

### Points à Insister
- 🔒 **Sécurité** : Context Isolation, preload script
- 🌐 **Multi-plateforme** : Un code, plusieurs OS
- 💾 **Local-first** : Aucune dépendance Internet
- ⚡ **Performance** : Chromium + V8

---

## 🎓 Questions Probables et Réponses

### Q1 : "Pourquoi Electron et pas une app web ?"
**R :** Electron permet un accès système complet (fichiers, base de données locale), fonctionne offline, et offre une meilleure expérience desktop (notifications, intégration OS).

### Q2 : "Electron n'est-il pas trop lourd ?"
**R :** C'est vrai que l'app fait ~150 MB avec Chromium embarqué, mais c'est un compromis acceptable pour la productivité de développement et l'expérience utilisateur moderne.

### Q3 : "Comment gérez-vous la sécurité ?"
**R :** J'utilise Context Isolation avec un preload script qui expose uniquement les API nécessaires via contextBridge. Le nodeIntegration est désactivé dans le renderer process.

### Q4 : "Peut-on faire de l'auto-update ?"
**R :** Oui, avec electron-updater. On peut configurer des mises à jour automatiques depuis GitHub Releases ou un serveur custom.

### Q5 : "Quelle est la différence avec Tauri ?"
**R :** Tauri utilise le WebView natif de l'OS (plus léger), mais Electron offre une meilleure compatibilité cross-platform et un écosystème plus mature.

### Q6 : "Comment tester l'app ?"
**R :** On utilise Karma/Jasmine pour Angular, et Spectron (ou Playwright) pour tester l'app Electron complète avec des tests E2E.

### Q7 : "Comment distribuer l'app ?"
**R :** Via Electron Forge : `npm run make` génère les installeurs (.exe, .dmg, .deb, .rpm). On peut publier sur GitHub Releases, le Microsoft Store, ou l'App Store Mac.

---

## 📚 Ressources Complémentaires

### Documentation Officielle
- [Electron Docs](https://www.electronjs.org/docs)
- [Angular Docs](https://angular.dev)
- [Electron Forge](https://www.electronforge.io)

### Tutoriels
- [Electron + Angular Tutorial](https://github.com/maximegris/angular-electron)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)

### Code Source du Projet
- Repository GitHub : [github.com/EnzoFB/RecipeBox](https://github.com/EnzoFB/RecipeBox)
- Documentation : Voir `README_COMPLET.md`

---

## ✅ Checklist Avant Présentation

### Jour J - 1 heure avant
- [ ] Tester l'app une dernière fois
- [ ] Vérifier que toutes les features fonctionnent
- [ ] Préparer la recette "Pâtes Carbonara" à créer
- [ ] Ajouter quelques recettes/ingrédients de test
- [ ] Préparer les slides (PDF ou PowerPoint)
- [ ] Charger le laptop (100%)
- [ ] Tester la projection vidéo

### Jour J - 10 minutes avant
- [ ] Lancer l'app (`npm start`)
- [ ] Ouvrir VS Code avec le projet
- [ ] Fermer les apps inutiles
- [ ] Mettre le téléphone en silencieux
- [ ] Préparer un verre d'eau
- [ ] Respirer profondément 😊

---

**Bonne présentation ! 🚀**

**Durée totale** : 10 minutes  
**Niveau** : Intermédiaire  
**Public cible** : Cours Electron / Développement Desktop
