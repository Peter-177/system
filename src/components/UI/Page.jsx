/**
 * Page — full-screen layout shell.
 *
 * Provides the dark background, decorative glow orbs, optional sidebar
 * (desktop only), and a flex main content area.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   noScrollLock?: boolean,
 *   sidebar?: React.ReactNode,
 *   noFlex?: boolean,
 *   noMinHeight?: boolean,
 * }} props
 */
export function Page({
  children,
  className = "",
  noScrollLock = false,
  sidebar,
  noFlex = false,
  noMinHeight = false,
}) {
  const baseClasses = `${noMinHeight ? "" : "min-h-screen"} ${noFlex ? "" : "flex flex-col md:flex-row"}`;

  return (
    <div
      className={`${
        noScrollLock
          ? "w-full " + (noMinHeight ? "" : "min-h-screen")
          : baseClasses
      } relative bg-slate-950 text-sky-50 overflow-x-hidden ${className}`}
      dir="rtl"
    >
      {/* Universal decorative background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_20%,transparent_100%)] opacity-80" />
        {/* Glow orbs — sized with vw so they scale on every breakpoint */}
        <div className="absolute top-0 right-0 w-[min(40rem,90vw)] h-[min(40rem,90vw)] bg-sky-500/10 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[min(40rem,90vw)] h-[min(40rem,90vw)] bg-sky-400/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Desktop sidebar — hidden on mobile */}
      {sidebar && (
        <aside className="hidden md:block w-80 shrink-0 h-screen sticky top-0 border-l border-white/5 bg-slate-900/40 backdrop-blur-xl z-[100]">
          {sidebar}
        </aside>
      )}

      <main
        className={`relative z-10 flex-1 flex flex-col ${
          noScrollLock ? "w-full" : noMinHeight ? "" : "min-h-screen"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
