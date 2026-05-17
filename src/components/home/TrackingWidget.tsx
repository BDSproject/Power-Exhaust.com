"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

interface Props {
  placeholder: string;
  btnLabel: string;
}

export default function TrackingWidget({ placeholder, btnLabel }: Props) {
  const [ref, setRef] = useState("");
  const router = useRouter();

  const go = () => {
    const v = ref.trim();
    if (v) router.push(`/suivi?ref=${encodeURIComponent(v)}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder={placeholder}
          className="w-full bg-[#1a1a1a] border border-white/10 focus:border-exhaust-orange/60 rounded-xl pl-11 pr-4 py-4 text-white placeholder:text-gray-500 text-sm outline-none transition-colors"
        />
      </div>
      <button
        onClick={go}
        disabled={!ref.trim()}
        className="flex items-center justify-center gap-2 bg-exhaust-orange hover:bg-exhaust-orange-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-4 rounded-xl transition-all whitespace-nowrap"
      >
        {btnLabel} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
