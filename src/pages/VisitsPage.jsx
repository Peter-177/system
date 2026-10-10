import React, { useState, useMemo, useRef } from "react";
import { visitsDB, studentsDB } from "../data/storage";
import { buildVisitEntry, visitedToday } from "../utils/helpers";
import { Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CalendarDays,
  X,
  Home as HomeIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export function VisitsPage({ onBack, onGoVisitsHistory }) {
  const [query, setQuery] = useState("");
  const [pendingList, setPendingList] = useState([]);
  const [showNotification, setShowNotification] = useState(true);
  const toast = useToast();
  const inputRef = useRef(null);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));
  }, []);

  const addPerson = (student) => {
    if (!student) return;
    if (pendingList.find((p) => p.qrId === student.qrId)) {
      toast.show("ده متسجل في القائمة أصلاً");
      setQuery("");
      return;
    }
    const log = visitsDB.get(student.qrId);
    if (visitedToday(log)) {
      toast.show(`⚠️ ${student.name} زُرناه النهارده!`);
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
      if (!match) {
        match = allStudents.find((s) => s.name && s.name.toLowerCase().includes(q));
      }
      if (match) {
        addPerson(match);
      } else {
        toast.show("ما لقيناش حد بالاسم أو الكود ده");
      }
    }
  };

  const removePerson = (qrId) => {
    setPendingList((prev) => prev.filter((p) => p.qrId !== qrId));
  };

  const handleSave = () => {
    if (pendingList.length === 0) return;
    let count = 0;
    pendingList.forEach((p) => {
      const log = visitsDB.get(p.qrId);
      if (!visitedToday(log)) {
        visitsDB.add(p.qrId, buildVisitEntry());
        count++;
      }
    });
    toast.show(`✅ تمام، سجلنا زيارة ${count} مخدوم`);
    setPendingList([]);
  };

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allStudents
      .filter(
        (s) =>
          s.qrId.toLowerCase().includes(q) ||
          (s.name && s.name.toLowerCase().includes(q)),
      )
      .slice(0, 5);
  }, [query, allStudents]);

  const missingVisits = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return allStudents.filter((s) => {
      const log = visitsDB.get(s.qrId);
      if (!log || log.length === 0) return true;
      const lastVisit = new Date(log[log.length - 1].timestamp);
      return lastVisit < threeMonthsAgo;
    });
  }, [allStudents]);

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
      <header className="sticky top-0 z-50 bg-[#FB923C] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
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

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FB923C] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              VISITS
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase flex items-center gap-2">
              تسجيل الافتقاد والزيارات
            </h1>
          </div>

          {/* History Button */}
          <button
            onClick={onGoVisitsHistory}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 font-black text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none flex items-center gap-2 transition-all cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">سجل الزيارات</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Missing Visits Banner */}
        <AnimatePresence>
          {showNotification && missingVisits.length > 0 && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#FEF08A] border-[3px] border-black shadow-[6px_6px_0px_#000000] p-5 sm:p-6 flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-[#FEF08A] flex items-center justify-center border-2 border-black">
                    <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-black uppercase">
                    مخدومين لم تتم زيارتهم منذ 3 أشهر ({missingVisits.length} مخدوم)
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="p-1 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {missingVisits.slice(0, 15).map((s) => (
                  <button
                    key={s.qrId}
                    onClick={() => addPerson(s)}
                    className="px-3 py-1 bg-white border-2 border-black text-xs font-black text-black hover:bg-[#FACC15] shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>+</span>
                    <span>{s.name}</span>
                  </button>
                ))}
                {missingVisits.length > 15 && (
                  <span className="px-3 py-1 bg-black text-white text-xs font-black">
                    +{missingVisits.length - 15} آخرين
                  </span>
                )}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Search & Input Box */}
        <div className="w-full relative">
          <div className="relative flex items-center bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] focus-within:shadow-[8px_8px_0px_#000000] transition-all">
            <div className="bg-[#38BDF8] text-black border-l-[3px] border-black p-4 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 stroke-[3]" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب اسم المخدوم أو الكود واضغط Enter لإضافته..."
              autoFocus
              className="w-full bg-transparent px-4 py-4 text-black font-black text-lg placeholder:text-black/30 outline-none"
            />
          </div>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-2 flex flex-col gap-1 z-[100]"
              >
                {suggestions.map((s) => (
                  <button
                    key={s.qrId}
                    className="p-3 text-right font-black text-sm text-black hover:bg-[#FACC15] transition-colors flex items-center justify-between border-b-2 border-black last:border-0 cursor-pointer"
                    onClick={() => addPerson(s)}
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

        {/* Pending Visit List Section */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">
            قائمة المخدومين المطلوب تسجيلهم
          </h2>
          <span className="bg-[#A3E635] text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
            {pendingList.length} مخدومين
          </span>
        </div>

        {/* Pending Cards */}
        <div className="flex flex-col gap-3 min-h-[250px]">
          <AnimatePresence mode="popLayout">
            {pendingList.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-white border-[3px] border-black border-dashed p-8 shadow-[6px_6px_0px_#000000]">
                <div className="w-16 h-16 bg-[#FB923C] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center">
                  <HomeIcon className="w-8 h-8 stroke-[2.5] text-black" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-black uppercase">
                    القائمة فارغة
                  </h3>
                  <p className="text-sm text-black/60 font-bold">
                    ابحث عن مخدوم وأضفه للقائمة ثم اضغط حفظ لتسجيل الزيارة
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingList.map((p) => {
                  const avatarBg = getAvatarBg(p.name);
                  return (
                    <Motion.div
                      layout
                      key={p.qrId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 border-[3px] border-black shadow-[2px_2px_0px_#000000] ${avatarBg} flex items-center justify-center overflow-hidden shrink-0`}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-xl text-black">
                              {(p.name || "م")?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-black text-base truncate">
                            {p.name}
                          </span>
                          <span className="font-mono text-xs font-black text-black/60">
                            #{p.qrId} {p.year ? `• ${p.year}` : ""}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removePerson(p.qrId)}
                        className="w-9 h-9 bg-[#EF4444] text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0"
                        title="إزالة من القائمة"
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                      </button>
                    </Motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating / Sticky Save Action Button */}
        <AnimatePresence>
          {pendingList.length > 0 && (
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="sticky bottom-6 z-40"
            >
              <button
                onClick={handleSave}
                className="w-full bg-[#A3E635] text-black border-[4px] border-black shadow-[8px_8px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] active:shadow-none py-5 font-black text-xl sm:text-2xl uppercase transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <CheckCircle2 className="w-7 h-7 stroke-[3]" />
                <span>تسجيل واكتمال ({pendingList.length}) زيارة</span>
              </button>
            </Motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
