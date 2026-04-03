import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import type { NafsQuestion } from "@/data/nafsQuestions";

interface SessionData {
  id: number;
  questions: NafsQuestion[];
  timeLimit: number;
  mode: string;
  grade?: string;
  subject?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  "لغتي": "#3498DB",
  "الرياضيات": "#E74C3C",
  "العلوم": "#27AE60",
};

export default function QuizSessionPage() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassage, setShowPassage] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.title = "الرياض تنافس - الاختبار";
    const raw = localStorage.getItem("activeQuizSession");
    if (!raw) { navigate("/quiz"); return; }
    try {
      const s: SessionData = JSON.parse(raw);
      setSession(s);
      setTimeLeft(s.timeLimit);
    } catch { navigate("/quiz"); }
  }, [navigate]);

  const handleSubmit = useCallback(
    (s: SessionData, ans: Record<string, number | null>, elapsed: number) => {
      if (submitting || submitted) return;
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const total = s.questions.length;
      let correct = 0;
      s.questions.forEach((q) => {
        if (ans[q.id] === q.answer) correct++;
      });
      const result = {
        correctAnswers: correct,
        totalQuestions: total,
        score: Math.round((correct / total) * 100),
        timeTaken: elapsed,
        questions: s.questions,
        answers: ans,
        grade: s.grade,
        subject: s.subject,
      };
      localStorage.setItem("quizResult", JSON.stringify(result));
      setSubmitted(true);
      navigate("/results");
      setSubmitting(false);
    },
    [submitting, submitted, navigate]
  );

  useEffect(() => {
    if (!session || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(session, answers, session.timeLimit);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session, submitted, handleSubmit, answers]);

  // Show passage by default when question has one
  useEffect(() => {
    if (!session) return;
    const q = session.questions[currentIdx];
    setShowPassage(!!q.passage);
  }, [currentIdx, session]);

  if (!session) {
    return (
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: "linear-gradient(135deg,#0f1a2e,#1a0a2e)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        جاري التحميل...
      </div>
    );
  }

  const q = session.questions[currentIdx];
  const total = session.questions.length;
  const answered = Object.keys(answers).filter(k => answers[k] !== null && answers[k] !== undefined).length;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const isLow = timeLeft < 60;
  const progress = ((currentIdx + 1) / total) * 100;
  const accentColor = SUBJECT_COLORS[session.subject || "لغتي"] || "#F39C12";

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: "linear-gradient(135deg,#0f1a2e,#1a0a2e,#0a1520)", minHeight: "100vh", padding: "0 0 40px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,.1)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: ".9rem" }}>
          سؤال {currentIdx + 1} / {total}
          <span style={{ color: "rgba(255,255,255,.5)", fontWeight: 600, marginRight: 8 }}>({answered} أُجيب)</span>
        </div>
        <div
          style={{
            background: isLow ? "rgba(231,76,60,.25)" : "rgba(255,255,255,.1)",
            border: `1px solid ${isLow ? "rgba(231,76,60,.5)" : "rgba(255,255,255,.2)"}`,
            color: isLow ? "#ff6b6b" : "#fff",
            padding: "6px 16px",
            borderRadius: 20,
            fontWeight: 900,
            fontSize: "1rem",
            fontFamily: "monospace",
          }}
        >
          ⏱ {mins}:{secs}
        </div>
        <button
          onClick={() => { if (confirm("هل تريد إنهاء الاختبار؟")) handleSubmit(session, answers, session.timeLimit - timeLeft); }}
          disabled={submitting}
          style={{ background: "rgba(231,76,60,.2)", border: "1px solid rgba(231,76,60,.4)", color: "#ff8a80", padding: "6px 14px", borderRadius: 9, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".82rem", fontWeight: 700 }}
        >
          {submitting ? "جاري الحساب..." : "إنهاء"}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,.1)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${accentColor},${accentColor}bb)`, transition: "width .3s" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        {/* Subject/Domain breadcrumb */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {session.subject && (
            <span style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor, padding: "3px 12px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700 }}>
              {session.subject}
            </span>
          )}
          {q.domain && (
            <span style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)", padding: "3px 12px", borderRadius: 20, fontSize: ".72rem" }}>
              {q.domain}
            </span>
          )}
        </div>

        {/* Passage block (لغتي reading comprehension) */}
        {q.passage && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowPassage(!showPassage)}
              style={{
                width: "100%",
                background: showPassage ? `${accentColor}18` : "rgba(255,255,255,.08)",
                border: `1px solid ${showPassage ? accentColor + "60" : "rgba(255,255,255,.18)"}`,
                borderRadius: showPassage ? "12px 12px 0 0" : "12px",
                padding: "10px 16px",
                color: showPassage ? accentColor : "rgba(255,255,255,.8)",
                cursor: "pointer",
                fontFamily: "'Cairo',sans-serif",
                fontSize: ".88rem",
                fontWeight: 700,
                textAlign: "right",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>📄 النص القرائي (اقرأه قبل الإجابة)</span>
              <span>{showPassage ? "▲ إخفاء" : "▼ إظهار"}</span>
            </button>
            {showPassage && (
              <div
                style={{
                  background: `${accentColor}08`,
                  border: `1px solid ${accentColor}30`,
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  padding: "16px 18px",
                  color: "rgba(255,255,255,.92)",
                  fontSize: ".92rem",
                  lineHeight: 2.1,
                  direction: "rtl",
                  fontWeight: 500,
                  whiteSpace: "pre-wrap",
                }}
              >
                {q.passage}
              </div>
            )}
          </div>
        )}

        {/* Question card */}
        <div
          style={{
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.13)",
            borderRadius: 18,
            padding: "24px",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span
              style={{
                background: `linear-gradient(135deg,${accentColor},${accentColor}bb)`,
                color: "#fff",
                width: 32,
                height: 32,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: ".85rem",
                flexShrink: 0,
              }}
            >
              {currentIdx + 1}
            </span>
            <p style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, lineHeight: 1.8, margin: 0 }}>{q.question}</p>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {q.options.map((opt: string, i: number) => {
            const selected = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                style={{
                  background: selected ? `linear-gradient(135deg,${accentColor}30,${accentColor}18)` : "rgba(255,255,255,.06)",
                  border: selected ? `2px solid ${accentColor}` : "1px solid rgba(255,255,255,.15)",
                  borderRadius: 12,
                  padding: "13px 18px",
                  color: selected ? "#fff" : "rgba(255,255,255,.85)",
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                  fontSize: ".92rem",
                  fontWeight: selected ? 700 : 500,
                  textAlign: "right",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: ".15s",
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: selected ? accentColor : "rgba(255,255,255,.1)",
                    color: selected ? "#fff" : "rgba(255,255,255,.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: ".82rem",
                    flexShrink: 0,
                  }}
                >
                  {["أ", "ب", "ج", "د"][i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
            disabled={currentIdx === 0}
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", padding: "10px 22px", borderRadius: 10, cursor: currentIdx === 0 ? "not-allowed" : "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".9rem", fontWeight: 700, opacity: currentIdx === 0 ? 0.4 : 1 }}
          >
            → السابق
          </button>

          {/* Question dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", justifyContent: "center", flex: 1, maxWidth: 300 }}>
            {session.questions.map((sq, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                title={`سؤال ${i + 1}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: i === currentIdx ? accentColor : answers[sq.id] !== undefined && answers[sq.id] !== null ? "rgba(39,174,96,.8)" : "rgba(255,255,255,.2)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: ".15s",
                }}
              />
            ))}
          </div>

          {currentIdx < total - 1 ? (
            <button
              onClick={() => setCurrentIdx((p) => Math.min(total - 1, p + 1))}
              style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", padding: "10px 22px", borderRadius: 10, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".9rem", fontWeight: 700 }}
            >
              التالي ←
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(session, answers, session.timeLimit - timeLeft)}
              disabled={submitting}
              style={{ background: submitting ? "rgba(255,255,255,.1)" : "linear-gradient(135deg,#27AE60,#1e8449)", border: "none", color: "#fff", padding: "10px 22px", borderRadius: 10, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".9rem", fontWeight: 800, boxShadow: submitting ? "none" : "0 3px 12px rgba(39,174,96,.4)" }}
            >
              {submitting ? "جاري الحساب..." : "إنهاء الاختبار ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
