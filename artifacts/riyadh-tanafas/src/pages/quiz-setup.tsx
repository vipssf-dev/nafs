import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { fetchCategories, fetchTopics, createQuizSession, type Category, type Topic } from "@/lib/quizApi";

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "easy", label: "سهل" },
  { value: "medium", label: "متوسط" },
  { value: "hard", label: "صعب" },
];
const COUNT_OPTIONS = [5, 10, 15, 20, 30];
const TIME_OPTIONS = [
  { value: 5, label: "5 دقائق" },
  { value: 10, label: "10 دقائق" },
  { value: 15, label: "15 دقيقة" },
  { value: 20, label: "20 دقيقة" },
  { value: 30, label: "30 دقيقة" },
];

export default function QuizSetup() {
  const [, navigate] = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "الرياض تنافس - إعداد الاختبار";
    fetchCategories().then(setCategories).catch(() => setError("تعذر تحميل الفئات"));
  }, []);

  useEffect(() => {
    setSelectedTopic("all");
    setTopics([]);
    if (selectedCategory !== "all") {
      fetchTopics(selectedCategory).then(setTopics).catch(() => {});
    }
  }, [selectedCategory]);

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const session = await createQuizSession({
        questionCount,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        topic: selectedTopic === "all" ? undefined : selectedTopic,
        difficulty: difficulty === "all" ? null : difficulty,
        timeLimit: timeMinutes * 60,
      });
      localStorage.setItem("activeQuizSession", JSON.stringify(session));
      navigate("/quiz/session");
    } catch {
      setError("حدث خطأ أثناء إنشاء الاختبار. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

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

      {/* Header */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, paddingTop: 8 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "#fff",
              padding: "7px 16px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              fontSize: ".85rem",
              fontWeight: 700,
            }}
          >
            ← الرئيسية
          </button>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>⚡ إعداد الاختبار التفاعلي</h1>
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
          {/* Category */}
          <SettingBlock label="المادة والصف" icon="📚">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              <OptionChip
                label="الكل"
                active={selectedCategory === "all"}
                onClick={() => setSelectedCategory("all")}
              />
              {categories.map((c) => (
                <OptionChip
                  key={c.name}
                  label={`${c.name} (${c.count})`}
                  active={selectedCategory === c.name}
                  onClick={() => setSelectedCategory(c.name)}
                />
              ))}
            </div>
          </SettingBlock>

          {/* Topic */}
          {topics.length > 0 && (
            <SettingBlock label="الموضوع" icon="📖">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                <OptionChip label="الكل" active={selectedTopic === "all"} onClick={() => setSelectedTopic("all")} />
                {topics.map((t) => (
                  <OptionChip
                    key={t.name}
                    label={`${t.name} (${t.count})`}
                    active={selectedTopic === t.name}
                    onClick={() => setSelectedTopic(t.name)}
                  />
                ))}
              </div>
            </SettingBlock>
          )}

          {/* Difficulty */}
          <SettingBlock label="مستوى الصعوبة" icon="🎯">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DIFFICULTY_OPTIONS.map((d) => (
                <OptionChip
                  key={d.value}
                  label={d.label}
                  active={difficulty === d.value}
                  onClick={() => setDifficulty(d.value)}
                />
              ))}
            </div>
          </SettingBlock>

          {/* Question Count */}
          <SettingBlock label="عدد الأسئلة" icon="🔢">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COUNT_OPTIONS.map((n) => (
                <OptionChip
                  key={n}
                  label={String(n)}
                  active={questionCount === n}
                  onClick={() => setQuestionCount(n)}
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
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "rgba(255,255,255,.1)" : "linear-gradient(135deg,#F39C12,#E67E22)",
              border: "none",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: 14,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Cairo', sans-serif",
              fontSize: "1.05rem",
              fontWeight: 900,
              marginTop: 8,
              transition: ".2s",
              boxShadow: loading ? "none" : "0 4px 18px rgba(243,156,18,.35)",
            }}
          >
            {loading ? "جاري الإعداد..." : "ابدأ الاختبار ←"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingBlock({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: "rgba(255,255,255,.7)", fontSize: ".85rem", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span> {label}
      </div>
      {children}
    </div>
  );
}

function OptionChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "linear-gradient(135deg,#F39C12,#E67E22)" : "rgba(255,255,255,.08)",
        border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,.15)",
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
