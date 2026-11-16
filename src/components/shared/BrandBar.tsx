import { SynqLogo } from "@/components/shared/SynqLogo";
import { LiveDot } from "@/components/shared/LiveDot";
import { User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface BrandBarProps {
  branch?:   string;
  session?:  string;
  channel?:  string;
  showSync?: boolean;
}

export function BrandBar({
  branch,
  session,
  channel,
  showSync = true,
}: BrandBarProps) {
  const { t } = useI18n();
  const branchText = branch ?? t("topbar.branch", "Branch");
  const sessionText = session ?? t("cash.register_default", "Register #01");
  const channelText = channel ?? t("dashboard.channel_pos", "Physical Store");

  return (
    <div className="brand-bar shrink-0">
      {/* Lockup */}
      <div className="flex items-center gap-2">
        <SynqLogo size={24} variant="icon" />
        <span className="font-bold text-[15px] leading-none bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          SynqPOS
        </span>
      </div>

      <div className="h-5 w-px bg-border shrink-0" />

      {/* Branch */}
      <div>
        <div className="eyebrow text-[9px] uppercase tracking-wider">{t("topbar.branch", "BRANCH")}</div>
        <div className="text-[13px] font-semibold leading-tight mt-0.5">{branchText}</div>
      </div>

      <div className="flex-1" />

      {/* Channel pill */}
      <span className="s-pill s-pill-blue">
        <LiveDot kind="blue" />
        {channelText}
      </span>

      {/* Sync pill */}
      {showSync && (
        <span className="s-pill s-pill-green">
          <LiveDot kind="green" />
          {t("dashboard.all_synced", "SYNC OK")}
        </span>
      )}

      {/* Session */}
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <User size={14} />
        {sessionText}
      </div>
    </div>
  );
}
