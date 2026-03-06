import { useState } from "react";
import { Field, AuthShell } from "../components/UI";

export function SetupPage({ onDone, onGoLogin }) {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = () => {
    const e = {};
    if (!form.username.trim()) e.username = "required";
    if (form.password.length < 8) e.password = "At least 8 letters";
    if (form.password !== form.confirm) e.confirm = "Not match";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onDone(form.username.trim(), form.password);
  };

  return (
    <AuthShell
      icon="🔐"
      title="Create an account"
      subtitle="حساب واحد بس — مينفعش تعمل تاني"
    >
      {[
        { k: "username", label: "username", type: "text", ph: "admin" },
        { k: "password", label: "password", type: "password", ph: "••••••••" },
        {
          k: "confirm",
          label: "confirm",
          type: "password",
          ph: "••••••••",
        },
      ].map(({ k, label, type, ph }) => (
        <Field key={k} label={label} error={errors[k]}>
          <input
            className={`input input-bordered w-full ${errors[k] ? "input-error" : ""}`}
            type={type}
            placeholder={ph}
            value={form[k]}
            onChange={(e) => upd(k, e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
      ))}
      <button className="btn btn-primary w-full mt-1" onClick={submit}>
        Create an account
      </button>
      <div className="text-center mt-2">
        <button
          className="btn btn-ghost btn-xs text-base-content/50 hover:text-primary"
          onClick={onGoLogin}
        >
          Already have an account? Log in
        </button>
      </div>
    </AuthShell>
  );
}

// ── Login ──────────────────────────────────────
export function LoginPage({ onLogin, onForgot, onGoSetup }) {
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
      setError("The username or password is incorrect");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div
      className={`min-h-screen bg-base-100 flex items-center justify-center p-5 ${shake ? "animate-shake" : ""}`}
      dir="rtl"
    >
      <div className="w-full max-w-sm animate-slideUp">
        <div className="text-center mb-8">
          <div className=" w-80 h-17 text-primary rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4">
            Log in
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-4">
            {[
              {
                k: "username",
                label: "username",
                type: "text",
                ph: "admin",
              },
              {
                k: "password",
                label: "password",
                type: "password",
                ph: "••••••••",
              },
            ].map(({ k, label, type, ph }) => (
              <Field key={k} label={label}>
                <input
                  className="input input-bordered w-full"
                  type={type}
                  placeholder={ph}
                  value={form[k]}
                  onChange={(e) => upd(k, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </Field>
            ))}
            {error && (
              <div className="alert alert-error text-sm py-2 animate-fadeIn">
                <span>{error}</span>
              </div>
            )}
            <button className="btn btn-primary w-full" onClick={submit} disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Log in"}
            </button>
            <div className="flex justify-between items-center">
              <button
                className="btn btn-ghost btn-xs text-base-content/30 text-sm hover:text-base-content"
                onClick={onForgot}
              >
                Forget password
              </button>
              {onGoSetup && (
                <button
                  className="btn btn-ghost btn-xs text-base-content/30 text-sm hover:text-primary"
                  onClick={onGoSetup}
                >
                  Create account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reset ──────────────────────────────────────
export function ResetPage({ onVerify, onReset, onBack }) {
  const [step, setStep] = useState("verify");
  const [secret, setSecret] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const doShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };
  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleVerify = () => {
    if (onVerify(secret)) {
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
    if (form.password !== form.confirm) e.confirm = "Not match";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onReset(form.password);
  };

  return (
    <div
      className={`min-h-screen bg-base-100 flex items-center justify-center p-5 ${shake ? "animate-shake" : ""}`}
      dir="rtl"
    >
      <div className="w-full max-w-sm animate-slideUp">
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-4">
            <button
              className="btn btn-ghost btn-xs self-start text-base-content/40"
              onClick={onBack}
            >
              Back
            </button>

            {/* Steps */}
            <ul className="steps steps-horizontal w-full text-xs">
              <li
                className={`step ${step === "verify" || step === "newpass" ? "step-primary" : ""}`}
              >
                Verification
              </li>
              <li
                className={`step ${step === "newpass" ? "step-primary" : ""}`}
              >
                Password
              </li>
            </ul>

            <div className="text-center">
              <div
                className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl border-2 ${step === "verify" ? "bg-warning/10 border-warning/20" : "bg-success/10 border-success/20"}`}
              >
                {step === "verify" ? "🔑" : "🔓"}
              </div>
              <p className="font-bold text-sm">
                {step === "verify" ? "Enter the Secret Key" : "new password"}
              </p>
              <p className="text-xs text-base-content/30 mt-1">
                {step === "verify"
                  ? "Write the secret key"
                  : "Write a new password"}
              </p>
            </div>

            {step === "verify" && (
              <>
                <Field label="Secret Key" error={errors.secret}>
                  <input
                    className={`input input-bordered w-full ${errors.secret ? "input-error" : ""}`}
                    type="password"
                    placeholder="••••••••••••"
                    value={secret}
                    onChange={(e) => {
                      setSecret(e.target.value);
                      setErrors({});
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  />
                </Field>
                <button
                  className="btn btn-warning w-full"
                  onClick={handleVerify}
                >
                  Confirm
                </button>
              </>
            )}

            {step === "newpass" && (
              <>
                {[
                  { k: "password", label: "new password" },
                  { k: "confirm", label: "new password" },
                ].map(({ k, label }) => (
                  <Field key={k} label={label} error={errors[k]}>
                    <input
                      className={`input input-bordered w-full ${errors[k] ? "input-error" : ""}`}
                      type="password"
                      placeholder="••••••••"
                      value={form[k]}
                      onChange={(e) => upd(k, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    />
                  </Field>
                ))}
                <button
                  className="btn btn-primary w-full"
                  onClick={handleReset}
                >
                  Save the new password
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
