import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LoadingScreen } from "./LoadingScreen";

// Route name mapping for clear, contextual feedback
const ROUTE_MESSAGES: Record<string, string> = {
  "/": "Launching SynqPOS…",
  "/auth": "Connecting to SynqPOS Security…",
  "/onboarding": "Preparing Store Setup…",
  "/dashboard": "Loading Dashboard & Live Analytics…",
  "/pos": "Opening Point of Sale Terminal…",
  "/tables": "Loading Tables & Dining Floor Plan…",
  "/waiter": "Opening Waiter Station…",
  "/courier": "Connecting to Courier Dispatch…",
  "/cash": "Opening Cash Register & Shift Sessions…",
  "/sales": "Loading Sales Receipts & History…",
  "/customers": "Loading Customer CRM & Loyalty…",
  "/products": "Loading Products & Pricing Matrix…",
  "/recipes": "Loading Recipe BOM & Ingredients…",
  "/catalog": "Loading Catalog & Categories…",
  "/channel-prices": "Loading Omnichannel Price Rules…",
  "/inventory": "Loading Real-time Inventory & Stock…",
  "/production": "Loading Kitchen Production Orders…",
  "/kds": "Opening Kitchen Display System (KDS)…",
  "/digital-orders": "Fetching Online & Delivery Orders…",
  "/whatsapp": "Connecting to WhatsApp Business…",
  "/delivery": "Loading Delivery & Fleet Routes…",
  "/branches": "Loading Branches & Outlets…",
  "/employees": "Loading Staff & Access Permissions…",
  "/shifts": "Loading Employee Shifts & Time Logs…",
  "/reports": "Compiling Financial & Sales Reports…",
  "/expenses": "Loading Expense Book & Disbursements…",
  "/suppliers": "Loading Supplier Directory…",
  "/settings": "Loading Settings & Preferences…",
  "/ai": "Initializing SynqPOS AI Copilot…",
};

export function PageTransitionLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Initializing SynqPOS AI Engine…");
  const previousPathRef = useRef<string | null>(null);
  const isFirstMount = useRef(true);

  // Combined initial mount and route transition effect
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const initialMessage = ROUTE_MESSAGES[location.pathname] || "Initializing SynqPOS AI Engine…";
      setMessage(initialMessage);
      previousPathRef.current = location.pathname;

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1200);

      return () => clearTimeout(timer);
    }

    // If it's the same path, don't re-trigger transition
    if (!previousPathRef.current || previousPathRef.current === location.pathname) {
      previousPathRef.current = location.pathname;
      return;
    }

    const currentPath = location.pathname;
    previousPathRef.current = currentPath;

    // Pick contextual message
    const targetMsg = ROUTE_MESSAGES[currentPath] || `Loading ${currentPath.replace("/", "").replace(/-/g, " ")}…`;
    setMessage(targetMsg);
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1.0s minimum guarantee

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <LoadingScreen
      show={loading}
      message={message}
      subMessage="AI Omnichannel POS & ERP"
      minDuration={1000}
      fullScreen
    />
  );
}

export default PageTransitionLoader;
