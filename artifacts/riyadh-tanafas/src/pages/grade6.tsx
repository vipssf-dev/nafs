import { useEffect } from "react";
import GradeViewer from "@/components/GradeViewer";
import { GRADE6_Q_PAGES, GRADE6_A_PAGES } from "@/data/grade6";

export default function Grade6() {
  useEffect(() => {
    document.title = "الرياض تنافس - الصف السادس الابتدائي";
  }, []);

  return (
    <GradeViewer
      title="الرياض تنافس"
      subtitle="تدريبات على اختبارات نافس — الصف السادس الابتدائي"
      badge="الصف السادس"
      gradientColors={{ c1: "#4A235A", c2: "#7D3C98", accent: "#E67E22" }}
      questionPages={GRADE6_Q_PAGES}
      answerPanelMode="image"
      answerPages={GRADE6_A_PAGES}
    />
  );
}
