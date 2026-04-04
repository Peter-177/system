import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import { AppRouter } from "./router/AppRouter";
const SetupPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.SetupPage })));
const LoginPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.RegisterPage })));
const ResetPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.ResetPage })));
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

  if (view === "register")
    return (
      <RegisterPage
        onDone={auth.registerUser}
        onGoLogin={() => setView("login")}
      />
    );

  return (
    <LoginPage
      onLogin={auth.login}
      onForgot={() => setView("reset")}
      onGoRegister={() => setView("register")}
    />
  );
}

export default function App() {
  const auth = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (auth.screen === "app") {
      setIsSyncing(true);
      Promise.all([
        syncFromFirebase(),
        auth.refreshUser() // Live-sync user permissions
      ]).finally(() => setIsSyncing(false));
    }
  }, [auth.screen]);

  if (auth.screen === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (auth.screen === "setup") return <SetupPage onDone={auth.setupAccount} />;
  
  if (auth.screen === "login") return <LoginFlow auth={auth} />;

  if (isSyncing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/60">بنجهز لك كل حاجة... ⏳</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/60">ثانية واحدة، بنفتح الصفحة... ⚡</p>
      </div>
    }>
      <AppRouter onLogout={auth.logout} currentUser={auth.currentUser} onRefreshAuth={auth.refreshUser} onUpdateSecret={auth.updateSecretKey} />
    </Suspense>
  );
}
