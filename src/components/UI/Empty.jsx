/**
 * Empty — empty-state placeholder with icon and message.
 *
 * @param {{ icon?: string, message: string }} props
 */
export function Empty({ icon = "📭", message }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 sm:py-24 text-slate-500 bg-slate-950/50 rounded-[3rem] border-2 border-dashed border-white/5 px-4">
      <div className="text-6xl sm:text-7xl grayscale opacity-30 drop-shadow-[0_0_40px_rgba(14,165,233,0.1)]">
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 opacity-60 text-center">
        {message}
      </span>
    </div>
  );
}
