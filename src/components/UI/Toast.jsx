/**
 * Toast — transient status message shown at top-center.
 * Renders nothing when `msg` is falsy.
 *
 * @param {{ msg: string | null }} props
 */
export function Toast({ msg }) {
  if (!msg) return null;

  return (
    <div className="toast toast-top toast-center z-[1000] pointer-events-none mt-4 px-4 w-full flex justify-center">
      <div className="bg-[#020617]/95 backdrop-blur-2xl border-2 border-sky-400/30 shadow-[0_0_50px_rgba(14,165,233,0.2)] text-sm font-black gap-5 py-5 px-6 sm:px-10 animate-slideUp rounded-[2rem] flex items-center max-w-sm w-full sm:w-auto">
        <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-pulse shrink-0" />
        <span className="text-white tracking-tight">{msg}</span>
      </div>
    </div>
  );
}
