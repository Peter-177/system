import { useAppContext } from "../context/AppContext";
import { translations, arabicToEnglishMap } from "../i18n/translations";

/**
 * useT — Universal translation hook.
 * Translates semantic keys AND direct Arabic UI strings to English when active language is 'en'.
 */
export function useT() {
  const { lang } = useAppContext();

  return (key, fallback) => {
    if (!key && key !== 0) return "";
    const strKey = String(key).trim();

    // 1. Direct semantic key lookup
    const entry = translations[strKey];
    if (entry) {
      if (lang === "en") {
        return entry.en || fallback || strKey;
      }
      return entry.ar || strKey;
    }

    // 2. Direct Arabic phrase mapping
    if (lang === "en") {
      if (arabicToEnglishMap[strKey]) {
        return arabicToEnglishMap[strKey];
      }
      // Check partial or normalized matches (harakat, alef, taa marbouta)
      const normalized = strKey
        .replace(/[\u064B-\u065F]/g, "")
        .replace(/[إأآ]/g, "ا")
        .replace(/ة/g, "ه");

      if (arabicToEnglishMap[normalized]) {
        return arabicToEnglishMap[normalized];
      }

      for (const [k, v] of Object.entries(arabicToEnglishMap)) {
        const normK = k
          .replace(/[\u064B-\u065F]/g, "")
          .replace(/[إأآ]/g, "ا")
          .replace(/ة/g, "ه");
        if (normK === normalized) {
          return v;
        }
      }

      // Dynamic Round pattern: "الجولة 1" / "الجوله 2" -> "Round 1" / "Round 2"
      const roundMatch = strKey.match(/^الجول[ةه]\s+(\d+)$/i);
      if (roundMatch) {
        return `Round ${roundMatch[1]}`;
      }

      // Dynamic Team pattern: "فريق 1" / "الفريق 2" -> "Team 1" / "Team 2"
      const teamMatch = strKey.match(/^(?:الفريق|فريق)\s+(\d+)$/i);
      if (teamMatch) {
        return `Team ${teamMatch[1]}`;
      }

      if (fallback) return fallback;
    }

    // 3. Arabic active: map English stored values back to Arabic
    if (lang === "ar") {
      const lower = strKey.toLowerCase();
      if (lower === "round 1") return "الجولة الأولى";
      if (lower === "round 2") return "الجولة الثانية";
      if (lower === "round 3") return "الجولة الثالثة";
      if (lower === "round 4") return "الجولة الرابعة";
      if (lower === "round 5") return "الجولة الخامسة";
      const enRoundMatch = strKey.match(/^Round\s+(\d+)$/i);
      if (enRoundMatch) {
        return `الجولة ${enRoundMatch[1]}`;
      }
      if (lower === "team 1") return "الفريق الأول";
      if (lower === "team 2") return "الفريق الثاني";
      if (lower === "team 3") return "الفريق الثالث";
      if (lower === "team 4") return "الفريق الرابع";
      const enTeamMatch = strKey.match(/^Team\s+(\d+)$/i);
      if (enTeamMatch) {
        return `فريق ${enTeamMatch[1]}`;
      }
    }

    return fallback ?? key;
  };
}
