import { X } from "lucide-react";

/**
 * DeleteBtn — 44×44px icon button for destructive actions.
 *
 * @param {{ onClick: () => void }} props
 */
export function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      /* w-11/h-11 = 2.75rem = 44px — meets WCAG 2.5.5 touch target */
      className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-red-500/20 active:scale-90"
      aria-label="Delete"
    >
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
