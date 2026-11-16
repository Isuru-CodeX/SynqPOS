import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  Cloud,
  Info,
  MessageSquare,
  X,
  ExternalLink,
  BellOff,
  Sparkles,
  Calendar,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useNotificationsStore, type AppNotification, type NotificationCategory } from "@/stores/notifications";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { icon: typeof Bell; gradient: string; toneText: string }
> = {
  stock: {
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]",
    toneText: "text-amber-400",
  },
  order: {
    icon: ShoppingBag,
    gradient: "from-cyan-500 to-blue-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    toneText: "text-cyan-400",
  },
  sync: {
    icon: Cloud,
    gradient: "from-emerald-500 to-teal-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    toneText: "text-emerald-400",
  },
  system: {
    icon: Info,
    gradient: "from-indigo-500 to-purple-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]",
    toneText: "text-indigo-400",
  },
  message: {
    icon: MessageSquare,
    gradient: "from-pink-500 to-rose-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]",
    toneText: "text-pink-400",
  },
};

export function NotificationCenter() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "alerts">("all");

  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationsStore();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "alerts":
        return notifications.filter(
          (n) => n.category === "stock" || n.category === "order"
        );
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const handleItemClick = (n: AppNotification) => {
    markAsRead(n.id);
    setSelectedNotification(n);
  };

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="glass g-topbar-bell cursor-pointer hover:border-purple-500/50 transition-all duration-200 active:scale-95"
          title={
            unreadCount > 0
              ? `${t("topbar.notifications", "Notifications")} (${unreadCount} unread)`
              : t("topbar.notifications", "Notifications")
          }
          aria-label={t("topbar.notifications", "Notifications")}
        >
          <Bell
            size={18}
            className={cn(
              "transition-transform duration-300",
              unreadCount > 0 && "animate-bounce-subtle text-foreground"
            )}
          />
          {unreadCount > 0 && (
            <span className="g-topbar-bell-dot bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.7)] animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[380px] sm:w-[420px] p-0 rounded-2xl glass-strong border border-border/60 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-[1px] flex items-center justify-center">
              <div className="h-full w-full bg-background rounded-[11px] flex items-center justify-center">
                <Bell size={15} className="text-purple-400" />
              </div>
            </div>
            <div>
              <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                {t("notifications.title", "Notifications")}
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {unreadCount} {t("notifications.new", "new")}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {t("notifications.subtitle", "Activity & system updates")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                title={t("notifications.mark_all_read", "Mark all as read")}
                className="h-8 px-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">{t("notifications.read_all", "Read all")}</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => clearAll()}
                title={t("notifications.clear_all", "Clear all notifications")}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-muted/10 border-b border-border/30 flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all duration-200",
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {t("notifications.all", "All")} ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all duration-200",
              filter === "unread"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {t("notifications.unread", "Unread")} ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("alerts")}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all duration-200",
              filter === "alerts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {t("notifications.alerts", "Alerts")}
          </button>
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/20">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-muted/30 border border-border/40 mx-auto flex items-center justify-center text-muted-foreground">
                <BellOff size={22} className="opacity-50" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {t("notifications.empty_title", "All caught up!")}
                </p>
                <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mt-0.5">
                  {t("notifications.empty_desc", "No notifications at the moment. We will notify you when events occur.")}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.system;
              const Icon = cfg.icon;
              const timeAgo = formatDistanceToNow(new Date(item.timestamp), {
                addSuffix: true,
              });

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 transition-colors duration-150 cursor-pointer group hover:bg-muted/30 relative",
                    !item.read && "bg-primary/[0.04]"
                  )}
                >
                  {/* Category icon */}
                  <div
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
                      cfg.gradient
                    )}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-muted text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                      <span>{timeAgo}</span>
                      {item.actionUrl && (
                        <span className="text-primary hover:underline inline-flex items-center gap-0.5">
                          {t("notifications.view", "View")} <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!item.read && (
                    <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  )}

                  {/* Dismiss button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(item.id);
                    }}
                    title={t("action.delete", "Dismiss")}
                    className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex items-center justify-center transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles size={12} className="text-purple-400" />
            SynqPOS Live Alerts
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/settings?tab=business");
            }}
            className="hover:text-foreground text-primary font-medium hover:underline"
          >
            {t("settings.title", "Settings")} →
          </button>
        </div>
      </PopoverContent>
    </Popover>

    {/* Notification Detail Dialog */}
    <Dialog open={!!selectedNotification} onOpenChange={(o) => !o && setSelectedNotification(null)}>
      <DialogContent className="sm:max-w-md p-6 glass border-purple-500/30 overflow-hidden">
        {selectedNotification && (() => {
          const cfg = CATEGORY_CONFIG[selectedNotification.category] || CATEGORY_CONFIG.system;
          const Icon = cfg.icon;
          const formattedDate = new Date(selectedNotification.timestamp).toLocaleString();
          const timeAgo = formatDistanceToNow(new Date(selectedNotification.timestamp), { addSuffix: true });

          return (
            <div className="space-y-4">
              <DialogHeader className="pb-3 border-b border-purple-500/20 text-left">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", cfg.gradient)}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                        {selectedNotification.category}
                      </span>
                      {selectedNotification.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                          {selectedNotification.badge}
                        </span>
                      )}
                    </div>
                    <DialogTitle className="text-base font-bold text-foreground mt-1 leading-snug">
                      {selectedNotification.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar size={13} className="text-purple-400" />
                  <span>{formattedDate} ({timeAgo})</span>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/[0.04] border border-purple-500/15 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.description}
                </div>
              </div>

              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedNotification.id;
                    removeNotification(id);
                    setSelectedNotification(null);
                  }}
                  className="g-btn g-btn-ghost text-xs text-destructive hover:bg-destructive/10 h-8 px-2.5 flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  {t("common.delete", "Delete")}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="g-btn g-btn-ghost text-xs h-8 px-3"
                  >
                    {t("common.close", "Close")}
                  </button>
                  {selectedNotification.actionUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = selectedNotification.actionUrl!;
                        setSelectedNotification(null);
                        setOpen(false);
                        navigate(url);
                      }}
                      className="g-btn g-btn-primary text-xs h-8 px-3.5 flex items-center gap-1.5"
                    >
                      {t("notifications.go_to_module", "Open Module")}
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </DialogContent>
    </Dialog>
    </>
  );
}
