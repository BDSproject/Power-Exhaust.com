# ⚡ Useful Commands — Power Exhaust

---

##  Génération de clés secrètes

```bash
# Générer AUTH_SECRET (NextAuth)
openssl rand -base64 32

# Générer FILE_ENCRYPTION_KEY (chiffrement AES-256)
openssl rand -hex 32

# Générer CRON_SECRET
openssl rand -hex 24
```

---

##  NPM — Gestion des dépendances

```bash
# Installer toutes les dépendances
npm install

# Installer avec legacy peer deps (si conflits de versions)
npm install --legacy-peer-deps

# Installer un paquet
npm install <paquet>

# Installer un paquet en dev
npm install --save-dev <paquet>

# Désinstaller un paquet
npm uninstall <paquet>

# Mettre à jour tous les paquets
npm update

# Vérifier les vulnérabilités
npm audit

# Corriger les vulnérabilités automatiquement
npm audit fix

# Voir les paquets obsolètes
npm outdated

# Lister les paquets installés (niveau 0)
npm list --depth=0
```

---

##  Next.js — Développement & Build

```bash
# Lancer le serveur de développement
npm run dev

# Build de production (génère .next/)
npm run build

# Lancer le serveur de production (après build)
npm start

# Linter le code (recherce d'erreur dans le code)
npm run lint

# Vérifier les types TypeScript sans build
npx tsc --noEmit

# Nettoyer le cache Next.js
rm -rf .next
```

---

##  Prisma — Base de données

```bash
# Générer le client Prisma (après modif du schéma)
npx prisma generate

# Appliquer les migrations en production (Neon/PostgreSQL)
npm run db:migrate
# ou directement :
npx prisma migrate deploy

# Créer une nouvelle migration (dev uniquement)
npx prisma migrate dev --name nom_de_la_migration

# Pousser le schéma sans migration (dev rapide)
npm run db:push
# ou :
npx prisma db push

# Réinitialiser la base de données (⚠️ supprime tout)
npx prisma migrate reset

# Ouvrir Prisma Studio (interface visuelle BDD)
npm run db:studio
# ou :
npx prisma studio

# Peupler la base de données (seed)
npm run db:seed
# ou :
npx tsx prisma/seed.ts

# Vérifier l'état des migrations
npx prisma migrate status

# Inspecter le schéma de la BDD
npx prisma db pull

# Formater le fichier schema.prisma
npx prisma format
```

---

##  Compte Admin

```bash
# Créer le compte administrateur
npx tsx create-admin.ts
```

---

##  Git — Contrôle de version

```bash
# Initialiser un dépôt git
git init

# Vérifier l'état des fichiers
git status

# Ajouter tous les fichiers modifiés
git add .

# Ajouter un fichier spécifique
git add <fichier>

# Créer un commit
git commit -m "message du commit"

# Voir l'historique des commits
git log --oneline

# Voir les remotes configurés
git remote -v

# Ajouter un remote GitHub
git remote add origin https://github.com/BDSproject/Power-Exhaust.com.git

# Pousser vers GitHub (premier push)
git push -u origin main

# Pousser les changements suivants
git push

# Récupérer les changements depuis GitHub
git pull

# Créer une nouvelle branche
git checkout -b nom-de-la-branche

# Changer de branche
git checkout main

# Fusionner une branche
git merge nom-de-la-branche

# Voir les branches
git branch -a

# Annuler les modifications non committées
git checkout -- .

# Voir les différences
git diff
```

---

##  Vercel CLI — Déploiement

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer en preview
vercel

# Déployer en production
vercel --prod

# Voir les déploiements
vercel ls

# Voir les logs d'un déploiement
vercel logs <url-du-déploiement>

# Lier le projet local à Vercel
vercel link

# Récupérer les variables d'environnement Vercel en local
vercel env pull .env.local

# Ajouter une variable d'environnement
vercel env add NOM_VARIABLE

# Lister les variables d'environnement
vercel env ls

# Supprimer une variable d'environnement
vercel env rm NOM_VARIABLE

# Voir les domaines configurés
vercel domains ls

# Inspecter un déploiement
vercel inspect <url>
```

---

##  Workflow complet de déploiement

```bash
# 1. Vérifier les types TypeScript
npx tsc --noEmit

# 2. Builder le projet
npm run build

# 3. Ajouter et committer les changements
git add .
git commit -m "✨ Description des changements"

# 4. Pousser sur GitHub (Vercel déploie automatiquement)
git push

# OU déployer manuellement via CLI
vercel --prod
```

---

## 🗃️ Workflow migration base de données

```bash
# 1. S'assurer que DATABASE_URL pointe vers Neon dans .env.local
# 2. Appliquer les migrations
npx prisma migrate deploy

# 3. Créer l'admin si c'est la première fois
npx tsx create-admin.ts

# 4. (Optionnel) Peupler le catalogue
npx tsx prisma/seed.ts
```

---

## 🛠️ Dépannage courant

```bash
# Nettoyer et réinstaller les dépendances
rm -rf node_modules package-lock.json && npm install --legacy-peer-deps

# Nettoyer le cache Next.js et rebuilder
rm -rf .next && npm run build

# Vérifier la version de Node.js
node --version

# Vérifier la version de npm
npm --version

# Vérifier la version de Prisma
npx prisma --version

# Voir les variables d'environnement chargées (sans les valeurs)
npx prisma debug

# Tester la connexion à la base de données
npx prisma db execute --stdin <<< "SELECT 1"
```

---

## 📋 Variables d'environnement — Résumé

| Variable | Générer avec | Usage |
|---|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` | Sessions NextAuth |
| `FILE_ENCRYPTION_KEY` | `openssl rand -hex 32` | Chiffrement AES-256 pièces d'identité |
| `CRON_SECRET` | `openssl rand -hex 24` | Protection routes cron |
| `DATABASE_URL` | Neon dashboard | PostgreSQL avec pooling |
| `DIRECT_URL` | Neon dashboard | PostgreSQL direct (migrations) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Storage > Blob | Upload fichiers chiffrés |
| `BLOB_BASE_URL` | Vercel Storage > Blob | URL base des fichiers |
