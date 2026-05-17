# 🚀 Déploiement sur Vercel — Power Exhaust

## Étape 1 : Créer la base de données PostgreSQL (Neon — Gratuit)

1. Allez sur **[neon.tech](https://neon.tech)** → Créer un compte gratuit
2. Cliquez **"New Project"** → donnez un nom (ex: `power-exhaust`)
3. Dans le dashboard Neon, allez dans **"Connection Details"**
4. Copiez les deux URLs :
   - **Connection string** (avec pooler) → `DATABASE_URL`
   - **Direct connection** (sans pooler) → `DIRECT_URL`

---

## Étape 2 : Créer le Blob Storage (Vercel)

1. Allez sur **[vercel.com](https://vercel.com)** → votre projet → **Storage**
2. Cliquez **"Create Database"** → choisissez **"Blob"**
3. Notez le **`BLOB_READ_WRITE_TOKEN`** généré
4. Notez l'**URL de base** du store (format : `https://xxxx.public.blob.vercel-storage.com`)

---

## Étape 3 : Déployer sur Vercel

### Via l'interface Vercel (recommandé)
1. Poussez votre code sur GitHub : `git push origin main`
2. Allez sur [vercel.com](https://vercel.com) → **"New Project"**
3. Importez votre repo GitHub
4. Ajoutez toutes les variables d'environnement (voir section ci-dessous)
5. Cliquez **"Deploy"**

### Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Variables d'environnement à configurer sur Vercel

Dans votre projet Vercel → **Settings → Environment Variables** :

| Variable | Valeur | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` | URL Neon avec pooling |
| `DIRECT_URL` | `postgresql://...` | URL Neon directe |
| `AUTH_SECRET` | `openssl rand -base64 32` | Secret NextAuth |
| `NEXTAUTH_URL` | `https://power-exhaust.com` | URL production |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_...` | Token Vercel Blob |
| `BLOB_BASE_URL` | `https://xxx.public.blob.vercel-storage.com` | URL base Blob |
| `FILE_ENCRYPTION_KEY` | `openssl rand -hex 32` | Clé AES-256 (64 hex) |
| `SMTP_HOST` | `smtp.gmail.com` | Serveur email |
| `SMTP_PORT` | `587` | Port SMTP |
| `SMTP_USER` | `votre@email.com` | Compte email |
| `SMTP_PASS` | `mot-de-passe-app` | Mot de passe app Gmail |
| `SMTP_FROM` | `Power Exhaust <contact@power-exhaust.com>` | Expéditeur |
| `NEXT_PUBLIC_APP_URL` | `https://power-exhaust.com` | URL publique |

---

## Étape 4 : Initialiser la base de données

Après le premier déploiement, exécutez en local avec votre `DATABASE_URL` de production :

```bash
# Copier le .env.example en .env.local avec vos vraies valeurs
cp .env.example .env.local
# Editer .env.local avec les URLs Neon

# Appliquer les migrations PostgreSQL
npm run db:migrate

# (Optionnel) Peupler avec des données initiales
npm run db:seed
```

---

## Étape 5 : Créer l'admin

```bash
# Avec votre DATABASE_URL pointant vers Neon
npx tsx create-admin.ts
```

---

## Commandes utiles

```bash
npm run db:migrate    # Appliquer les migrations en production
npm run db:push       # Pousser le schéma sans migration (dev)
npm run db:seed       # Peupler la BDD avec les données initiales
npm run db:studio     # Ouvrir Prisma Studio (interface visuelle BDD)
```

---

## Domaine personnalisé

Dans Vercel → **Settings → Domains** → Ajoutez `power-exhaust.com`
Configurez ensuite vos DNS chez votre registrar.
