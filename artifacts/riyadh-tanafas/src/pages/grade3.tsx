import { useEffect } from "react";
import GradeViewer from "@/components/GradeViewer";
import { GRADE3_PAGES, GRADE3_ANSWERS } from "@/data/grade3";

export default function Grade3() {
  useEffect(() => {
    document.title = "الرياض تنافس - الصف الثالث الابتدائي";
  }, []);

  return (
    <GradeViewer
      title="الرياض تنافس"
      subtitle="تدريبات على اختبارات نافس — الصف الثالث الابتدائي"
      badge="الصف الثالث"
      gradientColors={{ c1: "#1B4F72", c2: "#2E86C1", accent: "#F39C12" }}
      questionPages={GRADE3_PAGES}
      answerPanelMode="text"
      textAnswers={GRADE3_ANSWERS}
    />
  );
}
