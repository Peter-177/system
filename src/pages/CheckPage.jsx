import { useState, useMemo, useEffect, useRef } from "react";
import { studentsDB } from "../data/storage";
import { RewardCheck } from "../components/RewardCheck";
import { normalizeArabic } from "../utils/arabicWords";
import {
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

/**
 * CheckPage
 * Route: /check and /check/:childId
 *
 * Fully redesigned in Neo Brutalism design style.
 */
export function CheckPage({
  currentUser,
  initialChildId,
  onBack,
  onSelectChildId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChildId, setSelectedChildId] = useState(initialChildId || null);
  const [customPoints, setCustomPoints] = useState(0); 
  const searchInputRef = useRef(null);
  const t = useT();
  const { lang } = useAppContext();

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const ChevronIcon = lang === "ar" ? ChevronRight : ChevronLeft;

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll() || {};
    return Object.keys(db).map((id) => ({
      qrId: id,
      ...db[id],
    }));
  }, []);

  useEffect(() => {
    if (initialChildId) {
      setSelectedChildId(initialChildId);
    }
  }, [initialChildId]);

  const filteredStudents = useMemo(() => {
    const q = normalizeArabic(searchQuery);
    if (!q) {
      return [...allStudents].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", lang === "ar" ? "ar" : "en")
      );
    }

    return allStudents.filter((student) => {
      const normName = normalizeArabic(student.name);
      const normId = normalizeArabic(student.qrId);
      const normYear = normalizeArabic(student.year);
      return (
        normName.includes(q) ||
        normId.includes(q) ||
        normYear.includes(q)
      );
    }).sort((a, b) => (a.name || "").localeCompare(b.name || "", lang === "ar" ? "ar" : "en"));
  }, [allStudents, searchQuery, lang]);

  const selectedChild = useMemo(() => {
    if (!selectedChildId) return null;
    const direct = studentsDB.get(selectedChildId);
    if (direct) return { qrId: selectedChildId, ...direct };
    return allStudents.find((s) => s.qrId === selectedChildId) || null;
  }, [selectedChildId, allStudents]);

  const handleSelectChild = (child) => {
    setSelectedChildId(child.qrId);
    if (onSelectChildId) onSelectChildId(child.qrId);
    window.history.replaceState({ page: "check", childId: child.qrId }, "", `/check/${child.qrId}`);
  };

  const handleClearSelection = () => {
    setSelectedChildId(null);
    if (onSelectChildId) onSelectChildId(null);
    window.history.replaceState({ page: "check", childId: null }, "", "/check");
  };

  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const handleBackNav = () => {
    if (selectedChildId) {
      handleClearSelection();
    } else {
      if (onBack) onBack();
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000] no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
          <button
            onClick={handleBackNav}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label={t("back")}
          >
            <BackIcon className="w-5 h-5 stroke-[2.5]" />
            <span>{t("back")}</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              {t("checkTag")}
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              {t("checkTitle")}
            </h1>
          </div>

          {/* Student Count Badge in Navbar */}
          <div className="bg-white text-black border-2 border-black px-3 py-1 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000]">
            <span>{filteredStudents.length} {t("checkServantCount")}</span>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* ── SELECTED CHILD CHECK VIEW ── */}
        {selectedChild ? (
          <div className="w-full flex flex-col gap-6">
            {/* Top Navigation bar */}
            <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={handleClearSelection}
                  className="flex items-center gap-2 bg-[#FACC15] text-black border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none transition-all px-4 py-2 font-black text-xs sm:text-sm uppercase cursor-pointer shrink-0"
                >
                  <ChevronIcon size={18} className="stroke-[3]" />
                  <span>{t("checkChildList")}</span>
                </button>

                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center overflow-hidden shrink-0 ${getAvatarBg(selectedChild.name)}`}>
                    {selectedChild.image ? (
                      <img src={selectedChild.image} alt={selectedChild.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-xl text-black">
                        {(selectedChild.name || "M")?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={`flex flex-col min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    <span className="font-black text-black text-base sm:text-lg truncate">
                      {selectedChild.name}
                    </span>
                    <span className="font-mono text-xs font-black text-black/70 bg-black/5 px-2 py-0.5 border border-black inline-block w-max mt-1">
                      #{selectedChild.qrId} {selectedChild.year ? `• ${selectedChild.year}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Points adjuster */}
              <div className="flex items-center gap-2 bg-[#38BDF8] border-[3px] border-black shadow-[3px_3px_0px_#000000] px-3 py-2 shrink-0">
                <SlidersHorizontal className="w-5 h-5 stroke-[2.5] text-black" />
                <span className="text-sm font-black uppercase text-black">{t("checkPoints")}</span>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-20 bg-white text-black font-black text-center text-lg border-2 border-black px-2 py-1 focus:outline-none focus:bg-[#FEF08A] transition-colors"
                />
              </div>
            </div>

            {/* The Printable Check Component */}
            <RewardCheck
              child={selectedChild}
              points={customPoints}
            />
          </div>
        ) : (
          /* ── SEARCH & LIST VIEW ── */
          <div className="w-full flex flex-col gap-6">
            
            {/* Search Input Box */}
            <div className="no-print w-full">
              <div className="relative flex items-center bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] focus-within:shadow-[8px_8px_0px_#000000] transition-all duration-200">
                {/* Search Icon */}
                <div className="bg-[#38BDF8] text-black border-x-[3px] border-black p-3.5 sm:p-4.5 flex items-center justify-center shrink-0">
                  <Search className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
                </div>

                {/* Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("checkSearchPlaceholder")}
                  autoFocus
                  className="w-full bg-transparent px-4 sm:px-6 py-3.5 sm:py-4 text-black font-black text-lg sm:text-xl placeholder:text-black/40 outline-none"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-3.5 text-black hover:bg-[#FACC15] border-x-[3px] border-black transition-colors cursor-pointer shrink-0"
                    aria-label={t("cancel")}
                  >
                    <X className="w-6 h-6 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>

            {/* Status / Quick info */}
            <div className="no-print flex items-center justify-between px-1 text-xs font-black uppercase tracking-widest text-black/70">
              <span>
                {filteredStudents.length === allStudents.length
                  ? `${t("checkTotal")} ${allStudents.length}`
                  : `${t("checkResults")} ${filteredStudents.length} ${t("checkResultsOf")} ${allStudents.length}`}
              </span>
              {searchQuery && (
                <span className="bg-[#A3E635] text-black px-2 py-0.5 border-2 border-black font-black">
                  {t("checkActiveSearch")}
                </span>
              )}
            </div>

            {/* Children Grid List */}
            <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((child, index) => {
                    const avatarBg = getAvatarBg(child.name);
                    return (
                      <Motion.button
                        key={child.qrId}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                        onClick={() => handleSelectChild(child)}
                        className={`group bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all p-4 ${lang === 'ar' ? 'text-right' : 'text-left'} flex items-center justify-between gap-4 cursor-pointer`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-12 h-12 border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center overflow-hidden shrink-0 ${avatarBg}`}>
                            {child.image ? (
                              <img src={child.image} alt={child.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-black text-xl text-black">
                                {(child.name || "M")?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className={`flex flex-col min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            <span className="font-black text-black text-base lg:text-lg truncate">
                              {child.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono font-black text-white bg-black px-2 py-0.5 border border-black">
                                #{child.qrId}
                              </span>
                              {child.year && (
                                <span className="text-[10px] font-black text-black bg-[#FEF08A] px-2 py-0.5 border border-black uppercase">
                                  {child.year}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#FACC15] group-hover:bg-[#A3E635] border-2 border-black p-1.5 shadow-[2px_2px_0px_#000000] transition-colors shrink-0">
                          <Trophy className="w-4 h-4 stroke-[2.5] text-black" />
                        </div>
                      </Motion.button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-4 bg-white border-[3px] border-black border-dashed p-8 shadow-[6px_6px_0px_#000000]">
                    <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center">
                      <Search className="w-8 h-8 stroke-[3] text-black" />
                    </div>
                    <div className="space-y-1 mt-2">
                      <h3 className="text-xl font-black text-black uppercase">{t("checkNotFound")}</h3>
                      <p className="text-sm text-black/60 font-bold">
                        {t("checkNotFoundSub")}
                      </p>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-4 bg-[#A3E635] text-black font-black uppercase text-sm px-6 py-3 border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
                      >
                        {t("checkClearSearch")}
                      </button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

