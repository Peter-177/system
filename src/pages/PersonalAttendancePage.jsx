import { useState } from "react";
import { attendanceDB } from "../data/storage";
import {
  Page,
  Navbar,
  StudentMiniCard,
  Toast,
  DeleteBtn,
} from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, ClipboardList } from "lucide-react";

export function PersonalAttendancePage({ person, onBack }) {
  const [log, setLog] = useState(() => attendanceDB.get(person?.qrId));
  const toast = useToast();

  const handleRemove = (eid) => {
    attendanceDB.remove(person.qrId, eid);
    setLog(attendanceDB.get(person.qrId));
    toast.show("🗑️ اتمسح خلاص");
  };

  if (!person) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="سجل حضور الطفل" />

      <div
        className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8"
        dir="rtl"
      >
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-gradient-to-br from-[#0F2545] to-[#0A1931] backdrop-blur-3xl border border-[#1A3D63]/40 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.5)] p-8 overflow-hidden group"
        >
          {/* Spatial background elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#10B981]/10 rounded-full blur-[80px] pointer-events-none transition-all duration-1000 group-hover:bg-[#10B981]/20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4A7FA7]/10 rounded-full blur-[80px] pointer-events-none transition-all duration-1000 group-hover:bg-[#4A7FA7]/20"></div>

          <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
            <div className="flex-1">
              <StudentMiniCard person={person} hidePoints />
            </div>

            {/* Relocated Stats Card */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center justify-center bg-[#0A1931]/60 backdrop-blur-md px-10 py-5 rounded-[2rem] border border-[#10B981]/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
            >
              <div className="text-5xl font-black text-[#10B981] drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-500">
                {log.length}
              </div>
              <div className="text-[10px] font-black text-[#B3CFE5]/40 uppercase tracking-[0.3em] mt-2 bg-[#10B981]/10 px-4 py-1.5 rounded-full border border-[#10B981]/20">
                مرات الحضور
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Log Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <ClipboardList className="w-5 h-5 text-[#B3CFE5]/40" />
            <h3 className="text-[10px] font-black tracking-[0.3em] text-[#B3CFE5]/40 uppercase px-3 py-1 bg-[#1A3D63]/20 rounded-full border border-[#1A3D63]/10">
              تفاصيل السجل
            </h3>
            <div className="h-px bg-[#1A3D63]/20 flex-1 ml-4"></div>
          </div>

          <AnimatePresence mode="popLayout">
            {log.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {log.map((entry, i) => (
                  <motion.div
                    variants={itemVariants}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                    layout
                    key={entry.id}
                    className={`group relative flex justify-between items-center p-5 rounded-[2.5rem] border transition-all duration-300 ${
                      i === 0
                        ? "bg-gradient-to-l from-[#10B981]/10 to-[#0F2545] border-[#10B981]/30 shadow-2xl"
                        : "bg-[#0F2545] border-[#1A3D63]/50 hover:border-[#4A7FA7]/40 shadow-xl"
                    }`}
                  >
                    {/* Subtle glow for newest entry */}
                    {i === 0 && (
                      <div className="absolute inset-0 bg-success/5 animate-pulse rounded-[1.5rem] pointer-events-none"></div>
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner transition-all duration-300 ${i === 0 ? "bg-[#10B981]/20 text-[#10B981] group-hover:rotate-6" : "bg-[#1A3D63] text-[#B3CFE5]"}`}
                      >
                        <CalendarDays className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`font-black text-xl lg:text-2xl tracking-tighter transition-colors duration-300 ${i === 0 ? "text-[#F6FAFD]" : "text-[#F6FAFD]/90 group-hover:text-white"}`}
                        >
                          {entry.date}
                        </span>
                        {i === 0 && (
                          <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] bg-[#10B981]/10 px-3 py-1 rounded-full inline-block border border-[#10B981]/20">
                            أحدث حضور
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                      <div className="flex items-center gap-2 font-black text-xs text-[#B3CFE5] bg-[#1A3D63]/50 px-4 py-2.5 rounded-[1.25rem] border border-[#1A3D63]/40 shadow-inner group-hover:bg-[#1A3D63]/70 transition-all">
                        <Clock className="w-4 h-4 text-[#10B981]/60" />
                        {entry.time}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DeleteBtn onClick={() => handleRemove(entry.id)} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 bg-base-100/40 backdrop-blur-sm rounded-[2rem] border border-dashed border-base-300 gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-base-200/50 flex items-center justify-center">
                  <ClipboardList className="w-10 h-10 text-base-content/20" />
                </div>
                <span className="text-lg font-medium tracking-wide text-base-content/40">
                  مفيش سجل حضور لسه
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Page>
  );
}
