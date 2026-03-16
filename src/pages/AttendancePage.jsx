import React, { useState, useMemo, useEffect, useRef } from "react";
import { attendanceDB, studentsDB, classesDB, couponsDB } from "../data/storage";
import { buildAttendanceEntry, registeredToday, buildCouponEntry } from "../utils/helpers";
import { Page, Navbar, StudentMiniCard, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Search, CalendarDays, X, Users, UserCheck } from "lucide-react";
import { gsap } from "gsap";

export function AttendancePage({ currentUser, person, onBack, onGoHistory }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [pendingList, setPendingList] = useState([]);
  const toast = useToast();
  const inputRef = useRef(null);

  const allClassesDB = classesDB.getAll();
  const classList = Object.entries(allClassesDB).map(([id, cls]) => ({ id, ...cls }));

  useEffect(() => {
    if (person && !pendingList.find((p) => p.qrId === person.qrId)) {
      setPendingList([person]);
    }
  }, [person]);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));
  }, []);

  const classRoster = useMemo(() => {
    if (!selectedClass) return [];
    const targetClass = allClassesDB[selectedClass];
    if (!targetClass) return [];
    
    return allStudents.filter(s => targetClass.grades?.includes(s.year))
      .sort((a, b) => {
        const countA = attendanceDB.get(a.qrId).length;
        const countB = attendanceDB.get(b.qrId).length;
        if (countB !== countA) return countB - countA;
        return a.name.localeCompare(b.name, "ar");
      });
  }, [selectedClass, allStudents, allClassesDB]);

  const addPerson = (student) => {
    if (!student) return;
    if (pendingList.find((p) => p.qrId === student.qrId)) {
      toast.show("ده متسجل في القائمة أصلاً");
      setQuery("");
      return;
    }
    const log = attendanceDB.get(student.qrId);
    if (registeredToday(log)) {
      toast.show(`⚠️ ${student.name} متسجل النهارده!`);
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
    let registeredCount = 0;
    pendingList.forEach((p) => {
      const log = attendanceDB.get(p.qrId);
      if (!registeredToday(log)) {
        attendanceDB.add(p.qrId, buildAttendanceEntry());
        couponsDB.add(p.qrId, buildCouponEntry(50));
        registeredCount++;
      }
    });
    toast.show(`✅ تمام، حضرنا ${registeredCount} شخص`);
    setPendingList([]);
  };

  const handleSaveClass = () => {
    if (classRoster.length === 0) return;
    let registeredCount = 0;
    classRoster.forEach((p) => {
      const log = attendanceDB.get(p.qrId);
      if (!registeredToday(log)) {
        attendanceDB.add(p.qrId, buildAttendanceEntry());
        couponsDB.add(p.qrId, buildCouponEntry(50));
        registeredCount++;
      }
    });
    toast.show(`✅ تمام، حضرنا ${registeredCount} من الفصل`);
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
      <Navbar onBack={onBack} title="تسجيل الحضور" />

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-6 flex flex-col gap-6" dir="rtl">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 bg-base-100/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 shadow-sm"
        >
          {/* Class Selection Dropdown */}
          <div className="w-full relative">
            <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 w-5 h-5 pointer-events-none" />
            <select 
              className="select w-full bg-base-200/50 border-base-300 focus:border-primary/50 text-base font-bold pr-12 rounded-2xl h-14"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">اختار الفصل...</option>
              {classList.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 relative">
            <div className="flex-1 relative group rounded-2xl">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="دور بالاسم أو الكود..."
                className="input w-full bg-base-100 shadow-inner focus:shadow-md border-base-200 focus:border-primary/30 rounded-2xl pl-4 pr-11 h-14 font-medium transition-all duration-300"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoHistory}
              className="btn bg-info/10 hover:bg-info text-info hover:text-info-content border-none shadow-sm rounded-2xl px-5 h-14 flex gap-2"
              title="تاريخ الحضور"
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
                className="absolute top-full left-6 right-6 mt-2 bg-base-100/90 backdrop-blur-xl rounded-2xl shadow-xl border border-base-200 p-2 flex flex-col gap-1 z-30"
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

        {/* Class Roster */}
        <AnimatePresence mode="wait">
          {selectedClass && (
            <motion.div 
              key="roster"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  أطفال {allClassesDB[selectedClass]?.name} <span className="badge badge-sm badge-neutral">{classRoster.length}</span>
                </h3>
                
                {currentUser?.role === "admin" && classRoster.some(s => !registeredToday(attendanceDB.get(s.qrId))) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveClass}
                    className="btn btn-sm bg-success/10 hover:bg-success text-success hover:text-white border-0 rounded-lg text-xs font-bold"
                  >
                    تسجيل الكل
                  </motion.button>
                )}
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar"
              >
                {classRoster.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-base-content/30 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
                    لا يوجد مخدومين في هذا الفصل
                  </div>
                ) : (
                  classRoster.map(s => {
                    const hasAttended = registeredToday(attendanceDB.get(s.qrId));
                    const isPending = pendingList.some(p => p.qrId === s.qrId);
                    
                    return (
                      <motion.button
                        variants={itemVariants}
                        key={s.qrId}
                        disabled={hasAttended}
                        onClick={() => addPerson(s)}
                        className={`group flex relative items-center justify-between p-4 rounded-2xl border transition-all text-right overflow-hidden ${
                          hasAttended 
                            ? "bg-success/5 border-success/20 opacity-60 grayscale-[50%]" 
                            : (isPending 
                                ? "bg-primary/10 border-primary/30" 
                                : "bg-base-100/80 backdrop-blur-sm border-base-200/50 hover:border-primary/40 hover:shadow-md")
                        }`}
                      >
                        {isPending && !hasAttended && (
                          <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
                        )}
                        
                        <div className="flex items-center gap-4 relative z-10 w-full">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner transition-colors ${hasAttended ? 'bg-success text-success-content' : 'bg-base-200/80 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                            {hasAttended ? <CheckCircle2 className="w-6 h-6" /> : s.name.charAt(0)}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className={`font-bold truncate text-base ${hasAttended ? 'text-success' : 'text-base-content'}`}>{s.name}</span>
                            <span className="text-xs opacity-50 font-mono tracking-wider">{s.qrId}</span>
                          </div>
                          
                          {isPending && !hasAttended && (
                            <div className="badge badge-primary badge-sm font-bold shadow-sm">في القائمة</div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending List Section */}
        <div className="flex items-center gap-4 mt-4 px-2">
          <div className="h-px bg-base-300 flex-1"></div>
          <span className="text-xs font-bold text-base-content/40 uppercase tracking-widest px-2 py-1 bg-base-200/50 rounded-full">
            قائمة التحضير {pendingList.length > 0 && <span className="text-primary ml-1">({pendingList.length})</span>}
          </span>
          <div className="h-px bg-base-300 flex-1"></div>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
          {pendingList.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center text-base-content/30 py-12 gap-3 bg-base-100/30 rounded-3xl border border-dashed border-base-200"
            >
              <Users className="w-12 h-12 opacity-20" />
              <span className="text-sm font-medium">اختر مخدومين لإضافتهم للقائمة</span>
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
                  className="flex items-center gap-2 bg-base-100/90 backdrop-blur p-2 pr-3 rounded-2xl border border-primary/20 shadow-sm group"
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
                className="btn btn-primary btn-lg w-full text-xl shadow-xl shadow-primary/20 rounded-2xl text-white group overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <CheckCircle2 className="w-6 h-6 mr-2" />
                تحضير {pendingList.length} مخدوم
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}
