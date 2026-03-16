import React, { useState, useMemo, useRef, useEffect } from "react";
import { visitsDB, studentsDB } from "../data/storage";
import { buildVisitEntry, visitedToday } from "../utils/helpers";
import { Page, Navbar, StudentMiniCard, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CalendarDays, X, Users, Home as HomeIcon, CheckCircle2 } from "lucide-react";
import { gsap } from "gsap";

export function VisitsPage({ onBack, onGoVisitsHistory }) {
  const [query, setQuery] = useState("");
  const [pendingList, setPendingList] = useState([]);
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
          (s.name && s.name.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [query, allStudents]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="تسجيل الزيارات" />

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6" dir="rtl">
        
        {/* Top Controls Box */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 bg-base-100/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 shadow-sm"
        >
          <div className="flex gap-3 relative">
            <div className="flex-1 relative group rounded-2xl">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-base-content/40 group-focus-within:text-info transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="دور بالاسم أو الكود..."
                className="input w-full bg-base-100 shadow-inner focus:shadow-md border-base-200 focus:border-info/30 rounded-2xl pl-4 pr-11 h-14 font-medium transition-all duration-300"
                autoFocus
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoVisitsHistory}
              className="btn bg-info/10 hover:bg-info text-info hover:text-info-content border-none shadow-sm rounded-2xl px-5 h-14 flex gap-2"
              title="تاريخ الزيارات"
            >
              <CalendarDays className="w-5 h-5" />
              <span className="hidden sm:inline font-bold">السجل</span>
            </motion.button>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-[80px] left-6 right-6 mt-2 bg-base-100/90 backdrop-blur-xl rounded-2xl shadow-xl border border-base-200 p-2 flex flex-col gap-1 z-30"
              >
                {suggestions.map((s) => (
                  <button
                    key={s.qrId}
                    className="btn btn-ghost justify-start font-bold h-12 rounded-xl text-base hover:bg-base-200 transition-colors"
                    onClick={() => addPerson(s)}
                  >
                    {s.name} <span className="opacity-40 text-xs ml-auto font-mono bg-base-200 px-2 py-1 rounded-md">{s.qrId}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pending List Section */}
        <div className="flex items-center gap-4 mt-2 px-2">
          <div className="h-px bg-base-300 flex-1"></div>
          <span className="text-xs font-bold text-base-content/40 uppercase tracking-widest px-2 py-1 bg-base-200/50 rounded-full">
            قائمة الزيارة {pendingList.length > 0 && <span className="text-info ml-1">({pendingList.length})</span>}
          </span>
          <div className="h-px bg-base-300 flex-1"></div>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
          {pendingList.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center text-base-content/30 py-20 gap-4 bg-base-100/30 rounded-3xl border border-dashed border-base-200"
            >
              <HomeIcon className="w-16 h-16 opacity-20" />
              <span className="text-base font-medium">اختر مخدومين لإضافتهم للقائمة</span>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {pendingList.map((p) => (
                <motion.div
                  variants={itemVariants}
                  layout
                  key={p.qrId}
                  className="flex items-center gap-2 bg-base-100/90 backdrop-blur p-2 pr-3 rounded-2xl border border-info/20 shadow-sm group"
                >
                  <div className="flex-1 min-w-0 pr-2 pointer-events-none scale-[0.85] origin-right -ml-4">
                    <StudentMiniCard person={p} />
                  </div>
                  <div className="flex-none px-2 z-10">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removePerson(p.qrId)}
                      className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-error hover:bg-error/10"
                      title="إزالة"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
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
                className="btn btn-info btn-lg w-full text-xl shadow-xl shadow-info/20 rounded-2xl text-white group overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <CheckCircle2 className="w-6 h-6 mr-2" />
                تسجيل زيارة لـ {pendingList.length} مخدوم
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}
