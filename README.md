# Hôtel Clair de Lune — Application de réservation

Application web permettant aux clients de réserver directement les suites des hôtels ruraux du groupe **Hôtel Clair de Lune**, sans passer par des plateformes tierces. Elle offre également une interface de gestion pour les administrateurs et les gérants.

## Stack technique

- **Framework** : Next.js 16 (App Router) avec TypeScript
- **Base de données** : PostgreSQL via Drizzle ORM
- **Authentification** : Better Auth
- **Styles** : Tailwind CSS v4

## Prérequis

- Node.js >= 20
- Un projet [Supabase](https://supabase.com) (base de données PostgreSQL hébergée)

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

Créer un fichier `.env.local` à la racine du projet (ne jamais le committer) :

```env
# URL poolée (Transaction pooler, port 6543) — utilisée par l'application
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# URL directe (port 5432) — utilisée par Drizzle Kit pour les migrations
DATABASE_URL_UNPOOLED="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

BETTER_AUTH_SECRET=<une_chaine_aleatoire_longue>
BETTER_AUTH_URL=http://localhost:3000
```

> Les URLs de connexion se trouvent dans **Supabase → Project Settings → Database → Connect → onglet Drizzle**.
> Remplacer `[password]` par le mot de passe du projet Supabase (sans crochets).

### 4. Initialiser la base de données

```bash
npm run db:generate   # génère les fichiers de migration
npm run db:migrate    # applique les migrations sur Supabase
npm run db:seed       # peuple la base avec des données de test
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Commandes disponibles

```bash
npm run dev           # Serveur de développement
npm run build         # Build de production
npm run start         # Serveur de production
npm run lint          # Vérification ESLint
npm run db:generate   # Génère les fichiers de migration SQL
npm run db:migrate    # Applique les migrations sur Supabase
npm run db:studio     # Interface visuelle pour explorer la base
npm run db:seed       # Peuple la base avec des données de test
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
