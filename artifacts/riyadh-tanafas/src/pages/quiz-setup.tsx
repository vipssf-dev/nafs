import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nafsQuestions, getQuestions, getDomains, type NafsQuestion } from "@/data/nafsQuestions";

type Grade = "grade3" | "grade6";
type Subject = "لغتي" | "الرياضيات" | "العلوم";

const SUBJECTS_BY_GRADE: Record<Grade, Subject[]> = {
  grade3: ["لغتي", "الرياضيات"],
  grade6: ["لغتي", "الرياضيات", "العلوم"],
};

const GRADE_LABELS: Record<Grade, string> = {
  grade3: "الصف الثالث الابتدائي",
  grade6: "الصف السادس الابتدائي",
};

const SUBJECT_ICONS: Record<Subject, string> = {
  "لغتي": "📖",
  "الرياضيات": "🔢",
  "العلوم": "🔬",
};

const SUBJECT_COLORS: Record<Subject, string> = {
  "لغتي": "#3498DB",
  "الرياضيات": "#E74C3C",
  "العلوم": "#27AE60",
};

const COUNT_OPTIONS = [5, 10, 15, 20, 30];
const TIME_OPTIONS = [
  { value: 5, label: "5 دقائق" },
  { value: 10, label: "10 دقائق" },
  { value: 15, label: "15 دقيقة" },
  { value: 20, label: "20 دقيقة" },
  { value: 30, label: "30 دقيقة" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizSetup() {
  const [, navigate] = useLocation();
  const [grade, setGrade] = useState<Grade>("grade3");
  const [subject, setSubject] = useState<Subject>("لغتي");
  const [domain, setDomain] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "الرياض تنافس - إعداد الاختبار";
  }, []);

  // Reset subject when grade changes if subject not available
  useEffect(() => {
    if (!SUBJECTS_BY_GRADE[grade].includes(subject)) {
      setSubject("لغتي");
    }
    setDomain("all");
  }, [grade, subject]);

  // Reset domain when subject changes
  useEffect(() => {
    setDomain("all");
  }, [subject]);

  const domains = getDomains(subject, grade);
  const availableQuestions = getQuestions(subject, grade, domain !== "all" ? domain : undefined);
  const availableCount = availableQuestions.length;

  function handleStart() {
    setError("");
    if (availableCount === 0) {
      setError("لا توجد أسئلة لهذا الاختيار.");
      return;
    }

    const picked: NafsQuestion[] = shuffle(availableQuestions).slice(0, questionCount);

    const session = {
      id: Date.now(),
      questions: picked,
      timeLimit: timeMinutes * 60,
      mode: "nafs",
      grade,
      subject,
    };
    localStorage.setItem("activeQuizSession", JSON.stringify(session));
    navigate("/quiz/session");
  }

  const accentColor = SUBJECT_COLORS[subject];
  const actualCount = Math.min(questionCount, availableCount);

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', sans-serif",
        background: "linear-gradient(135deg,#0f1a2e,#1a0a2e,#0a1520)",
        minHeight: "100vh",
        padding: "20px 16px 40px",
        color: "#fff",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingTop: 8 }}>
          <button onClick={() => navigate("/")} style={btnSecStyle}>
            ← الرئيسية
          </button>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>⚡ اختبار تدريبي نافس</h1>
        </div>

        {/* Source badge */}
        <div
          style={{
            background: "rgba(52,152,219,.1)",
            border: "1px solid rgba(52,152,219,.25)",
            borderRadius: 12,
            padding: "10px 16px",
            marginBottom: 22,
            fontSize: ".82rem",
            color: "#74b9ff",
            lineHeight: 1.6,
          }}
        >
          📌 الأسئلة مستخرجة من موقع <strong>nafs.pro</strong> — مصنّفة حسب الصف والمادة والمجال بدون أي تداخل.
        </div>

        <div
          style={{
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 20,
            padding: "28px 24px",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Grade selector */}
          <SettingBlock label="الصف الدراسي" icon="🎓">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["grade3", "grade6"] as Grade[]).map((g) => (
                <GradeCard
                  key={g}
                  active={grade === g}
                  label={GRADE_LABELS[g]}
                  onClick={() => setGrade(g)}
                />
              ))}
            </div>
          </SettingBlock>

          {/* Subject selector */}
          <SettingBlock label="المادة الدراسية" icon="📚">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {SUBJECTS_BY_GRADE[grade].map((s) => (
                <SubjectCard
                  key={s}
                  active={subject === s}
                  icon={SUBJECT_ICONS[s]}
                  label={s}
                  color={SUBJECT_COLORS[s]}
                  onClick={() => setSubject(s)}
                  count={nafsQuestions.filter(q => q.subject === s && q.grade === grade).length}
                />
              ))}
            </div>
          </SettingBlock>

          {/* Domain selector */}
          {domains.length > 1 && (
            <SettingBlock label="المجال" icon="📂">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <OptionChip
                  label="الكل"
                  active={domain === "all"}
                  onClick={() => setDomain("all")}
                  accent={accentColor}
                />
                {domains.map((d) => {
                  const cnt = getQuestions(subject, grade, d).length;
                  return (
                    <OptionChip
                      key={d}
                      label={`${d} (${cnt})`}
                      active={domain === d}
                      onClick={() => setDomain(d)}
                      accent={accentColor}
                    />
                  );
                })}
              </div>
            </SettingBlock>
          )}

          {/* Available count */}
          <div
            style={{
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}30`,
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: ".82rem",
              color: accentColor,
              marginBottom: 20,
            }}
          >
            📊 {availableCount} سؤال متاح في هذا التصنيف
          </div>

          {/* Question count */}
          <SettingBlock label="عدد الأسئلة" icon="🔢">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COUNT_OPTIONS.map((n) => (
                <OptionChip
                  key={n}
                  label={String(n)}
                  active={questionCount === n}
                  onClick={() => setQuestionCount(n)}
                  accent={accentColor}
                />
              ))}
            </div>
          </SettingBlock>

          {/* Time */}
          <SettingBlock label="الوقت المتاح" icon="⏱️">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TIME_OPTIONS.map((t) => (
                <OptionChip
                  key={t.value}
                  label={t.label}
                  active={timeMinutes === t.value}
                  onClick={() => setTimeMinutes(t.value)}
                  accent={accentColor}
                />
              ))}
            </div>
          </SettingBlock>

          {error && (
            <div
              style={{
                background: "rgba(231,76,60,.15)",
                border: "1px solid rgba(231,76,60,.35)",
                borderRadius: 10,
                padding: "10px 16px",
                color: "#ff8a80",
                fontSize: ".88rem",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            style={{
              width: "100%",
              background: `linear-gradient(135deg,${accentColor},${accentColor}bb)`,
              border: "none",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: 14,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              fontSize: "1.05rem",
              fontWeight: 900,
              marginTop: 8,
              transition: ".2s",
              boxShadow: `0 4px 18px ${accentColor}40`,
            }}
          >
            ابدأ الاختبار ({actualCount} سؤال) ←
          </button>
        </div>
      </div>
    </div>
  );
}

const btnSecStyle: React.CSSProperties = {
  background: "rgba(255,255,255,.12)",
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
  padding: "7px 16px",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "'Cairo', sans-serif",
  fontSize: ".85rem",
  fontWeight: 700,
};

function GradeCard({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? "rgba(243,156,18,.18)" : "rgba(255,255,255,.05)",
        border: `2px solid ${active ? "#F39C12" : "rgba(255,255,255,.12)"}`,
        borderRadius: 14,
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "center",
        transition: ".15s",
        fontWeight: active ? 800 : 600,
        color: active ? "#F39C12" : "rgba(255,255,255,.8)",
        fontSize: ".9rem",
      }}
    >
      {label}
    </div>
  );
}

function SubjectCard({
  active, icon, label, color, onClick, count,
}: {
  active: boolean; icon: string; label: string; color: string; onClick: () => void; count: number;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? `${color}18` : "rgba(255,255,255,.05)",
        border: `2px solid ${active ? color : "rgba(255,255,255,.12)"}`,
        borderRadius: 14,
        padding: "14px 12px",
        cursor: "pointer",
        textAlign: "center",
        transition: ".15s",
      }}
    >
      <div style={{ fontSize: "1.6rem", marginBottom: 5 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: ".9rem", color: active ? color : "#fff", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.45)" }}>{count} سؤال</div>
    </div>
  );
}

function SettingBlock({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          color: "rgba(255,255,255,.7)",
          fontSize: ".85rem",
          fontWeight: 700,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>{icon}</span> {label}
      </div>
      {children}
    </div>
  );
}

function OptionChip({
  label, active, onClick, accent,
}: {
  label: string; active: boolean; onClick: () => void; accent: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${accent}25` : "rgba(255,255,255,.08)",
        border: `1.5px solid ${active ? accent : "rgba(255,255,255,.15)"}`,
        color: active ? "#fff" : "rgba(255,255,255,.75)",
        padding: "7px 14px",
        borderRadius: 9,
        cursor: "pointer",
        fontFamily: "'Cairo', sans-serif",
        fontSize: ".82rem",
        fontWeight: active ? 800 : 600,
        transition: ".15s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </button>
  );
}
