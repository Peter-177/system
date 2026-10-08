import { useState, useMemo, useEffect, useRef } from "react";
import {
  attendanceDB,
  studentsDB,
  classesDB,
  couponsDB,
} from "../data/storage";
import {
  buildAttendanceEntry,
  registeredToday,
  buildCouponEntry,
  todayISO,
} from "../utils/helpers";
import { Page, Navbar, Toast, Avatar } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Search,
  CalendarDays,
  X,
  Users,
  UserCheck,
  Save,
} from "lucide-react";
import { useAttendanceContext } from "../context/AttendanceContext";

// ─── Spring presets (apple-design §4) ────────────────────────────────────────
const spring = { type: "spring", bounce: 0, duration: 0.35 };
const springItem = { type: "spring", stiffness: 320, damping: 28 };

// ─── Animation variants ───────────────────────────────────────────────────────
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: springItem },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline section label — small, restrained, purposeful */
function SectionLabel({ icon: Icon, children }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] select-none">
      <Icon className="w-3.5 h-3.5 text-slate-600" strokeWidth={2.5} />
      {children}
    </p>
  );
}

/** A single person in the pending list */
function PendingCard({ person, onRemove }) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/[0.06] hover:border-white/10 transition-colors duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={person.name} size="sm" />
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-white text-sm truncate leading-snug">
            {person.name}
          </span>
          <span className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5">
            {person.qrId}
          </span>
        </div>
      </div>

      <button
        onClick={() => onRemove(person.qrId)}
        aria-label={`إزالة ${person.name}`}
        className="flex items-center justify-center w-8 h-8 rounded-full text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:outline-none shrink-0"
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

/** Empty state — minimal, legible, never opacity-hacked */
function EmptySlot({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl border border-dashed border-white/[0.08] bg-slate-900/20">
      <div className="w-11 h-11 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-600">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-600 max-w-[200px] leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AttendancePage({ person, onBack, onGoHistory }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const { pendingList, setPendingList } = useAttendanceContext();
  const toast = useToast();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // ── Derived date label ───────────────────────────────────────────────────
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const isCustomDate = selectedDate !== todayISO();

  // ── Data ─────────────────────────────────────────────────────────────────
  const allClassesDB = classesDB.getAll();
  const classList = Object.entries(allClassesDB).map(([id, cls]) => ({
    id,
    ...cls,
  }));

  useEffect(() => {
    if (person) {
      setPendingList((prev) => {
        if (prev.find((p) => p.qrId === person.qrId)) return prev;
        return [person, ...prev];
      });
    }
  }, [person, setPendingList]);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));
  }, []);

  const classRoster = useMemo(() => {
    if (!selectedClass) return [];
    const targetClass = allClassesDB[selectedClass];
    if (!targetClass) return [];
    return allStudents
      .filter((s) => targetClass.grades?.includes(s.year))
      .filter((s) => registeredToday(attendanceDB.get(s.qrId), selectedDate))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [selectedClass, allStudents, allClassesDB, selectedDate]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addPerson = (student) => {
    if (!student) return;
    if (pendingList.find((p) => p.qrId === student.qrId)) {
      toast.show(`⚠️ ${student.name} موجود في قائمة التحضير!`);
      setQuery("");
      return;
    }
    const log = attendanceDB.get(student.qrId);
    if (registeredToday(log, selectedDate)) {
      const isToday = selectedDate === todayISO();
      toast.show(
        isToday
          ? `⚠️ ${student.name} متسجل النهارده فعلاً!`
          : `⚠️ ${student.name} متسجل في تاريخ ${selectedDate} فعلاً!`
      );
      return;
    }
    setPendingList((prev) => [student, ...prev]);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      const q = query.trim().toLowerCase();
      let match = allStudents.find((s) => s.qrId.toLowerCase() === q);
      if (!match) match = allStudents.find((s) => s.name.toLowerCase().includes(q));
      if (match) addPerson(match);
      else toast.show("ما لقيناش حد بالاسم أو الكود ده");
    }
    // Close suggestions on Escape
    if (e.key === "Escape") setQuery("");
  };

  const removePerson = (qrId) => {
    setPendingList((prev) => prev.filter((p) => p.qrId !== qrId));
  };

  const handleSave = () => {
    if (pendingList.length === 0) return;
    let registeredCount = 0;
    const isToday = selectedDate === todayISO();
    pendingList.forEach((p) => {
      const log = attendanceDB.get(p.qrId);
      if (!registeredToday(log, selectedDate)) {
        attendanceDB.add(p.qrId, buildAttendanceEntry(selectedDate));
        couponsDB.add(p.qrId, buildCouponEntry(50, selectedDate));
        registeredCount++;
      }
    });
    const dateLabel = isToday ? "النهاردة" : `ليوم ${selectedDate}`;
    toast.show(`✅ تمام، حضرنا ${registeredCount} شخص ${dateLabel}`);
    setPendingList([]);
  };

  const handleSaveClass = () => {
    if (classRoster.length === 0) return;
    let registeredCount = 0;
    const isToday = selectedDate === todayISO();
    classRoster.forEach((p) => {
      const log = attendanceDB.get(p.qrId);
      if (!registeredToday(log, selectedDate)) {
        attendanceDB.add(p.qrId, buildAttendanceEntry(selectedDate));
        couponsDB.add(p.qrId, buildCouponEntry(50, selectedDate));
        registeredCount++;
      }
    });
    const dateLabel = isToday ? "النهاردة" : `ليوم ${selectedDate}`;
    toast.show(`✅ تمام، حضرنا ${registeredCount} من الفصل ${dateLabel}`);
  };

  // ── Search suggestions ───────────────────────────────────────────────────
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allStudents
      .filter(
        (s) =>
          s.qrId.toLowerCase().includes(q) ||
          (s.name && s.name.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [query, allStudents]);

  // ── Navbar right slot — save button (only when there's a pending list) ──
  const navRight = pendingList.length > 0 && (
    <button
      onClick={handleSave}
      className="flex items-center gap-2 h-9 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-black text-xs tracking-wide transition-all focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none shadow-lg shadow-sky-500/20"
    >
      <Save className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
      <span>
        حفظ ({pendingList.length})
        {isCustomDate && <span className="opacity-70 mr-1"> [{selectedDate}]</span>}
      </span>
    </button>
  );

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="تسجيل الحضور" right={navRight} />

      <div
        className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6"
        dir="rtl"
      >
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
              تسجيل الحضور
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {formattedSelectedDate}
            </p>
          </div>

          <button
            onClick={onGoHistory}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 border border-white/[0.07] text-slate-300 hover:text-white hover:border-white/15 font-bold text-xs tracking-wide transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:outline-none"
          >
            <CalendarDays className="w-4 h-4 text-sky-400" strokeWidth={2} />
            سجل الحضور
          </button>
        </header>

        {/* ── Custom-date warning banner ───────────────────────────────────── */}
        <AnimatePresence>
          {isCustomDate && (
            <motion.div
              key="date-warning"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={spring}
              role="alert"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                  <CalendarDays className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-200 leading-snug">
                    تسجيل لتاريخ مخصص
                  </p>
                  <p className="text-[11px] text-amber-400/70 mt-0.5">
                    {formattedSelectedDate} · {selectedDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(todayISO())}
                className="shrink-0 h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              >
                رجوع للنهاردة
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Controls panel ───────────────────────────────────────────────── */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">

          {/* Search */}
          <div className="sm:col-span-5 space-y-2 relative">
            <SectionLabel icon={Search}>بحث سريع</SectionLabel>
            <div className="relative">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسم الطفل أو الكود..."
                autoComplete="off"
                aria-label="ابحث عن طفل"
                aria-haspopup="listbox"
                aria-expanded={suggestions.length > 0}
                className="w-full h-12 bg-slate-950/60 border border-white/[0.08] focus:border-sky-500/40 rounded-xl pr-11 pl-11 text-sm sm:text-base text-white placeholder:text-slate-500 font-medium outline-none focus:ring-4 focus:ring-sky-500/[0.08] transition-all"
              />
              <Search
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                strokeWidth={2}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  aria-label="مسح البحث"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={spring}
                  role="listbox"
                  aria-label="نتائج البحث"
                  ref={suggestionsRef}
                  className="absolute top-full right-0 left-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 p-1.5 flex flex-col gap-0.5 z-50"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.qrId}
                      role="option"
                      onClick={() => addPerson(s)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition-colors text-right group focus-visible:bg-white/[0.05] focus-visible:outline-none min-h-[44px]"
                    >
                      <Avatar name={s.name} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white text-sm truncate group-hover:text-sky-300 transition-colors">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {s.qrId}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Class selector */}
          <div className="sm:col-span-3 space-y-2">
            <SectionLabel icon={Users}>حضر فصل</SectionLabel>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              aria-label="اختر الفصل"
              className="w-full h-12 bg-slate-950/60 border border-white/[0.08] focus:border-sky-500/40 rounded-xl px-4 text-sm text-white font-medium outline-none focus:ring-4 focus:ring-sky-500/[0.08] transition-all [color-scheme:dark] appearance-none cursor-pointer"
            >
              <option value="">اختر فصل...</option>
              {classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date picker */}
          <div className="sm:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel icon={CalendarDays}>تاريخ الحضور</SectionLabel>
              {isCustomDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayISO())}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  رجوع للنهاردة ↩
                </button>
              )}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="تاريخ التسجيل"
              className={`w-full h-12 bg-slate-950/60 border rounded-xl px-4 text-sm font-mono font-bold text-center outline-none focus:ring-4 transition-all [color-scheme:dark] ${
                isCustomDate
                  ? "border-amber-500/40 bg-amber-950/20 text-amber-200 focus:border-amber-400 focus:ring-amber-500/[0.08]"
                  : "border-white/[0.08] text-white focus:border-sky-500/40 focus:ring-sky-500/[0.08]"
              }`}
            />
          </div>
        </div>

        {/* ── Two-column content ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COL: Pending attendance list */}
          <section aria-label="قائمة الحضور" className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-2.5 px-0.5">
              <h3 className="text-sm font-black text-white">الحاضرين</h3>
              <AnimatePresence mode="popLayout">
                {pendingList.length > 0 && (
                  <motion.span
                    key={pendingList.length}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={spring}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-black tabular-nums"
                  >
                    {pendingList.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* List body */}
            {pendingList.length === 0 ? (
              <EmptySlot
                icon={UserCheck}
                title="القائمة فاضية"
                subtitle="ضيف الأطفال من البحث أو بالمسح"
              />
            ) : (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                <AnimatePresence initial={false}>
                  {pendingList.map((p) => (
                    <PendingCard key={p.qrId} person={p} onRemove={removePerson} />
                  ))}
                </AnimatePresence>

                {/* Save CTA — contextual, discoverable */}
                <motion.button
                  layout
                  onClick={handleSave}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.1 }}
                  className="w-full mt-2 h-13 flex items-center justify-center gap-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-sky-500/20 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                >
                  <Save className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>
                    حضّر الـ {pendingList.length} طفل دول
                    {isCustomDate && (
                      <span className="font-medium opacity-70 mr-1">
                        ({selectedDate})
                      </span>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </section>

          {/* RIGHT COL: Class roster (present students) */}
          <section aria-label="حضور الفصل" className="space-y-3">
            <div className="flex items-center gap-2.5 px-0.5">
              <h3 className="text-sm font-black text-white">
                {selectedClass
                  ? `الفصل: ${allClassesDB[selectedClass]?.name}`
                  : "عرض الفصل"}
              </h3>
              {selectedClass && classRoster.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black">
                  {classRoster.length}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!selectedClass ? (
                <motion.div
                  key="no-class"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                >
                  <EmptySlot
                    icon={Users}
                    title="اختار فصل"
                    subtitle="اختار فصل من فوق عشان تشوف مين الحاضرين"
                  />
                </motion.div>
              ) : classRoster.length === 0 ? (
                <motion.div
                  key="empty-roster"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                >
                  <EmptySlot
                    icon={UserCheck}
                    title="لسه مفيش حاضرين"
                    subtitle={
                      isCustomDate
                        ? `مفيش تسجيل من الفصل ده في ${selectedDate}`
                        : "مفيش حد اتسجل من الفصل ده النهارده"
                    }
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`roster-${selectedClass}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={spring}
                  className="space-y-1.5 max-h-[480px] overflow-y-auto pr-0.5"
                >
                  {classRoster.map((s) => {
                    const hasAttended = registeredToday(
                      attendanceDB.get(s.qrId),
                      selectedDate
                    );
                    const isPending = pendingList.some((p) => p.qrId === s.qrId);
                    return (
                      <button
                        key={s.qrId}
                        disabled={hasAttended}
                        onClick={() => addPerson(s)}
                        aria-pressed={hasAttended}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-right transition-all duration-200 min-h-[52px] focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:outline-none ${
                          hasAttended
                            ? "bg-emerald-500/[0.07] border-emerald-500/20 cursor-default"
                            : isPending
                            ? "bg-sky-500/[0.07] border-sky-500/20 hover:border-sky-500/35"
                            : "bg-slate-900/40 border-white/[0.06] hover:bg-slate-800/40 hover:border-white/10 active:scale-[0.99]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            name={s.name}
                            size="sm"
                            accent={hasAttended ? "emerald" : undefined}
                          />
                          <div className="flex flex-col min-w-0 text-right">
                            <span
                              className={`font-semibold text-sm truncate leading-snug ${
                                hasAttended ? "text-emerald-300" : "text-white"
                              }`}
                            >
                              {s.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {s.qrId}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {hasAttended ? (
                            <CheckCircle2
                              className="w-4.5 h-4.5 text-emerald-400"
                              strokeWidth={2}
                            />
                          ) : isPending ? (
                            <span className="w-2 h-2 rounded-full bg-sky-400 block" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </Page>
  );
}
