import { CheckCircle } from "lucide-react";

export default function ValidationOkPage() {
  return (
    <div className="min-h-screen bg-exhaust-dark flex items-center justify-center text-center">
      <div>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Rachat validé !</h1>
        <p className="text-gray-400 mt-2">Le statut a été mis à jour et le client a été notifié.</p>
      </div>
    </div>
  );
}
