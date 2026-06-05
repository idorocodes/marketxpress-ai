import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import {
  MessageSquare,
  Plus,
  LogOut,
  Send,
  Sparkles,
  Wallet,
  Menu,
  X,
  User,
  ShoppingBag,
  TrendingDown,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  QrCode,
  Download,
  BookmarkCheck,
} from "lucide-react";

/* ─── Google Fonts ─── */
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);
  return null;
};

type DealStatus =
  | "AVAILABLE"
  | "CREATING"
  | "PENDING_VENDOR"
  | "ACCEPTED"
  | "REJECTED"
  | "COLLECTED";

interface SavedDeal {
  dealId: string;
  qrCode: string;
  vendor: string;
  items: { name: string; qty: string; price: string }[];
  total: string;
  saved: string;
  timestamp: string;
}

/* ─── localStorage helpers ─── */
const LS_DEALS_KEY = "mx_saved_deals";

function persistDeal(deal: SavedDeal) {
  try {
    const existing: SavedDeal[] = JSON.parse(
      localStorage.getItem(LS_DEALS_KEY) || "[]",
    );
    const deduped = existing.filter((d) => d.dealId !== deal.dealId);
    localStorage.setItem(LS_DEALS_KEY, JSON.stringify([deal, ...deduped]));
  } catch {
    /* quota exceeded — silent */
  }
}

function persistChat(dealId: string, messages: any[]) {
  try {
    localStorage.setItem(`mx_chat_${dealId}`, JSON.stringify(messages));
  } catch {
    /* silent */
  }
}

const generateQRImage = async (qrData: string): Promise<string> => {
  try {
    if (qrData.startsWith("data:") || qrData.startsWith("http")) {
      return qrData;
    }

    return await QRCode.toDataURL(qrData, {
      width: 512,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  } catch (err) {
    console.error("QR generation failed:", err);
    return "";
  }
};

/* ─── Count-up hook ─── */
function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(t * t * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return val;
}
/* ─── Deal status poller ─── */
function useDealStatusPoller(
  dealId: string | null,
  active: boolean,
  onResolved: (status: DealStatus, qrCode?: string) => void,
) {
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  useEffect(() => {
    if (!active || !dealId) return;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("user_token");

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${baseUrl}/deals/${dealId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const response = await res.json();
        const statusData = response.data || response;
        const currentStatus = statusData.status;

        if (currentStatus === "ACCEPTED") {
          clearInterval(interval);
          try {
            const qrRes = await fetch(`${baseUrl}/deals/${dealId}/qr`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const qrResponse = await qrRes.json();
            const qrData =  qrResponse;
            let qrValue = qrData.qr_code ?? qrData.qrCode ?? qrData ?? "";

            console.log("qr code ", qrValue)
            if (
              qrValue &&
              !qrValue.startsWith("data:") &&
              !qrValue.startsWith("http")
            ) {
              qrValue = await generateQRImage(qrValue);
            }

            onResolvedRef.current("ACCEPTED", qrValue);
          } catch (err) {
            console.error("QR fetch failed:", err);
            onResolvedRef.current("ACCEPTED", "");
          }
        } else if (["REJECTED", "COLLECTED"].includes(currentStatus)) {
          clearInterval(interval);
          onResolvedRef.current(currentStatus as DealStatus);
        }
      } catch (err) {
        console.error("Deal status poll error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [active, dealId]);
}
/* ─── QR Modal ─── */
interface QRModalProps {
  deal: SavedDeal;
  onClose: () => void;
}

const QRModal = ({ deal, onClose }: QRModalProps) => {
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    const loadQR = async () => {
      const src = await generateQRImage(deal.qrCode);
      setImgSrc(src);
    };
    loadQR();
  }, [deal.qrCode]);

  const handleDownload = () => {
    if (!imgSrc) return;
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `marketxpress-deal-${deal.dealId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(18px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="qr-modal-enter relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #111111 0%, #0C0C0C 100%)",
          border: "0.5px solid rgba(245,158,11,0.25)",
          boxShadow:
            "0 0 80px rgba(245,158,11,0.08), 0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[120px] bg-amber-400/[0.06] rounded-full blur-[60px] pointer-events-none" />

        <div className="relative px-5 pt-5 pb-4 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-white/80 font-display">
                Deal QR Code
              </div>
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                Show vendor at stall
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/50 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative px-5 py-6 flex flex-col items-center gap-4">
          {imgSrc ? (
            <div
              className="qr-frame relative p-4 rounded-xl"
              style={{
                background: "#FFFFFF",
                boxShadow:
                  "0 0 0 1px rgba(245,158,11,0.2), 0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <img
                src={imgSrc}
                alt="Deal QR Code"
                className="w-48 h-48 object-contain block"
                style={{ imageRendering: "pixelated" }}
              />
              {/* Corner accents */}
              {[
                "top-1 left-1",
                "top-1 right-1",
                "bottom-1 left-1",
                "bottom-1 right-1",
              ].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-3 h-3 border-amber-400`}
                  style={{
                    borderTopWidth: i < 2 ? "2px" : "0",
                    borderBottomWidth: i >= 2 ? "2px" : "0",
                    borderLeftWidth: i % 2 === 0 ? "2px" : "0",
                    borderRightWidth: i % 2 === 1 ? "2px" : "0",
                    borderStyle: "solid",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="w-48 h-48 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-2">
              <QrCode className="w-8 h-8 text-white/20" />
              <span className="text-[10px] font-mono text-white/25">
                Generating QR Code...
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/[0.08] border border-emerald-400/20">
            <BookmarkCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] font-mono text-emerald-400">
              Saved to My Deals
            </span>
          </div>
        </div>

        <div className="mx-5 mb-4 rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.015]">
          <div className="px-4 py-2.5 border-b border-white/[0.05]">
            <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-0.5">
              Vendor
            </div>
            <div className="text-[13px] text-white/70">{deal.vendor}</div>
          </div>
          <div className="px-4 py-2.5 space-y-1.5">
            {deal.items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex justify-between text-[12px]">
                <span className="text-white/45">
                  {item.name}{" "}
                  <span className="text-white/25 font-mono">{item.qty}</span>
                </span>
                <span className="font-mono text-white/60">{item.price}</span>
              </div>
            ))}
            {deal.items.length > 3 && (
              <div className="text-[11px] font-mono text-white/25">
                +{deal.items.length - 3} more items
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-white/[0.05] flex justify-between items-center bg-amber-400/[0.02]">
            <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">
              Total
            </span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {deal.total}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          {deal.qrCode && (
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white/50 hover:text-white/70 text-[12px] font-mono transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-mono font-medium text-black transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
          >
            Done
          </button>
        </div>

        <div className="px-5 pb-4 text-center">
          <span className="text-[10px] font-mono text-white/15">
            Deal · {deal.dealId}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── My Saved Deals Modal ─── */
const MyDealsModal = ({
  deals,
  onClose,
  onLoadDeal,
}: {
  deals: SavedDeal[];
  onClose: () => void;
  onLoadDeal: (deal: SavedDeal) => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0C0C0C] border border-amber-400/20 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-amber-400">
            My Saved Deals
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {deals.length === 0 ? (
            <p className="text-white/40 text-center py-12">
              No saved deals yet. Complete a deal to see it here.
            </p>
          ) : (
            deals.map((deal) => (
              <div
                key={deal.dealId}
                className="border border-white/10 rounded-xl p-4 hover:border-amber-400/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-white">{deal.vendor}</div>
                    <div className="text-xs text-white/40 font-mono">
                      {deal.dealId}
                    </div>
                    <div className="text-[10px] text-white/30 mt-1">
                      {new Date(deal.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-mono font-bold">
                      {deal.total}
                    </div>
                    <div className="text-emerald-400 text-xs">
                      Saved {deal.saved}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onLoadDeal(deal)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-amber-400 text-black font-medium text-sm hover:bg-amber-300 transition-all"
                >
                  View QR Code
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Stat badge ─── */
const StatBadge = ({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const num = useCountUp(value, active);
  return (
    <div ref={ref} className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.12em] text-white/25 font-mono">
        {label}
      </span>
      <span className="text-lg font-mono font-medium text-amber-400">
        {num.toLocaleString()}
        {suffix}
      </span>
    </div>
  );
};

/* ─── Deal Card ─── */
interface DealCardProps {
  items?: { name: string; qty: string; price: string }[];
  total: string;
  vendor: string;
  saved: string;
  rawPayload: any;
  messages: any[];
  onDealAccepted?: () => void;
}

const DealCard = ({
  items = [],
  total,
  vendor,
  saved,
  rawPayload,
  messages,
  onDealAccepted,
}: DealCardProps) => {
  const [dealId, setDealId] = useState<string | null>(null);
  const [status, setStatus] = useState<DealStatus>("AVAILABLE");
  const [actionLoading, setActionLoading] = useState(false);
  const [qrModalDeal, setQrModalDeal] = useState<SavedDeal | null>(null);

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("user_token");

  const handleResolved = useCallback(
    (resolvedStatus: DealStatus, qrCode?: string) => {
      setStatus(resolvedStatus);

      if (resolvedStatus === "ACCEPTED" && dealId) {
        const savedDeal: SavedDeal = {
          dealId,
          qrCode: qrCode ?? "",
          vendor,
          items,
          total,
          saved,
          timestamp: new Date().toISOString(),
        };

        persistDeal(savedDeal);
        persistChat(dealId, messages);

        setQrModalDeal(savedDeal);
        onDealAccepted?.();
      }
    },
    [dealId, vendor, items, total, saved, messages, onDealAccepted],
  );

  useDealStatusPoller(dealId, status === "PENDING_VENDOR", handleResolved);

  const handleLockDeal = async () => {
    if (!rawPayload || actionLoading) return;
    setActionLoading(true);
    setStatus("CREATING");
    try {
      const res = await fetch(`${baseUrl}/deals/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          line_items: rawPayload.line_items,
          total_cost: rawPayload.total_cost,
          total_savings: rawPayload.total_savings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDealId(data.dealIds[0]);
      handleBuyerConfirm(data.dealIds[0]);
    } catch (err) {
      console.error("Deal locking failed:", err);
      setStatus("AVAILABLE");
      setActionLoading(false);
    }
  };

  const handleBuyerConfirm = async (targetId: string) => {
    try {
      const res = await fetch(`${baseUrl}/deals/${targetId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      let qrValue = data.qr_code ?? data.data?.qr_code ?? "";
      console.log("qr value : ",qrValue)

      if (
        qrValue &&
        !qrValue.startsWith("data:") &&
        !qrValue.startsWith("http")
      ) {
        qrValue = await generateQRImage(qrValue);
      }

      if (
        data.status === "ACCEPTED" ||
        (data.data && data.data.status === "ACCEPTED")
      ) {
        handleResolved("ACCEPTED", qrValue);
      } else {
        setStatus("PENDING_VENDOR");
      }
    } catch (err) {
      console.error("Buyer confirm error:", err);
      setStatus("PENDING_VENDOR");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {qrModalDeal && (
        <QRModal deal={qrModalDeal} onClose={() => setQrModalDeal(null)} />
      )}
      <div className="mt-4 rounded-xl border border-amber-400/20 overflow-hidden bg-black/40">
        <div className="bg-amber-400/[0.06] border-b border-amber-400/15 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-amber-400 uppercase tracking-widest">
            <ShoppingBag className="w-3 h-3" /> Decider Output · {vendor}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <TrendingDown className="w-3 h-3" /> Save {saved}
          </div>
        </div>

        <div className="px-4 py-3 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/20 w-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-white/70">{item.name}</span>
                <span className="text-[10px] text-white/30 font-mono">
                  {item.qty}
                </span>
              </div>
              <span className="text-xs font-mono text-white/80">
                {item.price}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] px-4 py-2.5 flex justify-between items-center bg-white/[0.01]">
          <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">
            Total
          </span>
          <span className="text-sm font-mono font-bold text-amber-400">
            {total}
          </span>
        </div>

        {rawPayload && (
          <div className="border-t border-white/[0.05] p-2 bg-zinc-950/60 flex justify-end">
            {status === "AVAILABLE" && (
              <button
                onClick={handleLockDeal}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-mono font-medium hover:bg-amber-400 transition-all active:scale-95 flex items-center gap-1"
              >
                Secure Market Deal
              </button>
            )}
            {status === "CREATING" && (
              <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs font-mono flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />{" "}
                Connecting Node...
              </div>
            )}
            {status === "PENDING_VENDOR" && (
              <div className="px-3 py-1.5 text-[11px] font-mono text-amber-400/80 bg-amber-400/[0.03] border border-amber-400/20 rounded-lg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" /> Awaiting Vendor
                Handshake...
              </div>
            )}
            {(status === "ACCEPTED" || status === "COLLECTED") && (
              <button
                onClick={() => setQrModalDeal(qrModalDeal!)}
                className="px-3 py-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-400/[0.04] border border-emerald-400/20 rounded-lg flex items-center gap-1.5 hover:bg-emerald-400/[0.08]"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Deal Locked · View QR
              </button>
            )}
            {status === "REJECTED" && (
              <div className="px-3 py-1.5 text-[11px] font-mono text-red-400 bg-red-400/[0.04] border border-red-400/20 rounded-lg flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Deal Rejected by Vendor
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

/* ─── Message bubble, Typing, EmptyState, HistoryItem ─── */
const Bubble = ({ msg, messages }: { msg: any; messages: any[] }) => {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-3 w-full bubble-enter ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border bg-amber-400/10 border-amber-400/25 text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}
      <div
        className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}
      >
        <span
          className={`text-[10px] font-mono uppercase tracking-widest ${isUser ? "text-white/20" : "text-amber-400/50"}`}
        >
          {isUser ? "You" : "Decider Engine"}
        </span>
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed border ${isUser ? "bg-white/[0.06] border-white/[0.08] text-white/85 rounded-tr-sm" : "bg-[#111111] border-white/[0.06] text-white/80 rounded-tl-sm"}`}
        >
          {msg.content}
          {msg.deal && <DealCard {...msg.deal} messages={messages} />}
        </div>
        {msg.timestamp && (
          <span className="text-[10px] font-mono text-white/15 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {msg.timestamp}
          </span>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border bg-white/[0.04] border-white/[0.08] text-white/50">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 bubble-enter">
    <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/25 flex items-center justify-center shrink-0 mt-0.5">
      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/50">
        Decider Engine
      </span>
      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-amber-400/60"
            style={{ animation: `bounce 1.2s ${i * 0.18}s infinite` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const EmptyState = ({
  onSuggestion,
}: {
  onSuggestion: (s: string) => void;
}) => {
  const suggestions = [
    "Cook jollof rice for 4 people, budget ₦2,500",
    "Source egusi soup ingredients under ₦3,000",
    "Party stew for 20 guests, max ₦15,000",
    "Cheapest protein sources this week in Lagos",
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 empty-enter">
      <div className="mb-6 relative">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center logo-pulse">
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0C0C0C] status-dot" />
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white/90 text-center mb-2">
        Market<span className="gold-text">Xpress</span> AI
      </h1>
      <p className="text-[13px] text-white/35 text-center max-w-sm leading-relaxed font-body mb-10">
        Constraint-optimized sourcing for Nigerian food markets.
        <br />
        Tell me what you want to cook and your hard budget cap.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s)}
            className="suggestion-btn text-left px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-amber-400/[0.05] hover:border-amber-400/25 transition-all duration-200 group"
          >
            <span className="text-[12px] text-white/45 group-hover:text-white/70 leading-relaxed transition-colors">
              {s}
            </span>
            <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-amber-400/50 mt-1 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

const HistoryItem = ({
  chat,
  active,
  onClick,
}: {
  chat: any;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2.5 group transition-all duration-200 ${active ? "bg-amber-400/[0.08] border border-amber-400/20" : "hover:bg-white/[0.025] border border-transparent"}`}
  >
    <MessageSquare
      className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? "text-amber-400" : "text-white/20 group-hover:text-white/40"}`}
    />
    <span
      className={`text-xs truncate transition-colors ${active ? "text-white/80" : "text-white/40 group-hover:text-white/60"}`}
    >
      {chat.title}
    </span>
    {active && (
      <ChevronRight className="w-3 h-3 text-amber-400/50 ml-auto shrink-0" />
    )}
  </button>
);

/* ─── Client Dashboard ─── */
const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budget, setBudget] = useState("4500");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(1);
  const [hasMessages, setHasMessages] = useState(false);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [showMyDeals, setShowMyDeals] = useState(false);
  const [qrModalDeal, setQrModalDeal] = useState<SavedDeal | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [chatHistory] = useState([
    { id: 1, title: "Jollof Rice Sourcing" },
    { id: 2, title: "Egusi Soup Fixings" },
    { id: 3, title: "Party Cooking — 50 pax" },
  ]);

  const [messages, setMessages] = useState<any[]>([]);

  const now = () =>
    new Date().toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Load saved deals on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_DEALS_KEY);
      if (stored) setSavedDeals(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to load saved deals:", err);
    }
  }, []);

  useEffect(() => {
    if (hasMessages && feedRef.current)
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth",
      });
  }, [messages, isLoading, hasMessages]);

  const sendMessage = async (text: string) => {
    /* unchanged from your original */
    if (!text.trim() || isLoading) return;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("user_token");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: text, timestamp: now() },
    ]);
    setHasMessages(true);
    setInputMessage("");
    setIsLoading(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const response = await fetch(`${baseUrl}/decider/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, budget: Number(budget) }),
      });
      const resData = await response.json();
      if (!response.ok)
        throw new Error(
          resData.message || "Engine calculation failed bounds checks.",
        );

      const engineResult = resData.data;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: engineResult.feasible
            ? "Optimization complete. Scanned database states. Best splits identified across market stalls."
            : `Boundary collision: ${engineResult.reason}`,
          timestamp: now(),
          deal: engineResult.feasible
            ? {
                vendor: `${engineResult.line_items[0]?.vendor_name || "Market Stall"} · ${engineResult.line_items[0]?.stall_number || "Multiple"}`,
                items: engineResult.line_items.map((item: any) => ({
                  name: item.product_name,
                  qty: `${item.quantity} ${item.unit_type}`,
                  price: `₦${item.line_total.toLocaleString()}`,
                })),
                total: `₦${engineResult.total_cost.toLocaleString()}`,
                saved: `₦${engineResult.total_savings.toLocaleString()}`,
                rawPayload: engineResult,
              }
            : null,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: `System connection issue: ${err.message || "Failed to reach optimization node."}`,
          timestamp: now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    window.location.href = "/login";
  };

  return (
    <>
      <FontLoader />
      <style>{`
        @keyframes slide-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes glow-pulse { 0%,100% { opacity:.45; } 50% { opacity:.9; } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes logo-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes modal-enter { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }

        .bubble-enter { animation: slide-up 0.3s cubic-bezier(.22,.68,0,1.15) both; }
        .empty-enter { animation: fade-in 0.5s ease both; }
        .logo-pulse { animation: logo-float 3s ease-in-out infinite; }
        .qr-modal-enter { animation: modal-enter 0.35s cubic-bezier(.22,.68,0,1.2) both; }

        .font-display { font-family:'Syne',sans-serif; }
        .font-body { font-family:'DM Sans',sans-serif; }
        .font-mono { font-family:'JetBrains Mono',monospace; }

        .gold-text { background: linear-gradient(135deg,#F59E0B,#FCD34D 50%,#F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .hairline { border: 0.5px solid rgba(255,255,255,0.07); }
        .hairline-gold { border: 0.5px solid rgba(245,158,11,0.2); }
        .sidebar-bg { background: #080808; }
        .main-bg { background: #0C0C0C; }

        .send-btn { background: linear-gradient(135deg,#F59E0B,#D97706); }
        .send-btn:hover { background: linear-gradient(135deg,#FCD34D,#F59E0B); }
        .send-btn:disabled { background: rgba(255,255,255,0.05); }

        .input-area { background: rgba(15,15,15,0.95); backdrop-filter: blur(24px); border: 0.5px solid rgba(255,255,255,0.08); transition: border-color 0.2s; }
        .input-area:focus-within { border-color: rgba(245,158,11,0.3); box-shadow: 0 0 0 1px rgba(245,158,11,0.12), 0 0 32px rgba(245,158,11,0.05); }

        .ambient-top { background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.055) 0%, transparent 70%); }
        .status-dot { animation: glow-pulse 2s ease-in-out infinite; }
        .budget-shimmer { background: linear-gradient(90deg,transparent,rgba(245,158,11,0.04),transparent); background-size: 200% 100%; animation: shimmer 3s infinite; }

        .scrollbar-thin::-webkit-scrollbar { width:3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }

        .suggestion-btn { transition: all 0.18s ease; }
        .suggestion-btn:hover { transform: translateY(-1px); }

        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="h-screen w-screen flex overflow-hidden main-bg text-white font-body antialiased relative">
        <div className="ambient-top absolute inset-0 pointer-events-none z-0" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.025] rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-amber-600/[0.015] rounded-full blur-[100px] pointer-events-none z-0" />

        {/* Mobile top bar */}
        <div
          className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 border-b border-white/[0.05]"
          style={{
            background: "rgba(8,8,8,0.92)",
            backdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-bold tracking-tight">
            Market<span className="gold-text">Xpress</span>
          </span>
          <div className="w-7 h-7 rounded-lg hairline-gold bg-amber-400/[0.08] flex items-center justify-center text-[11px] font-mono text-amber-400">
            B
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 sidebar-bg flex flex-col border-r border-white/[0.05] transform transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:flex`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
            <div className="font-display text-xl font-bold tracking-tight">
              Market<span className="gold-text">Xpress</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                Engine Online
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">
            <button
              onClick={() => {
                setMessages([]);
                setHasMessages(false);
              }}
              className="w-full hairline hover:border-amber-400/25 bg-white/[0.02] hover:bg-amber-400/[0.04] text-white/60 hover:text-amber-400 transition-all duration-200 rounded-xl py-3 px-4 flex items-center gap-2.5 text-[13px] font-medium group"
            >
              <Plus className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400" />{" "}
              New Deal Sourcing
            </button>

            <button
              onClick={() => setShowMyDeals(true)}
              className="w-full hairline hover:border-amber-400/25 bg-white/[0.02] hover:bg-amber-400/[0.04] text-white/60 hover:text-amber-400 transition-all duration-200 rounded-xl py-3 px-4 flex items-center gap-2.5 text-[13px] font-medium group"
            >
              <BookmarkCheck className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400" />{" "}
              My Saved Deals ({savedDeals.length})
            </button>

            <div className="rounded-xl hairline overflow-hidden budget-shimmer">
              <div className="bg-white/[0.02] px-4 pt-3 pb-3">
                <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">
                  <Wallet className="w-3 h-3 text-amber-400" /> Budget Cap (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-amber-400/50 text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-transparent border-none outline-none pl-4 text-lg font-mono font-medium text-amber-400 placeholder-amber-400/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl hairline bg-white/[0.015] px-3 py-2.5">
                <StatBadge label="Vendors" value={8200} suffix="+" />
              </div>
              <div className="rounded-xl hairline bg-white/[0.015] px-3 py-2.5">
                <StatBadge label="Avg. Saved" value={847} suffix="₦" />
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-white/20 px-1 mb-2">
                Recent Calculations
              </span>
              <div className="space-y-0.5">
                {chatHistory.map((chat) => (
                  <HistoryItem
                    key={chat.id}
                    chat={chat}
                    active={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.05] p-4 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hairline bg-white/[0.02]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white/70 truncate">
                  Buyer Account
                </div>
                <div className="text-[10px] font-mono text-white/25 truncate">
                  Active · Tier Free
                </div>
              </div>
              <Zap className="w-3 h-3 text-amber-400/40" />
            </div>
            <button
              onClick={handleLogout}
              className="w-full hover:bg-red-500/[0.08] text-white/30 hover:text-red-400/70 rounded-xl py-2.5 px-3 flex items-center gap-2.5 text-xs font-mono transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" /> Disconnect Node
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 relative z-10">
          {hasMessages && (
            <div
              className="hidden md:flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05]"
              style={{
                background: "rgba(12,12,12,0.85)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/25 uppercase tracking-widest">
                  Active Thread
                </span>
                <span className="text-xs font-mono text-white/50">—</span>
                <span className="text-sm text-white/60">
                  {chatHistory.find((c) => c.id === activeChat)?.title ??
                    "New Session"}
                </span>
              </div>
              <div className="text-[11px] font-mono text-white/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />{" "}
                Engine nominal · {messages.length} turns
              </div>
            </div>
          )}

          <div
            ref={feedRef}
            className={`flex-1 overflow-y-auto scrollbar-thin relative ${hasMessages ? "px-4 md:px-8 py-6" : "overflow-hidden"}`}
          >
            {!hasMessages ? (
              <EmptyState onSuggestion={(text) => sendMessage(text)} />
            ) : (
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((msg) => (
                  <Bubble key={msg.id} msg={msg} messages={messages} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            )}
          </div>

          <div
            className={`px-4 md:px-8 pb-6 transition-all duration-500 ${hasMessages ? "pt-3" : "pt-0"}`}
            style={{
              background: hasMessages
                ? "linear-gradient(to top, #0C0C0C 65%, transparent)"
                : "transparent",
            }}
          >
            <div className="max-w-3xl mx-auto">
              <div className="input-area rounded-2xl overflow-hidden">
                <textarea
                  ref={inputRef}
                  disabled={isLoading}
                  value={inputMessage}
                  rows={1}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputMessage);
                    }
                  }}
                  placeholder={
                    hasMessages
                      ? "Continue the negotiation…"
                      : "I want to cook jollof rice for 6 people under ₦3,000…"
                  }
                  className="w-full bg-transparent border-none outline-none resize-none py-4 pl-4 pr-16 text-[13px] text-white/80 placeholder-white/20 font-body leading-relaxed transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: "52px", maxHeight: "120px" }}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-[10px] font-mono text-white/15 flex items-center gap-1.5">
                    <Zap className="w-2.5 h-2.5 text-amber-400/30" /> Constraint
                    engine · MarketXpressAi
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/12">
                      ⏎ send · ⇧⏎ newline
                    </span>
                    <button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={isLoading || !inputMessage.trim()}
                      className="send-btn w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed hover:scale-105 active:scale-95 ml-1"
                    >
                      <Send className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Global Modals */}
        {showMyDeals && (
          <MyDealsModal
            deals={savedDeals}
            onClose={() => setShowMyDeals(false)}
            onLoadDeal={(deal) => {
              setQrModalDeal(deal);
              setShowMyDeals(false);
            }}
          />
        )}
        {qrModalDeal && (
          <QRModal deal={qrModalDeal} onClose={() => setQrModalDeal(null)} />
        )}
      </div>
    </>
  );
};

export default ClientDashboard;
