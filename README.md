# Hôtel Clair de Lune — Application de réservation

Application web permettant aux clients de réserver directement les suites des hôtels ruraux du groupe **Hôtel Clair de Lune**, sans passer par des plateformes tierces. Elle offre également une interface de gestion pour les administrateurs et les gérants.

## Stack technique

- **Framework** : Next.js 16 (App Router) avec TypeScript
- **Base de données** : PostgreSQL via Drizzle ORM
- **Authentification** : Better Auth
- **Styles** : Tailwind CSS v4

## Prérequis

- Node.js >= 20
- PostgreSQL >= 14

## Installation en local

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd hotel-jp-ad-as
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
DATABASE_URL=postgresql://<utilisateur>:<mot_de_passe>@localhost:5432/<nom_de_la_base>
BETTER_AUTH_SECRET=<une_chaine_aleatoire_longue>
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Initialiser la base de données

```bash
npx drizzle-kit migrate
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Créer un compte administrateur

Après avoir lancé l'application, exécuter le script de seed pour créer le premier compte administrateur :

```bash
npm run seed
```

Les identifiants par défaut seront affichés dans le terminal. **Pensez à changer le mot de passe dès la première connexion.**

> Si le script `seed` n'est pas encore disponible, créer manuellement un enregistrement dans la table `users` avec le rôle `admin`.

## Commandes disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Vérification ESLint
```

## Fonctionnalités

| User Story | Rôle         | Description                                               |
|------------|--------------|-----------------------------------------------------------|
| US1        | Admin        | Gérer les établissements (CRUD)                           |
| US2        | Admin        | Gérer les gérants (CRUD)                                  |
| US3        | Gérant       | Gérer les suites de son hôtel (CRUD)                      |
| US4        | Visiteur     | Consulter les établissements et les suites disponibles    |
| US5        | Client       | Réserver une suite en ligne avec vérification de dispo    |
| US6        | Client       | Consulter et annuler ses réservations (délai : 3 jours)   |
| US7        | Visiteur     | Contacter un établissement via un formulaire              |

## Structure du projet

```
src/
└── app/          # Routes Next.js (App Router)
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

## Contribution

Une branche par fonctionnalité, commits atomiques et réguliers.

```bash
git checkout -b feat/us1-gestion-etablissements
```
