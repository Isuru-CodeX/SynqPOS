import { useState, useRef, useEffect } from "react";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Send, Plus, TrendingUp, Package, Users, Truck, Wallet,
  ArrowUpRight, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  chart?: boolean;
  insights?: string[];
  actions?: string[];
}



function AiOrb({ size = 34 }: { size?: number }) {
  const sizeClass = size >= 48 ? "g-ai-orb-50" : "g-ai-orb-34";
  const iconSize = Math.round(size * 0.47);
  return (
    <div className={`orb ${sizeClass}`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
        <path d="M12 2 L14 8 L20 9.5 L15.5 13 L17 19 L12 16 L7 19 L8.5 13 L4 9.5 L10 8 Z" />
      </svg>
    </div>
  );
}

function UserOrb({ initials }: { initials: string }) {
  return (
    <div className="g-topbar-avatar g-ai-user-orb">
      {initials}
    </div>
  );
}

function MarginBarChart() {
  const { t } = useI18n();
  const data = [
    { name: "Classic Cappuccino",    margin: 71 },
    { name: "Strawberry Cheesecake", margin: 68 },
    { name: "Mocha Frappe",          margin: 64 },
    { name: "Butter Croissant",      margin: 58 },
    { name: "Vanilla Latte",         margin: 55 },
  ];
  return (
    <div className="glass-thin g-ai-chart-wrap">
      <div className="flex justify-between items-center mb-3">
        <span className="h-label">{t("ai.margin_title", "Gross margin by product · this month")}</span>
        <span className="h-meta">{t("ai.source_sales_costs", "Source: sales + costs")}</span>
      </div>
      <div className="g-ai-margin-chart">
        {data.map((d, i) => (
          <div key={i} className="g-ai-margin-row">
            <span className="g-ai-margin-label">{d.name}</span>
            <div className="g-ai-margin-bar-track">
              <div className="g-ai-margin-bar-fill" {...{ style: { width: `${d.margin}%` } }} />
              <span className="g-ai-margin-pct">{d.margin}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIAgent() {
  const { roles } = useTenantContext();
  const { t } = useI18n();
  const initials = (roles[0] ?? "U").slice(0, 2).toUpperCase();

  const suggestions = [
    t("ai.sugg_1", "Today's sales by hour"),
    t("ai.sugg_2", "What supplies to reorder this week?"),
    t("ai.sugg_3", "Top 10 customers this quarter"),
    t("ai.sugg_4", "Compare branches"),
  ];

  const dataSources = [
    { icon: TrendingUp, label: t("ai.source_sales", "POS Sales"), sub: t("ai.source_sales_sub", "monthly transactions") },
    { icon: Package,   label: t("ai.source_inv", "Inventory"),   sub: t("ai.source_inv_sub", "active SKUs") },
    { icon: Users,     label: t("ai.source_crm", "CRM Customers"), sub: t("ai.source_crm_sub", "active clients") },
    { icon: Truck,     label: t("ai.source_digital", "Digital Orders"), sub: "Rappi · DiDi · Uber" },
    { icon: Wallet,    label: t("ai.source_cash", "Cash & Register"), sub: t("ai.source_cash_sub", "daily sessions") },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: t("ai.welcome", "Hello, I am the SynqPOS AI Agent. I have full access to your sales, inventory, customers, and more. How can I help you today?"),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 1400));
    setTyping(false);

    const lower = text.toLowerCase();
    let aiMsg: Message;
    if (lower.includes("margen") || lower.includes("margin") || lower.includes("producto") || lower.includes("product")) {
      aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        text: t("ai.reply_margin", "I analyzed this month's sales. Here are the products with highest gross margin:"),
        chart: true,
        insights: [
          t("ai.insight_1", "Classic Cappuccino has a 71% margin — great opportunity to promote oat/almond milk upgrades."),
          t("ai.insight_2", "Strawberry Cheesecake has high margin but low stock in some branches — consider an inventory transfer."),
        ],
        actions: [t("ai.action_transfer", "Create transfer"), t("ai.action_export", "Export report")],
      };
    } else if (lower.includes("venta") || lower.includes("sale") || lower.includes("today") || lower.includes("hoy")) {
      aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        text: t("ai.reply_sales", "You have active sales across all branches today. Peak volume is between 12:00 and 14:00. Check the Dashboard for real-time details."),
        actions: [t("ai.action_view_dash", "View dashboard"), t("ai.action_export_excel", "Export Excel")],
      };
    } else {
      aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        text: t("ai.reply_default", "Understood. I am querying your business metrics to provide the most accurate insight. What specific details would you like to review?"),
        actions: [t("ai.action_view_sales", "View sales"), t("ai.action_view_inv", "View inventory")],
      };
    }

    setMessages((m) => [...m, aiMsg]);
  };

  return (
    <div className="g-ai-stage">
      {/* Chat column */}
      <div className="g-ai-chat-col">
        {/* Header */}
        <div className="glass g-ai-header">
          <AiOrb size={50} />
          <div className="g-ai-header-info">
            <div className="g-ai-header-title h-display">
              SynqPOS AI Agent
              <span className="pill pill-brand g-kds-pill-micro">BETA</span>
            </div>
            <div className="h-meta">{t("ai.connected_meta", "Connected to your inventory, sales, and CRM")}</div>
          </div>
          <div className="pill pill-ok">
            <span className="dot dot-ok" />
            {t("ai.online", "Online")}
          </div>
        </div>

        {/* Messages */}
        <div className="g-ai-msgs">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end gap-2 items-end">
                <div className="g-ai-bubble-user">{m.text}</div>
                <UserOrb initials={initials} />
              </div>
            ) : (
              <div key={m.id} className="g-ai-bubble-ai">
                <AiOrb size={34} />
                <div className="glass-strong g-ai-bubble-ai-body">
                  <div className="g-ai-bubble-ai-text">{m.text}</div>
                  {m.chart && <MarginBarChart />}
                  {m.insights && (
                    <div className="flex flex-col gap-2">
                      {m.insights.map((s, i) => (
                        <div key={i} className="g-ai-insight">
                          <ArrowUpRight size={14} className="g-ai-insight-icon" />
                          <span className="g-ai-insight-text">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.actions && (
                    <div className="flex gap-2 flex-wrap">
                      {m.actions.map((a, i) => (
                        <button key={i} type="button" className="g-btn g-btn-ghost g-btn-sm">
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {typing && (
            <div className="g-ai-typing">
              <AiOrb size={34} />
              <div className="glass-thin g-ai-typing-bubble">
                <span className="g-ai-typing-dots">
                  <span className="dot dot-brand g-ai-dot-pulse" />
                  <span className="dot dot-brand g-ai-dot-mid" />
                  <span className="dot dot-brand g-ai-dot-dim" />
                </span>
                <span className="g-ai-typing-text">{t("ai.querying", "Consulting data...")}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="glass-strong g-ai-composer">
          <div className="g-ai-composer-row">
            <button type="button" title={t("ai.attach_file", "Attach file")} className="g-btn g-btn-ghost g-ai-composer-btn-attach">
              <Plus size={16} />
            </button>
            <input
              className="g-ai-composer-placeholder bg-transparent border-none outline-none"
              placeholder={t("ai.ask_placeholder", "Ask the AI agent about sales, inventory, customers...")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
            />
            <button
              type="button"
              title={t("ai.send", "Send message")}
              className="g-btn g-btn-primary g-ai-composer-btn-send"
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
            >
              <Send size={15} />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i} type="button"
                className="pill pill-ghost pill-sm"
                onClick={() => send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="g-ai-side">
        {/* Data sources */}
        <div className="glass g-ai-sources">
          <div className="h-display g-ai-section-title">{t("ai.sources_title", "Connected Sources")}</div>
          {dataSources.map(({ icon: Icon, label, sub }, i) => (
            <div key={i} className="g-ai-source-row">
              <div className="g-ai-source-icon">
                <Icon size={14} />
              </div>
              <div className="g-ai-source-info">
                <div className="g-ai-source-name">{label}</div>
                <div className="h-meta">{sub}</div>
              </div>
              <span className="dot dot-ok" />
            </div>
          ))}
        </div>

        {/* Recent actions */}
        <div className="glass g-ai-actions-panel">
          <div className="h-display g-ai-section-title">{t("ai.recent_actions", "Recent Actions")}</div>
          {[
            { l: t("ai.action_item_1", "Weekly report sent"), s: t("ai.action_item_1_sub", "Today · 4 recipients"), ok: true },
            { l: t("ai.action_item_2", "Critical stock alert"), s: t("ai.action_item_2_sub", "2 SKUs · Downtown Branch"),  ok: false },
          ].map((r, i) => (
            <div key={i} className="glass-thin g-ai-action-row">
              <span className={cn("dot", r.ok ? "dot-ok" : "dot-warn")} />
              <div className="g-ai-source-info">
                <div className="g-ai-source-name">{r.l}</div>
                <div className="h-meta">{r.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-thin g-ai-privacy-note">
          {t("ai.privacy_note", "The agent accesses only your organization's data. Queries are safely recorded in audit_logs.")}
        </div>
      </div>
    </div>
  );
}
