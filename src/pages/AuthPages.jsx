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
  ShieldCheck,
} from "lucide-react";

// ── Shared Neo-Brutalist Design Shell ───────────────────────────────
function AuthContainer({ children, shake = false, dir = "ltr", category = "AUTH" }) {
  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#FDF8F0] font-sans selection:bg-[#FACC15] selection:text-black"
      dir={dir}
    >
      {/* Decorative Grid Lines / Brutalist Accents */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000000 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Form Box */}
      <div
        className={`relative w-full max-w-[460px] z-10 ${
          shake ? "animate-shake" : "animate-in fade-in duration-300"
        }`}
      >
        {/* Top Category Badge */}
        <div className="flex justify-start mb-[-3px] relative z-20">
          <span className="bg-black text-[#FACC15] border-[3px] border-black px-4 py-1 font-black text-xs uppercase tracking-widest">
            {category}
          </span>
        </div>

        {/* Card Body */}
        <div className="relative bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Neo-Brutalist Form Input ────────────────────────────────────────
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

  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const handleKeyUp = (e) => {
    if (isPassword && e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div className="w-full space-y-2 text-left">
      <div className="flex items-center justify-between px-0.5">
        <label
          htmlFor={id}
          className="text-xs font-black uppercase text-black tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          {label}
        </label>
        {rightAction && <div>{rightAction}</div>}
      </div>

      <div
        className={`relative flex items-stretch border-[3px] border-black transition-all ${
          error
            ? "bg-[#FEE2E2] shadow-[4px_4px_0px_#EF4444]"
            : "bg-white shadow-[4px_4px_0px_#000000] focus-within:shadow-[6px_6px_0px_#000000]"
        }`}
      >
        {/* Leading Icon */}
        {Icon && (
          <div className="w-12 bg-[#38BDF8] border-r-[3px] border-black flex items-center justify-center text-black shrink-0 pointer-events-none">
            <Icon className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}

        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onKeyUp={handleKeyUp}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full h-12 bg-transparent text-black font-black placeholder:text-black/30 placeholder:font-bold text-base px-3.5 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {/* Trailing Eye Toggle for Passwords */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-3.5 bg-[#FEF08A] hover:bg-[#FACC15] border-l-[3px] border-black text-black transition-colors flex items-center justify-center cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Eye className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        )}
      </div>

      {/* Caps Lock Indicator */}
      {capsLockActive && (
        <div className="inline-flex items-center gap-1.5 bg-[#FEF08A] border-2 border-black px-2 py-0.5 text-black text-[11px] font-black uppercase">
          <span>⚠️ Caps Lock is ON</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 bg-[#EF4444] text-white border-2 border-black text-xs font-black px-2.5 py-1"
        >
          <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Neo-Brutalist Primary Action Button ─────────────────────────────
function PrimaryButton({
  children,
  onClick,
  loading = false,
  loadingText = "PLEASE WAIT...",
  disabled = false,
  icon: Icon = ArrowRight,
  bg = "bg-[#FACC15]",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative w-full h-14 mt-4 ${bg} text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#000000]`}
    >
      {loading ? (
        <div className="flex items-center gap-2.5">
          <svg
            className="animate-spin h-5 w-5 text-black"
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
          <span>{loadingText}</span>
        </div>
      ) : (
        <>
          <span>{children}</span>
          {Icon && <Icon className="w-5 h-5 stroke-[3]" />}
        </>
      )}
    </button>
  );
}

// ── Header Brand / Title Section ────────────────────────────────────
function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 text-xs sm:text-sm text-black/70 font-bold leading-relaxed max-w-xs mx-auto">
          {subtitle}
        </p>
      )}
      <div className="w-16 h-1 bg-black mx-auto mt-4" />
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
    <AuthContainer shake={shake} dir="ltr" category="SIGN IN">
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to manage classes, attendance, and student profiles"
      />

      {globalError && (
        <div
          role="alert"
          className="mb-6 p-3.5 bg-[#EF4444] text-white border-[3px] border-black shadow-[4px_4px_0px_#000000] text-xs font-black flex items-center gap-2.5"
        >
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
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
                className="text-xs font-black text-black hover:underline uppercase transition-all focus:outline-none"
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
              className="w-5 h-5 border-2 border-black rounded-none bg-white text-black focus:ring-0 cursor-pointer accent-black"
            />
            <span className="text-xs font-black text-black uppercase">
              Remember my session
            </span>
          </label>
        </div>

        <PrimaryButton
          onClick={handleSubmit}
          loading={loading}
          loadingText="Authenticating..."
          bg="bg-[#FACC15]"
        >
          Sign In
        </PrimaryButton>
      </form>

      {/* Footer link to Register or Setup */}
      {(onGoRegister || onGoSetup) && (
        <div className="mt-8 pt-4 border-t-2 border-black text-center">
          <p className="text-xs font-bold text-black">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onGoRegister || onGoSetup}
              className="font-black text-black underline hover:bg-[#A3E635] px-1 transition-colors uppercase cursor-pointer"
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
    <AuthContainer shake={shake} dir="ltr" category="REGISTER">
      <AuthHeader
        title="Join Sunday School"
        subtitle="Create your servant account to access class attendance"
      />

      {globalError && (
        <div
          role="alert"
          className="mb-6 p-3.5 bg-[#EF4444] text-white border-[3px] border-black shadow-[4px_4px_0px_#000000] text-xs font-black flex items-center gap-2.5"
        >
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
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
          bg="bg-[#A3E635]"
        >
          Create Account
        </PrimaryButton>
      </form>

      <div className="mt-8 pt-4 border-t-2 border-black text-center">
        <p className="text-xs font-bold text-black">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onGoLogin}
            className="font-black text-black underline hover:bg-[#FACC15] px-1 transition-colors uppercase cursor-pointer"
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
    <AuthContainer shake={shake} dir="ltr" category="ADMIN SETUP">
      <AuthHeader
        title="Admin Setup"
        subtitle="Configure the master administrative credentials for this instance"
      />

      {globalError && (
        <div
          role="alert"
          className="mb-6 p-3.5 bg-[#EF4444] text-white border-[3px] border-black shadow-[4px_4px_0px_#000000] text-xs font-black flex items-center gap-2.5"
        >
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
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
          bg="bg-[#FB923C]"
          icon={ShieldCheck}
        >
          Initialize Admin Account
        </PrimaryButton>
      </form>

      {onGoLogin && (
        <div className="mt-8 pt-4 border-t-2 border-black text-center">
          <p className="text-xs font-bold text-black">
            Account already initialized?{" "}
            <button
              type="button"
              onClick={onGoLogin}
              className="font-black text-black underline hover:bg-[#FACC15] px-1 transition-colors uppercase cursor-pointer"
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
    <AuthContainer shake={shake} dir="ltr" category="PASSWORD RESET">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 bg-white text-black border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 font-black text-xs uppercase transition-all cursor-pointer"
        title="Back to Login"
      >
        <ArrowLeft className="w-4 h-4 stroke-[3]" />
        <span>Back</span>
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
          className={`flex items-center justify-center w-8 h-8 border-2 border-black text-xs font-black ${
            step === "verify"
              ? "bg-[#FACC15] text-black shadow-[2px_2px_0px_#000000]"
              : "bg-[#A3E635] text-black"
          }`}
        >
          {step === "newpass" ? <CheckCircle2 className="w-5 h-5 stroke-[3]" /> : "1"}
        </div>
        <div className="h-1 w-10 bg-black" />
        <div
          className={`flex items-center justify-center w-8 h-8 border-2 border-black text-xs font-black ${
            step === "newpass"
              ? "bg-[#FACC15] text-black shadow-[2px_2px_0px_#000000]"
              : "bg-white text-black/40"
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
            bg="bg-[#38BDF8]"
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
            bg="bg-[#A3E635]"
          >
            Save & Update Password
          </PrimaryButton>
        </form>
      )}
    </AuthContainer>
  );
}
