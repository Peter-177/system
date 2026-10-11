import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import { AppRouter } from "./router/AppRouter";
import { syncFromFirebase } from "./data/storage";
import { AppProvider } from "./context/AppContext";
import { LangToggleBtn } from "./components/SettingsBar";

const SetupPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.SetupPage })));
const LoginPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.RegisterPage })));
const ResetPage = lazy(() => import("./pages/AuthPages").then(m => ({ default: m.ResetPage })));

// ── Neo-Brutalist Full-Screen Loader ────────────────────────────────
function NeoBrutalistLoadingScreen() {
  return (
    <div
      className="min-h-screen w-full bg-[#FDF8F0] font-sans flex flex-col items-center justify-center p-4 selection:bg-[#FACC15] selection:text-black relative overflow-hidden"
    >
      {/* Decorative dot grid */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000000 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-8 w-full max-w-[340px] animate-in fade-in duration-300">

        {/* AUTH CHECK badge — top-right corner */}
        <div className="absolute -top-[3px] -right-[3px] bg-black text-[#FACC15] px-3 py-1 text-[10px] font-black uppercase tracking-widest border-[3px] border-black">
          AUTH CHECK
        </div>

        {/* Spinner icon box */}
        <div className="flex justify-center mb-6 mt-2">
          <div className="relative">
            <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-black shadow-[6px_6px_0px_#000000] flex items-center justify-center text-3xl animate-bounce">
              ⏳
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#38BDF8] border-[3px] border-black flex items-center justify-center font-black text-sm text-black animate-spin">
              ✦
            </div>
          </div>
        </div>

        {/* Striped progress bar */}
        <div className="w-full h-8 border-[3px] border-black overflow-hidden mb-4"
          style={{
            background: "repeating-linear-gradient(45deg, #A3E635, #A3E635 10px, #86EFAC 10px, #86EFAC 20px)",
            backgroundSize: "200% 100%",
            animation: "slide 1s linear infinite",
          }}
        />

        {/* PLEASE WAIT • SYNCING badge */}
        <div className="flex justify-center">
          <span className="bg-white border-[3px] border-black px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_#000000]">
            PLEASE WAIT • SYNCING
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          from { background-position: 0 0; }
          to   { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}


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

  // Single AppProvider wrapping everything — LangToggleBtn always visible
  return (
    <AppProvider>
      <Suspense fallback={<NeoBrutalistLoadingScreen />}>
        {auth.screen === "loading" && <NeoBrutalistLoadingScreen />}

        {auth.screen === "setup" && <SetupPage onDone={auth.setupAccount} />}

        {auth.screen === "login" && <LoginFlow auth={auth} />}

        {auth.screen === "app" && isSyncing && <NeoBrutalistLoadingScreen />}

        {auth.screen === "app" && !isSyncing && (
          <AppRouter
            onLogout={auth.logout}
            currentUser={auth.currentUser}
            onRefreshAuth={auth.refreshUser}
            onUpdateSecret={auth.updateSecretKey}
          />
        )}
      </Suspense>

      {/* Language toggle — fixed, always on top of every page */}
      <LangToggleBtn />
    </AppProvider>
  );
}
