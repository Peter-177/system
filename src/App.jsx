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
function NeoBrutalistLoadingScreen({
  tag = "SYSTEM LOADING",
  title = "جاري تجهيز البيانات...",
  subtitle = "لحظات وكل حاجة هتكون جاهزة ⚡",
}) {
  return (
    <div
      className="min-h-screen w-full bg-[#FDF8F0] font-sans flex flex-col items-center justify-center p-4 selection:bg-[#FACC15] selection:text-black relative overflow-hidden"
      dir="rtl"
    >
      {/* Decorative dot grid */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000000 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-200">
        {/* Category Tag */}
        <div className="flex justify-start mb-[-3px] relative z-20">
          <span className="bg-black text-[#FACC15] border-[3px] border-black px-4 py-1 font-black text-xs uppercase tracking-widest">
            {tag}
          </span>
        </div>

        {/* Card Body */}
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-8 sm:p-10 flex flex-col items-center text-center gap-6">
          {/* Animated Brutalist Icon Box */}
          <div className="relative">
            <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-3xl font-black animate-bounce">
              ⏳
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#38BDF8] border-[3px] border-black flex items-center justify-center font-black text-sm text-black animate-spin">
              ✦
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              {title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              {subtitle}
            </p>
          </div>

          {/* Brutalist Striped Progress Bar */}
          <div className="w-full bg-white border-[3px] border-black p-1 shadow-[3px_3px_0px_#000000] overflow-hidden">
            <div
              className="h-4 bg-[#A3E635] border-r-2 border-black animate-pulse"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 8px)",
                width: "100%",
              }}
            />
          </div>

          {/* Status Badge */}
          <span className="inline-block bg-[#FEF08A] text-black border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-wider">
            PLEASE WAIT • SYNCING
          </span>
        </div>
      </div>
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
      <Suspense fallback={<NeoBrutalistLoadingScreen tag="LOADING" title="لحظة واحدة..." subtitle="بنفتح الصفحة المطلوبة ⚡" />}>
        {auth.screen === "loading" && (
          <NeoBrutalistLoadingScreen
            tag="AUTH CHECK"
            title="جاري التحقق من الحساب..."
            subtitle="بنراجع بيانات الدخول 🔐"
          />
        )}

        {auth.screen === "setup" && <SetupPage onDone={auth.setupAccount} />}

        {auth.screen === "login" && <LoginFlow auth={auth} />}

        {auth.screen === "app" && isSyncing && (
          <NeoBrutalistLoadingScreen
            tag="SYNCING"
            title="جاري مزامنة البيانات..."
            subtitle="بنجهز الفصول وقوائم المخدومين ⏳"
          />
        )}

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
