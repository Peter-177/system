/**
 * Field — labelled form-control wrapper with error display.
 *
 * @param {{
 *   label?: string,
 *   error?: string,
 *   required?: boolean,
 *   children: React.ReactNode,
 * }} props
 */
export function Field({ label, error, required, children }) {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label py-2">
          <span className="label-text text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-1">
            {label}
            {required && <span className="text-sky-500 mr-2 text-lg">*</span>}
          </span>
        </label>
      )}
      {children}
      {error && (
        <label className="label py-1">
          <span className="label-text-alt text-red-400 font-bold text-[10px] uppercase tracking-widest">
            {error}
          </span>
        </label>
      )}
    </div>
  );
}
