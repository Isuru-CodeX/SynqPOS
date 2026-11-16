import React from "react";
import { cn } from "@/lib/utils";

interface SynqLogoProps {
  size?: number;
  variant?: "full" | "icon" | "mark";
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export function SynqLogo({
  size = 40,
  variant = "full",
  showText = true,
  className,
  textClassName,
}: SynqLogoProps) {
  const iconSize = variant === "full" ? Math.round(size * 0.95) : size;

  const iconElement = (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105",
        className
      )}
      style={{
        width: iconSize,
        height: iconSize,
        background: "linear-gradient(135deg, #0F172A 0%, #111827 50%, #0B0F19 100%)",
        boxShadow: "0 8px 24px -6px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(129, 140, 248, 0.35)",
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.45) 0%, rgba(56, 189, 248, 0.2) 60%, transparent 100%)",
        }}
      />

      <svg
        width={Math.round(iconSize * 0.72)}
        height={Math.round(iconSize * 0.72)}
        viewBox="0 0 512 512"
        fill="none"
        className="relative z-10"
      >
        <defs>
          <linearGradient id={`synq-gemini-${iconSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="35%" stop-color="#6366F1" />
            <stop offset="70%" stop-color="#A855F7" />
            <stop offset="100%" stop-color="#EC4899" />
          </linearGradient>
          <filter id={`sparkle-glow-${iconSize}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbiting Sync Arcs */}
        <path
          d="M 120 256 C 120 180, 200 130, 280 145 C 330 155, 375 190, 390 240"
          stroke="#38BDF8"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="24 18"
          opacity="0.45"
        />
        <path
          d="M 392 256 C 392 332, 312 382, 232 367 C 182 357, 137 322, 122 272"
          stroke="#EC4899"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="24 18"
          opacity="0.45"
        />

        {/* Gemini 4-Point Celestial Sparkle */}
        <g filter={`url(#sparkle-glow-${iconSize})`}>
          <path
            d="M 256 70
               C 256 180, 290 220, 430 256
               C 290 292, 256 332, 256 442
               C 256 332, 222 292, 82 256
               C 222 220, 256 180, 256 70 Z"
            fill={`url(#synq-gemini-${iconSize})`}
          />
        </g>
        <circle cx="256" cy="256" r="30" fill="#FFFFFF" opacity="0.95" />

        {/* Satellite Sync Pulse Star */}
        <g transform="translate(115, -115)">
          <path
            d="M 256 180
               C 256 225, 270 240, 325 256
               C 270 272, 256 287, 256 332
               C 256 287, 242 272, 187 256
               C 242 240, 256 225, 256 180 Z"
            fill="#38BDF8"
          />
          <circle cx="256" cy="256" r="14" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );

  if (variant === "icon") {
    return iconElement;
  }

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {iconElement}
      {showText && (
        <div className={cn("flex flex-col leading-none", textClassName)}>
          <div className="flex items-center">
            <span className="font-extrabold tracking-tight text-foreground" style={{ fontSize: size * 0.52 }}>
              Synq
            </span>
            <span
              className="font-black tracking-tight"
              style={{
                fontSize: size * 0.52,
                background: "linear-gradient(135deg, #38BDF8 0%, #818CF8 40%, #C084FC 75%, #F43F5E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              POS
            </span>
            <span className="ml-1 text-[#38BDF8] text-[10px] animate-pulse">✦</span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.22em] text-muted-foreground uppercase mt-0.5">
            AI Omnichannel
          </span>
        </div>
      )}
    </div>
  );
}

export default SynqLogo;
