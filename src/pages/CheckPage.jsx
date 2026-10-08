import { useState, useMemo, useEffect, useRef } from "react";
import { Page, Navbar, Avatar } from "../components/UI";
import { studentsDB } from "../data/storage";
import { RewardCheck } from "../components/RewardCheck";
import { normalizeArabic } from "../utils/arabicWords";
import {
  Search,
  X,
  Award,
  ChevronRight,
  UserCheck,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CheckPage
 * Route: /check and /check/:childId
 *
 * Provides real-time Arabic search with Hamza normalization across all children,
 * and displays an authentic printable bank check when a child is selected.
 */
export function CheckPage({
  currentUser,
  initialChildId,
  onBack,
  onSelectChildId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChildId, setSelectedChildId] = useState(initialChildId || null);
  const [customPoints, setCustomPoints] = useState(0); // placeholder value 0 as requested
  const searchInputRef = useRef(null);

  // Load all children from the DB
  const allStudents = useMemo(() => {
    const db = studentsDB.getAll() || {};
    return Object.keys(db).map((id) => ({
      qrId: id,
      ...db[id],
    }));
  }, []);

  // Sync initialChildId if provided from router
  useEffect(() => {
    if (initialChildId) {
      setSelectedChildId(initialChildId);
    }
  }, [initialChildId]);

  // Real-time filtering with Arabic Hamza normalization
  const filteredStudents = useMemo(() => {
    const q = normalizeArabic(searchQuery);
    if (!q) {
      // Sort alphabetically in Arabic
      return [...allStudents].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "ar")
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
    }).sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
  }, [allStudents, searchQuery]);

  // Fetch specific selected child data
  const selectedChild = useMemo(() => {
    if (!selectedChildId) return null;
    const direct = studentsDB.get(selectedChildId);
    if (direct) return { qrId: selectedChildId, ...direct };
    return allStudents.find((s) => s.qrId === selectedChildId) || null;
  }, [selectedChildId, allStudents]);

  const handleSelectChild = (child) => {
    setSelectedChildId(child.qrId);
    if (onSelectChildId) {
      onSelectChildId(child.qrId);
    }
    // Update browser URL to /check/:childId without reload
    window.history.pushState(
      { page: "check", childId: child.qrId },
      "",
      `/check/${child.qrId}`
    );
  };

  const handleClearSelection = () => {
    setSelectedChildId(null);
    if (onSelectChildId) {
      onSelectChildId(null);
    }
    // Revert URL to /check
    window.history.pushState({ page: "check", childId: null }, "", "/check");
  };

  return (
    <Page>
      {/* Page Header (hidden during print) */}
      <div className="no-print">
        <Navbar
          title="شيك المكافأة"
          onBack={() => {
            if (selectedChildId) {
              handleClearSelection();
            } else if (onBack) {
              onBack();
            } else {
              window.history.back();
            }
          }}
          right={
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-black text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
                النادي الصيفي 2026 🌴
              </span>
            </div>
          }
        />
      </div>

      <main
        className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-6"
        dir="rtl"
      >
        {/* ── IF A CHILD IS SELECTED: SHOW CHECK VIEW ── */}
        {selectedChild ? (
          <div className="w-full flex flex-col gap-4 sm:gap-6 animate-reveal">
            {/* Top Navigation bar between list and check (hidden during print) */}
            <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2.5 sm:gap-4 min-w-0">
                <button
                  onClick={handleClearSelection}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 text-sky-300 font-bold hover:bg-slate-700 transition-colors active:scale-95 text-xs sm:text-sm cursor-pointer shrink-0 min-h-[44px]"
                >
                  <ChevronRight size={18} />
                  <span>قائمة الأطفال</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar
                    name={selectedChild.name}
                    accent={selectedChild.accent}
                    image={selectedChild.image}
                    size="sm"
                  />
                  <div className="flex flex-col text-right min-w-0">
                    <span className="font-black text-white text-xs sm:text-base truncate max-w-[130px] sm:max-w-none">
                      {selectedChild.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{selectedChild.qrId} {selectedChild.year ? `• ${selectedChild.year}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Optional points adjuster */}
              <div className="flex items-center justify-end gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5 self-end sm:self-auto min-h-[40px]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-xs text-slate-400 font-bold">النقاط:</span>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-16 bg-slate-900 text-sky-300 font-black text-center text-base rounded-lg border border-white/10 px-1 py-0.5 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            {/* The Check Component */}
            <RewardCheck
              child={selectedChild}
              points={customPoints}
            />
          </div>
        ) : (
          /* ── NO CHILD SELECTED: SHOW SEARCH & CHILDREN LIST ── */
          <div className="w-full flex flex-col gap-4 sm:gap-6">
            {/* Header / Hero Banner */}
            <div className="no-print relative overflow-hidden bg-gradient-to-br from-emerald-950/60 via-slate-900/60 to-slate-950/80 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-2xl">
              <div className="space-y-1.5 sm:space-y-2 text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>شيكات المكافأة الرسمية</span>
                </div>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  اختر الطفل لإصدار <span className="text-emerald-400">شيك المكافأة</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-bold max-w-lg">
                  ابحث باسم الطفل أو الكود لطباعة أو تحميل شيك بنكي مميز باسمه للمكافآت والتشجيع.
                </p>
              </div>

              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-2xl">
                <Award className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
            </div>

            {/* Search Bar with Real-time Arabic filtering */}
            <div className="no-print relative group w-full">
              <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                <Search className="w-6 h-6" strokeWidth={2.5} />
              </div>

              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم الطفل (مثال: أحمد، ابراهيم...) أو الكود..."
                autoFocus
                className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 focus:border-emerald-500/60 rounded-2xl pr-14 pl-12 h-16 text-base sm:text-lg font-black text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-xl"
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 hover:text-white transition-colors"
                  aria-label="مسح البحث"
                >
                  <X className="w-5 h-5 bg-slate-800 rounded-full p-1" />
                </button>
              )}
            </div>

            {/* Results Counter */}
            <div className="no-print flex items-center justify-between px-2 text-xs font-bold text-slate-400">
              <span>
                {filteredStudents.length === allStudents.length
                  ? `إجمالي الأطفال: ${allStudents.length}`
                  : `نتائج البحث: ${filteredStudents.length} من ${allStudents.length}`}
              </span>
              {searchQuery && (
                <span className="text-emerald-400">
                  بحث بالهمزات التلقائية نشط ✓
                </span>
              )}
            </div>

            {/* Children Cards List */}
            <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              <AnimatePresence>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((child, index) => (
                    <motion.button
                      key={child.qrId}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                      onClick={() => handleSelectChild(child)}
                      className="group relative text-right p-4 sm:p-5 rounded-2xl bg-slate-900/40 hover:bg-emerald-950/30 border border-white/5 hover:border-emerald-500/30 backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer shadow-lg hover:shadow-emerald-950/20 hover:-translate-y-0.5 active:scale-98"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar
                          name={child.name}
                          accent={child.accent}
                          image={child.image}
                          size="md"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-white text-base truncate group-hover:text-emerald-300 transition-colors">
                            {child.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-white/5">
                              #{child.qrId}
                            </span>
                            {child.year && (
                              <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                                {child.year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-800/60 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-4 bg-slate-900/20 border border-dashed border-white/10 rounded-3xl p-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 text-2xl">
                      🔍
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white">لم يتم العثور على أطفال بهذا الاسم</h3>
                      <p className="text-xs text-slate-400 font-bold">
                        تأكد من كتابة الاسم أو الكود بشكل صحيح
                      </p>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="tech-btn-secondary text-xs !py-2 !px-4"
                      >
                        مسح البحث
                      </button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </Page>
  );
}
