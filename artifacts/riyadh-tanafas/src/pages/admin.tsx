import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const ADMIN_KEY = "0969860a95868f94163ffeb1dcdca859";

interface FeedbackItem {
  id: number;
  name: string | null;
  message: string;
  contact: string | null;
  page: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const PAGE_LABELS: Record<string, string> = {
  "/": "الرئيسية",
  "/grade3": "الصف الثالث",
  "/grade6": "الصف السادس",
  "/quiz": "الاختبار",
  "/quiz/session": "جلسة الاختبار",
  "/results": "النتيجة",
  "/stats": "الإحصائيات",
};

function FeedbackDashboard() {
  const [, navigate] = useLocation();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  async function loadFeedback() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/feedback?key=${ADMIN_KEY}`);
      if (!res.ok) throw new Error("unauthorized");
      const data = await res.json();
      setFeedback(data.feedback || []);
    } catch {
      setError("تعذّر تحميل الملاحظات");
    } finally {
      setLoading(false);
    }
  }

  async function deleteFeedback(id: number) {
    if (!confirm("هل تريد حذف هذه الملاحظة؟")) return;
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/api/feedback/${id}?key=${ADMIN_KEY}`, { method: "DELETE" });
      setFeedback((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("تعذّر الحذف");
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    document.title = "لوحة الملاحظات - إدارة";
    loadFeedback();
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', sans-serif",
        background: "linear-gradient(135deg,#0f1a2e,#1a0a2e,#0a1520)",
        minHeight: "100vh",
        padding: "24px 16px 48px",
        color: "#fff",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>📋 لوحة الملاحظات</h1>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".8rem", margin: "4px 0 0" }}>
              صفحة خاصة — {feedback.length} ملاحظة مستلمة
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={loadFeedback}
              style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", padding: "7px 14px", borderRadius: 9, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".82rem", fontWeight: 700 }}
            >
              🔄 تحديث
            </button>
            <button
              onClick={() => navigate("/")}
              style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.6)", padding: "7px 14px", borderRadius: 9, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".82rem", fontWeight: 700 }}
            >
              ← الرئيسية
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,.4)", padding: "60px 0", fontSize: ".9rem" }}>
            جاري التحميل...
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(231,76,60,.15)", border: "1px solid rgba(231,76,60,.3)", borderRadius: 12, padding: "14px 18px", color: "#ff8a80", marginBottom: 20 }}>
            {error}
          </div>
        )}

        {!loading && !error && feedback.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(255,255,255,.3)",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 20,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: "1rem", fontWeight: 700 }}>لا توجد ملاحظات بعد</div>
            <div style={{ fontSize: ".8rem", marginTop: 6 }}>ستظهر هنا ملاحظات المستفيدين فور إرسالها</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {feedback.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 16,
                padding: "18px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#1a6b55,#0e8c6b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    👤
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: ".92rem" }}>
                      {item.name || <span style={{ color: "rgba(255,255,255,.35)", fontWeight: 600 }}>مجهول</span>}
                    </div>
                    <div style={{ color: "rgba(255,255,255,.35)", fontSize: ".72rem", marginTop: 2 }}>
                      {timeAgo(item.createdAt)} · {formatDate(item.createdAt)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteFeedback(item.id)}
                  disabled={deleting === item.id}
                  style={{
                    background: "rgba(231,76,60,.12)",
                    border: "1px solid rgba(231,76,60,.25)",
                    color: "#ff8a80",
                    padding: "5px 10px",
                    borderRadius: 8,
                    cursor: deleting === item.id ? "not-allowed" : "pointer",
                    fontFamily: "'Cairo',sans-serif",
                    fontSize: ".75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {deleting === item.id ? "..." : "🗑 حذف"}
                </button>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "rgba(255,255,255,.9)",
                  fontSize: ".9rem",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  marginBottom: 10,
                }}
              >
                {item.message}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {item.contact && (
                  <span style={{ background: "rgba(52,152,219,.15)", border: "1px solid rgba(52,152,219,.3)", color: "#74b9ff", padding: "3px 10px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700 }}>
                    📞 {item.contact}
                  </span>
                )}
                {item.page && (
                  <span style={{ background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.4)", padding: "3px 10px", borderRadius: 20, fontSize: ".72rem" }}>
                    📍 {PAGE_LABELS[item.page] || item.page}
                  </span>
                )}
                <span style={{ background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.3)", padding: "3px 10px", borderRadius: 20, fontSize: ".7rem" }}>
                  #{item.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const urlKey = new URLSearchParams(window.location.search).get("k");

  if (urlKey !== ADMIN_KEY) {
    return (
      <div
        dir="rtl"
        style={{ fontFamily: "'Cairo',sans-serif", background: "#0f1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 700, color: "rgba(255,255,255,.4)", fontSize: ".9rem" }}>الصفحة غير متاحة</div>
        </div>
      </div>
    );
  }

  return <FeedbackDashboard />;
}
