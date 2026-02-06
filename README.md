# 🚀 Azure Fullstack Deployment (Node.js + MySQL)

Ce repository contient le code source de l'application ainsi que l'infrastructure as code (IaC) nécessaire pour déployer automatiquement l'ensemble sur Microsoft Azure.

L'architecture déployée comprend :

- **Frontend :** App Service (Node.js)
- **Backend :** App Service (Node.js)
- **Base de données :** Azure Database for MySQL (Flexible Server)
- **Orchestration :** Tout est interconnecté via Bicep et GitHub Actions.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. Un compte **Microsoft Azure** actif (avec une souscription).
2. **Azure CLI** installé sur votre machine locale (pour la configuration initiale).
3. Un compte **GitHub** (pour forker ce repo).

---

## 🛠️ Installation et Configuration

Suivez ces étapes pour configurer votre environnement de déploiement.

### 1. Forker le projet

Commencez par "Forker" ce repository sur votre propre compte GitHub.

### 2. Créer un "Service Principal" Azure

Pour que GitHub Actions puisse créer des ressources sur votre Azure, il a besoin d'une identité avec les droits de contribution.

Ouvrez votre terminal et connectez-vous à Azure :

```bash
az login

```

Récupérez votre ID de souscription (Subscription ID) :

```bash
az account show --query id --output tsv

```

Lancez la commande suivante (remplacez `{SUBSCRIPTION_ID}` par l'ID récupéré juste avant) :

```bash
az ad sp create-for-rbac --name "myAppDeployer" --role contributor --scopes /subscriptions/{SUBSCRIPTION_ID} --json-auth

```

⚠️ **Important :** Copiez tout le bloc JSON que cette commande va générer. Il ressemble à ceci :

```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "activeDirectoryEndpointUrl": "..."
}
```

### 3. Configurer les Secrets GitHub

Allez dans votre repository GitHub sur le web :

1. Cliquez sur **Settings** > **Secrets and variables** > **Actions**.
2. Cliquez sur **New repository secret**.

Ajoutez les secrets suivants :

| Nom du Secret           | Valeur                                                         |
| ----------------------- | -------------------------------------------------------------- |
| `AZURE_CREDENTIALS`     | Collez **tout le JSON** généré à l'étape précédente.           |
| `AZURE_SUBSCRIPTION_ID` | Votre ID de souscription Azure.                                |
| `DB_PASSWORD`           | Choisissez un mot de passe fort pour la base de données MySQL. |

### 4. Personnaliser les variables de déploiement

Ouvrez le fichier `.github/workflows/deploy-infra.yml` et modifiez la section `env` pour qu'elle corresponde à votre projet :

```yaml
env:
  RESOURCE_GROUP: "rg-mon-super-projet" # Nom du groupe de ressources qui sera créé
  LOCATION: "norwayeast" # Région Azure (ex: westeurope, eastus)
  PROJECT_NAME: "projet-xyz-123" # DOIT ÊTRE UNIQUE ! (utilisé pour les URL)
```

_Note : `PROJECT_NAME` doit être unique globalement sur Azure car il définit l'URL (ex: `projet-xyz-123-frontend.azurewebsites.net`)._

---

## 📂 Structure du Projet

Assurez-vous que vos fichiers sont organisés comme suit pour que le script fonctionne :

```text
/
├── .github/
│   └── workflows/
│       └── deploy-infra.yml  # Le pipeline CI/CD
├── backend/                  # Code source du backend
│   ├── package.json
│   └── ...
├── frontend/                 # Code source du frontend
│   ├── package.json
│   └── ...
├── main.bicep                # Orchestrateur d'infrastructure
├── backend.bicep             # Module infrastructure Backend
└── frontend.bicep            # Module infrastructure Frontend

```

---

## 🚀 Déploiement

Une fois la configuration terminée :

1. Faites un commit et poussez vos changements sur la branche `main`.

```bash
git add .
git commit -m "Setup deployment config"
git push origin main

```

2. Allez dans l'onglet **Actions** de votre repository GitHub.
3. Vous verrez le workflow `Deploy Infrastructure & Apps` se lancer.

### Ce qui va se passer automatiquement :

1. GitHub va créer le Resource Group.
2. Il va déployer le serveur MySQL et le plan App Service.
3. Il va créer les Web Apps (Front et Back).
4. Il va injecter les identifiants de la BDD dans le Backend.
5. Il va injecter l'URL du Backend dans le Frontend.
6. Il va builder et déployer le code Node.js.

---

## 🐛 Troubleshooting

- **Erreur de nom de domaine :** Si le déploiement échoue avec une erreur indiquant qu'un nom est déjà pris, changez la valeur de `PROJECT_NAME` dans le fichier YAML.
- **Erreur de base de données :** Vérifiez que le `DB_PASSWORD` dans les secrets respecte les exigences de complexité d'Azure (Majuscule, minuscule, chiffre, caractère spécial).
- **Coûts :** Ce déploiement utilise des tiers payants (Basic B1). N'oubliez pas de supprimer le groupe de ressources via le portail Azure si vous n'utilisez plus le projet pour éviter les frais.

---

## 📞 Support

Pour toute question concernant l'architecture, référez-vous aux fichiers `.bicep`.

```

```
