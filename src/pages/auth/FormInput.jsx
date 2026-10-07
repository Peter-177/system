import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

/**
 * FormInput — styled input field with icon, error, caps-lock warning,
 * and optional password eye-toggle.
 *
 * Input height is explicitly h-12 (48px ≥ 44px touch target).
 * Font-size is inherited from the global `input { font-size: 1rem }` rule
 * in index.css, so iOS Safari will never auto-zoom on focus.
 *
 * @param {{
 *   id: string,
 *   label: string,
 *   type?: string,
 *   value: string,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
 *   placeholder?: string,
 *   error?: string,
 *   icon?: React.ComponentType<{ className?: string }>,
 *   rightAction?: React.ReactNode,
 *   autoComplete?: string,
 *   disabled?: boolean,
 *   autoFocus?: boolean,
 * }} props
 */
export function FormInput({
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
            <Icon className="w-4 h-4" aria-hidden="true" />
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
          /* 
           * h-12 = 48px > 44px (touch target minimum).
           * font-size is set globally in index.css (1rem = 16px) to prevent
           * iOS Safari from zooming in on input focus.
           */
          className={`w-full h-12 bg-transparent text-white placeholder:text-slate-400 text-sm font-medium px-3.5 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isPassword && !showPassword ? "tracking-[0.15em]" : "tracking-normal"
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-2.5 mr-1 text-slate-400 hover:text-sky-300 transition-colors rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-400/50"
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

      {capsLockActive && (
        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] px-1 animate-in fade-in duration-200 font-medium">
          <span>⚠️ Caps Lock is ON</span>
        </div>
      )}

      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold px-1 pt-0.5 animate-in slide-in-from-top-1 fade-in duration-200"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * PrimaryButton — auth flow submit button with loading state.
 *
 * @param {{
 *   children: React.ReactNode,
 *   onClick: (e?: React.FormEvent) => void,
 *   loading?: boolean,
 *   loadingText?: string,
 *   disabled?: boolean,
 *   icon?: React.ComponentType<{ className?: string }>,
 * }} props
 */
export function PrimaryButton({
  children,
  onClick,
  loading = false,
  loadingText = "Please wait...",
  disabled = false,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="relative w-full h-12 mt-2 rounded-xl font-bold text-sm text-white tracking-wide overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] border border-sky-400/30"
      style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #004e92 100%)" }}
    >
      {/* Sheen sweep on hover */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {loading ? (
        <div className="flex items-center gap-2.5">
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-white/90">{loadingText}</span>
        </div>
      ) : (
        <>
          <span>{children}</span>
          {Icon && <Icon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />}
        </>
      )}
    </button>
  );
}
