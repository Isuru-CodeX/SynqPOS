import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Check, Zap, Shield, Bot, Wifi, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PlanBenefitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanBenefitsModal({ open, onOpenChange }: PlanBenefitsModalProps) {
  const { t } = useI18n();

  const benefits = [
    {
      icon: <Bot className="h-4 w-4 text-cyan-400" />,
      title: t("plan.ai_copilot", "AI Agent & Autonomous Copilot"),
      desc: t("plan.ai_copilot_desc", "Automated stock reordering, intelligent demand forecasts, and voice/chat commands."),
      active: true,
    },
    {
      icon: <Wifi className="h-4 w-4 text-emerald-400" />,
      title: t("plan.offline_sync", "Offline Sync & Vault Engine"),
      desc: t("plan.offline_sync_desc", "Full local POS operation with background collision resolution and automatic cloud reconciliation."),
      active: true,
    },
    {
      icon: <MessageCircle className="h-4 w-4 text-green-400" />,
      title: t("plan.whatsapp", "WhatsApp Automation"),
      desc: t("plan.whatsapp_desc", "Instant digital receipts, pickup ready notifications, and automated loyalty messages."),
      active: true,
    },
    {
      icon: <Zap className="h-4 w-4 text-purple-400" />,
      title: t("plan.multi_branch", "Unlimited Branches & Registers"),
      desc: t("plan.multi_branch_desc", "Centrally manage infinite locations, warehouses, staff roles, and price lists in real-time."),
      active: true,
    },
    {
      icon: <Clock className="h-4 w-4 text-pink-400" />,
      title: t("plan.kds_waiter", "KDS & Waiter Tablet Ecosystem"),
      desc: t("plan.kds_waiter_desc", "Live kitchen display system with acoustic SLA timer rings and digital tableside ordering."),
      active: true,
    },
    {
      icon: <Shield className="h-4 w-4 text-amber-400" />,
      title: t("plan.priority_support", "24/7 Priority Support & SLA"),
      desc: t("plan.priority_support_desc", "Enterprise 99.99% uptime guarantee with direct Slack/WhatsApp engineering channel."),
      active: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-purple-500/30 bg-card dark:bg-[#0B101D]/95 backdrop-blur-xl shadow-2xl">
        {/* Banner with Gemini gradient */}
        <div className="relative p-6 bg-gradient-to-br from-cyan-950/40 via-purple-950/40 to-pink-950/30 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-purple-500/25">
              <div className="h-full w-full bg-[#0D1322] rounded-[11px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-foreground">
                  SynqPOS Enterprise Premium
                </DialogTitle>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t("plan.active_tier", "Active Tier")}
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("plan.full_access", "All enterprise omnichannel & AI capabilities are unlocked on your account.")}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-3.5 max-h-[55vh] overflow-y-auto">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 dark:bg-white/[0.03] border border-border/40 hover:border-purple-500/30 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-card/80 border border-border/60 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {b.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">{b.title}</h4>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3 stroke-[3]" /> Included
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-muted/30 dark:bg-black/20 border-t border-border/50 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {t("plan.renews", "Renews automatically on Nov 2027")}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="g-btn g-btn-primary h-9 text-xs font-semibold px-4 rounded-xl"
          >
            {t("common.close", "Close")} <ArrowRight size={14} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
