import { Avatar } from "./Avatar";

/**
 * StudentMiniCard — compact student list item.
 *
 * Shows avatar, name, QR code and school year in a horizontally-scrollable-safe
 * card. The card height is at least 44px for touch-target compliance.
 *
 * @param {{ person: import('../../types/index.d.ts').StudentWithId }} props
 */
export function StudentMiniCard({ person }) {
  return (
    <div className="group relative rounded-3xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 transition-all duration-500 border border-white/5 hover:border-sky-400/20 shadow-xl min-h-[3.5rem]">
      <Avatar
        name={person.name}
        accent={person.accent}
        image={person.image}
        size="sm"
      />

      <div className="flex-1 min-w-0 pr-1 text-right">
        <div className="font-black text-base sm:text-lg truncate text-sky-50 leading-tight group-hover:text-sky-400 transition-colors">
          {person.name}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
          <span className="font-black text-[9px] text-slate-500 uppercase tracking-[0.2em] bg-slate-950/50 px-2 py-0.5 rounded-lg border border-white/5 transition-all group-hover:border-sky-400/20">
            {person.qrId}
          </span>
          {person.year && (
            <span className="text-[10px] font-black text-sky-500/60 uppercase tracking-widest">
              {person.year}
            </span>
          )}
        </div>
      </div>

      {/* Accent strip — decorative, aria-hidden */}
      <div
        className="w-1.5 h-6 rounded-full bg-slate-800 group-hover:bg-sky-500 transition-colors shrink-0"
        aria-hidden="true"
      />
    </div>
  );
}
