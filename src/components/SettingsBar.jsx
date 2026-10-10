import { useAppContext } from "../context/AppContext";
import { Languages } from "lucide-react";

/**
 * LangToggleBtn — Neo Brutalist language toggle
 * Fixed to navbar area (top-left / top-right depending on layout).
 * Rendered once in App.jsx, floats over every page.
 */
export function LangToggleBtn() {
  const { lang, toggleLang } = useAppContext();

  return (
    <button
      onClick={toggleLang}
      title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
      style={{ position: "fixed", top: "10px", left: "12px", zIndex: 9999 }}
      className="
        flex items-center gap-1.5
        bg-white text-black
        border-[3px] border-black
        shadow-[3px_3px_0px_#000000]
        hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]
        active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
        transition-all duration-150
        px-3 py-1.5 font-black text-xs uppercase cursor-pointer
        select-none
      "
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4 stroke-[3] shrink-0" />
      <span className="tracking-widest leading-none">
        {lang === "ar" ? "EN" : "عر"}
      </span>
    </button>
  );
}
