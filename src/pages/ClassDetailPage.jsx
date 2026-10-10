import { useMemo, useState } from "react";
import { studentsDB, classesDB } from "../data/storage";
import { Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { ArrowRight, Search, Ticket, Users, Lock, ChevronLeft } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

export function ClassDetailPage({
  classId,
  currentUser,
  onBack,
  onGoStudent,
  onGoCoupons,
}) {
  const cls = classesDB.get(classId);
  const [query, setQuery] = useState("");
  const toast = useToast();

  const hasAccess =
    currentUser?.role === "admin" ||
    (currentUser?.permissions || []).includes(classId);

  const allStudents = useMemo(() => {
    if (!cls || !hasAccess) return [];
    const students = studentsDB.getAll();
    const result = [];
    Object.entries(students).forEach(([qrId, student]) => {
      if (student.year && cls.grades?.includes(student.year)) {
        result.push({ qrId, ...student });
      }
    });
    return result.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [cls, hasAccess]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allStudents;
    const q = query.trim().toLowerCase();
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.qrId.toLowerCase().includes(q),
    );
  }, [allStudents, query]);

  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  if (!cls) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] text-black font-sans flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-black text-black uppercase">الفصل غير موجود</h2>
          <p className="text-sm font-bold text-black/60">تم حذف هذا الفصل أو الرابط غير صحيح</p>
          <button
            onClick={onBack}
            className="w-full bg-[#FACC15] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] py-3 font-black text-sm uppercase cursor-pointer"
          >
            رجوع للفصول
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] text-black font-sans flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-[#EF4444] text-white border-[3px] border-black flex items-center justify-center mx-auto">
            <Lock size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-black uppercase">غير مصرح بالدخول</h2>
          <p className="text-sm font-bold text-black/60">ليس لديك صلاحية للوصول لهذا الفصل</p>
          <button
            onClick={onBack}
            className="w-full bg-[#FACC15] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] py-3 font-black text-sm uppercase cursor-pointer"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col" dir="rtl">
      <Toast msg={toast.msg} />

      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#38BDF8] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#38BDF8] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              CLASS
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase truncate max-w-xs sm:max-w-none">
              {cls.name}
            </h1>
          </div>

          <div className="bg-white text-black border-2 border-black px-3 py-1 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000]">
            <span>{filtered.length} مخدوم</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Search Box */}
        <div className="relative flex items-center bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] focus-within:shadow-[8px_8px_0px_#000000] transition-all">
          <div className="bg-[#FACC15] text-black border-l-[3px] border-black p-4 flex items-center justify-center shrink-0">
            <Search className="w-6 h-6 stroke-[3]" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الكود في هذا الفصل..."
            className="w-full bg-transparent px-4 py-4 text-black font-black text-lg placeholder:text-black/30 outline-none"
          />
        </div>

        {/* Grades Pill Strip */}
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-black uppercase text-black/60">المراحل التابعة:</span>
          {cls.grades?.map((g) => (
            <span key={g} className="bg-[#FEF08A] border-2 border-black px-2.5 py-0.5 font-black text-xs text-black">
              {g}
            </span>
          ))}
        </div>

        {/* Student Cards List */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-white border-[3px] border-black border-dashed p-8 shadow-[6px_6px_0px_#000000]">
            <p className="font-black text-black text-lg uppercase">
              لا يوجد مخدومين في هذا الفصل مطابقين للبحث
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
            <AnimatePresence>
              {filtered.map((s, i) => {
                const avatarBg = getAvatarBg(s.name);
                return (
                  <Motion.div
                    key={s.qrId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all p-4 flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                      onClick={() => onGoStudent(s.qrId)}
                    >
                      <div className={`w-12 h-12 border-[3px] border-black shadow-[2px_2px_0px_#000000] ${avatarBg} flex items-center justify-center overflow-hidden shrink-0`}>
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-xl text-black">
                            {(s.name || "م")?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-base text-black group-hover:underline truncate">
                          {s.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-black text-white bg-black px-2 py-0.5 border border-black">
                            #{s.qrId}
                          </span>
                          {s.year && (
                            <span className="text-[10px] font-black text-black bg-[#FEF08A] px-2 py-0.5 border border-black">
                              {s.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGoCoupons(s);
                      }}
                      className="bg-[#FACC15] hover:bg-[#A3E635] text-black border-2 border-black px-3 py-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      title="كوبونات"
                    >
                      <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>كوبون</span>
                    </button>
                  </Motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
