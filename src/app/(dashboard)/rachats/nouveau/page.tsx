import type { Metadata } from "next";
import { RachatForm } from "@/components/forms/RachatForm";

export const metadata: Metadata = {
  title: "Nouvelle demande de rachat",
};

export default function NouvelleDemanPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande de rachat</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Remplissez le formulaire ci-dessous pour soumettre votre ligne d&apos;échappement au rachat. 
          Nous vous répondrons sous 24h ouvrées.
        </p>
      </div>
      <RachatForm />
    </div>
  );
}
