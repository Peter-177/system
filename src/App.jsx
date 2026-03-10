import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { AppRouter } from "./router/AppRouter";
import { SetupPage, LoginPage, ResetPage } from "./pages/AuthPages";
import { syncFromFirebase } from "./data/storage";

function LoginFlow({ auth }) {
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
  // Remove onGoSetup to hide the Create Account button
  return <LoginPage onLogin={auth.login} onForgot={() => setView("reset")} />;
}

export default function App() {
  const auth = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const { screen } = auth;
    if (screen === "app") {
      setIsSyncing(true);
      syncFromFirebase().finally(() => setIsSyncing(false));
    }
  }, [screen]);

  if (auth.screen === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Setup screen only appears if NO account exists in Firebase
  if (auth.screen === "setup") return <SetupPage onDone={auth.setupAccount} />;
  
  if (auth.screen === "login") return <LoginFlow auth={auth} />;

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
