"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { rachatSchema, type RachatFormData } from "@/lib/validations";
import { Input, Select, Textarea, Button, Alert, Card, CardContent, CardHeader } from "@/components/ui";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const MARQUES = [
  "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Porsche",
  "Renault", "Peugeot", "Citroën", "Ford", "Opel",
  "Toyota", "Honda", "Nissan", "Mazda", "Subaru",
  "Lamborghini", "Ferrari", "Maserati", "Autre",
].map((m) => ({ value: m, label: m }));

const ANNEES = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

const TYPES_ECHAPPEMENT = [
  { value: "Échappement Sport", label: "Échappement Sport" },
  { value: "Collecteur", label: "Collecteur" },
  { value: "Ligne complète", label: "Ligne complète" },
  { value: "Cat-back", label: "Cat-back" },
  { value: "Axle-back", label: "Axle-back" },
  { value: "Downpipe", label: "Downpipe" },
  { value: "Catalyseur sport", label: "Catalyseur sport" },
  { value: "Silencieux", label: "Silencieux arrière" },
  { value: "Autre", label: "Autre" },
];

const ETATS = [
  { value: "EXCELLENT", label: "Excellent état" },
  { value: "BON", label: "Bon état" },
  { value: "MOYEN", label: "État moyen" },
  { value: "MAUVAIS", label: "Mauvais état" },
];

interface RachatFormProps {
  defaultValues?: Partial<RachatFormData>;
}

export function RachatForm({ defaultValues }: RachatFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RachatFormData>({
    resolver: zodResolver(rachatSchema),
    defaultValues,
    mode: "onChange",
  });

  const nextStep = async () => {
    const fields: (keyof RachatFormData)[][] = [
      ["nomVendeur", "prenomVendeur", "emailVendeur", "telVendeur", "adresseVendeur", "villeVendeur", "codePostalVendeur"],
      ["marque", "modele", "annee", "immatriculation", "kilometrage", "typeEchappement", "etatEchappement"],
    ];

    const valid = await trigger(fields[step - 1]);
    if (valid) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const onSubmit = async (data: RachatFormData) => {
    setError(null);
    try {
      const res = await fetch("/api/rachat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Erreur lors de la soumission");
        return;
      }

      router.push(`/rachats/${json.id}?success=true`);
    } catch {
      setError("Une erreur réseau est survenue");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[
            { n: 1, label: "Vos informations" },
            { n: 2, label: "Le véhicule" },
            { n: 3, label: "Récapitulatif" },
          ].map((s) => (
            <div key={s.n} className="flex flex-col items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s.n
                    ? "bg-bmw-blue text-white shadow-bmw"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <p
                className={`text-xs mt-1.5 font-medium hidden sm:block ${
                  step >= s.n ? "text-bmw-blue" : "text-gray-500"
                }`}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-bmw-blue to-bmw-light rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {error && <Alert type="error" className="mb-5">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Étape 1 — Informations vendeur */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-bmw-blue text-white text-sm flex items-center justify-center font-bold">1</span>
                Vos informations personnelles
              </h2>
              <p className="text-sm text-gray-600 mt-1">Ces informations figureront sur l’attestation de vente</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nom"
                  placeholder="Dupont"
                  error={errors.nomVendeur?.message}
                  required
                  {...register("nomVendeur")}
                />
                <Input
                  label="Prénom"
                  placeholder="Jean"
                  error={errors.prenomVendeur?.message}
                  required
                  {...register("prenomVendeur")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="jean@exemple.fr"
                  error={errors.emailVendeur?.message}
                  required
                  {...register("emailVendeur")}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  placeholder="0612345678"
                  error={errors.telVendeur?.message}
                  required
                  {...register("telVendeur")}
                />
              </div>
              <Input
                label="Adresse"
                placeholder="12 Rue de la Paix"
                error={errors.adresseVendeur?.message}
                required
                {...register("adresseVendeur")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Code postal"
                  placeholder="75001"
                  error={errors.codePostalVendeur?.message}
                  required
                  {...register("codePostalVendeur")}
                />
                <Input
                  label="Ville"
                  placeholder="Paris"
                  error={errors.villeVendeur?.message}
                  required
                  {...register("villeVendeur")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2 — Informations véhicule */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-bmw-blue text-white text-sm flex items-center justify-center font-bold">2</span>
                Informations sur l'échappement
              </h2>
              <p className="text-sm text-gray-600 mt-1">Décrivez précisément votre échappement moto</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Marque du véhicule"
                  options={MARQUES}
                  placeholder="Sélectionner..."
                  error={errors.marque?.message}
                  required
                  {...register("marque")}
                />
                <Input
                  label="Modèle"
                  placeholder="M3, Golf GTI, Clio RS..."
                  error={errors.modele?.message}
                  required
                  {...register("modele")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Année"
                  options={ANNEES}
                  placeholder="Sélectionner..."
                  error={errors.annee?.message}
                  required
                  {...register("annee", { valueAsNumber: true })}
                />
                <Input
                  label="Immatriculation"
                  placeholder="AB-123-CD"
                  error={errors.immatriculation?.message}
                  required
                  {...register("immatriculation")}
                />
              </div>
              <Input
                label="Kilométrage"
                type="number"
                placeholder="80000"
                error={errors.kilometrage?.message}
                required
                hint="En kilomètres"
                {...register("kilometrage", { valueAsNumber: true })}
              />
              <Select
                label="Type d'échappement"
                options={TYPES_ECHAPPEMENT}
                placeholder="Sélectionner le type..."
                error={errors.typeEchappement?.message}
                required
                {...register("typeEchappement")}
              />
              <Select
                label="État de l'échappement"
                options={ETATS}
                placeholder="Évaluer l'état..."
                error={errors.etatEchappement?.message}
                required
                {...register("etatEchappement")}
              />
              <Textarea
                label="Description complémentaire (optionnel)"
                placeholder="Marque de l'échappement, modifications, historique, défauts éventuels..."
                {...register("description")}
              />
            </CardContent>
          </Card>
        )}

        {/* Étape 3 — Récapitulatif */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-bmw-blue text-white text-sm flex items-center justify-center font-bold">3</span>
                Récapitulatif & envoi
              </h2>
              <p className="text-sm text-gray-600 mt-1">Vérifiez vos informations avant d’envoyer la demande</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-bmw-blue text-sm">Vendeur</h3>
                <p className="text-sm text-gray-700">
                  {watch("prenomVendeur")} {watch("nomVendeur")}
                </p>
                <p className="text-sm text-gray-600">{watch("emailVendeur")} — {watch("telVendeur")}</p>
                <p className="text-sm text-gray-600">
                  {watch("adresseVendeur")}, {watch("codePostalVendeur")} {watch("villeVendeur")}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">Échappement</h3>
                <p className="text-sm text-gray-700">
                  {watch("marque")} {watch("modele")} ({watch("annee")})
                </p>
                <p className="text-sm text-gray-600">
                  {watch("immatriculation")} — {watch("kilometrage")?.toLocaleString()} km
                </p>
                <p className="text-sm text-gray-600">{watch("typeEchappement")}</p>
                <p className="text-sm text-gray-600">État : {ETATS.find(e => e.value === watch("etatEchappement"))?.label}</p>
                {watch("description") && (
                  <p className="text-sm text-gray-500 italic">"{watch("description")}"</p>
                )}
              </div>

              <Alert type="info">
                Notre équipe analysera votre demande et vous contactera sous <strong>24 à 48h ouvrées</strong> avec une offre de rachat.
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Navigation entre étapes */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4" /> Retour
            </Button>
          )}
          {step < totalSteps ? (
            <Button type="button" onClick={nextStep} className="flex-1">
              Suivant <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="submit" isLoading={isSubmitting} className="flex-1" size="lg">
              Envoyer ma demande
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
