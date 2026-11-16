import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LoadingScreenProps {
  show?: boolean;
  message?: string;
  subMessage?: string;
  minDuration?: number; // Minimum ms to display (default: 1000ms = 1 sec)
  onComplete?: () => void;
  fullScreen?: boolean;
}

export function LoadingScreen({
  show = true,
  message = "Loading SynqPOS…",
  subMessage = "AI Omnichannel POS & ERP",
  minDuration = 1000,
  onComplete,
  fullScreen = true,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(show);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!show) {
      setFading(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setFading(false);
        onComplete?.();
      }, 350);
      return () => clearTimeout(timer);
    }

    setVisible(true);
    setFading(false);
    setProgress(20);

    const startTime = performance.now();

    // Progress animation to 90% quickly, then 100% at minDuration
    const p1 = setTimeout(() => setProgress(55), minDuration * 0.25);
    const p2 = setTimeout(() => setProgress(85), minDuration * 0.65);
    const p3 = setTimeout(() => setProgress(100), minDuration * 0.9);

    const minTimer = setTimeout(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
          setFading(false);
          onComplete?.();
        }, 350);
      }, remaining);
    }, minDuration);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(minTimer);
    };
  }, [show, minDuration, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "z-[99999] flex flex-col items-center justify-center transition-all duration-300 ease-out select-none",
        fullScreen ? "fixed inset-0" : "relative w-full h-full min-h-[360px]",
        fading ? "opacity-0 scale-[1.02] blur-sm pointer-events-none" : "opacity-100 scale-100 blur-0",
        "synq-loading-backdrop"
      )}
      style={{
        background: "var(--synq-loader-bg, rgba(8, 12, 20, 0.94))",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* ── Ambient Radial Cosmic Halos (Cyan, Purple, Pink) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cyan Ambient Orb */}
        <div
          className="absolute w-[440px] h-[440px] rounded-full blur-[100px] opacity-40 synq-ambient-cyan pointer-events-none"
          style={{
            top: "20%",
            left: "25%",
            background: "radial-gradient(circle, #06B6D4 0%, rgba(6,182,212,0) 70%)",
          }}
        />
        {/* Purple Ambient Orb */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[110px] opacity-45 synq-ambient-purple pointer-events-none"
          style={{
            top: "30%",
            right: "20%",
            background: "radial-gradient(circle, #8B5CF6 0%, rgba(139,92,246,0) 70%)",
          }}
        />
        {/* Pink Ambient Orb */}
        <div
          className="absolute w-[420px] h-[420px] rounded-full blur-[100px] opacity-35 synq-ambient-pink pointer-events-none"
          style={{
            bottom: "15%",
            left: "40%",
            background: "radial-gradient(circle, #EC4899 0%, rgba(236,72,153,0) 70%)",
          }}
        />
      </div>

      {/* ── Main Loading Emblem Container ── */}
      <div className="relative flex flex-col items-center justify-center z-10 px-6 max-w-md w-full">
        {/* Rotating Cosmic Rings & Glowing Emblem */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          {/* Ring 1 (Outer): Electric Cyan Dashed Orbit */}
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#06B6D4]/40 synq-spin-clockwise"
            style={{
              filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.45))",
            }}
          />

          {/* Ring 2 (Middle): Neon Pink Dotted Orbit */}
          <div
            className="absolute inset-2.5 rounded-full border-2 border-dotted border-[#EC4899]/50 synq-spin-counter"
            style={{
              filter: "drop-shadow(0 0 10px rgba(236, 72, 153, 0.4))",
            }}
          />

          {/* Ring 3 (Inner): Vivid Purple Glowing Pulse Ring */}
          <div
            className="absolute inset-5 rounded-full border border-[#8B5CF6]/60 synq-ring-pulse"
            style={{
              boxShadow: "0 0 24px rgba(139, 92, 246, 0.5), inset 0 0 16px rgba(139, 92, 246, 0.3)",
            }}
          />

          {/* Center SynqPOS Core Icon */}
          <div
            className="relative w-20 h-20 rounded-3xl flex items-center justify-center overflow-hidden synq-emblem-float"
            style={{
              background: "linear-gradient(135deg, #0A0E17 0%, #15102A 50%, #080C14 100%)",
              border: "1px solid rgba(168, 85, 247, 0.5)",
              boxShadow:
                "0 0 35px -5px rgba(139, 92, 246, 0.65), 0 0 20px -3px rgba(6, 182, 212, 0.45), 0 0 20px -3px rgba(236, 72, 153, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Inner radiant backdrop */}
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.6) 0%, rgba(6, 182, 212, 0.3) 60%, transparent 100%)",
              }}
            />

            {/* Glowing SVG Emblem */}
            <svg
              width="50"
              height="50"
              viewBox="0 0 512 512"
              fill="none"
              className="relative z-10 synq-sparkle-breathing"
            >
              <defs>
                <linearGradient id="synq-loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="25%" stopColor="#38BDF8" />
                  <stop offset="55%" stopColor="#8B5CF6" />
                  <stop offset="80%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <filter id="synq-loader-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Orbiting Sync Arcs */}
              <path
                d="M 120 256 C 120 180, 200 130, 280 145 C 330 155, 375 190, 390 240"
                stroke="#06B6D4"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="24 18"
                opacity="0.8"
              />
              <path
                d="M 392 256 C 392 332, 312 382, 232 367 C 182 357, 137 322, 122 272"
                stroke="#EC4899"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="24 18"
                opacity="0.8"
              />

              {/* 4-Point Celestial Gemini Sparkle Star */}
              <g filter="url(#synq-loader-glow)">
                <path
                  d="M 256 65
                     C 256 180, 290 220, 435 256
                     C 290 292, 256 332, 256 447
                     C 256 332, 222 292, 77 256
                     C 222 220, 256 180, 256 65 Z"
                  fill="url(#synq-loader-grad)"
                />
              </g>
              <circle cx="256" cy="256" r="32" fill="#FFFFFF" opacity="0.95" />

              {/* Satellite Pulse Stars */}
              <g transform="translate(115, -115)">
                <path
                  d="M 256 180 C 256 225, 270 240, 325 256 C 270 272, 256 287, 256 332 C 256 287, 242 272, 187 256 C 242 240, 256 225, 256 180 Z"
                  fill="#06B6D4"
                />
                <circle cx="256" cy="256" r="14" fill="#FFFFFF" />
              </g>
              <g transform="translate(-105, 105) scale(0.7)">
                <path
                  d="M 256 190 C 256 228, 268 240, 310 256 C 268 272, 256 284, 256 322 C 256 284, 244 272, 202 256 C 244 240, 256 228, 256 190 Z"
                  fill="#EC4899"
                />
                <circle cx="256" cy="256" r="12" fill="#FFFFFF" />
              </g>
            </svg>
          </div>
        </div>

        {/* ── Brand Name with Shimmering Gradient ── */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-3xl font-black tracking-tight text-white">Synq</span>
          <span className="text-3xl font-black tracking-tight synq-shimmer-text">POS</span>
          <Sparkles className="w-4 h-4 text-[#06B6D4] animate-pulse ml-0.5" />
        </div>

        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6 text-[10px] font-bold tracking-[0.2em] text-purple-300 uppercase">
          {subMessage}
        </div>

        {/* ── Dynamic Status Message ── */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 h-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#06B6D4] shadow-[0_0_8px_#06B6D4]" />
          <span>{message}</span>
        </div>

        {/* ── Progress Track (Tricolor Cyan-Purple-Pink Gradient) ── */}
        <div className="w-64 h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner relative">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out synq-progress-bar relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glowing lead sparkle dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#FFFFFF,0_0_18px_#EC4899]" />
          </div>
        </div>

        {/* Subtle Bottom Tip */}
        <div className="text-[11px] font-medium text-slate-500 mt-4 tracking-wider flex items-center gap-1">
          <span>SECURE REALTIME RUNTIME</span>
          <span>·</span>
          <span className="text-[#06B6D4]">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
