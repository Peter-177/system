/**
 * AuthContainer — full-page wrapper for auth forms.
 *
 * Provides the dark background, ambient orb glows, grid pattern,
 * optional shake animation, and the glassmorphic form card.
 *
 * @param {{
 *   children: React.ReactNode,
 *   shake?: boolean,
 *   dir?: 'ltr' | 'rtl',
 * }} props
 */
export function AuthContainer({ children, shake = false, dir = "ltr" }) {
  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden bg-[#030712] font-body selection:bg-sky-500/30 selection:text-sky-200"
      dir={dir}
    >
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Ambient orbs — capped with min() so they never cause 320px overflow */}
        <div className="absolute -top-[20%] -left-[10%] w-[min(650px,80vw)] h-[min(650px,80vw)] bg-gradient-to-br from-sky-600/15 via-blue-600/10 to-transparent rounded-full blur-[130px] animate-pulse" />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[min(650px,80vw)] h-[min(650px,80vw)] bg-gradient-to-tl from-cyan-500/15 via-blue-700/10 to-transparent rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(400px,70vw)] h-[min(400px,70vw)] bg-sky-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Form card */}
      <div
        className={`relative w-full max-w-[440px] z-10 ${
          shake ? "animate-shake" : "animate-in fade-in zoom-in-95 duration-500"
        }`}
      >
        {/* Ambient border glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-sky-500/30 via-sky-500/5 to-transparent rounded-[2.5rem] blur-xl opacity-60 pointer-events-none" />

        <div className="relative bg-[#0b132b]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-[2rem] p-6 sm:p-10 overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * AuthHeader — title + subtitle displayed at the top of each auth form.
 *
 * @param {{ title: string, subtitle?: string }} props
 */
export function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-6 sm:mb-7">
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
