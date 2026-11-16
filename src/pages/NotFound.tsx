import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const NotFound = () => {
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t("notfound.title", "Page Not Found (404)")} | SynqPOS`;
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notfound.desc", "Oops! Page not found")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t("action.back_to_dashboard", "Return to Home")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
