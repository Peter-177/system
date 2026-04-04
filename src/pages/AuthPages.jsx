import { useState } from "react";

// ── Shared Premium Layout ──────────────────────────────────────
function PremiumAuthLayout({
  children,
  icon,
  title,
  subtitle,
  shake,
  dir = "ltr",
}) {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#050714]"
      dir={dir}
    >
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse duration-10000"></div>
        <div 
          className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse duration-10000"
          style={{ animationDelay: "3s" }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      <div
        className={`relative w-full max-w-md z-10 flex flex-col items-center ${
          shake ? "animate-shake" : "animate-in fade-in zoom-in duration-700"
        }`}
      >
        <div className="bg-[#0b0f24]/80 backdrop-blur-xl shadow-2xl shadow-black/60 border border-white/[0.05] rounded-[2rem] p-8 sm:p-12 w-full relative overflow-hidden group">
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
          {/* Subtle Bottom Border Glow */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-[5rem] h-[5rem] rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 mb-8 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
              <span className="text-4xl drop-shadow-md">{icon}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-indigo-200/60 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                {subtitle}
              </p>
            )}
          </div>

          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Shared Sleek Input Field ──────────────────────────────────────
function SleekInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  onKeyDown,
  error,
  rightElement,
  dir = "ltr",
}) {
  return (
    <div className="w-full flex flex-col gap-1.5" dir={dir}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-[0.2em]">
          {label}
        </label>
        {rightElement && <div>{rightElement}</div>}
      </div>
      <div className="relative group/input">
        <input
          className={`w-full h-14 bg-[#111736]/50 border ${
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/5 focus:border-indigo-500/50"
          } hover:bg-[#111736] focus:bg-[#111736] rounded-xl px-4 outline-none transition-all duration-300 text-white placeholder:text-slate-500/60 font-medium ${
            type === "password" ? "tracking-[0.3em]" : "tracking-wide"
          }`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        {/* Subtle input background glow */}
        <div className="absolute inset-0 -z-10 rounded-xl opacity-0 group-focus-within/input:opacity-100 ring-2 ring-indigo-500/20 blur-[2px] pointer-events-none transition-opacity duration-300"></div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-red-500 px-1 mt-1 animate-in slide-in-from-top-1 fade-in duration-300">
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-[11px] font-bold">{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Shared Submit Button ──────────────────────────────────────────
function SubmitButton({ onClick, loading, text, loadingText }) {
  return (
    <button
      className="w-full h-14 mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-sm font-bold uppercase tracking-[0.15em] shadow-lg shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      onClick={onClick}
      disabled={loading}
    >
      <span>{loading ? loadingText : text}</span>
      {!loading && (
        <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">
          →
        </span>
      )}
    </button>
  );
}


// ── Setup Page ──────────────────────────────────────
export function SetupPage({ onDone, onGoLogin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm: "",
    secret: "",
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setGlobalError("");
  };

  const submit = async () => {
    const e = {};
    if (!form.username.trim()) e.username = "Required";
    if (form.password.length < 8) e.password = "At least 8 letters";
    if (form.password !== form.confirm) e.confirm = "Does not match";
    if (!form.secret.trim()) e.secret = "Secret key required";
    if (Object.keys(e).length) {
      setErrors(e);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    const result = await onDone(
      form.username.trim(),
      form.password,
      form.secret.trim(),
    );
    setLoading(false);
    if (result && !result.ok) {
      setGlobalError(result.error);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <PremiumAuthLayout
      icon="🚀"
      title="تظبيط حساب الأدمن"
      subtitle="الخطوة الأولى عشان نبدأ"
      shake={shake}
      dir="rtl"
    >
      <SleekInput
        label="اسم المستخدم"
        type="text"
        placeholder="مثلاً: admin"
        value={form.username}
        onChange={(e) => upd("username", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.username ? "لازم تكتب الاسم" : ""}
        dir="rtl"
      />
      <SleekInput
        label="كلمة سر قوية"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => upd("password", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.password ? "خليها 8 حروف على الأقل" : ""}
        dir="rtl"
      />
      <SleekInput
        label="تأكيد كلمة السر"
        type="password"
        placeholder="••••••••"
        value={form.confirm}
        onChange={(e) => upd("confirm", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.confirm ? "مش زي بعض، اتأكد تاني" : ""}
        dir="rtl"
      />
      <SleekInput
        label="كود الأمان للطوارئ"
        type="password"
        placeholder="شيله في مكان أمين"
        value={form.secret}
        onChange={(e) => upd("secret", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.secret ? "الكود ده مهم جداً، متنساهوش" : ""}
        dir="rtl"
      />

      {globalError && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 mt-2 text-[13px] font-bold text-center">
          {globalError}
        </div>
      )}

      <SubmitButton 
        onClick={submit} 
        loading={loading} 
        text="تمام، سجلني" 
        loadingText="بنحفظ البيانات..." 
      />

      <div className="text-center pt-8 mt-4 border-t border-white/[0.05]">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest" dir="rtl">
          عندك حساب فعلاً؟{" "}
          <button
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold hover:underline underline-offset-4"
            onClick={onGoLogin}
          >
            ادخل من هنا
          </button>
        </p>
      </div>
    </PremiumAuthLayout>
  );
}

// ── Login Page ──────────────────────────────────────
export function LoginPage({ onLogin, onForgot, onGoSetup, onGoRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  };

  const submit = async () => {
    setLoading(true);
    const ok = await onLogin(form.username, form.password);
    setLoading(false);
    if (!ok) {
      setError("الاسم أو كلمة السر مش مظبوطين، جرب تاني");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const forgotButton = (
    <button
      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
      onClick={onForgot}
    >
      نسيت؟
    </button>
  );

  return (
    <PremiumAuthLayout icon="👋" title="نورتنا من تاني!" subtitle="ادخل عشان نكمل شغلنا" shake={shake} dir="rtl">
      <SleekInput
        label="اسم المستخدم"
        type="text"
        placeholder="مثلاً: admin"
        value={form.username}
        onChange={(e) => upd("username", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        dir="rtl"
      />
      <SleekInput
        label="كلمة السر"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => upd("password", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        rightElement={forgotButton}
        dir="rtl"
      />

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 mt-2 text-[13px] font-bold text-center flex items-center justify-center gap-2">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <SubmitButton 
        onClick={submit} 
        loading={loading} 
        text="يلا ندخل" 
        loadingText="جاري التأكد..." 
      />

      {(onGoSetup || onGoRegister) && (
        <div className="text-center pt-8 mt-4 border-t border-white/[0.05]">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest" dir="rtl">
            لسه معندكش حساب؟{" "}
            <button
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold hover:underline underline-offset-4"
              onClick={onGoSetup || onGoRegister}
            >
              سجل حساب جديد
            </button>
          </p>
        </div>
      )}
    </PremiumAuthLayout>
  );
}

// ── Register (For normal users) ────────────────
export function RegisterPage({ onDone, onGoLogin }) {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setGlobalError("");
  };

  const submit = async () => {
    const e = {};
    if (!form.username.trim()) e.username = "Required";
    if (form.password.length < 8) e.password = "At least 8 letters";
    if (form.password !== form.confirm) e.confirm = "Does not match";
    if (Object.keys(e).length) {
      setErrors(e);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    const result = await onDone(form.username.trim(), form.password);
    setLoading(false);
    if (result && !result.ok) {
      setGlobalError(result.error);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <PremiumAuthLayout icon="✨" title="Create Account" subtitle="Join our platform" shake={shake} dir="ltr">
      <SleekInput
        label="Username"
        type="text"
        placeholder="user123"
        value={form.username}
        onChange={(e) => upd("username", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.username}
      />
      <SleekInput
        label="Password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => upd("password", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.password}
      />
      <SleekInput
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={form.confirm}
        onChange={(e) => upd("confirm", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.confirm}
      />

      {globalError && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 mt-2 text-[13px] font-bold text-center">
          {globalError}
        </div>
      )}

      <SubmitButton 
        onClick={submit} 
        loading={loading} 
        text="Sign Up" 
        loadingText="Creating..." 
      />

      <div className="text-center pt-8 mt-4 border-t border-white/[0.05]">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
          Already have an account?{" "}
          <button
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold hover:underline underline-offset-4"
            onClick={onGoLogin}
          >
            Log in
          </button>
        </p>
      </div>
    </PremiumAuthLayout>
  );
}

// ── Reset ──────────────────────────────────────
export function ResetPage({ onVerify, onReset, onBack }) {
  const [step, setStep] = useState("verify");
  const [secret, setSecret] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const doShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleVerify = async () => {
    setLoading(true);
    const ok = await onVerify(secret);
    setLoading(false);
    if (ok) {
      setStep("newpass");
      setErrors({});
    } else {
      setErrors({ secret: "The secret key is incorrect" });
      doShake();
    }
  };

  const handleReset = () => {
    const e = {};
    if (form.password.length < 8) e.password = "At least 8 letters";
    if (form.password !== form.confirm) e.confirm = "Does not match";
    if (Object.keys(e).length) {
      setErrors(e);
      doShake();
      return;
    }
    onReset(form.password);
  };

  return (
    <PremiumAuthLayout
      icon={step === "verify" ? "🔑" : "🔓"}
      title={step === "verify" ? "Reset Password" : "New Password"}
      subtitle={
        step === "verify"
          ? "Verify identity"
          : "Secure your account"
      }
      shake={shake}
      dir="ltr"
    >
      <button
        className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5"
        onClick={onBack}
        title="Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Steps Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step === "verify" || step === "newpass" ? "bg-indigo-500 text-white" : "bg-white/5 text-white/30"}`}>
            1
          </div>
          <div className={`h-[2px] w-8 ${step === "newpass" ? "bg-indigo-500" : "bg-white/10"}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step === "newpass" ? "bg-indigo-500 text-white" : "bg-white/5 text-white/30"}`}>
            2
          </div>
        </div>
      </div>

      {step === "verify" && (
        <>
          <SleekInput
            label="Secret Key"
            type="password"
            placeholder="••••••••••••"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              setErrors({});
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            error={errors.secret}
          />
          <SubmitButton 
            onClick={handleVerify} 
            loading={loading} 
            text="Verify Key" 
            loadingText="Verifying..." 
          />
        </>
      )}

      {step === "newpass" && (
        <>
          <SleekInput
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => upd("password", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            error={errors.password}
          />
          <SleekInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={(e) => upd("confirm", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            error={errors.confirm}
          />
          <SubmitButton 
            onClick={handleReset} 
            loading={false} 
            text="Save Password" 
            loadingText="" 
          />
        </>
      )}
    </PremiumAuthLayout>
  );
}
