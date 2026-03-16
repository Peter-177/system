import { useState } from "react";
import { attendanceDB } from "../data/storage";
import { Page, Navbar, StudentMiniCard, Toast, DeleteBtn } from "../components/UI";
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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="سجل حضور الطفل" />

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8" dir="rtl">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-base-100/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-lg shadow-base-200/50 p-6 overflow-hidden"
        >
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none -z-10"></div>
          
          <StudentMiniCard person={person} hidePoints />
          
          <div className="absolute top-6 left-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-primary drop-shadow-sm">{log.length}</div>
            <div className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest mt-1">مرات الحضور</div>
          </div>
        </motion.div>

        {/* Log Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <ClipboardList className="w-5 h-5 text-base-content/40" />
            <h3 className="text-sm font-bold tracking-widest text-base-content/50 uppercase">
              تفاصيل السجل
            </h3>
            <div className="h-px bg-base-300 flex-1 ml-4"></div>
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
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    layout
                    key={entry.id}
                    className={`group relative flex justify-between items-center p-5 rounded-[1.5rem] border transition-all duration-300 ${
                      i === 0
                        ? "bg-gradient-to-l from-success/10 to-transparent border-success/30 shadow-md shadow-success/5"
                        : "bg-base-100/60 backdrop-blur-sm border-base-200/50 hover:border-primary/20 hover:shadow-sm"
                    }`}
                  >
                    {/* Subtle glow for newest entry */}
                    {i === 0 && (
                      <div className="absolute inset-0 bg-success/5 animate-pulse rounded-[1.5rem] pointer-events-none"></div>
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${i === 0 ? 'bg-success/20 text-success' : 'bg-base-200 text-base-content/60'}`}>
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold text-lg ${i === 0 ? 'text-success' : 'text-base-content'}`}>
                          {entry.date}
                        </span>
                        {i === 0 && <span className="text-[10px] font-bold text-success/70 uppercase tracking-widest">أحدث حضور</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                      <div className="flex items-center gap-1.5 opacity-50 font-mono text-sm font-medium bg-base-200 px-3 py-1.5 rounded-lg border border-base-300">
                        <Clock className="w-4 h-4" />
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
                <span className="text-lg font-medium tracking-wide text-base-content/40">مفيش سجل حضور لسه</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Page>
  );
}
