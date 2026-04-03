import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { submitQuizSession, type Question } from "@/lib/quizApi";
import type { LocalQuestion } from "@/data/localQuestions";

type AnyQuestion = (Question | LocalQuestion) & { passage?: string };

interface SessionData {
  id: number;
  questions: AnyQuestion[];
  timeLimit: number;
  mode: "local" | "nafes2";
}

// Detect if a question text references a passage without including it
function questionNeedsPassage(text: string): boolean {
  return (
    /في النص|من النص|الفقرة|القطعة|اقرأ النص|اقرأ الفقرة|بناءً على النص|بناءً على الفقرة/.test(text) &&
    text.length < 200
  );
}

export default function QuizSessionPage() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassage, setShowPassage] = useState(false);
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
    async (s: SessionData, ans: Record<number, number | null>, elapsed: number) => {
      if (submitting || submitted) return;
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        if (s.mode === "local") {
          // Local questions: compute results client-side
          const total = s.questions.length;
          let correct = 0;
          s.questions.forEach((q) => {
            if (ans[q.id] === q.correctAnswer) correct++;
          });
          const result = {
            correctAnswers: correct,
            totalQuestions: total,
            score: Math.round((correct / total) * 100),
            timeTaken: elapsed,
            questions: s.questions,
            answers: ans,
            mode: "local",
          };
          localStorage.setItem("quizResult", JSON.stringify(result));
        } else {
          // nafes2 API: submit remotely
          const answerList = s.questions.map((q) => ({
            questionId: q.id,
            selectedAnswer: ans[q.id] !== undefined ? ans[q.id] : null,
          }));
          try {
            const result = await submitQuizSession(s.id, answerList, elapsed);
            localStorage.setItem("quizResult", JSON.stringify({ ...result, questions: s.questions, answers: ans }));
          } catch {
            // Fallback: compute locally
            const total = s.questions.length;
            let correct = 0;
            s.questions.forEach((q) => { if (ans[q.id] === q.correctAnswer) correct++; });
            localStorage.setItem("quizResult", JSON.stringify({
              correctAnswers: correct, totalQuestions: total,
              score: Math.round((correct / total) * 100), timeTaken: elapsed,
              questions: s.questions, answers: ans,
            }));
          }
        }
        setSubmitted(true);
        navigate("/results");
      } finally {
        setSubmitting(false);
      }
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

  // Reset passage view when changing question
  useEffect(() => { setShowPassage(false); }, [currentIdx]);

  if (!session) {
    return (
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: "linear-gradient(135deg,#0f1a2e,#1a0a2e)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        جاري التحميل...
      </div>
    );
  }

  const q = session.questions[currentIdx];
  const total = session.questions.length;
  const answered = Object.keys(answers).length;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const isLow = timeLeft < 60;
  const progress = ((currentIdx + 1) / total) * 100;
  const hasPassage = !!(q as LocalQuestion).passage;
  const needsPassageNote = !hasPassage && questionNeedsPassage(q.text);

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
          {submitting ? "جاري الإرسال..." : "إنهاء"}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,.1)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#F39C12,#E67E22)", transition: "width .3s" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        {/* Passage (if attached to question) */}
        {hasPassage && (
          <div style={{ marginBottom: 14 }}>
            <button
              onClick={() => setShowPassage(!showPassage)}
              style={{
                width: "100%",
                background: showPassage ? "rgba(243,156,18,.18)" : "rgba(255,255,255,.08)",
                border: `1px solid ${showPassage ? "rgba(243,156,18,.5)" : "rgba(255,255,255,.18)"}`,
                borderRadius: 12,
                padding: "10px 16px",
                color: showPassage ? "#F39C12" : "rgba(255,255,255,.8)",
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
              <span>📄 اقرأ النص المرفق أولاً</span>
              <span>{showPassage ? "▲ إخفاء" : "▼ إظهار"}</span>
            </button>
            {showPassage && (
              <div
                style={{
                  background: "rgba(243,156,18,.07)",
                  border: "1px solid rgba(243,156,18,.25)",
                  borderRadius: "0 0 12px 12px",
                  padding: "16px 18px",
                  color: "rgba(255,255,255,.9)",
                  fontSize: ".92rem",
                  lineHeight: 2,
                  direction: "rtl",
                  fontWeight: 500,
                }}
              >
                {(q as LocalQuestion).passage}
              </div>
            )}
          </div>
        )}

        {/* Note if question needs passage but it's missing */}
        {needsPassageNote && (
          <div
            style={{
              background: "rgba(243,156,18,.1)",
              border: "1px solid rgba(243,156,18,.3)",
              borderRadius: 12,
              padding: "10px 14px",
              color: "#ffd32a",
              fontSize: ".8rem",
              marginBottom: 14,
              lineHeight: 1.55,
            }}
          >
            ⚠️ هذا السؤال يشير إلى نص قرائي. يُرجى مراجعة المصدر الأصلي للاطلاع على النص كاملاً.
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
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span
              style={{
                background: "linear-gradient(135deg,#F39C12,#E67E22)",
                color: "#fff",
                width: 30,
                height: 30,
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
            <p style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, lineHeight: 1.7, margin: 0 }}>{q.text}</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {"category" in q && q.category && (
              <span style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.5)", padding: "2px 10px", borderRadius: 20, fontSize: ".7rem" }}>
                {(q.category as string).replace("كفايات تربوية - ", "كفايات: ")}
              </span>
            )}
            {"topic" in q && q.topic && (
              <span style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.45)", padding: "2px 10px", borderRadius: 20, fontSize: ".7rem" }}>
                {q.topic as string}
              </span>
            )}
            {session.mode === "local" && (
              <span style={{ background: "rgba(39,174,96,.15)", color: "#7bed9f", padding: "2px 10px", borderRadius: 20, fontSize: ".7rem" }}>
                ✅ موثّق
              </span>
            )}
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
                  background: selected ? "linear-gradient(135deg,rgba(243,156,18,.3),rgba(230,126,34,.2))" : "rgba(255,255,255,.06)",
                  border: selected ? "2px solid #F39C12" : "1px solid rgba(255,255,255,.15)",
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
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: selected ? "#F39C12" : "rgba(255,255,255,.1)",
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
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", justifyContent: "center", flex: 1 }}>
            {session.questions.map((sq, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                title={`سؤال ${i + 1}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: i === currentIdx ? "#F39C12" : answers[sq.id] !== undefined ? "rgba(39,174,96,.8)" : "rgba(255,255,255,.2)",
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
              {submitting ? "جاري الإرسال..." : "إنهاء الاختبار ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
