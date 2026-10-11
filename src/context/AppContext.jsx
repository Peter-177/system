import { createContext, useContext, useState, useEffect } from "react";
import { arabicToEnglishMap } from "../i18n/translations";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("app_lang") || "ar"
  );

  // Persist lang + set HTML dir/lang attribute
  useEffect(() => {
    localStorage.setItem("app_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Global automatic fallback translator for any remaining Arabic text nodes
  useEffect(() => {
    if (lang !== "en") return;

    const translateNodes = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      let node;
      while ((node = walker.nextNode())) {
        const parentTag = node.parentElement?.tagName;
        if (
          parentTag === "SCRIPT" ||
          parentTag === "STYLE" ||
          parentTag === "INPUT" ||
          parentTag === "TEXTAREA"
        ) {
          continue;
        }

        const text = node.nodeValue?.trim();
        if (text && arabicToEnglishMap[text]) {
          node.nodeValue = node.nodeValue.replace(text, arabicToEnglishMap[text]);
        }
      }
    };

    translateNodes();
    const observer = new MutationObserver(translateNodes);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [lang]);

  const toggleLang = () => setLangState((l) => (l === "ar" ? "en" : "ar"));

  return (
    <AppContext.Provider value={{ lang, toggleLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
