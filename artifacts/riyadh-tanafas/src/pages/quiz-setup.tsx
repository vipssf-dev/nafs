import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  fetchCategories,
  fetchTopics,
  createQuizSession,
  type Category,
  type Topic,
} from "@/lib/quizApi";
import {
  getLocalCategories,
  getLocalTopics,
  getLocalQuizQuestions,
  type LocalQuestion,
} from "@/data/localQuestions";

type QuizMode = "local" | "nafes2";

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
  const [mode, setMode] = useState<QuizMode>("local");

  // nafes2 state
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiTopics, setApiTopics] = useState<Topic[]>([]);
  const [apiCategory, setApiCategory] = useState("all");
  const [apiTopic, setApiTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  // local state
  const localCategories = getLocalCategories();
  const [localCategory, setLocalCategory] = useState("all");
  const [localTopic, setLocalTopic] = useState("all");
  const localTopics = localCategory !== "all" ? getLocalTopics(localCategory) : [];

  const [questionCount, setQuestionCount] = useState(10);
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "الرياض تنافس - إعداد الاختبار";
    fetchCategories()
      .then(setApiCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setApiTopic("all");
    setApiTopics([]);
    if (apiCategory !== "all") {
      fetchTopics(apiCategory).then(setApiTopics).catch(() => {});
    }
  }, [apiCategory]);

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      if (mode === "local") {
        const questions: LocalQuestion[] = getLocalQuizQuestions({
          category: localCategory !== "all" ? localCategory : undefined,
          topic: localTopic !== "all" ? localTopic : undefined,
          count: questionCount,
        });
        if (questions.length === 0) {
          setError("لا توجد أسئلة لهذا التصنيف، الرجاء اختيار تصنيف آخر.");
          setLoading(false);
          return;
        }
        const session = {
          id: Date.now(),
          questions,
          timeLimit: timeMinutes * 60,
          mode: "local" as const,
        };
        localStorage.setItem("activeQuizSession", JSON.stringify(session));
        navigate("/quiz/session");
      } else {
        const session = await createQuizSession({
          questionCount,
          category: apiCategory === "all" ? undefined : apiCategory,
          topic: apiTopic === "all" ? undefined : apiTopic,
          difficulty: difficulty === "all" ? null : difficulty,
          timeLimit: timeMinutes * 60,
        });
        localStorage.setItem(
          "activeQuizSession",
          JSON.stringify({ ...session, timeLimit: timeMinutes * 60, mode: "nafes2" })
        );
        navigate("/quiz/session");
      }
    } catch {
      setError("حدث خطأ أثناء إنشاء الاختبار. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  // Count available local questions for the chosen filters
  const availableCount = (() => {
    if (mode !== "local") return null;
    const qs = getLocalQuizQuestions({
      category: localCategory !== "all" ? localCategory : undefined,
      topic: localTopic !== "all" ? localTopic : undefined,
      count: 9999,
    });
    return qs.length;
  })();

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
          <button
            onClick={() => navigate("/")}
            style={btnSecStyle}
          >
            ← الرئيسية
          </button>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>⚡ إعداد الاختبار التفاعلي</h1>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 22,
          }}
        >
          <ModeCard
            active={mode === "local"}
            onClick={() => setMode("local")}
            icon="✅"
            title="أسئلة موثّقة"
            desc="أسئلة الكفايات التربوية مستخرجة من ملفات الرخصة المهنية ومتحقق من إجاباتها"
            accent="#27AE60"
          />
          <ModeCard
            active={mode === "nafes2"}
            onClick={() => setMode("nafes2")}
            icon="📚"
            title="بنك نافس"
            desc="أسئلة الرياضيات والعلوم واللغة العربية من اختبار نافس الطلابي"
            accent="#3498DB"
          />
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
          {/* ── LOCAL MODE ── */}
          {mode === "local" && (
            <>
              <div
                style={{
                  background: "rgba(39,174,96,.12)",
                  border: "1px solid rgba(39,174,96,.3)",
                  borderRadius: 12,
                  padding: "10px 16px",
                  marginBottom: 22,
                  fontSize: ".82rem",
                  color: "#7bed9f",
                  lineHeight: 1.6,
                }}
              >
                ✅ هذه الأسئلة مُستخرجة يدوياً من ملفات الكفايات التربوية (eQiyasKefayat) مع التحقق من مفاتيح الإجابة.
                لا يوجد تداخل بين المواد.
              </div>

              <SettingBlock label="المجال" icon="📚">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 8 }}>
                  <OptionChip label="الكل" active={localCategory === "all"} onClick={() => { setLocalCategory("all"); setLocalTopic("all"); }} />
                  {localCategories.map((c) => (
                    <OptionChip
                      key={c.name}
                      label={`${c.name.replace("كفايات تربوية - ", "")} (${c.count})`}
                      active={localCategory === c.name}
                      onClick={() => { setLocalCategory(c.name); setLocalTopic("all"); }}
                    />
                  ))}
                </div>
              </SettingBlock>

              {localTopics.length > 0 && (
                <SettingBlock label="الموضوع" icon="📖">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                    <OptionChip label="الكل" active={localTopic === "all"} onClick={() => setLocalTopic("all")} />
                    {localTopics.map((t) => (
                      <OptionChip
                        key={t.name}
                        label={`${t.name} (${t.count})`}
                        active={localTopic === t.name}
                        onClick={() => setLocalTopic(t.name)}
                      />
                    ))}
                  </div>
                </SettingBlock>
              )}

              {availableCount !== null && (
                <div style={{ color: "rgba(255,255,255,.45)", fontSize: ".8rem", marginBottom: 18 }}>
                  {availableCount} سؤال متاح — سيتم اختيار {Math.min(questionCount, availableCount)} سؤال
                </div>
              )}
            </>
          )}

          {/* ── NAFES2 MODE ── */}
          {mode === "nafes2" && (
            <>
              <div
                style={{
                  background: "rgba(52,152,219,.1)",
                  border: "1px solid rgba(52,152,219,.3)",
                  borderRadius: 12,
                  padding: "10px 16px",
                  marginBottom: 22,
                  fontSize: ".82rem",
                  color: "#74b9ff",
                  lineHeight: 1.6,
                }}
              >
                📌 تنبيه: بنك أسئلة نافس يحتوي على أسئلة مختلطة المصادر. اختر فئة محددة لتقليل التداخل بين المواد.
              </div>

              <SettingBlock label="المادة والصف" icon="📚">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                  {apiCategories.map((c) => (
                    <OptionChip
                      key={c.name}
                      label={`${c.name} (${c.count})`}
                      active={apiCategory === c.name}
                      onClick={() => setApiCategory(c.name)}
                    />
                  ))}
                </div>
                {apiCategories.length === 0 && (
                  <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".8rem" }}>جاري تحميل الفئات...</div>
                )}
              </SettingBlock>

              {apiTopics.length > 0 && (
                <SettingBlock label="الموضوع" icon="📖">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                    <OptionChip label="الكل" active={apiTopic === "all"} onClick={() => setApiTopic("all")} />
                    {apiTopics.map((t) => (
                      <OptionChip
                        key={t.name}
                        label={`${t.name} (${t.count})`}
                        active={apiTopic === t.name}
                        onClick={() => setApiTopic(t.name)}
                      />
                    ))}
                  </div>
                </SettingBlock>
              )}

              <SettingBlock label="مستوى الصعوبة" icon="🎯">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <OptionChip key={d.value} label={d.label} active={difficulty === d.value} onClick={() => setDifficulty(d.value)} />
                  ))}
                </div>
              </SettingBlock>
            </>
          )}

          {/* Shared: question count & time */}
          <SettingBlock label="عدد الأسئلة" icon="🔢">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COUNT_OPTIONS.map((n) => (
                <OptionChip key={n} label={String(n)} active={questionCount === n} onClick={() => setQuestionCount(n)} />
              ))}
            </div>
          </SettingBlock>

          <SettingBlock label="الوقت المتاح" icon="⏱️">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TIME_OPTIONS.map((t) => (
                <OptionChip key={t.value} label={t.label} active={timeMinutes === t.value} onClick={() => setTimeMinutes(t.value)} />
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

function ModeCard({
  active,
  onClick,
  icon,
  title,
  desc,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? `${accent}18` : "rgba(255,255,255,.05)",
        border: `2px solid ${active ? accent : "rgba(255,255,255,.12)"}`,
        borderRadius: 14,
        padding: "14px 16px",
        cursor: "pointer",
        transition: ".15s",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: ".9rem", color: active ? accent : "#fff", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>{desc}</div>
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
