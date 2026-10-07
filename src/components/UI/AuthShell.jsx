import { settingsDB } from "../../data/storage";

/**
 * AuthShell — centred authentication page wrapper.
 *
 * Renders the global dark background with ambient orbs,
 * the app icon, title, and subtitle, then the form children
 * inside a glassmorphic panel.
 *
 * @param {{
 *   icon?: string,
 *   title?: string,
 *   subtitle?: string,
 *   children: React.ReactNode,
 * }} props
 */
export function AuthShell({ icon, title, subtitle, children }) {
  const settings = settingsDB.get();
  const displayIcon = icon ?? settings.icon;
  const isImageIcon = displayIcon?.startsWith("data:image");

  return (
    <div
      className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      dir="rtl"
    >
      {/* Ambient background orbs — sized with vw so they scale responsively */}
      <div className="absolute top-[-10%] left-[-10%] w-[min(50vw,30rem)] h-[min(50vw,30rem)] bg-sky-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[min(40vw,25rem)] h-[min(40vw,25rem)] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md animate-reveal stagger-1 relative z-10">
        {/* Header: icon + title */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border-2 border-sky-400/20 flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl relative group">
            <div className="absolute inset-0 bg-sky-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
            {isImageIcon ? (
              <img
                src={displayIcon}
                className="w-full h-full object-cover rounded-[1.8rem] relative z-10"
                alt="App Icon"
              />
            ) : (
              <span className="relative z-10">{displayIcon}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-sky-50 tracking-tighter mb-2">
            {title ?? "مدارس أحد المحبة"}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form panel */}
        <div className="tech-panel p-6 sm:p-8 md:p-10 !rounded-[2.5rem]">
          <div className="space-y-5 sm:space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
