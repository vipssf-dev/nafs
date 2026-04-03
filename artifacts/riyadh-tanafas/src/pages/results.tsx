import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import type { NafsQuestion } from "@/data/nafsQuestions";

interface StoredResult {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  timeTaken: number;
  questions: NafsQuestion[];
  answers: Record<string, number | null>;
  grade?: string;
  subject?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  "لغتي": "#3498DB",
  "الرياضيات": "#E74C3C",
  "العلوم": "#27AE60",
};

export default function Results() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<StoredResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedPassage, setExpandedPassage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "الرياض تنافس - النتيجة";
    const raw = localStorage.getItem("quizResult");
    if (!raw) { navigate("/"); return; }
    try { setResult(JSON.parse(raw)); } catch { navigate("/"); }
  }, [navigate]);

  if (!result) return null;

  const { correctAnswers, totalQuestions, score, timeTaken, questions, answers, subject } = result;
  const wrong = totalQuestions - correctAnswers;
  const unanswered = totalQuestions - Object.keys(answers).filter(k => answers[k] !== null && answers[k] !== undefined).length;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  const scoreColor = score >= 80 ? "#27AE60" : score >= 60 ? "#F39C12" : "#E74C3C";
  const scoreLabel = score >= 80 ? "ممتاز! 🌟" : score >= 60 ? "جيد 👍" : "تحتاج مراجعة 📚";
  const accentColor = (subject && SUBJECT_COLORS[subject]) || "#F39C12";

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: "linear-gradient(135deg,#0f1a2e,#1a0a2e,#0a1520)", minHeight: "100vh", padding: "24px 16px 48px", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 900, marginBottom: 4 }}>🏆 نتيجة الاختبار</h1>
        {subject && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor, padding: "4px 16px", borderRadius: 20, fontSize: ".82rem", fontWeight: 700 }}>
              {subject}
            </span>
          </div>
        )}

        {/* Score circle */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: `6px solid ${scoreColor}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              background: `${scoreColor}18`,
              boxShadow: `0 0 30px ${scoreColor}40`,
            }}
          >
            <div style={{ fontSize: "2.6rem", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.6)", marginTop: 4 }}>النتيجة</div>
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: scoreColor }}>{scoreLabel}</div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { label: "إجمالي الأسئلة", value: totalQuestions, color: "#74b9ff" },
            { label: "إجابات صحيحة", value: correctAnswers, color: "#27AE60" },
            { label: "إجابات خاطئة", value: wrong - unanswered, color: "#E74C3C" },
            { label: "الوقت", value: `${mins}:${secs.toString().padStart(2, "0")}`, color: "#F39C12" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 14,
                padding: "14px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.55)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => { localStorage.removeItem("activeQuizSession"); navigate("/quiz"); }}
            style={{ flex: 1, background: `linear-gradient(135deg,${accentColor},${accentColor}bb)`, border: "none", color: "#fff", padding: "13px 20px", borderRadius: 12, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: "1rem", fontWeight: 800, boxShadow: `0 4px 14px ${accentColor}40` }}
          >
            اختبار جديد ←
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ flex: 1, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", color: "#fff", padding: "13px 20px", borderRadius: 12, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: "1rem", fontWeight: 700 }}
          >
            الرئيسية 🏠
          </button>
        </div>

        {/* Toggle details */}
        <button
          onClick={() => setShowDetails((v) => !v)}
          style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.14)", color: "rgba(255,255,255,.75)", padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".88rem", fontWeight: 700, marginBottom: showDetails ? 16 : 0 }}
        >
          {showDetails ? "إخفاء التفاصيل ▲" : "عرض تفاصيل الأسئلة ▼"}
        </button>

        {/* Questions review */}
        {showDetails && questions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.answer;
              const notAnswered = userAns === undefined || userAns === null;
              const borderColor = notAnswered ? "rgba(255,255,255,.15)" : isCorrect ? "#27AE60" : "#E74C3C";
              const bgColor = notAnswered ? "rgba(255,255,255,.05)" : isCorrect ? "rgba(39,174,96,.1)" : "rgba(231,76,60,.1)";
              const isPassageExpanded = expandedPassage === q.id;

              return (
                <div
                  key={q.id}
                  style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: 14, padding: "16px 18px" }}
                >
                  {/* Passage toggle */}
                  {q.passage && (
                    <div style={{ marginBottom: 10 }}>
                      <button
                        onClick={() => setExpandedPassage(isPassageExpanded ? null : q.id)}
                        style={{ background: "rgba(52,152,219,.12)", border: "1px solid rgba(52,152,219,.3)", color: "#74b9ff", padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".75rem", fontWeight: 700 }}
                      >
                        📄 {isPassageExpanded ? "إخفاء النص" : "عرض النص القرائي"}
                      </button>
                      {isPassageExpanded && (
                        <div style={{ marginTop: 8, background: "rgba(52,152,219,.07)", border: "1px solid rgba(52,152,219,.2)", borderRadius: 8, padding: "12px 14px", color: "rgba(255,255,255,.85)", fontSize: ".85rem", lineHeight: 2, whiteSpace: "pre-wrap" }}>
                          {q.passage}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ background: isCorrect ? "#27AE60" : notAnswered ? "rgba(255,255,255,.2)" : "#E74C3C", color: "#fff", width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", fontWeight: 900, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <p style={{ margin: 0, color: "#fff", fontSize: ".9rem", fontWeight: 600, lineHeight: 1.65 }}>{q.question}</p>
                  </div>

                  {/* Domain tag */}
                  {q.domain && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.45)", padding: "2px 10px", borderRadius: 20, fontSize: ".7rem" }}>{q.domain}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {q.options.map((opt, oi) => {
                      const isCorrectOpt = oi === q.answer;
                      const isUserOpt = oi === userAns;
                      let bg = "rgba(255,255,255,.06)";
                      let border = "1px solid rgba(255,255,255,.12)";
                      let color = "rgba(255,255,255,.7)";
                      if (isCorrectOpt) { bg = "rgba(39,174,96,.2)"; border = "1px solid #27AE60"; color = "#fff"; }
                      if (isUserOpt && !isCorrectOpt) { bg = "rgba(231,76,60,.2)"; border = "1px solid #E74C3C"; color = "#fff"; }

                      return (
                        <div key={oi} style={{ background: bg, border, borderRadius: 8, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 20, height: 20, borderRadius: 5, background: isCorrectOpt ? "#27AE60" : isUserOpt ? "#E74C3C" : "rgba(255,255,255,.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem", fontWeight: 800, flexShrink: 0 }}>
                            {["أ", "ب", "ج", "د"][oi]}
                          </span>
                          <span style={{ fontSize: ".82rem", color }}>{opt}</span>
                          {isCorrectOpt && <span style={{ marginRight: "auto", fontSize: ".75rem", color: "#27AE60", fontWeight: 800 }}>✓ صحيح</span>}
                          {isUserOpt && !isCorrectOpt && <span style={{ marginRight: "auto", fontSize: ".75rem", color: "#E74C3C", fontWeight: 800 }}>✗ اخترت</span>}
                        </div>
                      );
                    })}
                  </div>

                  {notAnswered && (
                    <div style={{ marginTop: 8, color: "rgba(255,255,255,.4)", fontSize: ".75rem" }}>لم يتم الإجابة</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
