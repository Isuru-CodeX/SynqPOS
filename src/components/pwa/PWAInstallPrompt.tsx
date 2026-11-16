import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";
import { applyPWAUpdate } from "@/pwa";
import { useI18n } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function isElectron() {
  return typeof window !== "undefined" && Boolean(window.electron);
}

export function PWAInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (isElectron() || isStandalone()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;

      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;

      toast(t("pwa.install_title", "Install SynqPOS"), {
        description: t(
          "pwa.install_desc",
          "Install on this device to launch as a standalone desktop/tablet app and work offline.",
        ),
        duration: Infinity,
        icon: <Download className="h-4 w-4" />,
        action: {
          label: t("pwa.install_btn", "Install"),
          onClick: async () => {
            const promptEvent = deferredPromptRef.current;
            if (!promptEvent) return;
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;
            if (choice.outcome === "accepted") {
              toast.success(t("pwa.installed_success", "SynqPOS installed successfully!"));
            }
            deferredPromptRef.current = null;
          },
        },
        cancel: {
          label: t("pwa.not_now", "Not now"),
          onClick: () => {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
          },
        },
      });
    };

    const onInstalled = () => {
      deferredPromptRef.current = null;
      localStorage.removeItem(DISMISS_KEY);
      toast.success(t("pwa.installed_success", "SynqPOS installed successfully!"));
    };

    const onUpdateAvailable = () => {
      toast(t("pwa.update_title", "New version available"), {
        description: t("pwa.update_desc", "Update now to receive the latest improvements."),
        duration: Infinity,
        icon: <RefreshCw className="h-4 w-4" />,
        action: {
          label: t("pwa.update_btn", "Update"),
          onClick: () => {
            void applyPWAUpdate();
          },
        },
      });
    };

    const onOfflineReady = () => {
      toast.success(t("pwa.offline_ready", "Ready for offline operation"));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("pwa:update-available", onUpdateAvailable);
    window.addEventListener("pwa:offline-ready", onOfflineReady);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("pwa:update-available", onUpdateAvailable);
      window.removeEventListener("pwa:offline-ready", onOfflineReady);
    };
  }, []);

  return null;
}
