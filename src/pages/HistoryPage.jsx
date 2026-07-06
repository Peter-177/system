import { useState } from "react";
import { attendanceDB, studentsDB, classesDB } from "../data/storage";
import { todayISO } from "../utils/helpers";
import { Page, Navbar, Empty, Avatar } from "../components/UI";
import { Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HistoryPage({ onBack }) {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [selectedClass, setSelectedClass] = useState("all");
  const [results, setResults] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const allClassesDB = classesDB.getAll();
  const classList = Object.entries(allClassesDB).map(([id, cls]) => ({
    id,
    ...cls,
  }));

  const search = () => {
    if (!from || !to) return;
    const found = [];
    Object.entries(attendanceDB.getAll()).forEach(([qrId, entries]) => {
      const student = studentsDB.get(qrId);
      if (!student) return;

      // Class Filter
      if (selectedClass !== "all") {
        const targetClass = allClassesDB[selectedClass];
        if (!targetClass || !targetClass.grades?.includes(student.year)) return;
      }

      const sessions = entries.filter((e) => {
        const d = e.timestamp.slice(0, 10);
        return d >= from && d <= to;
      });
      if (sessions.length > 0) found.push({ qrId, ...student, sessions });
    });
    found.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    setResults(found);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { qrId, sessId } = deleteConfirm;
    
    // Remove from DB
    attendanceDB.remove(qrId, sessId);
    
    // Remove from UI
    setResults(prev => prev.map(s => {
      if (s.qrId === qrId) {
        return { ...s, sessions: s.sessions.filter(sess => (sess.recordId || sess.id) !== sessId) };
      }
      return s;
    }).filter(s => s.sessions.length > 0));
    
    setDeleteConfirm(null);
  };

  return (
    <Page>
      <Navbar onBack={onBack} title="📅 تاريخ الحضور" />

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-6 animate-slideUp">
        {/* Date picker card */}
        <div className="bg-[#0F2545] border border-[#1A3D63]/40 rounded-[3rem] shadow-2xl overflow-hidden p-8 gap-8 flex flex-col">
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "من تاريخ", val: from, set: setFrom },
              { label: "إلى تاريخ", val: to, set: setTo },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-[#B3CFE5]/70 uppercase tracking-[0.3em] px-2 text-right">
                  {label}
                </span>
                <input
                  type="date"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="bg-[#1A3D63]/30 border border-[#1A3D63]/40 rounded-2xl px-5 h-14 text-sm font-black text-[#F6FAFD] outline-none focus:border-[#4A7FA7] transition-all text-center"
                />
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-3">
            <span className="text-[10px] font-black text-[#B3CFE5]/70 uppercase tracking-[0.3em] px-2 text-right">
              تصفية حسب الفصل
            </span>
            <select
              className="bg-[#1A3D63]/30 border border-[#1A3D63]/40 rounded-2xl px-5 h-14 text-sm font-black text-[#F6FAFD] outline-none focus:border-[#4A7FA7] transition-all appearance-none text-right"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">كل الفصول</option>
              {classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={search}
            className="w-full h-16 bg-[#1A3D63] hover:bg-[#4A7FA7] text-[#F6FAFD] rounded-[2rem] text-xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group"
          >
            <span>بحث في السجلات</span>
            <Search className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Results */}
        {results !== null && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#B3CFE5]/60 font-bold">
                من <span className="text-[#F6FAFD]/90">{from}</span> لـ{" "}
                <span className="text-[#F6FAFD]/90">{to}</span>
              </span>
              <div className="badge badge-primary badge-outline">
                {results.length}
              </div>
            </div>

            {results.length === 0 ? (
              <Empty icon="📭" message="ما فيش بيانات مطابقة للفترة دي" />
            ) : (
              results.map((s, i) => (
                <div
                  key={s.qrId}
                  className="bg-[#0F2545] border border-[#1A3D63]/40 rounded-3xl p-6 shadow-2xl animate-fadeIn flex flex-col gap-4 group"
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={s.name}
                      accent={s.accent}
                      image={s.image}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="font-black text-lg text-[#F6FAFD] leading-none mb-1">
                        {s.name}
                      </div>
                      <div className="text-[10px] font-black tracking-widest text-[#B3CFE5]/60 uppercase opacity-50">
                        {s.qrId}
                      </div>
                    </div>
                    <div
                      className="px-4 py-1.5 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-white/5"
                      style={{
                        background: s.accent + "25",
                        color: s.accent,
                      }}
                    >
                      <span className="text-[10px] opacity-60 ml-0.5">
                        عدد المرات:
                      </span>{" "}
                      {s.sessions.length}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1A3D63]/20">
                    {s.sessions.map((sess) => (
                      <div
                        key={sess.recordId || sess.id}
                        className="px-3 py-2 bg-[#1A3D63]/50 text-[#F6FAFD] rounded-xl text-[11px] font-black border border-[#1A3D63]/40 flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-[#4A7FA7]">📅</span>
                        <span>{sess.timestamp.slice(0, 10)}</span>
                        <span className="text-[#B3CFE5]/60 ml-1">
                          {sess.time}
                        </span>
                        <button
                          onClick={() => setDeleteConfirm({
                            qrId: s.qrId,
                            sessId: sess.recordId || sess.id,
                            name: s.name,
                            date: sess.timestamp.slice(0, 10)
                          })}
                          className="ms-2 text-red-400/70 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-400/10"
                          title="حذف الحضور"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0F2545] border border-[#1A3D63]/40 rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#F6FAFD]">حذف الحضور؟</h3>
              <p className="text-sm font-bold text-[#B3CFE5]/70">
                متأكد إنك عايز تحذف حضور <span className="text-[#F6FAFD]">{deleteConfirm.name}</span> ليوم <span className="text-[#F6FAFD]">{deleteConfirm.date}</span>؟
              </p>
              
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-2xl bg-[#1A3D63]/50 text-[#F6FAFD] font-black border border-[#1A3D63]/40 hover:bg-[#1A3D63] transition-all"
                >
                  لا، خليه
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                >
                  أيوة، احذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Page>
  );
}
