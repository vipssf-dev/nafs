import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";

export interface AnswerItem {
  q: number;
  letter: string;
  text: string;
}

interface GradeViewerProps {
  title: string;
  subtitle: string;
  badge: string;
  gradientColors: { c1: string; c2: string; accent: string };
  questionPages: string[];
  answerPanelMode: "text" | "image";
  textAnswers?: Record<string, AnswerItem[]>;
  answerPages?: string[];
}

export default function GradeViewer({
  title,
  subtitle,
  badge,
  gradientColors,
  questionPages,
  answerPanelMode,
  textAnswers,
  answerPages,
}: GradeViewerProps) {
  const [cur, setCur] = useState(1);
  const [showAns, setShowAns] = useState(true);
  const [, navigate] = useLocation();
  const thumbsRef = useRef<HTMLDivElement>(null);
  const total = questionPages.length;

  const { c1, c2, accent } = gradientColors;

  const goPage = useCallback(
    (n: number) => {
      if (n < 1 || n > total) return;
      setCur(n);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [total]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goPage(cur - 1);
      if (e.key === "ArrowLeft") goPage(cur + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cur, goPage]);

  useEffect(() => {
    const thumb = document.getElementById(`thumb-${cur}`);
    if (thumb) {
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [cur]);

  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById("scroll-top-btn");
      if (btn) btn.style.display = window.scrollY > 300 ? "flex" : "none";
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerGrad = `linear-gradient(135deg,${c1},${c2})`;

  const answers = textAnswers?.[String(cur)] ?? [];

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', sans-serif",
        background: `linear-gradient(135deg,${c1},${c2},${c1})`,
        minHeight: "100vh",
        color: "#2C3E50",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        .thumb-item { flex-shrink: 0; width: 48px; height: 62px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; overflow: hidden; transition: .2s; position: relative; }
        .thumb-item.active { border-color: #F1C40F; box-shadow: 0 0 10px rgba(241,196,15,.55); }
        .thumb-item:hover:not(.active) { border-color: rgba(255,255,255,.45); transform: translateY(-2px); }
        .thumb-item img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,.6); color: #fff; font-size: 8.5px; text-align: center; padding: 1px 0; font-family: 'Cairo', sans-serif; }
        .nav-btn { background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.3); color: #fff; padding: 7px 16px; border-radius: 9px; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: .88rem; font-weight: 700; transition: .2s; }
        .nav-btn:hover:not(:disabled) { background: rgba(255,255,255,.35); transform: translateY(-1px); }
        .nav-btn:disabled { opacity: .3; cursor: not-allowed; }
        .ans-item:hover { transform: translateY(-2px); box-shadow: 0 2px 8px rgba(39,174,96,.2); }
        @media (max-width: 600px) {
          .ans-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: headerGrad,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,.35)",
          position: "sticky",
          top: 0,
          zIndex: 200,
          gap: 12,
        }}
      >
        {/* Right side (RTL start): school name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 900, lineHeight: 1.2 }}>
            مدرسة الرياض الابتدائية
          </div>
          <div style={{ color: "rgba(255,255,255,.75)", fontSize: ".78rem", marginTop: 2 }}>{subtitle}</div>
        </div>

        {/* Center: trophy + title + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: "1.6rem" }}>🏆</span>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 900 }}>{title}</div>
            <div
              style={{
                background: accent,
                color: "#fff",
                padding: "2px 12px",
                borderRadius: 20,
                fontWeight: 800,
                fontSize: ".76rem",
                display: "inline-block",
                marginTop: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,.2)",
              }}
            >
              {badge}
            </div>
          </div>
        </div>

        {/* Left side (RTL end): NAFS logo + back button */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <img
            src={`${import.meta.env.BASE_URL}nafs-logo.png`}
            alt="نافس"
            style={{ height: 52, width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.2))" }}
          />
          <button
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,.15)",
              border: "1px solid rgba(255,255,255,.3)",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              fontSize: ".82rem",
              fontWeight: 600,
            }}
          >
            ← الرئيسية
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: "20px 14px" }}>
        {/* Nav bar */}
        <div
          style={{
            background: "rgba(255,255,255,.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,.2)",
            borderRadius: 14,
            padding: "12px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap" as const,
          }}
        >
          <div style={{ color: "#fff", fontWeight: 700, fontSize: ".92rem" }}>
            صفحة {cur} من {total}
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <button className="nav-btn" disabled={cur <= 1} onClick={() => goPage(cur - 1)}>
              → السابق
            </button>
            <input
              type="number"
              min={1}
              max={total}
              value={cur}
              onChange={(e) => goPage(Number(e.target.value))}
              style={{
                background: "rgba(255,255,255,.15)",
                border: "1px solid rgba(255,255,255,.3)",
                color: "#fff",
                padding: "6px 8px",
                borderRadius: 8,
                width: 56,
                textAlign: "center",
                fontFamily: "'Cairo', sans-serif",
                fontSize: ".88rem",
              }}
            />
            <button className="nav-btn" disabled={cur >= total} onClick={() => goPage(cur + 1)}>
              ← التالي
            </button>
          </div>
          <button
            onClick={() => setShowAns((v) => !v)}
            style={{
              background: showAns
                ? "linear-gradient(135deg,#27AE60,#1e8449)"
                : "linear-gradient(135deg,#E74C3C,#c0392b)",
              border: "none",
              color: "#fff",
              padding: "7px 18px",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              fontSize: ".88rem",
              fontWeight: 800,
              transition: ".2s",
              boxShadow: showAns
                ? "0 2px 8px rgba(39,174,96,.4)"
                : "0 2px 8px rgba(231,76,60,.4)",
            }}
          >
            {showAns ? "إخفاء الإجابات" : "إظهار الإجابات"}
          </button>
        </div>

        {/* Thumbnail strip */}
        <div
          ref={thumbsRef}
          style={{
            background: "rgba(255,255,255,.07)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,.14)",
            borderRadius: 14,
            padding: 10,
            marginBottom: 16,
            overflowX: "auto",
            display: "flex",
            gap: 5,
          }}
        >
          {questionPages.map((img, i) => {
            const pageNum = i + 1;
            return (
              <div
                key={pageNum}
                id={`thumb-${pageNum}`}
                className={`thumb-item${cur === pageNum ? " active" : ""}`}
                onClick={() => goPage(pageNum)}
              >
                <img src={`data:image/jpeg;base64,${img}`} loading="lazy" alt={`صفحة ${pageNum}`} />
                <div className="thumb-label">{pageNum}</div>
              </div>
            );
          })}
        </div>

        {/* Main card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,.32)",
          }}
        >
          <div
            style={{
              background: headerGrad,
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fff",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: ".95rem" }}>صفحة {cur}</span>
          </div>

          <img
            src={`data:image/jpeg;base64,${questionPages[cur - 1]}`}
            alt={`سؤال صفحة ${cur}`}
            style={{ width: "100%", display: "block", background: "#f8f9fa" }}
          />

          {showAns && (
            <>
              {answerPanelMode === "text" && (
                <div
                  style={{
                    padding: "14px 18px",
                    background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                    borderTop: "3px solid #27AE60",
                  }}
                >
                  <div
                    style={{
                      color: "#166534",
                      fontSize: ".9rem",
                      fontWeight: 800,
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <span
                      style={{
                        background: "#27AE60",
                        color: "#fff",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".7rem",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    مفتاح الإجابات
                  </div>
                  <div
                    className="ans-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
                      gap: 7,
                    }}
                  >
                    {answers.length > 0 ? (
                      answers.map((a) => (
                        <div
                          key={a.q}
                          className="ans-item"
                          style={{
                            background: "#fff",
                            border: "2px solid #bbf7d0",
                            borderRadius: 9,
                            padding: "7px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: ".2s",
                          }}
                        >
                          <div
                            style={{
                              background: c2,
                              color: "#fff",
                              width: 26,
                              height: 26,
                              borderRadius: 7,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: ".75rem",
                              flexShrink: 0,
                            }}
                          >
                            {a.q}
                          </div>
                          <div
                            style={{
                              background: "#27AE60",
                              color: "#fff",
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: ".85rem",
                              flexShrink: 0,
                            }}
                          >
                            {a.letter}
                          </div>
                          <div style={{ fontSize: ".78rem", color: "#2C3E50", fontWeight: 600, lineHeight: 1.3 }}>
                            {a.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#6b7280", fontSize: ".82rem", padding: 4 }}>لا توجد إجابات لهذه الصفحة</p>
                    )}
                  </div>
                </div>
              )}

              {answerPanelMode === "image" && answerPages && (
                <div
                  style={{
                    background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                    borderTop: "3px solid #27AE60",
                  }}
                >
                  <div
                    style={{
                      color: "#166534",
                      fontSize: ".9rem",
                      fontWeight: 800,
                      padding: "10px 18px 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <span
                      style={{
                        background: "#27AE60",
                        color: "#fff",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".7rem",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    مفتاح الإجابات
                  </div>
                  <img
                    src={`data:image/jpeg;base64,${answerPages[cur - 1]}`}
                    alt="مفتاح الإجابة"
                    style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto", padding: "0 10px 10px" }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scroll-to-top button */}
      <button
        id="scroll-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          position: "fixed",
          bottom: 26,
          left: 26,
          background: accent,
          color: "#fff",
          border: "none",
          width: 44,
          height: 44,
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "1.1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,.3)",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}
      >
        ↑
      </button>

      <footer style={{ textAlign: "center", color: "rgba(255,255,255,.45)", fontSize: ".75rem", padding: 18, marginTop: 16 }}>
        الرياض تنافس · تدريبات على اختبارات نافس
      </footer>
    </div>
  );
}
