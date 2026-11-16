import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'
import { useBrandingStore } from '@/stores/branding'

type ColorSet = { primary: string; glow: string; sidebar: string; gradient: string }

const ACCENT_COLORS: Record<string, { light: ColorSet; dark: ColorSet }> = {
  gemini: {
    light: {
      primary: '243 75% 59%',
      glow: '258 90% 66%',
      sidebar: '243 75% 59%',
      gradient: 'linear-gradient(135deg, #0284C7 0%, #6366F1 50%, #A855F7 100%)',
    },
    dark: {
      primary: '243 85% 68%',
      glow: '265 89% 75%',
      sidebar: '243 85% 68%',
      gradient: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 45%, #A855F7 80%, #EC4899 100%)',
    },
  },
  azul: {
    light: { primary: '204 78% 35%', glow: '204 78% 48%', sidebar: '204 78% 55%', gradient: 'linear-gradient(135deg, hsl(204 78% 35%), hsl(204 78% 50%))' },
    dark:  { primary: '204 78% 52%', glow: '204 78% 62%', sidebar: '204 78% 60%', gradient: 'linear-gradient(135deg, hsl(204 78% 46%), hsl(204 78% 60%))' },
  },
  indigo: {
    light: { primary: '240 58% 50%', glow: '240 58% 63%', sidebar: '240 58% 68%', gradient: 'linear-gradient(135deg, hsl(240 58% 44%), hsl(240 58% 58%))' },
    dark:  { primary: '240 58% 65%', glow: '240 58% 75%', sidebar: '240 58% 70%', gradient: 'linear-gradient(135deg, hsl(240 58% 58%), hsl(240 58% 72%))' },
  },
  teal: {
    light: { primary: '175 65% 33%', glow: '175 65% 45%', sidebar: '175 65% 52%', gradient: 'linear-gradient(135deg, hsl(175 65% 28%), hsl(175 65% 44%))' },
    dark:  { primary: '175 65% 48%', glow: '175 65% 60%', sidebar: '175 65% 55%', gradient: 'linear-gradient(135deg, hsl(175 65% 42%), hsl(175 65% 57%))' },
  },
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const clean = hex.replace(/^#/, '')
  if (clean.length !== 6) return null
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function ThemeApplier() {
  const { mode, accent, spacing } = useThemeStore()
  const { primaryColor } = useBrandingStore()

  useEffect(() => {
    const root = document.documentElement
    
    // Apply dark or light mode based on user preference
    root.classList.toggle('dark', mode === 'dark')
    root.classList.toggle('spacing-compact', spacing === 'compacto')

    // Remove old class-based accent markers
    root.classList.remove('accent-indigo', 'accent-teal')

    let colors: ColorSet
    const isDark = mode === 'dark'

    if (accent === 'azul' && primaryColor) {
      const hsl = hexToHsl(primaryColor)
      const isBrandHue = hsl && hsl.s >= 35 && (hsl.h >= 150 && hsl.h <= 270)
      if (hsl && isBrandHue) {
        const glowL = Math.min(hsl.l + 11, 95)
        const sidebarL = Math.min(hsl.l + 20, 95)
        colors = {
          primary: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
          glow: `${hsl.h} ${hsl.s}% ${glowL}%`,
          sidebar: `${hsl.h} ${hsl.s}% ${sidebarL}%`,
          gradient: `linear-gradient(135deg, hsl(${hsl.h} ${hsl.s}% ${hsl.l}%), hsl(${hsl.h} ${hsl.s}% ${glowL}%))`,
        }
      } else {
        colors = isDark ? ACCENT_COLORS.gemini.dark : ACCENT_COLORS.gemini.light
      }
    } else {
      const palette = ACCENT_COLORS[accent] ?? ACCENT_COLORS.gemini
      colors = isDark ? palette.dark : palette.light
    }

    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-glow', colors.glow)
    root.style.setProperty('--ring', colors.primary)
    root.style.setProperty('--sidebar-primary', colors.sidebar)
    root.style.setProperty('--sidebar-ring', colors.sidebar)
    root.style.setProperty('--gradient-primary', colors.gradient)

    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(el => {
      el.content = isDark ? '#0B0F19' : `hsl(${colors.primary})`
    })
  }, [mode, accent, spacing, primaryColor])

  return null
}
