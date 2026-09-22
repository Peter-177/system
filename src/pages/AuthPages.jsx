import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// ── Shared Design Shell & Background ────────────────────────────────
function AuthContainer({ children, shake = false, dir = "ltr" }) {
  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden bg-[#030712] font-body selection:bg-sky-500/30 selection:text-sky-200"
      dir={dir}
    >
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-[20%] -left-[10%] w-[650px] h-[650px] bg-gradient-to-br from-sky-600/15 via-blue-600/10 to-transparent rounded-full blur-[130px] animate-pulse duration-[8000ms]" />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[650px] h-[650px] bg-gradient-to-tl from-cyan-500/15 via-blue-700/10 to-transparent rounded-full blur-[140px] animate-pulse duration-[10000ms]"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Form Box */}
      <div
        className={`relative w-full max-w-[440px] z-10 ${
          shake ? "animate-shake" : "animate-in fade-in zoom-in-95 duration-500"
        }`}
      >
        {/* Ambient Border Glow Ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-sky-500/30 via-sky-500/5 to-transparent rounded-[2.5rem] blur-xl opacity-60 pointer-events-none transition-all duration-700 group-hover:opacity-100" />

        <div className="relative bg-[#0b132b]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-[2rem] p-7 sm:p-10 overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

          {children}
        </div>
      </div>
    </div>
  );
}

// ── Custom Modern Input ──────────────────────────────────────────────
function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  error,
  icon: Icon,
  rightAction,
  autoComplete,
  disabled = false,
  autoFocus = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const handleKeyUp = (e) => {
    if (isPassword && e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="flex items-center justify-between px-0.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-300 tracking-wide flex items-center gap-1.5 cursor-pointer"
        >
          {label}
        </label>
        {rightAction && <div>{rightAction}</div>}
      </div>

      <div
        className={`relative flex items-center rounded-xl border transition-all duration-200 ${
          error
            ? "border-rose-500/60 bg-rose-500/[0.03] shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            : isFocused
            ? "border-sky-400/70 bg-[#0f172a]/90 shadow-[0_0_20px_rgba(14,165,233,0.18)]"
            : "border-white/[0.08] bg-[#090d1f]/60 hover:border-white/[0.16] hover:bg-[#090d1f]/90"
        }`}
      >
        {/* Leading Icon */}
        {Icon && (
          <div
            className={`pl-3.5 pr-1 flex items-center justify-center transition-colors duration-200 pointer-events-none ${
              error
                ? "text-rose-400"
                : isFocused
                ? "text-sky-400"
                : "text-slate-400"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setCapsLockActive(false);
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full h-12 bg-transparent text-white placeholder:text-slate-400 text-sm font-medium px-3.5 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isPassword && !showPassword ? "tracking-[0.15em]" : "tracking-normal"
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {/* Trailing Eye Toggle for Passwords */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-2.5 mr-1 text-slate-400 hover:text-sky-300 transition-colors rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-400/50"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Caps Lock Indicator */}
      {capsLockActive && (
        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] px-1 animate-in fade-in duration-200 font-medium">
          <span>⚠️ Caps Lock is ON</span>
        </div>
      )}

      {/* Error Message with Icon */}
      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold px-1 pt-0.5 animate-in slide-in-from-top-1 fade-in duration-200"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Primary Action Button ────────────────────────────────────────────
function PrimaryButton({
  children,
  onClick,
  loading = false,
  loadingText = "Please wait...",
  disabled = false,
  icon: Icon = ArrowRight,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="relative w-full h-12 mt-2 rounded-xl font-bold text-sm text-white tracking-wide overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] border border-sky-400/30"
      style={{
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #004e92 100%)",
      }}
    >
      {/* Light sheen animation */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {loading ? (
        <div className="flex items-center gap-2.5">
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-white/90">{loadingText}</span>
        </div>
      ) : (
        <>
          <span>{children}</span>
          {Icon && (
            <Icon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </>
      )}
    </button>
  );
}

// ── Header Brand / Title Section ──────────────────────────────────────
function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-7">
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-xs mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 1. LOGIN PAGE
// ════════════════════════════════════════════════════════════════════
export function LoginPage({ onLogin, onForgot, onGoSetup, onGoRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
    if (globalError) setGlobalError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = "Please enter your username or email";
    }
    if (!form.password) {
      newErrors.password = "Please enter your password";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const ok = await onLogin(form.username.trim(), form.password);
      if (!ok) {
        setGlobalError("Invalid username or password. Please try again.");
        triggerShake();
      }
    } catch {
      setGlobalError("A connection error occurred. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer shake={shake} dir="ltr">
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to manage classes, attendance, and student profiles"
      />

      {globalError && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="login-username"
          label="Username or Email"
          type="text"
          value={form.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="e.g. admin or peter"
          icon={User}
          error={errors.username}
          autoComplete="username"
          autoFocus
        />

        <FormInput
          id="login-password"
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
          autoComplete="current-password"
          rightAction={
            onForgot && (
              <button
                type="button"
                onClick={onForgot}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            )
          }
        />

        {/* Remember me & Helper */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-slate-900/60 text-sky-500 focus:ring-1 focus:ring-sky-400 focus:ring-offset-0 cursor-pointer accent-sky-500"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              Remember my session
            </span>
          </label>
        </div>

        <PrimaryButton
          onClick={handleSubmit}
          loading={loading}
          loadingText="Authenticating..."
        >
          Sign In
        </PrimaryButton>
      </form>

      {/* Footer link to Register or Setup */}
      {(onGoRegister || onGoSetup) && (
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onGoRegister || onGoSetup}
              className="text-sky-400 hover:text-sky-300 font-bold hover:underline transition-colors focus:outline-none"
            >
              Create new account
            </button>
          </p>
        </div>
      )}
    </AuthContainer>
  );
}

// ════════════════════════════════════════════════════════════════════
// 2. REGISTER PAGE
// ════════════════════════════════════════════════════════════════════
export function RegisterPage({ onDone, onGoLogin }) {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    if (globalError) setGlobalError("");
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.trim().length < 3)
      e.username = "Username must be at least 3 characters";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";

    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const result = await onDone(form.username.trim(), form.password);
      if (result && !result.ok) {
        setGlobalError(result.error || "Failed to create account");
        triggerShake();
      }
    } catch {
      setGlobalError("Network error. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer shake={shake} dir="ltr">
      <AuthHeader
        title="Join Sunday School"
        subtitle="Create your servant account to access class attendance"
      />

      {globalError && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="reg-username"
          label="Desired Username"
          type="text"
          value={form.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="e.g. mina or john"
          icon={User}
          error={errors.username}
          autoFocus
        />

        <FormInput
          id="reg-password"
          label="Password (min. 8 characters)"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
        />

        <FormInput
          id="reg-confirm"
          label="Confirm Password"
          type="password"
          value={form.confirm}
          onChange={(e) => updateField("confirm", e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirm}
        />

        <PrimaryButton
          onClick={handleSubmit}
          loading={loading}
          loadingText="Creating account..."
        >
          Create Account
        </PrimaryButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onGoLogin}
            className="text-sky-400 hover:text-sky-300 font-bold hover:underline transition-colors focus:outline-none"
          >
            Sign in here
          </button>
        </p>
      </div>
    </AuthContainer>
  );
}

// ════════════════════════════════════════════════════════════════════
// 3. SETUP PAGE (Initial Admin Account Setup)
// ════════════════════════════════════════════════════════════════════
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

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    if (globalError) setGlobalError("");
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Admin username is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.secret.trim())
      e.secret = "Emergency recovery key is required";
    return e;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await onDone(
        form.username.trim(),
        form.password,
        form.secret.trim()
      );
      if (res && !res.ok) {
        setGlobalError(res.error || "Setup failed");
        triggerShake();
      }
    } catch {
      setGlobalError("Network error. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer shake={shake} dir="ltr">
      <AuthHeader
        title="Admin Setup"
        subtitle="Configure the master administrative credentials for this instance"
      />

      {globalError && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="setup-username"
          label="Admin Username"
          type="text"
          value={form.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="admin"
          icon={User}
          error={errors.username}
          autoFocus
        />

        <FormInput
          id="setup-password"
          label="Master Password (min. 8 characters)"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
        />

        <FormInput
          id="setup-confirm"
          label="Confirm Master Password"
          type="password"
          value={form.confirm}
          onChange={(e) => updateField("confirm", e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirm}
        />

        <FormInput
          id="setup-secret"
          label="Emergency Recovery Key"
          type="password"
          value={form.secret}
          onChange={(e) => updateField("secret", e.target.value)}
          placeholder="Save this in a secure vault"
          icon={KeyRound}
          error={errors.secret}
        />

        <PrimaryButton
          onClick={handleSubmit}
          loading={loading}
          loadingText="Initializing system..."
        >
          Initialize Admin Account
        </PrimaryButton>
      </form>

      {onGoLogin && (
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Account already initialized?{" "}
            <button
              type="button"
              onClick={onGoLogin}
              className="text-sky-400 hover:text-sky-300 font-bold hover:underline transition-colors focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </AuthContainer>
  );
}

// ════════════════════════════════════════════════════════════════════
// 4. RESET PASSWORD PAGE
// ════════════════════════════════════════════════════════════════════
export function ResetPage({ onVerify, onReset, onBack }) {
  const [step, setStep] = useState("verify"); // "verify" | "newpass"
  const [secret, setSecret] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!secret.trim()) {
      setErrors({ secret: "Please enter your emergency recovery key" });
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const ok = await onVerify(secret.trim());
      if (ok) {
        setStep("newpass");
        setErrors({});
      } else {
        setErrors({ secret: "Incorrect recovery key" });
        triggerShake();
      }
    } catch {
      setErrors({ secret: "Verification failed. Please try again." });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (e) => {
    if (e) e.preventDefault();
    const errs = {};
    if (!form.password) errs.password = "New password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      triggerShake();
      return;
    }

    onReset(form.password);
  };

  return (
    <AuthContainer shake={shake} dir="ltr">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-6 left-6 p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition-all flex items-center justify-center focus:outline-none"
        title="Back to Login"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <AuthHeader
        title={step === "verify" ? "Recovery Key" : "Set New Password"}
        subtitle={
          step === "verify"
            ? "Enter your emergency recovery key to verify your authority"
            : "Choose a strong new password for your account"
        }
      />

      {/* Stepper indicator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
            step === "verify"
              ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {step === "newpass" ? <CheckCircle2 className="w-4 h-4" /> : "1"}
        </div>
        <div
          className={`h-0.5 w-10 transition-colors ${
            step === "newpass" ? "bg-sky-500" : "bg-white/10"
          }`}
        />
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
            step === "newpass"
              ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]"
              : "bg-white/5 text-slate-500 border border-white/5"
          }`}
        >
          2
        </div>
      </div>

      {step === "verify" ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <FormInput
            id="reset-secret"
            label="Emergency Recovery Key"
            type="password"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              if (errors.secret) setErrors({});
            }}
            placeholder="••••••••••••"
            icon={KeyRound}
            error={errors.secret}
            autoFocus
          />

          <PrimaryButton
            onClick={handleVerify}
            loading={loading}
            loadingText="Verifying key..."
          >
            Verify Recovery Key
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <FormInput
            id="reset-new-pass"
            label="New Master Password"
            type="password"
            value={form.password}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, password: e.target.value }));
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
            }}
            placeholder="••••••••"
            icon={Lock}
            error={errors.password}
            autoFocus
          />

          <FormInput
            id="reset-confirm-pass"
            label="Confirm New Password"
            type="password"
            value={form.confirm}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, confirm: e.target.value }));
              if (errors.confirm)
                setErrors((prev) => ({ ...prev, confirm: "" }));
            }}
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirm}
          />

          <PrimaryButton
            onClick={handleReset}
            loading={false}
            icon={CheckCircle2}
          >
            Save & Update Password
          </PrimaryButton>
        </form>
      )}
    </AuthContainer>
  );
}
