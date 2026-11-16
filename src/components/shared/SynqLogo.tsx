import React from "react";
import { cn } from "@/lib/utils";

interface SynqLogoProps {
  size?: number;
  variant?: "full" | "icon" | "mark";
  showText?: boolean;
  animated?: boolean;
  className?: string;
  textClassName?: string;
}

export function SynqLogo({
  size = 40,
  variant = "full",
  showText = true,
  animated = false,
  className,
  textClassName,
}: SynqLogoProps) {
  const iconSize = variant === "full" ? Math.round(size * 0.95) : size;
  const gradientId = `synq-gemini-${iconSize}-${Math.random().toString(36).substr(2, 5)}`;
  const filterId = `sparkle-glow-${iconSize}-${Math.random().toString(36).substr(2, 5)}`;

  const iconElement = (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden transition-all duration-300",
        animated ? "synq-logo-animated" : "hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]",
        className
      )}
      style={{
        width: iconSize,
        height: iconSize,
        background: "linear-gradient(135deg, #080C14 0%, #151028 50%, #0A0E17 100%)",
        boxShadow:
          "0 8px 24px -4px rgba(139, 92, 246, 0.5), 0 0 16px -2px rgba(6, 182, 212, 0.35), 0 0 16px -2px rgba(236, 72, 153, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
        border: "1px solid rgba(168, 85, 247, 0.4)",
      }}
    >
      {/* Background ambient radial glow (Cyan, Purple, Pink) */}
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.4) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.4) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.5) 0%, transparent 80%)",
        }}
      />

      <svg
        width={Math.round(iconSize * 0.74)}
        height={Math.round(iconSize * 0.74)}
        viewBox="0 0 512 512"
        fill="none"
        className={cn("relative z-10", animated && "synq-sparkle-breathing")}
      >
        <defs>
          {/* Gemini Signature: Electric Cyan -> Vivid Purple -> Neon Pink */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="25%" stopColor="#38BDF8" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="78%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbiting Sync Arcs (Cyan top, Pink bottom) */}
        <path
          d="M 120 256 C 120 180, 200 130, 280 145 C 330 155, 375 190, 390 240"
          stroke="#06B6D4"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="24 18"
          opacity="0.75"
        />
        <path
          d="M 392 256 C 392 332, 312 382, 232 367 C 182 357, 137 322, 122 272"
          stroke="#EC4899"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="24 18"
          opacity="0.75"
        />

        {/* Gemini 4-Point Celestial Sparkle */}
        <g filter={`url(#${filterId})`}>
          <path
            d="M 256 68
               C 256 180, 290 220, 432 256
               C 290 292, 256 332, 256 444
               C 256 332, 222 292, 80 256
               C 222 220, 256 180, 256 68 Z"
            fill={`url(#${gradientId})`}
          />
        </g>
        <circle cx="256" cy="256" r="30" fill="#FFFFFF" opacity="0.95" />

        {/* Top-Right Satellite Sparkle (Electric Cyan) */}
        <g transform="translate(115, -115)">
          <path
            d="M 256 180
               C 256 225, 270 240, 325 256
               C 270 272, 256 287, 256 332
               C 256 287, 242 272, 187 256
               C 242 240, 256 225, 256 180 Z"
            fill="#06B6D4"
          />
          <circle cx="256" cy="256" r="14" fill="#FFFFFF" />
        </g>

        {/* Bottom-Left Satellite Sparkle (Neon Pink) */}
        <g transform="translate(-105, 105) scale(0.72)">
          <path
            d="M 256 185
               C 256 226, 268 240, 315 256
               C 268 272, 256 286, 256 327
               C 256 286, 244 272, 197 256
               C 244 240, 256 226, 256 185 Z"
            fill="#EC4899"
          />
          <circle cx="256" cy="256" r="13" fill="#FFFFFF" />
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
                background: "linear-gradient(135deg, #06B6D4 0%, #38BDF8 25%, #8B5CF6 60%, #EC4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 12px rgba(139, 92, 246, 0.45))",
              }}
            >
              POS
            </span>
            <span className="ml-1 text-[#06B6D4] text-[10px] animate-pulse">✦</span>
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
