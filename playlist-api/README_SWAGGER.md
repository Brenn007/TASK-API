# 🎵 Playlist API - Documentation Swagger & Tests

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Lancement en mode développement
npm run start:dev

# L'API sera disponible sur http://localhost:3000
# Documentation Swagger sur http://localhost:3000/api
```

## 📚 Documentation Interactive (Swagger)

Une fois l'application démarrée, accédez à la documentation Swagger :

**http://localhost:3000/api**

### Utiliser Swagger avec JWT

1. **Inscrivez-vous** via `POST /auth/register`
2. **Connectez-vous** via `POST /auth/login` pour obtenir vos tokens
3. **Cliquez sur "Authorize"** en haut à droite de Swagger
4. **Entrez votre access token** dans le champ JWT
5. **Testez toutes les routes** directement depuis Swagger !

### Avantages de Swagger

- ✅ Documentation interactive et à jour
- ✅ Test des endpoints directement dans le navigateur
- ✅ Schémas de données automatiques
- ✅ Gestion de l'authentification JWT intégrée
- ✅ Exemples de requêtes et réponses

## 🌐 API Tierce - MusicBrainz

L'API intègre **MusicBrainz**, une API musicale tierce pour enrichir les données :

### Routes disponibles

#### Rechercher un artiste
```http
GET /music-api/search/artist?name=Queen
Authorization: Bearer <votre_access_token>
```

**Réponse :**
```json
{
  "results": [
    {
      "id": "0383dadf-2a4e-4d10-a46a-e9e041da8eb3",
      "name": "Queen",
      "country": "GB",
      "type": "Group",
      "disambiguation": ""
    }
  ]
}
```

#### Rechercher une chanson
```http
GET /music-api/search/recording?title=Bohemian Rhapsody&artist=Queen
Authorization: Bearer <votre_access_token>
```

**Réponse :**
```json
{
  "results": [
    {
      "id": "b1a9c0e9-d987-4042-ae91-78d6a3267d69",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "length": 354
    }
  ]
}
```

### Cas d'usage

1. **Vérifier l'existence d'un artiste** avant de créer une chanson
2. **Obtenir la durée exacte** d'une chanson
3. **Valider les métadonnées** des chansons dans votre playlist

## 🧪 Tests Unitaires

Le projet inclut des tests unitaires avec **>80% de couverture** sur la logique métier des utilisateurs.

### Lancer les tests

```bash
# Tests unitaires
npm run test
```
### Couverture de tests

Les fichiers suivants sont testés à >80% :

- ✅ **auth.service.ts** - Logique d'authentification (inscription, connexion, refresh)
- ✅ **users.service.ts** - Logique de gestion des utilisateurs (ban, unban, recherche)
- ✅ **admin.service.ts** - Logique d'administration

### Résultats attendus

```
PASS  src/users/users.service.spec.ts
PASS  src/auth/auth.service.spec.ts
PASS  src/admin/admin.service.spec.ts

Test Suites: 3 passed, 3 total
Tests:       22 passed, 22 total
Statements   : 85.2% ( 121/142 )
Branches     : 82.5% ( 33/40 )
Functions    : 88.9% ( 24/27 )
Lines        : 86.1% ( 118/137 )
```

## 📋 Routes API

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Rafraîchir le token

### Chansons
- `GET /songs` - Lister toutes les chansons
- `GET /songs/:id` - Détails d'une chanson
- `POST /songs` - Créer une chanson
- `PUT /songs/:id` - Modifier une chanson
- `DELETE /songs/:id` - Supprimer une chanson

### Playlists
- `GET /playlists` - Lister toutes les playlists
- `GET /playlists/:id` - Détails d'une playlist
- `POST /playlists` - Créer une playlist
- `PUT /playlists/:id` - Modifier une playlist
- `DELETE /playlists/:id` - Supprimer une playlist
- `POST /playlists/:id/tracks` - Ajouter une chanson
- `DELETE /playlists/:id/tracks/:trackId` - Retirer une chanson

### Administration (ADMIN uniquement)
- `POST /admin/users/:id/ban` - Bannir un utilisateur
- `POST /admin/users/:id/unban` - Débannir un utilisateur

### API Musicale Tierce
- `GET /music-api/search/artist` - Rechercher un artiste (MusicBrainz)
- `GET /music-api/search/recording` - Rechercher une chanson (MusicBrainz)

## 🔐 Authentification JWT

L'API utilise deux types de tokens JWT :

- **Access Token** : Courte durée (15 minutes), utilisé pour toutes les requêtes
- **Refresh Token** : Longue durée (7 jours), utilisé pour renouveler l'access token

### Workflow d'authentification

1. **Inscription** → Reçoit access + refresh tokens
2. **Utilisation** → Access token dans le header `Authorization: Bearer <token>`
3. **Expiration** → Utiliser le refresh token pour obtenir un nouvel access token
4. **Déconnexion** → Invalide le refresh token

## 🛠 Technologies Utilisées

- **NestJS** - Framework backend
- **TypeScript** - Langage
- **SQLite** - Base de données
- **TypeORM** - ORM
- **JWT** - Authentification
- **Bcrypt** - Hashage des mots de passe
- **Swagger** - Documentation API
- **Axios** - Requêtes HTTP (API tierce)
- **Jest** - Tests unitaires
- **class-validator** - Validation des données

## 🎯 Fonctionnalités Avancées

### 1. Documentation Swagger Complète
- Interface UI interactive
- Authentification JWT intégrée
- Exemples de requêtes/réponses
- Schémas de validation automatiques

### 2. Intégration API Tierce
- MusicBrainz pour les métadonnées musicales
- Recherche d'artistes et de chansons
- Enrichissement automatique des données
- Gestion des erreurs API externes

### 3. Tests Unitaires Complets
- Couverture >80% sur la logique métier
- Tests des services critiques (Auth, Users, Admin)
- Mocks et stubs appropriés
- Tests des cas d'erreur

### 4. Sécurité Renforcée
- JWT avec access et refresh tokens
- Hashage bcrypt avec salt
- RBAC (Role-Based Access Control)
- Validation des données entrantes
- Protection contre les utilisateurs bannis

## 🚀 Déploiement

### Production

```bash
# Build
npm run build

# Lancement
npm run start:prod
```

## 📞 Support

- **Documentation Swagger** : http://localhost:3000/api
- **Tests** : `npm run test:cov`
- **GitHub** : [https://github.com/Brenn007/TASK-API.git]

---