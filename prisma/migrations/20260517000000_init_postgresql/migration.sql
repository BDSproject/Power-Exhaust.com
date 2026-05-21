-- ============================================================
-- POWER EXHAUST — Migration initiale PostgreSQL
-- ============================================================

-- Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');
CREATE TYPE "StatutRachat" AS ENUM (
  'EN_ATTENTE', 'VALIDE', 'EN_COURS', 'OFFRE_ENVOYEE', 'ACCEPTE',
  'EN_EXPEDITION', 'RECU', 'PAYE', 'NON_PAYE', 'LITIGE', 'REFUSE', 'COMPLETE'
);
CREATE TYPE "EtatEchappement" AS ENUM ('EXCELLENT', 'BON', 'MOYEN', 'MAUVAIS');

-- Users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "phone" TEXT,
    "address" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Accounts
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- Sessions
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- VerificationTokens
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- ExhaustBrands
CREATE TABLE "exhaust_brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoEmoji" TEXT,
    "origine" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exhaust_brands_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "exhaust_brands_name_key" ON "exhaust_brands"("name");
CREATE UNIQUE INDEX "exhaust_brands_slug_key" ON "exhaust_brands"("slug");

-- ExhaustModels
CREATE TABLE "exhaust_models" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "anneeDebut" INTEGER,
    "anneeFin" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exhaust_models_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "exhaust_models_brandId_slug_key" ON "exhaust_models"("brandId", "slug");

-- ExhaustPrices
CREATE TABLE "exhaust_prices" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "etat" "EtatEchappement" NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exhaust_prices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "exhaust_prices_modelId_etat_key" ON "exhaust_prices"("modelId", "etat");

-- Rachats
CREATE TABLE "rachats" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "statut" "StatutRachat" NOT NULL DEFAULT 'EN_ATTENTE',
    "userId" TEXT,
    "exhaustModelId" TEXT,
    "prixOfficiel" DOUBLE PRECISION,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "annee" INTEGER,
    "immatriculation" TEXT,
    "kilometrage" INTEGER,
    "typeEchappement" TEXT,
    "marqueEchappement" TEXT,
    "modeleEchappement" TEXT,
    "etatEchappement" "EtatEchappement" NOT NULL,
    "description" TEXT,
    "photos" TEXT,
    "prixPropose" DOUBLE PRECISION,
    "prixAccepte" DOUBLE PRECISION,
    "noteAdmin" TEXT,
    "nomVendeur" TEXT NOT NULL,
    "prenomVendeur" TEXT NOT NULL,
    "emailVendeur" TEXT NOT NULL,
    "telVendeur" TEXT NOT NULL,
    "adresseVendeur" TEXT NOT NULL,
    "villeVendeur" TEXT NOT NULL,
    "codePostalVendeur" TEXT NOT NULL,
    "signatureVendeur" TEXT,
    "signatureVendeurAt" TIMESTAMP(3),
    "signatureVendeurIp" TEXT,
    "signatureVendeurUa" TEXT,
    "adminToken" TEXT,
    "identiteToken" TEXT,
    "poidsKg" DOUBLE PRECISION,
    "longueurCm" INTEGER,
    "largeurCm" INTEGER,
    "hauteurCm" INTEGER,
    "boxtralOrderRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rachats_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rachats_reference_key" ON "rachats"("reference");

-- Attestations
CREATE TABLE "attestations" (
    "id" TEXT NOT NULL,
    "rachatId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dateVente" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prixFinal" DOUBLE PRECISION NOT NULL,
    "signatureVendeur" TEXT,
    "signatureAcheteur" TEXT,
    "signatureVendeurAt" TIMESTAMP(3),
    "signatureAcheteurAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "estComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "attestations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "attestations_rachatId_key" ON "attestations"("rachatId");
CREATE UNIQUE INDEX "attestations_numero_key" ON "attestations"("numero");

-- IdentiteDocuments
CREATE TABLE "identite_documents" (
    "id" TEXT NOT NULL,
    "rachatId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "typePiece" TEXT NOT NULL,
    "numeroPiece" TEXT NOT NULL,
    "dateDelivrance" TEXT NOT NULL,
    "lieuDelivrance" TEXT NOT NULL,
    "fichierRectoUuid" TEXT,
    "fichierVersoUuid" TEXT,
    "fichierRectoMime" TEXT,
    "fichierVersoMime" TEXT,
    "fichierRectoIv" TEXT,
    "fichierRectoTag" TEXT,
    "fichierVersoIv" TEXT,
    "fichierVersoTag" TEXT,
    "consentementTraitement" BOOLEAN NOT NULL DEFAULT false,
    "consentementConservation" BOOLEAN NOT NULL DEFAULT false,
    "consentementAt" TIMESTAMP(3),
    "purgeAt" TIMESTAMP(3) NOT NULL,
    "purgee" BOOLEAN NOT NULL DEFAULT false,
    "purgeeAt" TIMESTAMP(3),
    "uploadIp" TEXT,
    "uploadUa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "identite_documents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "identite_documents_rachatId_key" ON "identite_documents"("rachatId");

-- RibDocuments
CREATE TABLE "rib_documents" (
    "id" TEXT NOT NULL,
    "rachatId" TEXT NOT NULL,
    "fichierUuid" TEXT NOT NULL,
    "fichierMime" TEXT NOT NULL,
    "fichierIv" TEXT NOT NULL,
    "fichierTag" TEXT NOT NULL,
    "uploadIp" TEXT,
    "uploadUa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rib_documents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rib_documents_rachatId_key" ON "rib_documents"("rachatId");

-- ChatConversations
CREATE TABLE "chat_conversations" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- ChatMessages
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exhaust_models" ADD CONSTRAINT "exhaust_models_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "exhaust_brands"("id") ON UPDATE CASCADE;
ALTER TABLE "exhaust_prices" ADD CONSTRAINT "exhaust_prices_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "exhaust_models"("id") ON UPDATE CASCADE;
ALTER TABLE "rachats" ADD CONSTRAINT "rachats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "rachats" ADD CONSTRAINT "rachats_exhaustModelId_fkey" FOREIGN KEY ("exhaustModelId") REFERENCES "exhaust_models"("id") ON UPDATE CASCADE;
ALTER TABLE "attestations" ADD CONSTRAINT "attestations_rachatId_fkey" FOREIGN KEY ("rachatId") REFERENCES "rachats"("id") ON UPDATE CASCADE;
ALTER TABLE "identite_documents" ADD CONSTRAINT "identite_documents_rachatId_fkey" FOREIGN KEY ("rachatId") REFERENCES "rachats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rib_documents" ADD CONSTRAINT "rib_documents_rachatId_fkey" FOREIGN KEY ("rachatId") REFERENCES "rachats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
