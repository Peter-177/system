import { useState, useMemo, useEffect, useRef } from "react";
import { Page, Navbar, StudentMiniCard } from "../components/UI";
import { studentsDB } from "../data/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, FileQuestion } from "lucide-react";
import { gsap } from "gsap";

export function SearchPage({ currentUser, onBack, onGoStudent, onGoAdd }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allStudents.filter(
      (s) =>
        s.qrId.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q)),
    );
  }, [query, allStudents]);

  // Input focus animation
  useEffect(() => {
    if (inputRef.current) {
      gsap.fromTo(
        inputRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 },
      );
    }
  }, []);

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
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
      <Navbar title="البحث" onBack={onBack} />

      <div
        className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6"
        dir="rtl"
      >
        {/* Search Bar - Modern Floating Pill */}
        <div className="relative group w-full" ref={inputRef}>
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
            <Search className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب اسم الطفل أو الكود بتاعه هنا..."
            className="input w-full bg-[#011C40]/5 backdrop-blur-xl shadow-lg border border-[#011C40]/10 focus:border-primary/50 rounded-2xl pl-6 pr-14 h-16 text-lg font-black transition-all duration-300 placeholder:text-muted/60 text-text outline-none focus:shadow-[0_0_30px_rgba(2,56,89,0.1)]"
            autoFocus
          />

          {/* subtle glow behind search bar */}
          <div className="absolute inset-0 -z-10 bg-primary/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Add Button */}
        {(currentUser?.role === "admin" ||
          currentUser?.permissions?.includes("perm_add_student")) && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGoAdd}
            className="btn w-full bg-gradient-to-r from-[#4A7FA7] to-[#011C40] text-white border border-[#4A7FA7]/40 rounded-[2.5rem] h-20 font-black text-2xl flex items-center justify-center gap-5 transition-all shadow-[0_0_40px_rgba(74,127,167,0.4)] cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <UserPlus className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
            <span className="drop-shadow-lg">نضيف طفل جديد للمجموعة</span>
          </motion.button>
        )}

        {/* Results Info */}
        <AnimatePresence>
          {query.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm font-bold text-base-content/50 px-3 tracking-wide"
            >
              لقينا كام واحد؟{" "}
              <span className="text-primary">{filtered.length}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results List */}
        <div className="flex flex-col gap-4 pb-20 w-full relative">
          {!query.trim() ? null : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center py-20 text-base-content/40 gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-surface-brighter flex items-center justify-center mb-2">
                <FileQuestion
                  className="w-10 h-10 opacity-50"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-lg font-medium tracking-wider">
                للأسف، مفيش حد بالاسم ده. اتأكد من الاسم تاني!
              </span>
            </motion.div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filtered.map((student) => (
                <motion.button
                  key={student.qrId}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onGoStudent(student.qrId)}
                  className="block text-right w-full bg-background backdrop-blur-md border border-[#011C40]/10 hover:border-[#023859]/40 rounded-[2rem] shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                >
                  <StudentMiniCard person={student} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Page>
  );
}
