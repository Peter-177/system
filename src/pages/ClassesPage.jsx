import { useState, useMemo } from "react";
import { classesDB } from "../data/storage";
import { Plus, RefreshCcw, Lock, Users, Trash2, ArrowRight } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

export function ClassesPage({
  currentUser,
  onRefreshAuth,
  onBack,
  onGoCreate,
  onGoClass,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [classesMap, setClassesMap] = useState(() => classesDB.getAll());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const classList = useMemo(
    () => Object.entries(classesMap).map(([id, cls]) => ({ id, ...cls })),
    [classesMap],
  );

  const isAdmin = currentUser?.role === "admin";
  const userPerms = currentUser?.permissions || [];

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    classesDB.remove(confirmDelete);
    setClassesMap({ ...classesDB.getAll() });
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col" dir="rtl">
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
              STAGES
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              إدارة الفصول
            </h1>
          </div>

          {!isAdmin && (
            <button
              onClick={async () => {
                setIsRefreshing(true);
                if (onRefreshAuth) await onRefreshAuth();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="bg-white text-black border-2 border-black px-3 py-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </button>
          )}
          {isAdmin && <div className="w-10" />}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase">
              قائمة الفصول والمراحل
            </h2>
            <p className="text-xs font-bold text-black/60">
              اختر الفصل للوصول لقائمة المخدومين والغياب
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onGoCreate}
              className="bg-[#A3E635] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none px-4 py-2 font-black text-xs sm:text-sm uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>فصل جديد</span>
            </button>
          )}
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classList.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white border-[3px] border-black border-dashed p-8 shadow-[6px_6px_0px_#000000]">
              <p className="font-black text-black text-lg uppercase">
                لا توجد فصول مضافة بعد
              </p>
            </div>
          ) : (
            classList.map((cls, idx) => {
              const hasAccess = isAdmin || userPerms.includes(cls.id);
              return (
                <Motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  key={cls.id}
                  className={`bg-white border-[3px] border-black p-6 flex flex-col justify-between gap-6 relative transition-all duration-150 ${
                    !hasAccess
                      ? "opacity-60 bg-[#FDF8F0] shadow-[2px_2px_0px_#000000]"
                      : "shadow-[6px_6px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]"
                  }`}
                >
                  {/* Delete Button for Admin */}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(cls.id);
                      }}
                      className="absolute top-4 left-4 w-9 h-9 bg-[#EF4444] text-white border-2 border-black flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                      title="حذف الفصل"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  {/* Clickable Card Body */}
                  <div
                    onClick={() => hasAccess && onGoClass(cls.id)}
                    className={`flex flex-col gap-4 text-right ${
                      hasAccess ? "cursor-pointer group" : "cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-[#38BDF8] border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center text-black shrink-0">
                        <Users className="w-7 h-7 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-xl text-black group-hover:underline truncate">
                          {cls.name}
                        </h3>
                        {!hasAccess && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#EF4444] bg-[#FEE2E2] px-2 py-0.5 border border-black mt-1">
                            <Lock className="w-3 h-3" />
                            غير مصرح
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assigned Grades */}
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t-2 border-black">
                      {cls.grades?.map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-1 bg-[#FEF08A] text-black font-black text-xs border border-black"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </Motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60" dir="rtl">
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-[4px] border-black shadow-[10px_10px_0px_#000000] p-6 max-w-sm w-full space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-[#EF4444] text-white border-2 border-black flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-lg text-black uppercase">تأكيد حذف الفصل</h4>
                <p className="text-xs font-bold text-black/70">
                  سيتم حذف الفصل من قاعدة البيانات بشكل نهائي.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-white border-2 border-black py-2.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="flex-1 bg-[#EF4444] text-white border-2 border-black py-2.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]"
                >
                  نعم، احذف
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CreateClassPage({ onBack, onSaved }) {
  const [name, setName] = useState("");
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const GRADES = [
    "حضانه",
    "أولى ابتدائي",
    "تانية ابتدائي",
    "تالتة ابتدائي",
    "رابعة ابتدائي",
    "خامسة ابتدائي",
    "ستة ابتدائي",
  ];

  const handleToggle = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter((g) => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      setError("اكتب اسم الفصل لو سمحت");
      return;
    }
    if (selectedGrades.length === 0) {
      setError("اختار سنة واحدة على الأقل");
      return;
    }

    setLoading(true);
    const id = Date.now().toString();
    const newClass = {
      name: name.trim(),
      grades: selectedGrades,
      createdAt: new Date().toISOString(),
    };

    classesDB.set(id, newClass);
    setLoading(false);
    onSaved();
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col" dir="rtl">
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#38BDF8] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#38BDF8] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              NEW CLASS
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              إضافة فصل جديد
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 sm:p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-black block">
              اسم الفصل
            </label>
            <input
              type="text"
              className="w-full h-14 bg-[#FDF8F0] border-[3px] border-black px-4 text-lg font-black text-black outline-none focus:bg-[#FEF08A] transition-colors shadow-[3px_3px_0px_#000000]"
              placeholder="مثال: أولى وتانية ابتدائي"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-black block">
              المراحل الدراسية التابعة له
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GRADES.map((grade) => {
                const isSelected = selectedGrades.includes(grade);
                return (
                  <div
                    key={grade}
                    onClick={() => {
                      handleToggle(grade);
                      setError("");
                    }}
                    className={`p-3.5 border-[3px] border-black cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#FEF08A] shadow-[3px_3px_0px_#000000] translate-x-[-1px] translate-y-[-1px]"
                        : "bg-[#FDF8F0] hover:bg-white"
                    }`}
                  >
                    <span className="font-black text-sm text-black">{grade}</span>
                    <div className={`w-5 h-5 border-2 border-black flex items-center justify-center ${isSelected ? "bg-black text-white" : "bg-white"}`}>
                      {isSelected && <span className="font-black text-xs">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-[#EF4444] text-white border-[3px] border-black shadow-[3px_3px_0px_#000000] p-3 text-xs font-black">
              ⚠️ {error}
            </div>
          )}

          <button
            className="w-full bg-[#A3E635] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none py-4 font-black text-lg uppercase transition-all cursor-pointer disabled:opacity-50"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "جاري الحفظ..." : "إنشاء الفصل الآن"}
          </button>
        </div>
      </main>
    </div>
  );
}
