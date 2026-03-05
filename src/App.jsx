import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { AppRouter } from "./router/AppRouter";
import { SetupPage, LoginPage, ResetPage } from "./pages/AuthPages";
import { syncFromFirebase } from "./data/storage";

function LoginFlow({ auth, onGoSetup }) {
  const [view, setView] = useState("login");
  if (view === "reset")
    return (
      <ResetPage
        onVerify={auth.verifySecret}
        onReset={(p) => {
          auth.resetPassword(p);
          setView("login");
        }}
        onBack={() => setView("login")}
      />
    );
  return <LoginPage onLogin={auth.login} onForgot={() => setView("reset")} onGoSetup={onGoSetup} />;
}

export default function App() {
  const auth = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (auth.screen === "app") {
      setIsSyncing(true);
      syncFromFirebase().finally(() => setIsSyncing(false));
    }
  }, [auth.screen]);

  if (auth.screen === "setup") return <SetupPage onDone={auth.setupAccount} onGoLogin={() => auth.setScreen("login")} />;
  if (auth.screen === "login") return <LoginFlow auth={auth} onGoSetup={() => auth.setScreen("setup")} />;

  if (isSyncing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/60">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return <AppRouter onLogout={auth.logout} />;
}
