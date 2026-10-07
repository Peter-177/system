import { ChevronLeft } from "lucide-react";

/**
 * Navbar — sticky page-level top bar.
 *
 * Renders a back button (←) when `onBack` is provided,
 * a centred gradient title, and an optional right slot.
 * Back button meets the 44×44px touch-target minimum.
 *
 * @param {{
 *   onBack?: () => void,
 *   title: string,
 *   right?: React.ReactNode,
 * }} props
 */
export function Navbar({ onBack, title, right }) {
  return (
    <div className="navbar sticky top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 min-h-[4rem] px-4 sm:px-8 transition-all duration-300 pt-safe">
      <div className="navbar-start">
        {onBack && (
          <button
            onClick={onBack}
            /* Explicit 44×44px touch target */
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all active:scale-90"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="navbar-center">
        <span className="font-black text-lg sm:text-xl tracking-tighter text-sky-50 uppercase bg-gradient-to-r from-sky-400 to-sky-100 bg-clip-text text-transparent">
          {title}
        </span>
      </div>

      <div className="navbar-end gap-2 sm:gap-3 flex">{right ?? null}</div>
    </div>
  );
}
