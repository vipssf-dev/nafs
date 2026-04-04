import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  useEffect(() => {
    document.title = "الرياض تنافس - تدريبات على اختبارات نافس";
  }, []);

  const [, navigate] = useLocation();

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', sans-serif",
        background: "linear-gradient(135deg,#0a0515,#1a0a2e,#0f1a2e)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
      }}
    >
      {/* Top header bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: 0,
          zIndex: 100,
          background: "rgba(10,5,21,0.75)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,.1)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Right: school name */}
        <div style={{ color: "#fff", fontWeight: 900, fontSize: "1.05rem", letterSpacing: ".2px" }}>
          مدرسة الرياض الابتدائية
        </div>
        {/* Left: NAFS logo */}
        <img
          src={`${import.meta.env.BASE_URL}nafs-logo.png`}
          alt="نافس"
          style={{ height: 52, width: "auto", objectFit: "contain" }}
        />
      </div>

      <Stars />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 760 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontSize: "4.5rem", display: "block", marginBottom: 12, animation: "float 3.5s ease-in-out infinite" }}>🏆</span>
          <div
            style={{
              fontSize: "2.8rem",
              fontWeight: 900,
              background: "linear-gradient(135deg,#74b9ff,#a29bfe,#fd79a8,#fdcb6e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            الرياض تنافس
          </div>
          <div
            style={{
              color: "rgba(255,255,255,.6)",
              fontSize: ".95rem",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 30,
              padding: "6px 20px",
              display: "inline-block",
            }}
          >
            تدريبات على اختبارات نافس
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
            width: "100%",
          }}
        >
          <GradeCard
            grade="الصف الثالث الابتدائي"
            icon="✏️"
            badges={["📖 القراءة", "🔢 الرياضيات"]}
            stats="67 صفحة · 255 إجابة مضمّنة · إخفاء/إظهار"
            gradeKey="g3"
            onClick={() => navigate("/grade3")}
          />
          <GradeCard
            grade="الصف السادس الابتدائي"
            icon="🎓"
            badges={["🔢 الرياضيات", "🔬 العلوم", "📖 القراءة"]}
            stats="200 صفحة · مفتاح الإجابات منفصل · إخفاء/إظهار"
            gradeKey="g6"
            onClick={() => navigate("/grade6")}
          />
        </div>

        {/* Quiz section */}
        <div style={{ width: "100%", marginTop: 16 }}>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,.1)",
              paddingTop: 20,
              marginBottom: 16,
              textAlign: "center",
              color: "rgba(255,255,255,.45)",
              fontSize: ".8rem",
              letterSpacing: ".5px",
            }}
          >
            ─── اختبر نفسك ───
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <QuizCard
              title="اختبار تفاعلي"
              icon="⚡"
              desc="1194 سؤالاً في الرياضيات والعلوم واللغة العربية لجميع الصفوف"
              badges={["⏱️ مؤقت حي", "🎯 متعدد الاختيارات", "📊 نتيجة فورية"]}
              accent="#F39C12"
              onClick={() => navigate("/quiz")}
            />
            <QuizCard
              title="الإحصائيات"
              icon="📊"
              desc="استعرض توزيع بنك الأسئلة وإحصائيات الاختبارات"
              badges={["📝 1194 سؤال", "5 مواد دراسية"]}
              accent="#7D3C98"
              onClick={() => navigate("/stats")}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: 48,
          textAlign: "center",
          color: "rgba(255,255,255,.35)",
          fontSize: ".78rem",
          lineHeight: 1.9,
          padding: "0 16px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 60,
            height: 1,
            background: "rgba(255,255,255,.12)",
            margin: "0 auto 14px",
          }}
        />
        <div style={{ fontWeight: 700, color: "rgba(255,255,255,.55)", fontSize: ".82rem" }}>
          مدرسة الرياض الابتدائية
        </div>
        <div>© 1447 جميع الحقوق محفوظة</div>
        <div style={{ marginTop: 4 }}>
          تصميم وتطوير:{" "}
          <span style={{ color: "rgba(255,255,255,.5)", fontWeight: 700 }}>
            صالح سفر الغامدي
          </span>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes twinkle {
          0%,100% { opacity: .1; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Stars() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.8,
    size: Math.random() < 0.2 ? 3 : 2,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            width: s.size,
            height: s.size,
            background: "#fff",
            borderRadius: "50%",
            left: `${s.left}%`,
            top: `${s.top}%`,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

interface GradeCardProps {
  grade: string;
  icon: string;
  badges: string[];
  stats: string;
  gradeKey: "g3" | "g6";
  onClick: () => void;
}

interface QuizCardProps {
  title: string;
  icon: string;
  desc: string;
  badges: string[];
  accent: string;
  onClick: () => void;
}

function QuizCard({ title, icon, desc, badges, accent, onClick }: QuizCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 20,
        padding: "22px 20px",
        textAlign: "center",
        color: "#fff",
        cursor: "pointer",
        transition: "all .3s",
        backdropFilter: "blur(12px)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
        (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)";
      }}
    >
      <span style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}>{icon}</span>
      <div style={{ fontSize: "1.05rem", fontWeight: 900, marginBottom: 6, color: accent }}>{title}</div>
      <div style={{ color: "rgba(255,255,255,.55)", fontSize: ".8rem", marginBottom: 12, lineHeight: 1.5 }}>{desc}</div>
      <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
        {badges.map((b) => (
          <span
            key={b}
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: ".7rem",
              fontWeight: 700,
              background: `${accent}20`,
              color: accent,
              border: `1px solid ${accent}40`,
            }}
          >
            {b}
          </span>
        ))}
      </div>
      <span
        style={{
          display: "inline-block",
          padding: "8px 20px",
          borderRadius: 10,
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 800,
          fontSize: ".85rem",
          background: `linear-gradient(135deg,${accent},${accent}bb)`,
          color: "#fff",
        }}
      >
        انتقل ←
      </span>
    </div>
  );
}

function GradeCard({ grade, icon, badges, stats, gradeKey, onClick }: GradeCardProps) {
  const isG3 = gradeKey === "g3";
  const gradientGlow = isG3
    ? "linear-gradient(135deg,rgba(30,79,160,.3),rgba(46,134,193,.25))"
    : "linear-gradient(135deg,rgba(74,35,90,.3),rgba(125,60,152,.25))";
  const gradeColor = isG3 ? "#74b9ff" : "#c39bff";
  const openBg = isG3
    ? "linear-gradient(135deg,#1B4F72,#2E86C1)"
    : "linear-gradient(135deg,#4A235A,#7D3C98)";
  const badgeBg = isG3 ? "rgba(116,185,255,.18)" : "rgba(195,155,255,.18)";
  const badgeBorder = isG3 ? "rgba(116,185,255,.28)" : "rgba(195,155,255,.28)";

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 22,
        padding: "28px 22px",
        textAlign: "center",
        color: "#fff",
        cursor: "pointer",
        transition: "all .3s",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.25)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)";
      }}
    >
      <span style={{ fontSize: "2.6rem", display: "block", marginBottom: 10 }}>{icon}</span>
      <div style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: 8, color: gradeColor }}>{grade}</div>
      <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
        {badges.map((b) => (
          <span
            key={b}
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: ".72rem",
              fontWeight: 700,
              background: badgeBg,
              color: gradeColor,
              border: `1px solid ${badgeBorder}`,
            }}
          >
            {b}
          </span>
        ))}
      </div>
      <div style={{ color: "rgba(255,255,255,.45)", fontSize: ".76rem", marginBottom: 18 }}>{stats}</div>
      <span
        style={{
          display: "inline-block",
          padding: "9px 22px",
          borderRadius: 11,
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 800,
          fontSize: ".9rem",
          background: openBg,
          color: "#fff",
          transition: ".2s",
        }}
      >
        ابدأ التدريب ←
      </span>
    </div>
  );
}
