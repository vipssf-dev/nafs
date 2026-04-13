import { useState } from "react";
import { useLocation } from "wouter";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [location] = useLocation();

  function reset() {
    setName("");
    setMessage("");
    setContact("");
    setSent(false);
    setError("");
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { setError("يرجى كتابة ملاحظتك أو اقتراحك"); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          message: message.trim(),
          contact: contact.trim() || null,
          page: location,
        }),
      });
      if (!res.ok) throw new Error("server error");
      setSent(true);
    } catch {
      setError("حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button with label */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: 16,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            background: "rgba(14,140,107,.85)",
            color: "#fff",
            fontSize: ".68rem",
            fontWeight: 700,
            fontFamily: "'Cairo', sans-serif",
            padding: "3px 9px",
            borderRadius: 20,
            backdropFilter: "blur(6px)",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,.25)",
            letterSpacing: ".3px",
          }}
        >
          ملاحظتك تهمنا
        </span>
        <button
          onClick={() => { setOpen(true); setSent(false); }}
          title="ملاحظات واقتراحات"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#1a6b55,#0e8c6b)",
            border: "2px solid rgba(255,255,255,.2)",
            color: "#fff",
            fontSize: "1.3rem",
            cursor: "pointer",
            boxShadow: "0 4px 18px rgba(0,0,0,.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform .2s, box-shadow .2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,0,0,.45)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(0,0,0,.35)";
          }}
        >
          💬
        </button>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            dir="rtl"
            style={{
              background: "linear-gradient(160deg,#0f1a2e,#1a0a2e)",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: 20,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 460,
              color: "#fff",
              fontFamily: "'Cairo', sans-serif",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,.5)",
            }}
          >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

            <button
              onClick={handleClose}
              style={{ position: "absolute", top: 14, left: 14, background: "none", border: "none", color: "rgba(255,255,255,.5)", fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: 6, marginTop: 0 }}>
              💬 ملاحظاتك تهمنا
            </h2>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".82rem", marginBottom: 22, marginTop: 0 }}>
              شاركنا ملاحظاتك أو اقتراحاتك لتحسين الموقع
            </p>

            {sent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>شكراً لك!</div>
                <div style={{ color: "rgba(255,255,255,.55)", fontSize: ".85rem", marginBottom: 24 }}>
                  وصلت ملاحظتك بنجاح وسنأخذها بعين الاعتبار
                </div>
                <button
                  onClick={handleClose}
                  style={{ background: "linear-gradient(135deg,#1a6b55,#0e8c6b)", border: "none", color: "#fff", padding: "10px 28px", borderRadius: 10, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: ".9rem" }}
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Field label="الاسم (اختياري)">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك..."
                    style={inputStyle}
                  />
                </Field>

                <Field label="الملاحظة أو الاقتراح *">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب ملاحظتك أو اقتراحك هنا..."
                    rows={4}
                    required
                    style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                  />
                </Field>

                <Field label="وسيلة التواصل (اختياري)">
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="جوال / بريد إلكتروني / تويتر..."
                    style={inputStyle}
                  />
                </Field>

                {error && (
                  <div style={{ color: "#ff8a80", fontSize: ".82rem", marginBottom: 14, background: "rgba(231,76,60,.12)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(231,76,60,.3)" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    width: "100%",
                    background: sending ? "rgba(255,255,255,.1)" : "linear-gradient(135deg,#1a6b55,#0e8c6b)",
                    border: "none",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: 12,
                    cursor: sending ? "not-allowed" : "pointer",
                    fontFamily: "'Cairo',sans-serif",
                    fontWeight: 800,
                    fontSize: ".95rem",
                    marginTop: 4,
                    boxShadow: sending ? "none" : "0 4px 14px rgba(14,140,107,.3)",
                  }}
                >
                  {sending ? "جاري الإرسال..." : "إرسال الملاحظة ←"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: ".82rem", fontWeight: 700, color: "rgba(255,255,255,.65)", marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.15)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#fff",
  fontFamily: "'Cairo',sans-serif",
  fontSize: ".88rem",
  outline: "none",
  boxSizing: "border-box",
};
