"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { AttestationType, RachatType } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Styles PDF ───────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
    padding: 0,
  },
  // En-tête
  header: {
    backgroundColor: "#1C69D4",
    padding: "30px 40px 25px",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  companyName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
  companySubtitle: {
    fontSize: 9,
    color: "#9FC9EF",
    marginTop: 3,
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "right",
  },
  docNumber: {
    fontSize: 9,
    color: "#9FC9EF",
    marginTop: 4,
  },
  // Bandeau bleu clair
  subHeader: {
    backgroundColor: "#E8F1FB",
    padding: "12px 40px",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "2px solid #1C69D4",
  },
  subHeaderText: {
    fontSize: 9,
    color: "#1C69D4",
    fontFamily: "Helvetica-Bold",
  },
  // Corps du document
  body: {
    padding: "30px 40px",
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1C69D4",
    borderBottom: "1.5px solid #1C69D4",
    paddingBottom: 5,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Grille 2 colonnes
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  col: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    borderRadius: 6,
    padding: "12px 14px",
    border: "1px solid #DDE8F7",
  },
  fieldLabel: {
    fontSize: 8,
    color: "#6B7280",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 10,
    color: "#1a1a1a",
    fontFamily: "Helvetica-Bold",
  },
  // Prix en évidence
  priceBox: {
    backgroundColor: "#1C69D4",
    borderRadius: 8,
    padding: "16px 20px",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: "#9FC9EF",
    fontFamily: "Helvetica-Bold",
  },
  priceValue: {
    fontSize: 24,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  // Texte légal
  legalBox: {
    backgroundColor: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: 6,
    padding: "12px 14px",
    marginBottom: 20,
  },
  legalText: {
    fontSize: 8.5,
    color: "#92400E",
    lineHeight: 1.6,
  },
  // Signatures
  signatureSection: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },
  signatureBox: {
    flex: 1,
    border: "1.5px solid #E5E7EB",
    borderRadius: 8,
    padding: "14px",
    minHeight: 120,
  },
  signatureTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  signatureImage: {
    height: 70,
    objectFit: "contain",
  },
  signatureLine: {
    borderTop: "1px dashed #9CA3AF",
    marginTop: 10,
    paddingTop: 4,
  },
  signatureDate: {
    fontSize: 7.5,
    color: "#6B7280",
    textAlign: "center",
  },
  // Pied de page
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTop: "1px solid #E5E7EB",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    color: "#9CA3AF",
  },
  footerBrand: {
    fontSize: 8,
    color: "#1C69D4",
    fontFamily: "Helvetica-Bold",
  },
  // Badge état
  stateBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 4,
    padding: "2px 8px",
    border: "1px solid #86EFAC",
  },
  stateBadgeText: {
    fontSize: 8,
    color: "#166534",
    fontFamily: "Helvetica-Bold",
  },
});

// ─── Helper ───────────────────────────────────
function formatPDF(date: Date | string) {
  return format(new Date(date), "dd MMMM yyyy", { locale: fr });
}

function formatPricePDF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

const ETAT_LABELS: Record<string, string> = {
  EXCELLENT: "Excellent",
  BON: "Bon état",
  MOYEN: "État moyen",
  MAUVAIS: "Mauvais état",
};

// ─── Composant PDF ────────────────────────────
interface AttestationPDFProps {
  attestation: AttestationType;
  rachat: RachatType;
}

export function AttestationPDF({ attestation, rachat }: AttestationPDFProps) {
  return (
    <Document
      title={`Attestation de vente ${attestation.numero}`}
      author="Alchimiste BMW"
      subject="Attestation de cession de ligne d'échappement"
      creator="Alchimiste BMW - alchimistebmw.com"
      keywords="attestation, rachat, échappement, cession"
    >
      <Page size="A4" style={styles.page}>
        {/* ── EN-TÊTE ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>ALCHIMISTE BMW</Text>
            <Text style={styles.companySubtitle}>
              {"RACHAT DE LIGNES D'ÉCHAPPEMENT — TOUS MODÈLES"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>ATTESTATION DE VENTE</Text>
            <Text style={styles.docNumber}>N° {attestation.numero}</Text>
          </View>
        </View>

        {/* ── SOUS-EN-TÊTE ── */}
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>
            Date : {formatPDF(attestation.dateVente)}
          </Text>
          <View style={styles.stateBadge}>
            <Text style={styles.stateBadgeText}>
              {attestation.estComplete ? "✓ SIGNÉ" : "EN COURS DE SIGNATURE"}
            </Text>
          </View>
          <Text style={styles.subHeaderText}>
            Réf. rachat : {rachat.reference.substring(0, 8).toUpperCase()}
          </Text>
        </View>

        {/* ── CORPS ── */}
        <View style={styles.body}>
          {/* Prix */}
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>MONTANT DE LA CESSION</Text>
            <Text style={styles.priceValue}>
              {formatPricePDF(attestation.prixFinal)}
            </Text>
          </View>

          {/* Parties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parties</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Le Vendeur</Text>
                <Text style={styles.fieldValue}>
                  {rachat.prenomVendeur} {rachat.nomVendeur}
                </Text>
                <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 4 }}>
                  {rachat.emailVendeur}
                </Text>
                <Text style={{ fontSize: 9, color: "#6B7280" }}>
                  {rachat.telVendeur}
                </Text>
                <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 2 }}>
                  {rachat.adresseVendeur}
                </Text>
                <Text style={{ fontSize: 9, color: "#6B7280" }}>
                  {rachat.codePostalVendeur} {rachat.villeVendeur}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>{"L'Acheteur"}</Text>
                <Text style={styles.fieldValue}>ALCHIMISTE BMW</Text>
                <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 4 }}>
                  contact@alchimistebmw.com
                </Text>
                <Text style={{ fontSize: 9, color: "#6B7280" }}>
                  SIRET : XXX XXX XXX XXXXX
                </Text>
                <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 2 }}>
                  {"XXX Rue de l'Alchimiste"}
                </Text>
                <Text style={{ fontSize: 9, color: "#6B7280" }}>
                  75000 Paris
                </Text>
              </View>
            </View>
          </View>

          {/* Pièce cédée */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Désignation de la pièce cédée</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Marque du véhicule</Text>
                <Text style={styles.fieldValue}>{rachat.marque}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Modèle</Text>
                <Text style={styles.fieldValue}>{rachat.modele}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Année</Text>
                <Text style={styles.fieldValue}>{rachat.annee}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Immatriculation</Text>
                <Text style={styles.fieldValue}>{rachat.immatriculation}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>{"Type d'échappement"}</Text>
                <Text style={styles.fieldValue}>{rachat.typeEchappement}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>État au moment de la cession</Text>
                <Text style={styles.fieldValue}>
                  {ETAT_LABELS[rachat.etatEchappement] ?? rachat.etatEchappement}
                </Text>
              </View>
            </View>
            {rachat.description && (
              <View style={[styles.col, { marginBottom: 0 }]}>
                <Text style={styles.fieldLabel}>Description complémentaire</Text>
                <Text style={{ fontSize: 9, color: "#374151", lineHeight: 1.5 }}>
                  {rachat.description}
                </Text>
              </View>
            )}
          </View>

          {/* Clause légale */}
          <View style={styles.legalBox}>
            <Text style={styles.legalText}>
              {`Le vendeur déclare être l'unique propriétaire de la pièce décrite ci-dessus, libre de tout gage, nantissement ou opposition, et certifie l'exactitude des informations fournies. La présente attestation vaut contrat de cession entre les parties. Conformément au Code Civil, la propriété est transférée dès la signature des deux parties.`}
            </Text>
          </View>

          {/* Signatures */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Signatures des parties</Text>
            <View style={styles.signatureSection}>
              {/* Vendeur */}
              <View style={styles.signatureBox}>
                <Text style={styles.signatureTitle}>
                  Signature du vendeur{"\n"}
                  {rachat.prenomVendeur} {rachat.nomVendeur}
                </Text>
                {attestation.signatureVendeur ? (
                  <Image
                    src={attestation.signatureVendeur}
                    style={styles.signatureImage}
                    // @ts-expect-error react-pdf Image alt not typed
                    alt=""
                  />
                ) : (
                  <View style={{ height: 60 }} />
                )}
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureDate}>
                    {attestation.signatureVendeurAt
                      ? formatPDF(attestation.signatureVendeurAt)
                      : "Date et signature"}
                  </Text>
                </View>
              </View>

              {/* Acheteur */}
              <View style={styles.signatureBox}>
                <Text style={styles.signatureTitle}>
                  {"Signature de l'acheteur\nAlchimiste BMW"}
                </Text>
                {attestation.signatureAcheteur ? (
                  <Image
                    src={attestation.signatureAcheteur}
                    style={styles.signatureImage}
                    // @ts-expect-error react-pdf Image alt not typed
                    alt=""
                  />
                ) : (
                  <View style={{ height: 60 }} />
                )}
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureDate}>
                    {attestation.signatureAcheteurAt
                      ? formatPDF(attestation.signatureAcheteurAt)
                      : "Date et signature"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── PIED DE PAGE ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>ALCHIMISTE BMW</Text>
          <Text style={styles.footerText}>
            Document généré le {format(new Date(), "dd/MM/yyyy à HH:mm")} —
            alchimistebmw.com
          </Text>
          <Text style={styles.footerText}>{attestation.numero}</Text>
        </View>
      </Page>
    </Document>
  );
}
