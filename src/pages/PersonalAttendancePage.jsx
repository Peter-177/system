import { useState } from "react";
import { attendanceDB } from "../data/storage";
import { Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, Trash2, CheckCircle2 } from "lucide-react";

export function PersonalAttendancePage({ person, onBack }) {
  const [log, setLog] = useState(() => attendanceDB.get(person?.qrId));
  const toast = useToast();

  const handleRemove = (eid) => {
    attendanceDB.remove(person.qrId, eid);
    setLog((prev) => prev.filter((e) => (e.recordId || e.id) !== eid));
    toast.show("🗑️ تم حذف السجل بنجاح");
  };

  if (!person) return null;

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
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              PROFILE LOG
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              سجل حضور الطفل
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Profile Card & Stats */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 border-[3px] border-black shadow-[3px_3px_0px_#000000] ${getAvatarBg(person.name)} flex items-center justify-center overflow-hidden shrink-0`}>
              {person.image ? (
                <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-3xl text-black">
                  {(person.name || "م")?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0 text-right">
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight truncate">
                {person.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-black text-white font-mono font-black text-xs px-2 py-0.5 border border-black">
                  #{person.qrId}
                </span>
                {person.year && (
                  <span className="bg-[#FEF08A] text-black font-black text-xs px-2 py-0.5 border border-black">
                    {person.year}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_#000000] px-8 py-4 text-center shrink-0">
            <span className="text-4xl sm:text-5xl font-black text-black tabular-nums block leading-tight">
              {log.length}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-black/70">
              مرات الحضور
            </span>
          </div>
        </div>

        {/* Attendance Log List */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-black text-black uppercase">
              تفاصيل أيام الحضور
            </h3>
            <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase border border-black">
              {log.length} جلسة
            </span>
          </div>

          {log.length === 0 ? (
            <div className="py-16 text-center bg-white border-[3px] border-black border-dashed p-8 shadow-[4px_4px_0px_#000000]">
              <p className="font-black text-black text-lg uppercase">
                لم يتم تسجيل أي حضور لهذا الطفل بعد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {[...log].reverse().map((entry) => (
                  <Motion.div
                    key={entry.recordId || entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#FEF08A] border-2 border-black flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5 stroke-[2.5] text-black" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-base text-black font-mono">
                          {entry.timestamp?.slice(0, 10)}
                        </span>
                        <span className="text-xs font-bold text-black/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.time || entry.timestamp?.slice(11, 16) || "حضور"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(entry.recordId || entry.id)}
                      className="w-9 h-9 bg-[#EF4444] text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="حذف هذا اليوم"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </Motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
