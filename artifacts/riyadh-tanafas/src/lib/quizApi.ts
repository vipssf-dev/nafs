const API_BASE = "https://nafes2.replit.app";

export interface Category {
  name: string;
  count: number;
}

export interface Topic {
  name: string;
  count: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  category: string;
  topic: string;
  difficulty: string;
}

export interface QuizSession {
  id: number;
  questions: Question[];
  timeLimit: number;
}

export interface AnswerItem {
  questionId: number;
  selectedAnswer: number | null;
}

export interface QuizResult {
  sessionId: number;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  timeTaken: number;
  answers: Array<{
    questionId: number;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}

export interface StatsOverview {
  totalQuestions: number;
  totalSessions: number;
  averageScore: number;
  categoryCounts: Array<{ name: string; count: number }>;
  passRate: number;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/questions/categories`);
  if (!res.ok) throw new Error("فشل تحميل الفئات");
  return res.json();
}

export async function fetchTopics(category: string): Promise<Topic[]> {
  const res = await fetch(`${API_BASE}/api/questions/topics?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("فشل تحميل المواضيع");
  return res.json();
}

export async function createQuizSession(params: {
  questionCount: number;
  category?: string;
  topic?: string;
  difficulty?: string | null;
  timeLimit: number;
}): Promise<QuizSession> {
  const res = await fetch(`${API_BASE}/api/quiz/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: params }),
  });
  if (!res.ok) throw new Error("فشل إنشاء جلسة الاختبار");
  const session = await res.json();
  return { ...session, timeLimit: params.timeLimit };
}

export async function submitQuizSession(
  sessionId: number,
  answers: AnswerItem[],
  timeTaken: number
): Promise<QuizResult> {
  const res = await fetch(`${API_BASE}/api/quiz/sessions/${sessionId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, timeTaken }),
  });
  if (!res.ok) throw new Error("فشل إرسال الإجابات");
  return res.json();
}

export async function fetchStatsOverview(): Promise<StatsOverview> {
  const res = await fetch(`${API_BASE}/api/stats/overview`);
  if (!res.ok) throw new Error("فشل تحميل الإحصائيات");
  return res.json();
}
