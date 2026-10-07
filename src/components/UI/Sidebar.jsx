import { HelpCircle } from "lucide-react";

/**
 * Sidebar — desktop-only navigation shell used inside `<Page sidebar={...}>`.
 *
 * Renders nav items via children, with a branded support footer at the bottom.
 *
 * @param {{ children: React.ReactNode, branding?: React.ReactNode }} props
 */
export function Sidebar({ children }) {
  return (
    <div className="flex flex-col h-full p-6 lg:p-8 text-right">
      {/* Spacer matching the fixed-position ModernNavbar height */}
      <div className="mb-14 h-14" aria-hidden="true" />

      <nav className="flex-1 flex flex-col gap-2" aria-label="Sidebar navigation">
        {children}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex items-center gap-4 px-4 py-3 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-sky-400/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shrink-0">
            <HelpCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
              Support
            </span>
            <span className="text-[11px] font-bold text-sky-100/60 leading-none">
              مدارس أحد المحبة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
