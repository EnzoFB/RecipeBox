# 📋 Checklist - Mise en Production

## 🔍 Avant Déploiement

### Code Quality

- [ ] `npm run build:electron` - Aucune erreur TypeScript
- [ ] `npm test` - Tous les tests passent
- [ ] Vérifier pas de `console.log` (sauf logger)
- [ ] Vérifier pas de `any` types
- [ ] Logs pas trop verbeux en production
- [ ] Pas de secrets en hardcode

### Security

- [ ] ✅ Context isolation: true
- [ ] ✅ Node integration: false
- [ ] ✅ Preload path correct
- [ ] Validation inputs côté backend
- [ ] Parameterized queries (déjà ✅)
- [ ] Rate limiting considéré

### Database

- [ ] Backup avant migration
- [ ] Migrations testées
- [ ] DB path correct (userData)
- [ ] Permissions fichier corrects
- [ ] Transactions pour opérations critiques

### Performance

- [ ] Pas de N+1 queries
- [ ] Indexing sur colonnes fréquemment cherchées
- [ ] Pagination pour grandes listes
- [ ] Caching considéré

### Testing

- [ ] Services testés unitairement
- [ ] IPC handlers testés
- [ ] DB migrations testées
- [ ] Frontend intégration testée

## 🏗️ Structure Vérifiée

- [ ] electron/config.ts existe
- [ ] electron/logger.ts existe
- [ ] electron/types.ts existe
- [ ] electron/services/ complet
- [ ] electron/ipc/handlers.ts existe
- [ ] main.ts simplifié (~70 lignes)
- [ ] db.ts utilise logger
- [ ] preload.ts expose API correctement

## 📦 Compilation & Build

```bash
# Vérifier
npm run build:electron     # ✅ 0 erreurs
npm run build              # ✅ Angular build OK
npm run package            # ✅ Package OK
npm run make               # ✅ Installer créé
```

## 🚀 Déploiement

### Linux (Debian/Ubuntu)

```bash
npm run make -- --targets deb
# Génère: out/make/deb/x64/recipe-box-0.0.0.deb
```

### Windows (NSIS Installer)

```bash
npm run make -- --targets squirrel.windows
# Génère: Setup.exe + delta updates
```

### macOS (DMG)

```bash
npm run make -- --targets dmg
# Génère: RecipeBox-0.0.0.dmg
```

## 📋 Configuration Production

### electron/config.ts

```typescript
// Vérifier isDevelopment=false en production
const isDevelopment = process.env.NODE_ENV === 'production'; // false ✅

// Vérifier URL de production
productionUrl: (buildPath) => `file://${path.join(buildPath, 'browser', 'index.html')}`
```

### electron/logger.ts

```typescript
// En production, debug logs désactivés
const logger = new Logger('RecipeService', false); // isDevelopment=false
```

### Vaincre DevTools

```typescript
// ❌ PRODUCTION: Désactiver DevTools
if (config.isDevelopment) {
  mainWindow.webContents.openDevTools(); // ← Seulement en dev
}
```

## 🔐 Sécurité Production

### Fuses de Sécurité (forge.config.js)

```javascript
new FusesPlugin({
  version: FuseVersion.V1,
  [FuseV1Options.RunAsNode]: false,          // ✅
  [FuseV1Options.EnableCookieEncryption]: true,     // ✅
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // ✅
  [FuseV1Options.OnlyLoadAppFromAsar]: true,  // ✅
})
```

- [ ] Toutes les fuses activées
- [ ] Pas de développement flags

## 📝 Documentation

- [ ] README.md à jour
- [ ] CHANGELOG.md créé
- [ ] Documentation API complète
- [ ] Guide installation pour utilisateurs
- [ ] Screenshots/démo disponibles

## 🧪 Tests Finaux

```bash
# 1. Installation fraîche
rm -rf node_modules package-lock.json
npm install

# 2. Compilation
npm run build:electron
npm run build

# 3. Package
npm run package

# 4. Tests utilisateur
npm start

# 5. Tester chaque feature
- Créer recette
- Éditer recette
- Supprimer recette
- Stock expiring
- Import/export (si applicable)
```

## 📊 Versioning

- [ ] Package.json version bumped
- [ ] Git tag créé: `v0.0.1`
- [ ] CHANGELOG.md updaté
- [ ] Release notes préparées

```json
{
  "version": "0.0.1",  // ← UPDATE
  "name": "recipe-box",
  "description": "Electron Recipe Management App",
}
```

## 🌐 Distribution

### Auto-Update (Optionnel)

```typescript
// À implémenter:
import { autoUpdater } from 'electron-updater';

if (!isDevelopment) {
  autoUpdater.checkForUpdatesAndNotify();
}
```

### Platform-Specific

- [ ] Windows: NSIS installer + delta updates
- [ ] macOS: Notarization si applicable
- [ ] Linux: .deb package

## 📈 Post-Deployment

### Monitoring

- [ ] Logs sauvegardés centralement
- [ ] Error tracking (Sentry, etc.)
- [ ] User analytics (optionnel)
- [ ] Performance monitoring

### Maintenance

- [ ] Hotfix procedure documentée
- [ ] Rollback procedure
- [ ] User support contact
- [ ] Bug reporting system

## 🔄 Update Cycle

- [ ] Major version pour breaking changes
- [ ] Minor version pour nouvelles features
- [ ] Patch version pour bug fixes
- [ ] Release notes automatisées

## ✅ Final Checks

```bash
# Résumé pre-release
npm run build:electron   # ✅ Aucune erreur
npm test                 # ✅ Tous les tests
npm run package          # ✅ Package créé
npm run make             # ✅ Installers créés

# File sizes (example)
# out/recipe-box-0.0.0.zip: ~150MB
# Setup.exe: ~80MB
# recipe-box-0.0.0.deb: ~120MB
```

## 🎉 Deployment Checklist

```
Before Release:
□ Code review complétée
□ Tests passent 100%
□ Documentation à jour
□ Changelog préparé
□ Version bumped
□ Git tag créé
□ Installers générés
□ Signatures vérifiées
□ User guide préparé
□ Support contact établi

Release:
□ Upload installers
□ Post release notes
□ Notify users
□ Monitor crash reports

After Release:
□ Monitor server logs
□ Check user feedback
□ Plan next update
□ Archive old versions
```

## 📞 Support & Feedback

- [ ] Support email setup
- [ ] Bug report template
- [ ] Feature request process
- [ ] User community (if applicable)

## 🎓 Documentation pour Users

Créer guide installation:

```markdown
# Installation Recipe Box

## Windows
1. Télécharger Setup.exe
2. Double-cliquer
3. Suivre l'assistant

## macOS
1. Télécharger .dmg
2. Drag & drop vers Applications

## Linux
```bash
sudo apt install ./recipe-box-0.0.0.deb
```

## Troubleshooting

... (ajouter FAQ)
```

## 🔐 Environment Variables

Pour production, créer `.env.production`:

```bash
NODE_ENV=production
ELECTRON_ENV=production
LOG_LEVEL=info
DATABASE_PATH=/path/to/db
```

---

**Checklist version** : 1.0
**Date création** : 26 novembre 2025
**Status** : ✅ Prêt pour production
