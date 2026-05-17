"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

const FEATURE_META = [
  {
    id: 0,
    metric: "24h",
    color: "#E30613",
    bg: "from-red-600/8 to-red-500/5",
    border: "border-red-400/40",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.3" />
        <path d="M24 10v4M24 34v4M10 24h4M34 24h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2.5" />
        <path d="M20 24l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 1,
    metric: "48h",
    color: "#10B981",
    bg: "from-emerald-500/10 to-green-500/5",
    border: "border-emerald-400/40",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="6" y="12" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M6 20h36" stroke="currentColor" strokeWidth="2.5" />
        <path d="M14 28h8M14 32h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="34" cy="30" r="6" fill="currentColor" opacity="0.15" />
        <path d="M31 30l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 2,
    metric: "100%",
    color: "#6366F1",
    bg: "from-indigo-500/10 to-violet-500/5",
    border: "border-indigo-400/40",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path d="M12 6h18l10 10v26H12V6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M30 6v10h10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M18 22h12M18 28h12M18 34h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="33" cy="34" r="7" fill="currentColor" opacity="0.15" />
        <path d="M30 34l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 3,
    metric: "16+",
    color: "#F59E0B",
    bg: "from-amber-500/10 to-yellow-500/5",
    border: "border-amber-400/40",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" />
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 20l3 3-3 3M16 20l-3 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <circle cx="38" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M36 14l1.5 1.5L40 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 4,
    metric: "SSL",
    color: "#3B82F6",
    bg: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-400/40",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path d="M24 6L10 12v12c0 10 7 18 14 20 7-2 14-10 14-20V12L24 6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M19 24l3.5 3.5L30 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 5,
    metric: "2 min",
    color: "#EC4899",
    bg: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-400/40",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="10" y="8" width="28" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M18 18h12M18 24h12M18 30h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="34" cy="36" r="6" fill="currentColor" opacity="0.15" />
        <path d="M32 36l1.5 1.5L36 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const PROGRESS_DURATION = 4000;

export default function WhyUsInteractive() {
  const t = useTranslations("whyUs");
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const FEATURES = FEATURE_META.map((m) => ({
    ...m,
    title: t(`f${m.id}_title`),
    subtitle: t(`f${m.id}_sub`),
    desc: t(`f${m.id}_desc`),
    metricLabel: t(`f${m.id}_metricLabel`),
    steps: [t(`f${m.id}_s1`), t(`f${m.id}_s2`), t(`f${m.id}_s3`), t(`f${m.id}_s4`)],
  }));

  const startProgress = () => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 100 / (PROGRESS_DURATION / 50);
      });
    }, 50);
  };

  const next = () => {
    setActive((a) => (a + 1) % FEATURES.length);
    startProgress();
  };

  useEffect(() => {
    startProgress();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = setInterval(next, PROGRESS_DURATION);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused]);

  const select = (id: number) => {
    setActive(id);
    startProgress();
  };

  const f = FEATURES[active];

  return (
    <div className="mt-16 grid lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-exhaust-dark">
      {/* ── Left: feature list ── */}
      <div className="lg:col-span-2 bg-[#0E0E0E] p-6 flex flex-col gap-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">
          {t("commitments")}
        </p>
        {FEATURES.map((feat) => {
          const isActive = feat.id === active;
          return (
            <button
              key={feat.id}
              onClick={() => select(feat.id)}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className={`group relative w-full text-left rounded-xl px-4 py-3.5 transition-all duration-300 ${
                isActive
                  ? "bg-white/8 border border-white/10"
                  : "hover:bg-white/5 border border-transparent"
              }`}
              style={isActive ? { backgroundColor: `${feat.color}15`, borderColor: `${feat.color}30` } : {}}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    color: isActive ? feat.color : "#6B7280",
                    backgroundColor: isActive ? `${feat.color}20` : "transparent",
                  }}
                >
                  <div className="w-5 h-5">{feat.icon}</div>
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold truncate transition-colors duration-300 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {feat.title}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{feat.subtitle}</p>
                </div>
                {isActive && (
                  <div className="ml-auto flex-shrink-0">
                    <svg className="w-4 h-4" style={{ color: feat.color }} fill="none" viewBox="0 0 16 16">
                      <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Progress bar */}
              {isActive && (
                <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-none"
                    style={{ width: `${progress}%`, backgroundColor: feat.color }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Right: detail panel ── */}
      <div
        key={active}
        className="lg:col-span-3 bg-exhaust-gray p-8 md:p-10 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${f.color}20`, color: f.color }}
            >
              <div className="w-9 h-9">{f.icon}</div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black" style={{ color: f.color }}>
                {f.metric}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-0.5">{f.metricLabel}</p>
            </div>
          </div>

          <h3 className="text-2xl font-black text-white mb-3">{f.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2">
          {f.steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 bg-black/30 rounded-xl px-3.5 py-2.5 border ${f.border}`}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black"
                style={{ backgroundColor: f.color }}
              >
                {i + 1}
              </div>
              <span className="text-xs font-medium text-gray-300 leading-tight">{step}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-1.5">
            {FEATURES.map((feat) => (
              <button
                key={feat.id}
                onClick={() => select(feat.id)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: feat.id === active ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: feat.id === active ? f.color : "#374151",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => select((active - 1 + FEATURES.length) % FEATURES.length)}
              className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 16 16">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => select((active + 1) % FEATURES.length)}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${f.color}15`, borderColor: `${f.color}40`, color: f.color }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
