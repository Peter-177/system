import { useState } from "react";

// ── Shared Premium Layout ──────────────────────────────────────
function PremiumAuthLayout({ children, icon, title, subtitle, shake, dir = "ltr" }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-base-300" dir={dir}>
      {/* Dynamic Background with glowing blobs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/30 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-secondary/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-accent/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob" style={{animationDelay: '4s'}}></div>
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className={`relative w-full max-w-[420px] z-10 flex flex-col items-center ${shake ? "animate-shake" : "animate-slideUp"}`}>
        <div className="backdrop-blur-2xl bg-base-100/70 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-base-content/5 rounded-[2.5rem] p-8 sm:p-10 w-full relative overflow-hidden">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-[1.25rem] bg-gradient-to-br from-primary to-secondary shadow-xl mb-6 transform transition hover:-translate-y-1 hover:shadow-2xl duration-300 border border-white/20">
              <span className="text-3xl">{icon}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-base-content tracking-tight mb-2 leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-base-content/60 font-medium tracking-wide text-sm px-2 leading-relaxed">{subtitle}</p>
            )}
          </div>

          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared Sleek Input Field ──────────────────────────────────────
function SleekInput({ label, type, value, onChange, placeholder, onKeyDown, error, rightElement, dir="ltr" }) {
  return (
    <div className="form-control w-full" dir={dir}>
      <div className="flex justify-between items-center py-1.5 px-1">
        <label className="label py-0">
          <span className="label-text text-sm font-bold text-base-content/70 uppercase tracking-widest">{label}</span>
        </label>
        {rightElement && <div>{rightElement}</div>}
      </div>
      <div className="relative group">
        <input
          className={`input h-[3.5rem] bg-base-200/50 border-2 ${error ? "border-error/50 focus:border-error focus:ring-error/20" : "border-transparent focus:border-primary focus:ring-primary/20"} hover:bg-base-200 focus:bg-base-100 rounded-2xl transition-all duration-300 w-full shadow-inner ${type === "password" ? "tracking-widest" : "tracking-wide"}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        {/* Input border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 pointer-events-none ring-4 ring-primary/10 transition-opacity duration-300"></div>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-error px-1 animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}
    </div>
  );
}


// ── Setup Page ──────────────────────────────────────
export function SetupPage({ onDone, onGoLogin }) {
  const [form, setForm] = useState({ username: "", password: "", confirm: "", secret: "" });
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
    const result = await onDone(form.username.trim(), form.password, form.secret.trim());
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
      title="Admin Setup"
      subtitle="Only one admin account"
      shake={shake}
      dir="ltr"
    >
      <SleekInput
        label="Admin Username"
        type="text"
        placeholder="admin"
        value={form.username}
        onChange={(e) => upd("username", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.username}
      />
      <SleekInput
        label="Strong Password"
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
      <SleekInput
        label="Secret Reset Key"
        type="password"
        placeholder="Choose a secret word"
        value={form.secret}
        onChange={(e) => upd("secret", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.secret}
      />

      {globalError && (
        <div className="alert alert-error shadow-lg py-3 rounded-xl animate-fadeIn bg-error/10 text-error border-error/20 mt-2">
          <span className="text-sm font-bold">{globalError}</span>
        </div>
      )}

      <button 
        className="btn btn-primary w-full h-14 rounded-2xl text-[1.1rem] shadow-[0_8px_20px_-6px_rgba(var(--p),0.5)] hover:shadow-[0_12px_24px_-8px_rgba(var(--p),0.7)] hover:-translate-y-0.5 transition-all duration-300 font-extrabold tracking-wide mt-6 relative overflow-hidden group border-none"
        onClick={submit} 
        disabled={loading}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 pointer-events-none"></div>
        {loading ? <span className="loading loading-spinner loading-md"></span> : "Save Admin"}
      </button>

      <div className="text-center pt-6 mt-4 border-t border-base-content/10">
        <p className="text-sm text-base-content/60 font-medium">
          Already have an account?{" "}
          <button
            className="font-bold text-primary hover:text-primary-focus transition-colors underline-offset-4 hover:underline"
            onClick={onGoLogin}
          >
            Log in
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
      setError("Invalid username or password");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const forgotButton = (
    <button
      className="text-xs font-bold text-primary hover:text-primary-focus transition-colors"
      onClick={onForgot}
    >
      Forgot?
    </button>
  );

  return (
    <PremiumAuthLayout
      icon="👋"
      title=" Log In"
      shake={shake}
      dir="rtl"
    >
      <SleekInput
        label="Username"
        type="text"
        placeholder="admin"
        value={form.username}
        onChange={(e) => upd("username", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <SleekInput
        label="Password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => upd("password", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        rightElement={forgotButton}
      />
      
      {error && (
        <div className="alert alert-error shadow-lg py-3 rounded-xl animate-fadeIn bg-error/10 text-error border-error/20 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <button 
        className="btn btn-primary w-full h-14 rounded-2xl text-[1.1rem] shadow-[0_8px_20px_-6px_rgba(var(--p),0.5)] hover:shadow-[0_12px_24px_-8px_rgba(var(--p),0.7)] hover:-translate-y-0.5 transition-all duration-300 font-extrabold tracking-wide mt-6 relative overflow-hidden group border-none"
        onClick={submit} 
        disabled={loading}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 pointer-events-none"></div>
        {loading ? <span className="loading loading-spinner loading-md"></span> : "Log In"}
      </button>

      {(onGoSetup || onGoRegister) && (
        <div className="text-center pt-6 mt-4 border-t border-base-content/10">
          <p className="text-sm text-base-content/60 font-medium">
            Don't have an account?{" "}
            <button
              className="font-bold text-primary hover:text-primary-focus transition-colors underline-offset-4 hover:underline"
              onClick={onGoSetup || onGoRegister}
            >
              Sign up
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
    <PremiumAuthLayout
      icon="✨"
      title="Create Account"
      shake={shake}
      dir="ltr"
    >
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
        <div className="alert alert-error shadow-lg py-3 rounded-xl animate-fadeIn bg-error/10 text-error border-error/20 mt-2">
          <span className="text-sm font-bold">{globalError}</span>
        </div>
      )}

      <button 
        className="btn btn-primary w-full h-14 rounded-2xl text-[1.1rem] shadow-[0_8px_20px_-6px_rgba(var(--p),0.5)] hover:shadow-[0_12px_24px_-8px_rgba(var(--p),0.7)] hover:-translate-y-0.5 transition-all duration-300 font-extrabold tracking-wide mt-6 relative overflow-hidden group border-none"
        onClick={submit} 
        disabled={loading}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 pointer-events-none"></div>
        {loading ? <span className="loading loading-spinner loading-md"></span> : "Sign Up"}
      </button>

      <div className="text-center pt-6 mt-4 border-t border-base-content/10">
        <p className="text-sm text-base-content/60 font-medium">
          Already have an account?{" "}
          <button
            className="font-bold text-primary hover:text-primary-focus transition-colors underline-offset-4 hover:underline"
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
      subtitle={step === "verify" ? "Enter your secret key to verify your identity" : "Create a strong new password"}
      shake={shake}
      dir="ltr"
    >
      <button
        className="absolute top-8 left-8 btn btn-ghost btn-sm btn-circle text-base-content/50 hover:bg-base-200 hover:text-base-content"
        onClick={onBack}
        title="Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Steps Indicator */}
      <div className="flex justify-center mb-6">
        <ul className="steps steps-horizontal text-xs font-bold tracking-widest uppercase">
          <li className={`step ${step === "verify" || step === "newpass" ? "step-primary" : ""}`}>Verify</li>
          <li className={`step ${step === "newpass" ? "step-primary" : ""}`}>Password</li>
        </ul>
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
          <button
            className="btn btn-warning w-full h-14 rounded-2xl text-[1.1rem] shadow-[0_8px_20px_-6px_rgba(var(--wa),0.5)] hover:shadow-[0_12px_24px_-8px_rgba(var(--wa),0.7)] hover:-translate-y-0.5 transition-all duration-300 font-extrabold tracking-wide mt-6 border-none text-warning-content"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-md"></span> : "Verify Key"}
          </button>
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
          <button
            className="btn btn-primary w-full h-14 rounded-2xl text-[1.1rem] shadow-[0_8px_20px_-6px_rgba(var(--p),0.5)] hover:shadow-[0_12px_24px_-8px_rgba(var(--p),0.7)] hover:-translate-y-0.5 transition-all duration-300 font-extrabold tracking-wide mt-6 border-none"
            onClick={handleReset}
          >
            Save Password
          </button>
        </>
      )}
    </PremiumAuthLayout>
  );
}
