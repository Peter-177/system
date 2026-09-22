import { useState, useMemo, useEffect, useRef } from "react";
import { Page, Navbar, StudentMiniCard } from "../components/UI";
import { studentsDB } from "../data/storage";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, FileQuestion, LayoutDashboard } from "lucide-react";
import { gsap } from "gsap";

export function SearchPage({ currentUser, onBack, onGoStudent, onGoAdd, onGoDashboard }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // FIXED: Read directly from DB to avoid staleness issues
  const filtered = useMemo(() => {
    const db = studentsDB.getAll();
    const students = Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));

    const normalizeArabic = (text) => {
      if (!text) return "";
      return text.replace(/[أإآا]/g, 'ا');
    };

    const q = normalizeArabic(query.trim().toLowerCase());

    if (!q) return students;

    return students.filter((s) => {
      const normalizedName = normalizeArabic(String(s.name || "").toLowerCase());
      const normalizedId = normalizeArabic(String(s.qrId || "").toLowerCase());
      const normalizedPhone = normalizeArabic(String(s.phone || "").toLowerCase());
      const normalizedYear = normalizeArabic(String(s.year || "").toLowerCase());

      return (
        normalizedId.includes(q) ||
        normalizedName.startsWith(q) ||
        normalizedPhone.includes(q) ||
        normalizedYear.includes(q)
      );
    });
  }, [query]);

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

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Add Button */}
          {(currentUser?.role === "admin" ||
            currentUser?.permissions?.includes("perm_add_student")) && (
            <Motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoAdd}
              className="btn w-full bg-gradient-to-r from-[#4A7FA7] to-[#011C40] text-white border border-[#4A7FA7]/40 rounded-2xl h-16 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(74,127,167,0.3)] cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                <UserPlus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="drop-shadow">ضيف طفل جديد</span>
            </Motion.button>
          )}

          {/* Dashboard Button */}
          {onGoDashboard && (
            <Motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoDashboard}
              className="btn w-full bg-slate-900/80 hover:bg-slate-800 text-sky-300 border border-sky-400/30 hover:border-sky-400/60 rounded-2xl h-16 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(14,165,233,0.15)] cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center backdrop-blur-md border border-sky-400/20 text-sky-400">
                <LayoutDashboard className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="drop-shadow">Dashboard</span>
            </Motion.button>
          )}
        </div>


        {/* Results Info */}
        <AnimatePresence>
          {query.trim() && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm font-bold text-base-content/50 px-3 tracking-wide"
            >
              لقينا كام واحد؟{" "}
              <span className="text-primary">{filtered.length}</span>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Results List */}
        <div className="flex flex-col gap-4 pb-20 w-full relative">
          {filtered.length === 0 ? (
            <Motion.div
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
            </Motion.div>
          ) : (
            <Motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filtered.map((student) => (
                <Motion.button
                  key={student.qrId}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onGoStudent(student.qrId)}
                  className="block text-right w-full bg-background backdrop-blur-md border border-[#011C40]/10 hover:border-[#023859]/40 rounded-[2rem] shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                >
                  <StudentMiniCard person={student} />
                </Motion.button>
              ))}
            </Motion.div>
          )}
        </div>
      </div>
    </Page>
  );
}
