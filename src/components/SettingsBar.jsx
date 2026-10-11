import { useAppContext } from "../context/AppContext";
import { Languages } from "lucide-react";

/**
 * LangToggleBtn — Neo Brutalist language toggle.
 * Positioned in the thumb-friendly trailing bottom corner with safe-area insets.
 * Meets WCAG 2.5.5 / iOS HIG touch target minimums (>= 44x44px).
 * Never overlaps top navbar links, logos, or back buttons.
 */
export function LangToggleBtn({ className = "" }) {
  const { lang, toggleLang } = useAppContext();

  return (
    <button
      type="button"
      onClick={toggleLang}
      title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      aria-label={lang === "ar" ? "Switch language to English" : "التبديل إلى العربية"}
      style={{
        position: "fixed",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        // Using CSS logical property inset-inline-end so in LTR it's bottom-right, in RTL it's bottom-left
        insetInlineEnd: "calc(16px + env(safe-area-inset-inline-end, 0px))",
        zIndex: 60,
      }}
      className={`
        flex items-center justify-center gap-2
        min-h-[44px] min-w-[44px]
        px-3.5 py-2.5
        bg-[#FACC15] text-black
        border-[3px] border-black
        shadow-[4px_4px_0px_#000000]
        hover:bg-[#FDE047] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        transition-all duration-150
        font-black text-xs sm:text-sm uppercase cursor-pointer
        select-none touch-manipulation
        rounded-none
        ${className}
      `}
    >
      <Languages className="w-5 h-5 stroke-[2.5] shrink-0" aria-hidden="true" />
      <span className="tracking-wider leading-none font-black text-sm">
        {lang === "ar" ? "EN" : "عربي"}
      </span>
    </button>
  );
}

