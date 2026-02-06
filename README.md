# AZ Fileshare Backend

Backend d'une application de partage de fichiers (type Google Drive) conçu pour être déployé sur **Microsoft Azure**. Ce projet expose une API RESTful permettant l'authentification des utilisateurs, la gestion de dossiers hiérarchiques et le stockage de fichiers volumineux.

## Technologies Utilisées

- **Runtime** : Node.js (v24.x)
- **Framework** : Express.js (v5)
- **Base de données** : Azure SQL Database (MSSQL) pour les métadonnées et la structure.
- **Stockage de fichiers** : Azure Blob Storage pour les fichiers binaires.
- **Authentification** : JWT (JSON Web Tokens).
- **Upload** : Multer (gestion des flux en mémoire).

## Structure du Projet

```text
az-fileshare-backend/
├── .github/workflows/   # Pipeline CI/CD pour Azure Actions
├── middleware/          # Middlewares (Auth JWT, Config Upload)
├── routes/              # Définition des endpoints API (Auth, Drive)
├── utils/               # Logique de connexion (SQL, Blob Storage)
├── main.bicep           # Définition de l'infrastructure Azure (IaC)
├── server.js            # Point d'entrée de l'application
└── package.json         # Dépendances
```

## Installation et Démarrage Local

### Prérequis

- Node.js installé.
- Une instance SQL Server (locale ou Azure).
- Un compte de stockage Azure (ou l'émulateur Azurite).

### 1. Cloner et installer

```bash
git clone [https://github.com/ByggL/az-fileshare-backend.git](https://github.com/ByggL/az-fileshare-backend.git)
cd az-fileshare-backend
npm install
```

### 2. Configuration (.env)

Créez un fichier `.env` à la racine (ce fichier est ignoré par git) :

```ini
PORT=3000
SECRET_KEY=votre_cle_secrete_jwt_super_longue

# Configuration Base de Données
DB_SERVER=localhost # ou votre-serveur.database.windows.net
DB_USER=votre_user
DB_PASS=votre_password
DB_NAME=FileshareDB

# Configuration Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
CONTAINER_NAME=user-files
```

### 3. Initialisation de la Base de Données

Exécutez ce script SQL pour créer les tables nécessaires (basé sur le schéma utilisé dans `routes/`) :

```sql
CREATE TABLE Users (
    id NVARCHAR(50) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(100) NOT NULL
);

CREATE TABLE Items (
    id NVARCHAR(50) PRIMARY KEY,
    userId NVARCHAR(50) NOT NULL,
    type NVARCHAR(20) NOT NULL, -- 'folder' ou 'file'
    name NVARCHAR(255) NOT NULL,
    size BIGINT,
    mimetype NVARCHAR(100),
    parentId NVARCHAR(50),
    createdAt DATETIME DEFAULT GETDATE(),
    blobName NVARCHAR(255),
    CONSTRAINT FK_Items_Users FOREIGN KEY (userId) REFERENCES Users(id)
);
```

### 4. Lancer le serveur

```bash
npm start
# Le serveur démarrera sur http://localhost:3000 (après connexion BDD réussie)
```

## Déploiement et CI/CD (Azure)

Le déploiement est entièrement automatisé via GitHub Actions.

### Workflow

1. **Trigger** : À chaque `push` sur la branche `main`.
2. **Job Build** :

- Installation des dépendances (`npm install`).
- Création de l'artefact de déploiement.

3. **Job Deploy** :

- Authentification via Azure Login (Service Principal).
- Déploiement sur **Azure App Service** (Linux Plan).
- L'application est configurée pour utiliser Node 24 LTS.

### Configuration sur Azure Portal

**Important** : Les fichiers `.env` ne sont pas envoyés sur Azure. Vous devez configurer manuellement les variables d'environnement dans le portail Azure :

- Aller dans **App Service** > **Settings** > **Environment variables**.
- Ajouter : `DB_SERVER`, `DB_USER`, `DB_PASS`, `DB_NAME`, `AZURE_STORAGE_CONNECTION_STRING`, `CONTAINER_NAME`, `SECRET_KEY`.

## Endpoints Principaux

| Méthode  | Endpoint                       | Description                                      |
| -------- | ------------------------------ | ------------------------------------------------ |
| `POST`   | `/api/auth/register`           | Création de compte                               |
| `POST`   | `/api/auth/login`              | Connexion (retourne un Token)                    |
| `GET`    | `/api/drive`                   | Lister la racine ou un dossier (`?parentId=...`) |
| `POST`   | `/api/drive/folders`           | Créer un dossier                                 |
| `POST`   | `/api/drive/files`             | Uploader un fichier                              |
| `GET`    | `/api/drive/files/:id/content` | Télécharger un fichier                           |
| `DELETE` | `/api/drive/items/:id`         | Supprimer un fichier ou dossier                  |
