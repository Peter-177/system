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
import { Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Search,
  CalendarDays,
  X,
  Users,
  UserCheck,
  Save,
  ArrowRight,
} from "lucide-react";
import { useAttendanceContext } from "../context/AttendanceContext";

export function AttendancePage({ person, onBack, onGoHistory }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const { pendingList, setPendingList } = useAttendanceContext();
  const toast = useToast();
  const inputRef = useRef(null);

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

  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col" dir="rtl">
      <Toast msg={toast.msg} />

      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {onBack ? (
            <button
              onClick={onBack}
              className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              <span>رجوع</span>
            </button>
          ) : (
            <div className="w-10" />
          )}

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              ATTENDANCE
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              تسجيل الحضور
            </h1>
          </div>

          <button
            onClick={onGoHistory}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 font-black text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none flex items-center gap-2 transition-all cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">سجل الحضور</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Custom Date Warning */}
        {isCustomDate && (
          <div className="bg-[#FEF08A] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-6 h-6 stroke-[2.5] text-black" />
              <div>
                <span className="font-black text-sm text-black block">تسجيل لتاريخ مخصص</span>
                <span className="text-xs font-bold text-black/70">{formattedSelectedDate} ({selectedDate})</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(todayISO())}
              className="bg-black text-white px-3 py-1.5 font-black text-xs uppercase border border-black hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              الرجوع لتاريخ اليوم
            </button>
          </div>
        )}

        {/* Controls Card */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Quick Search */}
          <div className="md:col-span-6 relative">
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1.5">
              بحث وإضافة سريعة
            </label>
            <div className="relative flex items-center bg-[#FDF8F0] border-[3px] border-black shadow-[2px_2px_0px_#000000]">
              <div className="bg-[#38BDF8] border-l-[3px] border-black p-3 flex items-center justify-center">
                <Search className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسم الطفل أو الكود..."
                className="w-full bg-transparent px-3 py-2.5 text-black font-black text-base outline-none placeholder:text-black/30"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-2 text-black hover:bg-[#EF4444] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <Motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-2 flex flex-col gap-1 z-50"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.qrId}
                      onClick={() => addPerson(s)}
                      className="p-3 text-right font-black text-sm text-black hover:bg-[#FACC15] transition-colors flex items-center justify-between border-b-2 border-black last:border-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 border-2 border-black ${getAvatarBg(s.name)} flex items-center justify-center text-xs font-black`}>
                          {(s.name || "م")?.[0]?.toUpperCase()}
                        </div>
                        <span>{s.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-black/60 bg-[#FDF8F0] px-2 py-0.5 border border-black">
                        #{s.qrId}
                      </span>
                    </button>
                  ))}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Class Select */}
          <div className="md:col-span-3">
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1.5">
              حسب الفصل
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-12 bg-[#FDF8F0] border-[3px] border-black px-3 font-black text-sm text-black outline-none focus:bg-[#FEF08A] transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <option value="">اختر الفصل...</option>
              {classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="md:col-span-3">
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1.5">
              تاريخ الحضور
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-12 bg-[#FDF8F0] border-[3px] border-black px-3 font-black text-sm text-black outline-none focus:bg-[#FEF08A] transition-colors shadow-[2px_2px_0px_#000000]"
            />
          </div>
        </div>

        {/* ── Two Columns: Pending List & Class View ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Pending List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-black uppercase flex items-center gap-2">
                <span>قائمة الحاضرين المطلوبة</span>
              </h3>
              <span className="bg-[#A3E635] text-black border-2 border-black px-3 py-0.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
                {pendingList.length} مخدوم
              </span>
            </div>

            {pendingList.length === 0 ? (
              <div className="py-14 text-center bg-white border-[3px] border-black border-dashed p-6 shadow-[4px_4px_0px_#000000]">
                <UserCheck className="w-10 h-10 stroke-[2] mx-auto text-black/30 mb-2" />
                <p className="font-black text-base text-black uppercase">القائمة فارغة</p>
                <p className="text-xs font-bold text-black/60">ابحث عن المخدومين لإضافتهم للقائمة</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {pendingList.map((p) => (
                    <Motion.div
                      key={p.qrId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 border-2 border-black ${getAvatarBg(p.name)} flex items-center justify-center text-sm font-black text-black`}>
                          {(p.name || "م")?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-base text-black block truncate">{p.name}</span>
                          <span className="font-mono text-xs font-bold text-black/60">#{p.qrId}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePerson(p.qrId)}
                        className="w-8 h-8 bg-[#EF4444] text-white border-2 border-black flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                        title="إزالة"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </Motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={handleSave}
                  className="w-full bg-[#A3E635] text-black border-[3px] border-black shadow-[6px_6px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none py-4 font-black text-base uppercase flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <Save size={20} className="stroke-[2.5]" />
                  <span>تأكيد تسجيل حضور ({pendingList.length}) مخدوم</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Class Roster View */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-black uppercase">
                {selectedClass ? `حضور فصل: ${allClassesDB[selectedClass]?.name}` : "عرض حضور الفصل"}
              </h3>
              {selectedClass && (
                <span className="bg-[#38BDF8] text-black border-2 border-black px-3 py-0.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
                  {classRoster.length} حاضر
                </span>
              )}
            </div>

            {!selectedClass ? (
              <div className="py-14 text-center bg-white border-[3px] border-black border-dashed p-6 shadow-[4px_4px_0px_#000000]">
                <Users className="w-10 h-10 stroke-[2] mx-auto text-black/30 mb-2" />
                <p className="font-black text-base text-black uppercase">اختر فصلاً</p>
                <p className="text-xs font-bold text-black/60">حدد فصلاً من القائمة بالأعلى لعرض الحاضرين</p>
              </div>
            ) : classRoster.length === 0 ? (
              <div className="py-14 text-center bg-white border-[3px] border-black border-dashed p-6 shadow-[4px_4px_0px_#000000]">
                <p className="font-black text-base text-black uppercase">لم يتم تسجيل حضور لأي مخدوم من هذا الفصل في هذا اليوم</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {classRoster.map((s) => (
                  <div
                    key={s.qrId}
                    className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000000] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 border-2 border-black ${getAvatarBg(s.name)} flex items-center justify-center text-xs font-black`}>
                        {(s.name || "م")?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-sm text-black block truncate">{s.name}</span>
                        <span className="font-mono text-[10px] text-black/60">#{s.qrId}</span>
                      </div>
                    </div>
                    <div className="bg-[#DCFCE7] border-2 border-black px-2.5 py-1 text-black font-black text-xs flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-black stroke-[3]" />
                      <span>حاضر</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
