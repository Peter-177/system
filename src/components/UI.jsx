// components/UI.jsx

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="toast toast-top toast-center z-999 pointer-events-none">
      <div className="alert bg-base-300 border border-base-content/10 shadow-xl text-sm text-base-content gap-2 animate-pop">
        <span>{msg}</span>
      </div>
    </div>
  );
}

export function Page({ children, className = "" }) {
  return (
    <div
      className={`min-h-screen bg-base-100 text-base-content flex flex-col ${className}`}
      dir="rtl"
    >
      {children}
    </div>
  );
}

export function Navbar({ onBack, title, right }) {
  return (
    <div className="navbar bg-base-200 border-b border-base-300 min-h-14 px-4">
      <div className="navbar-start">
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm gap-1 text-base-content/50 hover:text-base-content"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Back
          </button>
        )}
      </div>
      <div className="navbar-center">
        <span className="font-bold text-sm">{title}</span>
      </div>
      <div className="navbar-end gap-2 flex">{right ?? null}</div>
    </div>
  );
}

export function Field({ label, error, required, children }) {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label py-1">
          <span className="label-text text-xs text-base-content/50">
            {label}
            {required && <span className="text-error mr-1">*</span>}
          </span>
        </label>
      )}
      {children}
      {error && (
        <label className="label py-1">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

export function Avatar({ name, accent, size = "md" }) {
  const sz = {
    sm: "w-10 h-10 text-base",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-2xl",
  }[size];
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{
        background: accent + "22",
        border: `2px solid ${accent}`,
        color: accent,
      }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export function StudentMiniCard({ person }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 border"
      style={{
        borderColor: person.accent + "30",
        background: "oklch(var(--b2))",
      }}
    >
      <Avatar name={person.name} accent={person.accent} size="md" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-base truncate">{person.name}</div>
        <div className="text-xs font-mono text-base-content/30">
          {person.qrId}
        </div>
      </div>
    </div>
  );
}

export function Empty({ icon = "📭", message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-base-content/20">
      <span className="text-4xl">{icon}</span>
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function AuthShell({ icon, title, subtitle, children }) {
  return (
    <div
      className="min-h-screen bg-base-100 flex items-center justify-center p-5"
      dir="rtl"
    >
      <div className="w-full max-w-sm animate-slideUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl mx-auto mb-4">
            {icon}
          </div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-base-content/40 mt-1">{subtitle}</p>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-ghost btn-xs text-error/50 hover:text-error hover:bg-error/10 w-7 h-7 min-h-0 p-0 rounded-lg"
    >
      ✕
    </button>
  );
}
