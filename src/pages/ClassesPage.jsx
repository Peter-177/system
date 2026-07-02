import { useState, useMemo } from "react";
import { classesDB } from "../data/storage";
import { Page, Navbar, Empty } from "../components/UI";
import { Plus, RefreshCcw, Lock, Users, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ClassesPage({
  currentUser,
  onRefreshAuth,
  onBack,
  onGoCreate,
  onGoClass,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [classesMap, setClassesMap] = useState(() => classesDB.getAll());
  const [confirmDelete, setConfirmDelete] = useState(null); // holds class id to delete

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
    <Page>
      <Navbar title="إدارة الفصول" onBack={onBack} />

      {/* ── Confirm Delete Dialog ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center space-y-6"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">متأكد؟</h3>
                <p className="text-slate-500 text-sm font-medium">
                  هيتمسح الفصل ومش هيرجع تاني
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="h-12 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all"
                >
                  متمسحش
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="h-12 rounded-2xl bg-red-600 font-black text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  امسح
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex-1 px-8 py-10 space-y-10 max-w-5xl mx-auto w-full pb-24"
        dir="rtl"
      >
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              الفصول الدراسية
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              إدارة مجموعات المخدومين والمراحل
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={async () => {
                setIsRefreshing(true);
                if (onRefreshAuth) await onRefreshAuth();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              {isRefreshing ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              <span>تحديث</span>
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdmin && (
            <button
              onClick={onGoCreate}
              className="group h-full min-h-[200px] rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-black text-lg">إضافة فصل جديد</span>
            </button>
          )}

          {classList.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-2">
              <Empty message="مافيش فصول لغاية دلوقتي" icon="📚" />
            </div>
          ) : (
            classList.map((cls, idx) => {
              const hasAccess = isAdmin || userPerms.includes(cls.id);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={cls.id}
                  className={`tech-panel p-8 text-right flex flex-col items-start gap-6 group transition-all duration-300 h-full relative ${
                    !hasAccess
                      ? "opacity-50 grayscale cursor-not-allowed border-slate-100 bg-slate-50/50"
                      : "hover:border-indigo-200 hover:shadow-indigo-600/5"
                  }`}
                >
                  {/* Admin delete button */}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(cls.id);
                      }}
                      className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Card content — clickable area */}
                  <button
                    className="w-full text-right flex flex-col items-start gap-6"
                    onClick={() => hasAccess && onGoClass(cls.id)}
                    disabled={!hasAccess}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        <Users className="w-7 h-7" />
                      </div>
                      {!hasAccess && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        {cls.id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-auto pt-4">
                      {cls.grades?.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg border border-slate-200 uppercase tracking-tight"
                        >
                          {g}
                        </span>
                      ))}
                      {cls.grades?.length > 3 && (
                        <span className="px-2 py-1 bg-slate-50 text-[10px] font-black text-slate-400 rounded-lg">
                          +{cls.grades.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </Page>
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
    <Page>
      <Navbar title="إضافة فصل جديد" onBack={onBack} />
      <div className="max-w-2xl mx-auto px-8 py-12" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="tech-panel p-10 space-y-10"
        >
          <header>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              بيانات الفصل الجديد
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              حدد اسم الفصل والمراحل الدراسية التابعة له
            </p>
          </header>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1">
                اسم الفصل
              </label>
              <input
                type="text"
                className="tech-input h-16 w-full text-lg"
                placeholder="مثال: أولى وتانية ابتدائي"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1">
                المراحل الدراسية
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADES.map((grade) => (
                  <label
                    key={grade}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedGrades.includes(grade) ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"}`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm rounded-lg"
                      checked={selectedGrades.includes(grade)}
                      onChange={() => {
                        handleToggle(grade);
                        setError("");
                      }}
                    />
                    <span className="text-sm">{grade}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl text-sm font-bold flex items-center gap-3">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <button
            className="tech-btn-primary w-full h-16 shadow-indigo-600/10"
            onClick={submit}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <span>إنشاء الفصل الآن</span>
            )}
          </button>
        </motion.div>
      </div>
    </Page>
  );
}
