# 🚀 Azure Fullstack Deployment (Backend + Infrastructure)

Ce repository contient le code source de l'API (Backend) ainsi que l'**Infrastructure as Code (IaC)** pour tout le projet (Front + Back + Base de données).

L'architecture est séparée en deux repositories :

1.  **Ce repo (Backend + Infra)** : Déploie les ressources Azure (MySQL, App Services) et le code Backend.
2.  **Le repo Frontend** : Déploie uniquement le code React/Vue/Angular sur l'infrastructure créée ici.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1.  Un compte **Microsoft Azure** actif.
2.  **Azure CLI** installé en local.
3.  Ce repository **Backend** forké.
4.  Le repository **Frontend** forké (sur un autre repo).

---

## 🛠️ Partie 1 : Déploiement de l'Infrastructure et du Backend

C'est ce repository qui pilote la création des serveurs.

### 1. Créer un "Service Principal" Azure

Cette étape permet à GitHub Actions de créer des ressources sur votre compte Azure.

Connectez-vous et récupérez votre ID de souscription :

```bash
az login
az account show --query id --output tsv
```

````

Créez le robot de déploiement (remplacez `{SUBSCRIPTION_ID}`) :

```bash
az ad sp create-for-rbac --name "myFullstackDeployer" --role contributor --scopes /subscriptions/{SUBSCRIPTION_ID} --json-auth

```

⚠️ **Copiez le JSON généré**, vous en aurez besoin pour les DEUX repositories.

### 2. Configurer les Secrets du Backend

Dans ce repository GitHub (Backend), allez dans **Settings > Secrets and variables > Actions** et ajoutez :

| Nom du Secret           | Valeur                                              |
| ----------------------- | --------------------------------------------------- |
| `AZURE_CREDENTIALS`     | Le JSON complet généré à l'étape précédente.        |
| `AZURE_SUBSCRIPTION_ID` | Votre ID de souscription Azure.                     |
| `DB_PASSWORD`           | Un mot de passe fort pour la base de données MySQL. |

### 3. Lancer le déploiement

1. Allez dans le fichier `.github/workflows/deploy-backend.yml` (ou équivalent).
2. Modifiez les variables d'environnement au début du fichier si nécessaire (notamment `PROJECT_NAME` qui doit être unique).
3. Poussez sur la branche `main`.

**Ce qui va se passer :**

- Azure crée le Groupe de Ressources.
- Azure crée MySQL et les 2 App Services (un pour le Back, un vide pour le Front).
- Le code Backend est déployé et connecté à la BDD.

---

## 🔗 Partie 2 : Connexion avec le Frontend

Une fois le déploiement de ce repo terminé, l'infrastructure est prête à recevoir le Frontend.

### 1. Récupérer le nom de l'App Service Frontend

Allez sur le portail Azure, dans le groupe de ressources créé. Trouvez l'App Service destiné au Frontend (ex: `monprojet-frontend`). Copiez son nom.

### 2. Configurer le Repo Frontend

Allez sur votre **autre repository** (celui du Frontend) :

1. Allez dans **Settings > Secrets and variables > Actions**.
2. Ajoutez le **MÊME** secret `AZURE_CREDENTIALS` que vous avez utilisé pour le backend.

### 3. Configurer le Workflow Frontend

Dans le repo Frontend, éditez le fichier `.github/workflows/deploy-frontend.yml` :

```yaml
env:
  AZURE_WEBAPP_NAME: "nom-du-front-recupere-sur-azure" # 👈 Mettre le nom ici
```

### 4. Déployer

Faites un push sur le repo Frontend. GitHub Actions va compiler votre site et l'envoyer sur l'App Service qui a été créé par le repo Backend.

---

## 🐛 Troubleshooting

- **Le Frontend ne trouve pas l'API :**
- Le déploiement Infra (ce repo) injecte automatiquement l'URL de l'API dans les fichiers de configuration du Frontend via la commande de démarrage (Startup Command).
- Assurez-vous que le déploiement Backend a bien réussi avant de lancer celui du Frontend.

- **Erreur de droits (403/401) :**
- Vérifiez que le secret `AZURE_CREDENTIALS` est identique et valide sur les deux repos.

---

## 📞 Support

L'infrastructure est définie dans les fichiers `.bicep` de ce repository. Pour modifier la taille des serveurs ou la version de Node, c'est ici qu'il faut agir.

```

```
````
