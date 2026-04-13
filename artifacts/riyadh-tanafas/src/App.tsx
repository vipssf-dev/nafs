import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/home";
import Grade3 from "@/pages/grade3";
import Grade6 from "@/pages/grade6";
import QuizSetup from "@/pages/quiz-setup";
import QuizSessionPage from "@/pages/quiz-session";
import Results from "@/pages/results";
import Stats from "@/pages/stats";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import FeedbackButton from "@/components/FeedbackButton";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/grade3" component={Grade3} />
      <Route path="/grade6" component={Grade6} />
      <Route path="/quiz" component={QuizSetup} />
      <Route path="/quiz/session" component={QuizSessionPage} />
      <Route path="/results" component={Results} />
      <Route path="/stats" component={Stats} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
        <FeedbackButton />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
