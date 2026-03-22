import React, { useState, useMemo, useRef, useEffect } from "react";
import { visitsDB, studentsDB } from "../data/storage";
import { buildVisitEntry, visitedToday } from "../utils/helpers";
import { Page, Navbar, StudentMiniCard, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CalendarDays,
  X,
  Users,
  Home as HomeIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { gsap } from "gsap";

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
        match = allStudents.find((s) => s.name.toLowerCase().includes(q));
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

    return allStudents.filter(s => {
      const log = visitsDB.get(s.qrId);
      if (!log || log.length === 0) return true; // Never visited

      const lastVisit = new Date(log[log.length - 1].timestamp);
      return lastVisit < threeMonthsAgo;
    });
  }, [allStudents]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="تسجيل الزيارات" />

      <div
        className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6"
        dir="rtl"
      >
        {/* Missing Visits Notification */}
        <AnimatePresence>
          {showNotification && missingVisits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-[2rem] overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-amber-500">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-lg font-black tracking-tight">مخدومين لم تتم زيارتهم منذ 3 شهور</h3>
                  </div>
                  <button 
                    onClick={() => setShowNotification(false)}
                    className="p-2 hover:bg-amber-500/10 rounded-full text-amber-500/50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 text-white">
                  {missingVisits.map(s => (
                    <div key={s.qrId} className="px-3 py-1.5 bg-[#0F2545] border border-[#1A3D63] rounded-xl text-xs font-bold flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                       {s.name}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-amber-500/60 font-black uppercase tracking-widest mt-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>برجاء المتابعة مع هؤلاء المخدومين في أقرب وقت.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Top Controls Box */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 bg-[#0F2545] backdrop-blur-md p-6 rounded-[2rem] border border-[#1A3D63]/30 shadow-2xl relative"
        >
          <div className="flex gap-3 relative">
            <div className="flex-1 relative group rounded-2xl">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#B3CFE5]/40 group-focus-within:text-[#4A7FA7] transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="دور بالاسم أو الكود..."
                className="input w-full bg-[#0A1931] shadow-inner focus:shadow-md border-[#1A3D63]/40 focus:border-[#4A7FA7] rounded-2xl pl-4 pr-11 h-14 font-black text-[#F6FAFD] transition-all duration-300 placeholder:text-[#B3CFE5]/30 outline-none"
                autoFocus
              />

              {/* Suggestions Dropdown - Moved inside relative container */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#0F2545]/98 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#1A3D63]/50 p-2 flex flex-col gap-1 z-[100]"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s.qrId}
                        className="btn btn-ghost justify-start font-black h-14 rounded-xl text-[15px] text-[#F6FAFD] hover:bg-[#1A3D63]/60 transition-all flex items-center gap-3 px-4 border-none"
                        onClick={() => addPerson(s)}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#1A3D63] flex items-center justify-center text-xs opacity-80 border border-[#4A7FA7]/20 uppercase">
                          {s.name?.[0] || "؟"}
                        </div>
                        <span>{s.name}</span>
                        <span className="opacity-40 text-[10px] ml-auto font-mono bg-[#0A1931] px-2 py-1 rounded-md tracking-tighter">
                          {s.qrId}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoVisitsHistory}
              className="btn bg-[#1A3D63] hover:bg-[#4A7FA7] text-[#F6FAFD] border border-[#1A3D63]/40 shadow-2xl rounded-2xl px-5 h-14 flex items-center gap-2 font-black transition-all duration-300"
              title="تاريخ الزيارات"
            >
              <CalendarDays className="w-5 h-5" />
              <span className="hidden sm:inline">السجل</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Pending List Section Header */}
        <div className="flex items-center gap-4 mt-2 px-2">
          <div className="h-px bg-[#1A3D63]/30 flex-1"></div>
          <span className="text-[10px] font-black text-[#B3CFE5]/40 uppercase tracking-[0.3em] px-4 py-1.5 bg-[#1A3D63]/20 rounded-full border border-[#1A3D63]/30">
            قائمة الزيارة{" "}
            {pendingList.length > 0 && (
              <span className="text-secondary ml-1">
                ({pendingList.length})
              </span>
            )}
          </span>
          <div className="h-px bg-[#1A3D63]/30 flex-1"></div>
        </div>

        {/* List Content */}
        <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {pendingList.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-[#B3CFE5]/20 py-20 gap-4 bg-[#0F2545]/30 rounded-[2.5rem] border border-dashed border-[#1A3D63]/40"
              >
                <div className="w-20 h-20 rounded-full bg-[#1A3D63]/10 flex items-center justify-center border border-[#1A3D63]/20">
                  <HomeIcon className="w-10 h-10 opacity-30" />
                </div>
                <span className="text-sm font-black uppercase tracking-wider text-center">
                  اختر مخدومين لإضافتهم للقائمة
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="active-list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {pendingList.map((p) => (
                  <motion.div
                    key={p.qrId}
                    variants={itemVariants}
                    layout
                    className="bg-[#0F2545] p-1 pr-1 rounded-[2.5rem] border border-[#1A3D63]/50 shadow-2xl group relative overflow-hidden flex items-center"
                  >
                    <div
                      className="absolute inset-y-0 right-0 w-2"
                      style={{ backgroundColor: p.accent || "#4A7FA7" }}
                    ></div>
                    <div className="flex-1 min-w-0 pointer-events-none pr-1">
                      <StudentMiniCard person={p} />
                    </div>
                    <div className="pr-4 z-10">
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removePerson(p.qrId)}
                        className="btn btn-ghost btn-circle btn-sm text-[#B3CFE5]/40 hover:text-error hover:bg-error/10 border-none transition-all"
                        title="إزالة"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save Button */}
        <AnimatePresence>
          {pendingList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
              className="sticky bottom-6 mt-auto pt-4 z-40"
            >
              <button
                onClick={handleSave}
                className="w-full h-16 bg-[#1A3D63] hover:bg-[#4A7FA7] text-[#F6FAFD] text-xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl group overflow-hidden relative border border-[#4A7FA7]/30 flex items-center justify-center gap-3 transition-all"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <CheckCircle2 className="w-6 h-6" />
                <span>سجلنا {pendingList.length} زيارات</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}
