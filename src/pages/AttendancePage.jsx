import React, { useState, useMemo, useEffect, useRef } from "react";
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
} from "../utils/helpers";
import { Page, Navbar, StudentMiniCard, Toast, Avatar } from "../components/UI";
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

export function AttendancePage({ currentUser, person, onBack, onGoHistory }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [pendingList, setPendingList] = useState([]);
  const toast = useToast();
  const inputRef = useRef(null);

  const allClassesDB = classesDB.getAll();
  const classList = Object.entries(allClassesDB).map(([id, cls]) => ({
    id,
    ...cls,
  }));

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

    return allStudents
      .filter((s) => targetClass.grades?.includes(s.year))
      .filter((s) => registeredToday(attendanceDB.get(s.qrId))) // Only show present students
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [selectedClass, allStudents, allClassesDB]);

  const addPerson = (student) => {
    if (!student) return;
    if (pendingList.find((p) => p.qrId === student.qrId)) {
      toast.show(`⚠️ ${person.name} متسجل النهارده فعلاً!`);
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
          (s.name && s.name.toLowerCase().includes(q)),
      )
      .slice(0, 5);
  }, [query, allStudents]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const saveBtn = pendingList.length > 0 && (
    <button
      onClick={handleSave}
      className="btn btn-sm bg-indigo-600 text-white border-none hover:bg-indigo-700 px-4 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
    >
      <Save className="w-4 h-4" />
      <span>حفظ ({pendingList.length})</span>
    </button>
  );

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="تسجيل الحضور" right={saveBtn} />

      <div
        className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10"
        dir="rtl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  يلا نحضّرهم
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  سجل كل اللي جه النهاردة عشان ميفوتوش حاجة
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoHistory}
                className="flex items-center gap-3 px-6 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all uppercase tracking-widest"
              >
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                سجل الحضور
              </motion.button>
            </header>

            <div className="admin-panel shadow-admin-lg grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
              {/* Quick Search - Now First (Right in RTL) and Larger (75%) */}
              <div className="md:col-span-3 space-y-2 relative">
                <label className="text-[10px] font-black text-sky-300/60 uppercase tracking-widest flex items-center gap-2 mr-1">
                  <Search className="w-4 h-4 text-sky-500" />
                  دور بسرعة
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب اسم الطفل أو الكود بتاعه..."
                    className="admin-input h-14 pl-4 pr-12 w-full"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-300">
                    <Search className="w-5 h-5" />
                  </div>
                </div>

                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-admin-xl border border-slate-100 p-2 flex flex-col gap-1 z-50"
                    >
                      {suggestions.map((s) => (
                        <button
                          key={s.qrId}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-all text-right group"
                          onClick={() => addPerson(s)}
                        >
                          <Avatar name={s.name} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.qrId}
                            </span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Class Filter - Now Second (Left in RTL) and Smaller (25%) */}
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-sky-300/60 uppercase tracking-widest flex items-center gap-2 mr-1">
                  <Users className="w-4 h-4 text-sky-500" />
                  حضر فصل بالانابة
                </label>
                <select
                  className="admin-input h-14"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">أنهي فصل اللي موجود؟</option>
                  {classList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Attendance List - Now First (Right in RTL) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1.5 h-5 bg-orange-500 rounded-full"></span>
                  <h3 className="text-lg font-black text-white">
                    الناس اللي حضرت
                  </h3>
                  <span className="text-xs bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded-full text-sky-300 font-black">
                    {pendingList.length}
                  </span>
                </div>

                {pendingList.length === 0 ? (
                  <div className="py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <UserCheck className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-bold text-slate-400 text-sm max-w-[200px]">
                      ضيف الأطفال من هنا أو دور عليهم فوق عشان تحضرهم
                    </p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {pendingList.map((p) => (
                      <motion.div
                        key={p.qrId}
                        variants={itemVariants}
                        layout
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar name={p.name} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">
                              {p.qrId}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removePerson(p.qrId)}
                          className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all flex items-center justify-center"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}

                    <button
                      onClick={handleSave}
                      className="admin-btn-primary w-full h-16 mt-6 shadow-indigo-600/20"
                    >
                      <Save className="w-6 h-6" />
                      <span>تمام، حضّر الـ {pendingList.length} طفل دول</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Class Roster - Now Second (Left in RTL) */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {selectedClass ? (
                    <motion.div
                      key="roster"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-5 bg-indigo-600 rounded-full"></span>
                          <h3 className="text-lg font-black text-white">
                            أطفال {allClassesDB[selectedClass]?.name} الحاضرين
                          </h3>
                          <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-400 font-black">
                            {classRoster.length}
                          </span>
                        </div>
                      </div>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
                      >
                        {classRoster.length === 0 ? (
                          <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl text-center text-slate-400 font-bold text-sm">
                            لسه مفيش حد اتسجل من الفصل ده النهاردة
                          </div>
                        ) : (
                          classRoster.map((s) => {
                            const hasAttended = registeredToday(
                              attendanceDB.get(s.qrId),
                            );
                            const isPending = pendingList.some(
                              (p) => p.qrId === s.qrId,
                            );
                            return (
                              <button
                                key={s.qrId}
                                disabled={hasAttended}
                                onClick={() => addPerson(s)}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-right group ${hasAttended ? "bg-emerald-50 border-emerald-100" : isPending ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-300"}`}
                              >
                                <div className="flex items-center gap-4">
                                  <Avatar
                                    name={s.name}
                                    size="sm"
                                    accent={hasAttended ? "emerald" : "indigo"}
                                  />
                                  <div className="flex flex-col">
                                    <span
                                      className={`font-bold ${hasAttended ? "text-emerald-700" : "text-slate-900"}`}
                                    >
                                      {s.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                                      {s.qrId}
                                    </span>
                                  </div>
                                </div>
                                {hasAttended && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                )}
                                {isPending && !hasAttended && (
                                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-30 grayscale">
                      <Users className="w-16 h-16 text-slate-900" />
                      <p className="font-black text-slate-900">
                        اختار الفصل من فوق عشان تعرف مين اللي جه
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
