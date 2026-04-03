import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { fetchStatsOverview, type StatsOverview } from "@/lib/quizApi";

export default function Stats() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "الرياض تنافس - الإحصائيات";
    fetchStatsOverview()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const categoryColors = [
    { bg: "rgba(116,185,255,.15)", border: "rgba(116,185,255,.35)", text: "#74b9ff" },
    { bg: "rgba(129,236,236,.15)", border: "rgba(129,236,236,.35)", text: "#81ecec" },
    { bg: "rgba(162,155,254,.15)", border: "rgba(162,155,254,.35)", text: "#a29bfe" },
    { bg: "rgba(253,203,110,.15)", border: "rgba(253,203,110,.35)", text: "#fdcb6e" },
    { bg: "rgba(85,239,196,.15)", border: "rgba(85,239,196,.35)", text: "#55efc4" },
  ];

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: "linear-gradient(135deg,#0f1a2e,#1a0a2e,#0a1520)", minHeight: "100vh", padding: "24px 16px 48px", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: ".85rem", fontWeight: 700 }}
          >
            ← الرئيسية
          </button>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>📊 إحصائيات بنك الأسئلة</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,.5)", padding: 40 }}>جاري التحميل...</div>
        ) : stats ? (
          <>
            {/* Overview cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "إجمالي الأسئلة", value: stats.totalQuestions.toLocaleString("ar-SA"), icon: "📝" },
                { label: "الجلسات", value: stats.totalSessions.toLocaleString("ar-SA"), icon: "🎯" },
                { label: "متوسط النتيجة", value: `${Math.round(stats.averageScore)}%`, icon: "⭐" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: "18px 14px", textAlign: "center" }}
                >
                  <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>{s.value}</div>
                  <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.5)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: "22px 20px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 18, color: "rgba(255,255,255,.8)" }}>توزيع الأسئلة حسب الفئة</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {stats.categoryCounts.map((cat, i) => {
                  const clr = categoryColors[i % categoryColors.length];
                  const pct = Math.round((cat.count / stats.totalQuestions) * 100);
                  return (
                    <div key={cat.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: ".85rem", fontWeight: 700, color: clr.text }}>{cat.name}</span>
                        <span style={{ fontSize: ".82rem", color: "rgba(255,255,255,.6)" }}>{cat.count} سؤال ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: clr.text, borderRadius: 99, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start quiz CTA */}
            <button
              onClick={() => navigate("/quiz")}
              style={{ width: "100%", marginTop: 20, background: "linear-gradient(135deg,#F39C12,#E67E22)", border: "none", color: "#fff", padding: "14px 24px", borderRadius: 14, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: "1rem", fontWeight: 900, boxShadow: "0 4px 18px rgba(243,156,18,.3)" }}
            >
              ابدأ اختباراً الآن ←
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,.5)", padding: 40 }}>تعذر تحميل الإحصائيات</div>
        )}
      </div>
    </div>
  );
}
