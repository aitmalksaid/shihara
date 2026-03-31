# Gestion de Teinture Marocaine

Une application web pour gérer le processus d'une teinturerie marocaine, développée avec React 18 et Supabase.

## Fonctionnalités

- Gestion des clients
- Gestion des commandes avec suivi du statut
- Gestion des types de teintures
- Gestion des couleurs
- Tableau de bord avec statistiques

## Prérequis

- Node.js (version 16 ou supérieure)
- Un compte Supabase

## Installation

1. Clonez ce dépôt :
   ```
   git clone https://github.com/votre-repo/app-teinture-marocaine.git
   cd app-teinture-marocaine
   ```

2. Installez les dépendances :
   ```
   npm install
   ```

3. Configurez Supabase :
   - Créez un compte sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Récupérez votre URL et votre clé API depuis les paramètres du projet
   - Mettez à jour le fichier `src/supabase.js` avec vos propres identifiants

4. Créez les tables dans Supabase :
   - Dans votre projet Supabase, allez dans l'éditeur SQL
   - Exécutez les commandes SQL du fichier `database.sql`

## Démarrage

Démarrez l'application en mode développement :

```
npm start
```

L'application sera accessible à l'adresse http://localhost:3000

## Structure du projet

```
src/
├── components/       # Composants React
│   ├── Navigation.js
│   ├── Dashboard.js
│   ├── Commandes.js
│   ├── Clients.js
│   ├── Teintures.js
│   ├── Couleurs.js
│   └── Login.js
├── App.js           # Composant principal
├── index.js         # Point d'entrée
├── App.css          # Styles globaux
├── index.css        # Styles de base
└── supabase.js      # Configuration Supabase
```

## Technologies utilisées

- React 18
- React Router DOM
- Supabase
- CSS3

## Auteur

Votre nom

## Licence

MIT
