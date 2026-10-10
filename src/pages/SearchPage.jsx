import { useState, useMemo, useEffect, useRef } from "react";
import { studentsDB } from "../data/storage";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  FileQuestion,
  LayoutDashboard,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Phone,
} from "lucide-react";
import { gsap } from "gsap";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

export function SearchPage({ currentUser, onBack, onGoStudent, onGoAdd, onGoDashboard }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const t = useT();
  const { lang } = useAppContext();

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const ChevronIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  // Read directly from DB to avoid staleness issues
  const filtered = useMemo(() => {
    const db = studentsDB.getAll();
    const students = Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));

    const normalizeArabic = (text) => {
      if (!text) return "";
      return text.replace(/[أإآا]/g, "ا");
    };

    const q = normalizeArabic(query.trim().toLowerCase());

    if (!q) return students;

    return students.filter((s) => {
      const normalizedName = normalizeArabic(String(s.name || "").toLowerCase());
      const normalizedId = normalizeArabic(String(s.qrId || "").toLowerCase());
      const normalizedPhone = normalizeArabic(String(s.phone || "").toLowerCase());
      const normalizedYear = normalizeArabic(String(s.year || "").toLowerCase());

      return (
        normalizedId.includes(q) ||
        normalizedName.startsWith(q) ||
        normalizedPhone.includes(q) ||
        normalizedYear.includes(q)
      );
    });
  }, [query]);

  useEffect(() => {
    if (inputRef.current) {
      gsap.fromTo(
        inputRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.05 }
      );
    }
  }, []);

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25 },
    },
  };

  // Neo-brutalist avatar palette cycling
  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
          {onBack ? (
            <button
              onClick={onBack}
              className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer rounded-none"
              aria-label={t("back")}
            >
              <BackIcon className="w-5 h-5 stroke-[2.5]" />
              <span>{t("back")}</span>
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              SEARCH
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              {t("searchTitle")}
            </h1>
          </div>

          {/* Student Count Badge in Navbar */}
          <div className="bg-white text-black border-2 border-black px-3 py-1 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000]">
            <span>{filtered.length} {t("checkServantCount")}</span>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* ── Search Input Box ── */}
        <div className="w-full" ref={inputRef}>
          <div className="relative flex items-center bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] focus-within:shadow-[8px_8px_0px_#000000] transition-all duration-200">
            {/* Search Icon Container */}
            <div className="bg-[#38BDF8] text-black border-x-[3px] border-black p-3.5 sm:p-4.5 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
            </div>

            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent px-4 sm:px-6 py-3.5 sm:py-4 text-black font-black text-lg sm:text-xl placeholder:text-black/40 outline-none"
              autoFocus
            />

            {/* Clear Button */}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mx-3 sm:mx-4 bg-[#F472B6] text-black border-2 border-black p-1.5 sm:p-2 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer shrink-0"
                title={t("cancel")}
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            )}
          </div>
        </div>

        {/* ── Action Buttons Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Add Student Button */}
          {(currentUser?.role === "admin" ||
            currentUser?.permissions?.includes("perm_add_student")) && (
            <button
              onClick={onGoAdd}
              className="w-full bg-[#A3E635] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1 font-black text-base sm:text-lg py-3.5 sm:py-4 px-6 flex items-center justify-center gap-3 uppercase transition-all cursor-pointer rounded-none"
            >
              <div className="bg-white text-black p-1.5 border-2 border-black shadow-[2px_2px_0px_#000000]">
                <UserPlus className="w-5 h-5 stroke-[3]" />
              </div>
              <span>{t("searchAddNew")}</span>
            </button>
          )}

          {/* Dashboard Button */}
          {onGoDashboard && (
            <button
              onClick={onGoDashboard}
              className="w-full bg-[#38BDF8] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1 font-black text-base sm:text-lg py-3.5 sm:py-4 px-6 flex items-center justify-center gap-3 uppercase transition-all cursor-pointer rounded-none"
            >
              <div className="bg-white text-black p-1.5 border-2 border-black shadow-[2px_2px_0px_#000000]">
                <LayoutDashboard className="w-5 h-5 stroke-[3]" />
              </div>
              <span>{t("searchDashboard")}</span>
            </button>
          )}
        </div>

        {/* ── Active Filter / Query Info Banner ── */}
        <AnimatePresence>
          {query.trim() && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between bg-[#FEF08A] border-2 border-black px-4 py-2.5 shadow-[3px_3px_0px_#000000]"
            >
              <div className="flex items-center gap-2 font-black text-sm sm:text-base text-black">
                <Sparkles className="w-4 h-4 stroke-[3] text-black" />
                <span>{t("checkResults")}</span>
                <span className="bg-black text-white px-2 py-0.5 border border-black font-black">
                  "{query}"
                </span>
              </div>
              <span className="bg-white text-black border-2 border-black px-2.5 py-0.5 font-black text-xs uppercase">
                {filtered.length}
              </span>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Section ── */}
        <div className="flex flex-col gap-4 pb-16 w-full">
          {filtered.length === 0 ? (
            /* ── Empty State Card ── */
            <Motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-4 my-6"
            >
              <div className="w-20 h-20 bg-[#F472B6] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-black">
                <FileQuestion className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                {t("checkNotFound")}
              </h2>
              <p className="text-sm sm:text-base font-bold text-black/70 max-w-md">
                {t("checkNotFoundSub")}
              </p>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="mt-2 bg-[#FACC15] text-black border-2 border-black px-5 py-2 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  {t("checkClearSearch")}
                </button>
              )}
            </Motion.div>
          ) : (
            /* ── Student Cards Grid ── */
            <Motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((student) => {
                const avatarBg = getAvatarBg(student.name || student.qrId);
                return (
                  <Motion.div
                    key={student.qrId}
                    variants={itemVariants}
                    onClick={() => onGoStudent(student.qrId)}
                    className={`bg-white border-[3px] border-black shadow-[5px_5px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-[5px] hover:translate-y-[5px] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] p-5 cursor-pointer transition-all duration-150 flex flex-col justify-between gap-4 group select-none relative ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    {/* Top Row: Tags / Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {/* Stage/Year Tag */}
                      {student.year ? (
                        <span className="inline-flex items-center gap-1 bg-[#38BDF8] text-black border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
                          <GraduationCap className="w-3.5 h-3.5 stroke-[2.5]" />
                          {student.year}
                        </span>
                      ) : (
                        <span className="bg-[#FEF08A] text-black border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                          {t("homeServant")}
                        </span>
                      )}

                      {/* QR Code / ID Badge */}
                      <span className="bg-black text-white border-2 border-black px-2.5 py-0.5 text-xs font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
                        #{student.qrId}
                      </span>
                    </div>

                    {/* Middle Row: Avatar + Student Info */}
                    <div className="flex items-center gap-4">
                      {/* Brutalist Avatar */}
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 border-[3px] border-black shadow-[3px_3px_0px_#000000] ${avatarBg} text-black font-black text-2xl sm:text-3xl flex items-center justify-center overflow-hidden`}
                      >
                        {student.image ? (
                          <img
                            src={student.image}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(student.name || "M")?.[0]?.toUpperCase()}</span>
                        )}
                      </div>

                      {/* Name & Details */}
                      <div className={`flex-1 min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h3 className="font-black text-lg sm:text-xl text-black truncate tracking-tight group-hover:underline underline-offset-4 decoration-2">
                          {student.name || "N/A"}
                        </h3>
                        {student.phone ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-black/70 mt-1">
                            <Phone className="w-3.5 h-3.5 stroke-[2.5] text-black" />
                            <span dir="ltr">{student.phone}</span>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-black/40 mt-1">
                            -
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: View Profile Action Button */}
                    <div className="pt-3 border-t-2 border-black flex items-center justify-between mt-1">
                      <span className="text-xs font-black uppercase text-black/60 tracking-wider">
                        {t("open")}
                      </span>
                      <div className="bg-[#FACC15] group-hover:bg-[#A3E635] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1 transition-colors">
                        <span>{t("enter")}</span>
                        <ChevronIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  </Motion.div>
                );
              })}
            </Motion.div>
          )}
        </div>
      </main>
    </div>
  );
}


