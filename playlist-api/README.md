# 🎵 Playlist API - Démarrage Rapide

## ⚡ Installation en 3 Étapes

### 1️⃣ Installer les Dépendances

**Si vous avez des erreurs "Cannot find module"**

#### Linux/Mac :
```bash
chmod +x fix-dependencies.sh
./fix-dependencies.sh
```

#### Windows PowerShell :
```powershell
.\fix-dependencies.ps1
```

#### Ou manuellement :
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm install --save-dev @types/jest @types/node @types/bcrypt @types/passport-jwt @types/passport-local
```

### 2️⃣ Lancer l'Application

```bash
npm run start:dev
```

Vous devriez voir :
```
🎵 Playlist API démarrée avec succès!
🚀 Serveur: http://localhost:3000
📚 Swagger UI: http://localhost:3000/api
```

### 3️⃣ Tester avec Swagger

1. Ouvrez http://localhost:3000/api
2. Testez **POST /auth/register** pour créer un compte
3. Cliquez sur **"Authorize"** (en haut à droite)
4. Collez votre `accessToken`
5. Testez toutes les routes ! 🎉

---

## 🧪 Lancer les Tests

```bash
npm run test:cov
```

Résultat attendu : **22 tests passés**

---

## 📚 Documentation

- **README_SWAGGER.md** - Documentation complète
---

## 🚨 Problèmes Courants

### Erreur : "Port 3000 already in use"
➡️ Changez `PORT=3001` dans `.env`

### Erreur : TypeScript ne compile pas
➡️ `npm install --save-dev typescript @types/node`

---

## 📋 Routes API Disponibles

### 🔐 Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Rafraîchir le token

### 🎵 Chansons (CRUD)
- `GET /songs` - Lister
- `POST /songs` - Créer
- `PUT /songs/:id` - Modifier
- `DELETE /songs/:id` - Supprimer

### 📝 Playlists (CRUD)
- `GET /playlists` - Lister
- `POST /playlists` - Créer
- `POST /playlists/:id/tracks` - Ajouter une chanson
- `DELETE /playlists/:id/tracks/:trackId` - Retirer une chanson

### 👮 Administration (ADMIN)
- `POST /admin/users/:id/ban` - Bannir un utilisateur
- `POST /admin/users/:id/unban` - Débannir un utilisateur
  `POST /admin/users/:id/make-admin` - Promouvoir un utilisateur en Admin

### 🌐 API Tierce (MusicBrainz)
- `GET /music-api/search/artist` - Rechercher un artiste
- `GET /music-api/search/recording` - Rechercher une chanson

---

## ✅ Fonctionnalités

- ✅ **20 routes API** fonctionnelles
- ✅ **Swagger UI** interactive sur /api
- ✅ **JWT** (access + refresh tokens)
- ✅ **RBAC** (USER/ADMIN)
- ✅ **API tierce** MusicBrainz
---

## 🎯 Exemple Rapide

```bash
# 1. Créer un compte
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"Test123!"}'

# 2. Récupérer le token dans la réponse
# {"accessToken": "eyJhbGc...", ...}

# 3. Créer une chanson
curl -X POST http://localhost:3000/songs \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bohemian Rhapsody","artist":"Queen"}'

# 4. Créer une playlist
curl -X POST http://localhost:3000/playlists \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ma playlist rock"}'
```

---

## 🚀 Technologies

- **NestJS** - Framework backend
- **TypeScript** - Langage
- **SQLite** - Base de données
- **JWT** - Authentification
- **MusicBrainz** - API tierce musicale
- **Jest** - Tests unitaires

---

## 📜 Licence

Ce projet est sous licence MIT.
---
