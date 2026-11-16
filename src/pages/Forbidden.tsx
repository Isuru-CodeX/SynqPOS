import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { SynqLogo } from "@/components/shared/SynqLogo";
import { useI18n } from "@/lib/i18n";

export default function Forbidden() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t("forbidden.title", "Access Restricted (403)")} | SynqPOS`;
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 gap-6">
      <SynqLogo size={44} variant="full" />

      <div className="w-full max-w-sm text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 grid place-items-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>

        <div>
          <div className="eyebrow eyebrow-muted mb-2">ERROR 403</div>
          <h1 className="page-header-title">{t("forbidden.header", "Access Restricted")}</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {t("forbidden.desc", "Your current role does not have permission to access this section. Contact your administrator if you believe this is an error.")}
          </p>
        </div>

        <Button asChild className="w-full h-11">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("action.back_to_dashboard", "Back to Dashboard")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
