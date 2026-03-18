# Hôtel Clair de Lune — Application de réservation

Application web permettant aux clients de réserver directement les suites des hôtels ruraux du groupe **Hôtel Clair de Lune**, sans passer par des plateformes tierces. Elle offre également une interface de gestion pour les administrateurs et les gérants.

## Stack technique

- **Framework** : Next.js 16 (App Router) avec TypeScript
- **Base de données** : PostgreSQL via Drizzle ORM
- **Authentification** : Better Auth
- **Styles** : Tailwind CSS v4

## Prérequis

- Node.js >= 20
- PostgreSQL >= 14 installé en local — [télécharger ici](https://www.postgresql.org/download)

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

### 3. Créer la base de données locale

```bash
psql -U postgres -c "CREATE DATABASE hotel_dev;"
```

### 4. Configurer les variables d'environnement

Copier `.env.example` en `.env.local` et remplacer `<ton-mdp-local>` par ton mot de passe PostgreSQL (ou le supprimer si pas de mot de passe) :

```bash
cp .env.example .env.local
```

```env
DATABASE_URL=postgresql://postgres:<ton-mdp-local>@localhost:5432/hotel_dev
DATABASE_URL_UNPOOLED=postgresql://postgres:<ton-mdp-local>@localhost:5432/hotel_dev

BETTER_AUTH_SECRET=nimporte_quelle_chaine_en_dev
BETTER_AUTH_URL=http://localhost:3000
```

> Ne jamais committer `.env.local` — il est dans le `.gitignore`.

### 5. Initialiser la base de données

```bash
npm run db:migrate    # crée les tables
npm run db:seed       # insère les données de test
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

> Pour le guide complet (psql, Drizzle Studio, connexion VSCode), voir [ONBOARDING.md](ONBOARDING.md).

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
