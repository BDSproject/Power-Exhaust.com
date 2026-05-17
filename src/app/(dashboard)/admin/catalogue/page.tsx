"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2, Plus, Trash2, Pencil, Check, X, Upload,
  Download, AlertTriangle, ChevronDown, ChevronRight,
  Table2, FolderTree,
} from "lucide-react";

interface ExhaustPrice {
  id: string;
  etat: "EXCELLENT" | "BON" | "MOYEN" | "MAUVAIS";
  prix: number;
  isActive: boolean;
}
interface ExhaustModel {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  anneeDebut: number | null;
  anneeFin: number | null;
  prices: ExhaustPrice[];
}
interface ExhaustBrand {
  id: string;
  name: string;
  slug: string;
  logoEmoji: string | null;
  origine: string | null;
  isActive: boolean;
  models: ExhaustModel[];
}

type Tab = "table" | "tree";

function EditableCell({
  value,
  onSave,
  type = "text",
  className = "",
}: {
  value: string | number | null;
  onSave: (v: string) => Promise<void>;
  type?: "text" | "number";
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setDraft(String(value ?? ""));
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const cancel = () => setEditing(false);
  const save = async () => {
    setSaving(true);
    try { await onSave(draft); setEditing(false); }
    finally { setSaving(false); }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="w-full bg-[#2a2a2a] border border-exhaust-orange/50 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-exhaust-orange"
          style={{ minWidth: 60 }}
        />
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-exhaust-orange flex-shrink-0" />
        ) : (
          <>
            <button onClick={save} className="text-green-400 hover:text-green-300 flex-shrink-0">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={cancel} className="text-gray-500 hover:text-gray-400 flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <span
      onClick={open}
      className={`cursor-pointer rounded px-1.5 py-0.5 hover:bg-white/8 transition-colors group flex items-center gap-1 ${className}`}
      title="Cliquer pour modifier"
    >
      <span>{value !== null && value !== undefined ? value : <span className="text-gray-600 italic text-xs">—</span>}</span>
      <Pencil className="w-2.5 h-2.5 text-gray-600 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0" />
    </span>
  );
}

export default function AdminCataloguePage() {
  const [brands, setBrands] = useState<ExhaustBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("table");
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "brand" | "model";
    id: string;
    name: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRow, setNewRow] = useState({
    marque: "", modele: "", type: "slip-on",
    anneeDebut: "", anneeFin: "",
    prixExcellent: "", prixBon: "", prixMoyen: "", prixMauvais: "",
  });

  const showMsg = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalogue");
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      setBrands(data.brands ?? []);
    } catch {
      showMsg("Impossible de charger le catalogue", true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const api = async (body: object) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/catalogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      return data;
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = async (priceId: string, prix: string) => {
    await api({ action: "update_price", priceId, prix: parseFloat(prix) });
    await load();
    showMsg("Prix mis à jour");
  };

  const updateModel = async (modelId: string, field: string, value: string) => {
    const parsed = field.includes("annee") ? (value ? parseInt(value) : null) : value;
    await api({ action: "update_model", modelId, [field]: parsed });
    await load();
    showMsg("Modèle mis à jour");
  };

  const toggleModelActive = async (modelId: string, isActive: boolean) => {
    await api({ action: "update_model", modelId, isActive: !isActive });
    await load();
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    try {
      const action = deleteTarget.type === "brand" ? "delete_brand" : "delete_model";
      const key = `${deleteTarget.type}Id`;
      await api({ action, [key]: deleteTarget.id });
      showMsg(`${deleteTarget.type === "brand" ? "Marque" : "Modèle"} supprimé(e)`);
      setDeleteTarget(null);
      await load();
    } catch (e: unknown) {
      showMsg((e instanceof Error ? e.message : "Erreur suppression"), true);
      setDeleteTarget(null);
    }
  };

  const addRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.marque || !newRow.modele) return showMsg("Marque et modèle requis", true);
    try {
      await api({
        action: "import_csv",
        rows: [{
          marque: newRow.marque,
          modele: newRow.modele,
          type: newRow.type,
          anneeDebut: newRow.anneeDebut ? parseInt(newRow.anneeDebut) : null,
          anneeFin: newRow.anneeFin ? parseInt(newRow.anneeFin) : null,
          prixExcellent: newRow.prixExcellent ? parseFloat(newRow.prixExcellent) : 0,
          prixBon: newRow.prixBon ? parseFloat(newRow.prixBon) : 0,
          prixMoyen: newRow.prixMoyen ? parseFloat(newRow.prixMoyen) : 0,
          prixMauvais: newRow.prixMauvais ? parseFloat(newRow.prixMauvais) : 0,
        }],
      });
      showMsg("Ligne ajoutée");
      setNewRow({ marque: "", modele: "", type: "slip-on", anneeDebut: "", anneeFin: "", prixExcellent: "", prixBon: "", prixMoyen: "", prixMauvais: "" });
      setShowAddForm(false);
      await load();
    } catch (e: unknown) {
      showMsg((e instanceof Error ? e.message : "Erreur ajout"), true);
    }
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const rows = lines.slice(1).map((line) => {
        const [marque, modele, type, anneeDebut, anneeFin, prixExcellent, prixBon, prixMoyen, prixMauvais] = line.split(";");
        return {
          marque, modele, type,
          anneeDebut: anneeDebut ? parseInt(anneeDebut) : null,
          anneeFin: anneeFin ? parseInt(anneeFin) : null,
          prixExcellent: parseFloat(prixExcellent) || 0,
          prixBon: parseFloat(prixBon) || 0,
          prixMoyen: parseFloat(prixMoyen) || 0,
          prixMauvais: parseFloat(prixMauvais) || 0,
        };
      });
      try {
        const result = await api({ action: "import_csv", rows });
        showMsg(`Import terminé : ${result.created} créés, ${result.updated} mis à jour`);
        await load();
      } catch (err: unknown) {
        showMsg((err instanceof Error ? err.message : "Erreur import"), true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportCSV = () => {
    const rows: string[] = ["marque;modele;type;anneeDebut;anneeFin;prixExcellent;prixBon;prixMoyen;prixMauvais"];
    brands.forEach((b) => {
      b.models.forEach((m) => {
        const p = (etat: string) => m.prices.find((px) => px.etat === etat)?.prix ?? 0;
        rows.push([b.name, m.name, m.type, m.anneeDebut ?? "", m.anneeFin ?? "", p("EXCELLENT"), p("BON"), p("MOYEN"), p("MAUVAIS")].join(";"));
      });
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalogue_prix.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const flatRows = brands.flatMap((b) => b.models.map((m) => ({ brand: b, model: m })));

  const ETAT_COLORS: Record<string, string> = {
    EXCELLENT: "text-green-400",
    BON: "text-blue-400",
    MOYEN: "text-amber-400",
    MAUVAIS: "text-red-400",
  };

  const TREE_COLORS: Record<string, string> = {
    EXCELLENT: "text-green-400 border-green-400/20",
    BON: "text-blue-400 border-blue-400/20",
    MOYEN: "text-amber-400 border-amber-400/20",
    MAUVAIS: "text-red-400 border-red-400/20",
  };

  const ETAT_LABELS: Record<string, string> = {
    EXCELLENT: "Excellent", BON: "Bon", MOYEN: "Moyen", MAUVAIS: "Mauvais",
  };

  return (
    <div className="p-6 space-y-6 text-white min-h-screen bg-[#0d0d0d]">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Catalogue &amp; Prix</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {flatRows.length} modèle(s) — {brands.length} marque(s)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-exhaust-orange hover:bg-exhaust-orange/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
          <label
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <Upload className="w-4 h-4" /> Importer CSV
            <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
          </label>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-green-400"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <Check className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <form
          onSubmit={addRow}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h3 className="font-bold text-white text-sm">Nouveau modèle</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Marque *</label>
              <input
                value={newRow.marque}
                onChange={(e) => setNewRow((r) => ({ ...r, marque: e.target.value }))}
                list="brands-list"
                placeholder="Akrapovic"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-exhaust-orange/50"
                required
              />
              <datalist id="brands-list">
                {brands.map((b) => <option key={b.id} value={b.name} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Modèle *</label>
              <input
                value={newRow.modele}
                onChange={(e) => setNewRow((r) => ({ ...r, modele: e.target.value }))}
                placeholder="Evolution Line"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-exhaust-orange/50"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Type</label>
              <select
                value={newRow.type}
                onChange={(e) => setNewRow((r) => ({ ...r, type: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-exhaust-orange/50"
              >
                <option value="slip-on">Slip-on</option>
                <option value="ligne-complete">Ligne complète</option>
                <option value="collecteur">Collecteur</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">De</label>
                <input
                  type="number"
                  value={newRow.anneeDebut}
                  onChange={(e) => setNewRow((r) => ({ ...r, anneeDebut: e.target.value }))}
                  placeholder="2015"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-exhaust-orange/50"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">À</label>
                <input
                  type="number"
                  value={newRow.anneeFin}
                  onChange={(e) => setNewRow((r) => ({ ...r, anneeFin: e.target.value }))}
                  placeholder="2022"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-exhaust-orange/50"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "prixExcellent", label: "Excellent (€)", color: "text-green-400" },
              { key: "prixBon", label: "Bon (€)", color: "text-blue-400" },
              { key: "prixMoyen", label: "Moyen (€)", color: "text-amber-400" },
              { key: "prixMauvais", label: "Mauvais (€)", color: "text-red-400" },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <label className={`text-xs font-semibold block mb-1 ${color}`}>{label}</label>
                <input
                  type="number"
                  step="0.01"
                  value={(newRow as Record<string, string>)[key]}
                  onChange={(e) => setNewRow((r) => ({ ...r, [key]: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-exhaust-orange/50"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-exhaust-orange hover:bg-exhaust-orange/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Ajouter
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={() => setTab("table")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "table" ? "bg-exhaust-orange text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <Table2 className="w-4 h-4" /> Tableau des prix
        </button>
        <button
          onClick={() => setTab("tree")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "tree" ? "bg-exhaust-orange text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <FolderTree className="w-4 h-4" /> Arborescence
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-exhaust-orange" />
        </div>
      ) : tab === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Marque", "Modèle", "Type", "Années", "Excellent (€)", "Bon (€)", "Moyen (€)", "Mauvais (€)", "Actif", ""].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatRows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-600">
                      Catalogue vide. Ajoutez votre premier modèle.
                    </td>
                  </tr>
                )}
                {flatRows.map(({ brand, model }) => {
                  const price = (etat: string) => model.prices.find((p) => p.etat === etat);
                  return (
                    <tr
                      key={model.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                      style={{ opacity: model.isActive ? 1 : 0.5 }}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {brand.logoEmoji && <span className="text-base">{brand.logoEmoji}</span>}
                          <span className="font-semibold text-white">{brand.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <EditableCell
                          value={model.name}
                          onSave={(v) => updateModel(model.id, "name", v)}
                          className="text-white"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-xs text-gray-400 px-2 py-1 rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          {model.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <EditableCell
                            value={model.anneeDebut}
                            onSave={(v) => updateModel(model.id, "anneeDebut", v)}
                            type="number"
                          />
                          <span>–</span>
                          <EditableCell
                            value={model.anneeFin}
                            onSave={(v) => updateModel(model.id, "anneeFin", v)}
                            type="number"
                          />
                        </div>
                      </td>
                      {(["EXCELLENT", "BON", "MOYEN", "MAUVAIS"] as const).map((etat) => {
                        const p = price(etat);
                        return (
                          <td key={etat} className="px-3 py-2.5">
                            {p ? (
                              <EditableCell
                                value={p.prix}
                                onSave={(v) => updatePrice(p.id, v)}
                                type="number"
                                className={ETAT_COLORS[etat]}
                              />
                            ) : (
                              <span className="text-gray-700 text-xs italic">N/A</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => toggleModelActive(model.id, model.isActive)}
                          className={`w-9 h-5 rounded-full transition-all relative ${model.isActive ? "bg-exhaust-orange" : "bg-white/15"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                              model.isActive ? "left-[18px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setDeleteTarget({ type: "model", id: model.id, name: `${brand.name} ${model.name}` })}
                          className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TREE VIEW */
        <div className="space-y-3">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={() => setExpandedBrand(expandedBrand === brand.id ? null : brand.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="flex items-center gap-3">
                  {brand.logoEmoji && <span className="text-xl">{brand.logoEmoji}</span>}
                  <div className="text-left">
                    <p className="font-bold text-white">{brand.name}</p>
                    <p className="text-xs text-gray-500">
                      {brand.models.length} modèle(s) · {brand.origine ?? "origine inconnue"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: "brand", id: brand.id, name: brand.name });
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedBrand === brand.id
                    ? <ChevronDown className="w-4 h-4 text-gray-500" />
                    : <ChevronRight className="w-4 h-4 text-gray-500" />
                  }
                </div>
              </button>
              {expandedBrand === brand.id && (
                <div className="border-t border-white/6">
                  {brand.models.length === 0 ? (
                    <p className="px-5 py-4 text-gray-600 text-sm italic">Aucun modèle</p>
                  ) : (
                    brand.models.map((model) => (
                      <div
                        key={model.id}
                        className="px-5 py-3 flex flex-wrap items-center gap-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
                      >
                        <div className="flex-1 min-w-40">
                          <p className="text-sm font-semibold text-white">{model.name}</p>
                          <p className="text-xs text-gray-500">
                            {model.type} · {model.anneeDebut ?? "?"} – {model.anneeFin ?? "?"}
                          </p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {model.prices.map((p) => (
                            <div
                              key={p.id}
                              className={`flex flex-col items-center px-3 py-1.5 rounded-lg border text-xs ${TREE_COLORS[p.etat]}`}
                            >
                              <span className="font-semibold">{ETAT_LABELS[p.etat]}</span>
                              <span className="font-black text-sm">{p.prix} €</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setDeleteTarget({ type: "model", id: model.id, name: `${brand.name} ${model.name}` })}
                          className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
          {brands.length === 0 && (
            <p className="text-center py-16 text-gray-600">Aucune marque dans le catalogue.</p>
          )}
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="rounded-2xl p-6 w-full max-w-sm mx-4 space-y-5"
            style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-white">Confirmer la suppression</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Supprimer{" "}
                  <span className="text-white font-semibold">{deleteTarget.name}</span> ?
                  {deleteTarget.type === "brand" &&
                    " Tous les modèles et prix associés seront également supprimés."}
                  {" Cette action est irréversible."}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={deleteItem}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
