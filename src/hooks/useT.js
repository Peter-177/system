import { useAppContext } from "../context/AppContext";
import { translations } from "../i18n/translations";

export function useT() {
  const { lang } = useAppContext();
  return (key) => translations[key]?.[lang] ?? key;
}
