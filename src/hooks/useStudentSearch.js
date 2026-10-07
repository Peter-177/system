import { useState, useMemo } from "react";
import { studentsDB } from "../data/storage";

/**
 * Normalizes Arabic text for fuzzy search:
 * converts Alef variants (أ, إ, آ, ا) to plain Alef (ا).
 *
 * @param {string} text
 * @returns {string}
 */
function normalizeArabic(text) {
  if (!text) return "";
  return text.replace(/[أإآا]/g, "ا");
}

/**
 * Custom hook for searching students across multiple fields.
 *
 * Reads directly from the DB on every render to avoid staleness,
 * then filters with Arabic-normalized fuzzy matching.
 *
 * @param {string} query - Raw search string from user input
 * @returns {import('../types/index.d.ts').StudentWithId[]} Filtered student list
 */
export function useStudentSearch(query) {
  return useMemo(() => {
    const db = studentsDB.getAll();
    const students = Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));

    const q = normalizeArabic(query.trim().toLowerCase());
    if (!q) return students;

    return students.filter((s) => {
      const name  = normalizeArabic(String(s.name  || "").toLowerCase());
      const id    = normalizeArabic(String(s.qrId  || "").toLowerCase());
      const phone = normalizeArabic(String(s.phone || "").toLowerCase());
      const year  = normalizeArabic(String(s.year  || "").toLowerCase());

      return (
        id.includes(q)    ||
        name.startsWith(q)||
        phone.includes(q) ||
        year.includes(q)
      );
    });
  }, [query]);
}

/**
 * Custom hook for searching students with both query and filter state.
 *
 * @returns {{ query: string, setQuery: Function, filtered: import('../types/index.d.ts').StudentWithId[] }}
 */
export function useStudentSearchState() {
  const [query, setQuery] = useState("");
  const filtered = useStudentSearch(query);
  return { query, setQuery, filtered };
}
