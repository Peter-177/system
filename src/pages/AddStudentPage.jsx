import { useState, useRef, useEffect } from "react";
import { studentsDB } from "../data/storage";
import { randomAccent } from "../utils/helpers";
import { Page, Navbar, ImageCropperModal } from "../components/UI";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Fingerprint, Camera, Trash2, CalendarDays, CheckCircle2, UserCheck, AlertCircle, Sparkles } from "lucide-react";
export function AddIdPage({ onBack, onNext }) {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const go = () => {
    const t = id.trim();
    if (!t) return;
    if (studentsDB.exists(t)) {
      setError(`الـ ID "${t}" موجود قبل كده — شوف واحد غيره`);
    } else {
      setError("");
      onNext(t);
    }
  };

  return (
    <Page>
      <Navbar onBack={onBack} title="إضافة طفل" />
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 py-10" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full relative"
        >
          {/* Decorative Background */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] blur-xl opacity-50 pointer-events-none z-0"></div>
          
          <div className="bg-base-100/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-8 flex flex-col items-center gap-6 relative z-10">
            
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-primary mb-2 shadow-inner border border-primary/30 relative overflow-hidden group">
               <Fingerprint className="w-12 h-12 relative z-10 group-hover:scale-110 transition-transform" />
               <motion.div 
                 animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                 className="absolute inset-0 rounded-[2rem] border-2 border-primary/50"
               ></motion.div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-black text-base-content tracking-tight">اكتب الـ ID هنا</h2>
              <p className="text-sm text-base-content/50 mt-2 font-bold tracking-wide">كود الطفل</p>
            </div>

            <div className="w-full relative mt-4">
              <div className="relative flex items-center">
                <input
                  ref={ref}
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && go()}
                  placeholder="Student ID"
                  className={`input w-full h-16 bg-base-200/80 backdrop-blur-md shadow-inner text-center font-mono text-xl tracking-widest rounded-2xl border-2 transition-all duration-300 focus:outline-none placeholder:font-sans placeholder:tracking-normal ${error ? "border-error/50 focus:border-error focus:ring-4 focus:ring-error/20 text-error" : "border-transparent focus:border-success/50 focus:ring-4 focus:ring-success/20"}`}
                  dir="ltr"
                />
                
                {/* Submit Button inside Input (left side for RTL) */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={go}
                  className={`absolute left-2 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-colors ${error ? 'bg-error' : 'bg-primary hover:bg-primary/90'} ${!id.trim() ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  disabled={!id.trim()}
                >
                  <ArrowLeft className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="w-full bg-error/10 border border-error/20 text-error rounded-xl p-4 flex items-center gap-3 mt-2 overflow-hidden"
                >
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <span className="text-sm font-bold leading-tight">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </Page>
  );
}

// ── Step 2: Form ───────────────────────────────
const FORM_FIELDS = [
  { key: "name", label: "الاسم", type: "text", full: true, required: true },
  { key: "phone", label: "التليفون", type: "text" },
  { key: "address", label: "السكن", type: "text", full: true },
  {
    key: "year",
    label: "الفصل",
    type: "select",
    options: ["حضانه", "أولى ابتدائي", "تانية ابتدائي", "تالتة ابتدائي", "رابعة ابتدائي", "خامسة ابتدائي", "ستة ابتدائي"],
  },
];

export function AddFormPage({
  onBack,
  pendingId,
  onGoAttendance,
  onGoStudent,
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    birthdate_d: "",
    birthdate_m: "",
    birthdate_y: "",
    year: "",
    phone: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [savedPerson, setSavedPerson] = useState(null);
  
  // Cropper state
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read the file as a data URL so the cropper can use it
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
    // Reset file input so the same file could be selected again if needed
    e.target.value = null;
  };

  const handleCropDone = (croppedBase64) => {
    upd("image", croppedBase64);
    setCropImageSrc(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "لازم تكتب اسم الطفل" });
      return;
    }
    const bd = (form.birthdate_d && form.birthdate_m && form.birthdate_y)
      ? `${form.birthdate_d}/${form.birthdate_m}/${form.birthdate_y}`
      : "";

    const { ...restForm } = form;
    const data = { ...restForm, birthdate: bd, name: restForm.name.trim(), accent: randomAccent() };
    studentsDB.set(pendingId, data);
    setSavedPerson({ qrId: pendingId, ...data });
    setSaved(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Page>
      {/* Premium Navbar for Add Form */}
      <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-white/5 px-4 min-h-16 sticky top-0 z-50">
        <div className="navbar-start">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-circle hover:bg-base-200"
          >
            <ArrowRight className="w-5 h-5 text-base-content/70" />
          </button>
        </div>
        <div className="navbar-center flex flex-col items-center">
          <div className="font-black text-base-content/90">بيانات الطفل</div>
          <div className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-0.5">
            ID: {pendingId}
          </div>
        </div>
        <div className="navbar-end">
          <AnimatePresence>
            {saved && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onGoAttendance(savedPerson)}
                className="btn btn-sm bg-success/10 text-success hover:bg-success hover:text-success-content border-none shadow-sm rounded-full px-4"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                حضور
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 w-full max-w-lg mx-auto px-5 py-8" dir="rtl">
        <AnimatePresence mode="wait">
          {saved && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="mb-8"
            >
              <div className="bg-success/10 border border-success/30 rounded-3xl p-6 flex flex-col items-center text-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-transparent opacity-50 pointer-events-none"></div>
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success shadow-inner relative z-10 mb-2">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-black text-success drop-shadow-sm mb-1">تم حفظ البيانات بنجاح! 🎉</div>
                  <div className="text-success/80 text-sm font-medium">يمكنك الآن تسجيل حضوره أو زيارة ملفه الشخصي.</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {/* Image Uploader */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3">
            <label className={`relative cursor-pointer group ${saved ? "pointer-events-none opacity-50" : ""}`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={saved}
              />
              <div className="w-32 h-32 rounded-[2.5rem] border-2 border-dashed border-primary/40 flex flex-col items-center justify-center bg-base-100 shadow-inner overflow-hidden hover:bg-base-200 transition-all duration-300 group-hover:border-primary group-hover:shadow-md relative">
                {form.image ? (
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-primary/50 mb-1 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-primary/50">اختر صورة</span>
                  </>
                )}
                
                {form.image && !saved && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </label>
            
            <AnimatePresence>
               {form.image && !saved && (
                 <motion.button
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   onClick={() => upd("image", null)}
                   className="btn btn-sm btn-ghost text-error hover:bg-error/10 rounded-full px-4"
                 >
                   <Trash2 className="w-4 h-4 mr-1" /> مسح الصورة
                 </motion.button>
               )}
            </AnimatePresence>
          </motion.div>

          {/* Cropper Modal */}
          <AnimatePresence>
            {cropImageSrc && (
              <ImageCropperModal
                imageSrc={cropImageSrc}
                onCropDone={handleCropDone}
                onCancel={() => setCropImageSrc(null)}
              />
            )}
          </AnimatePresence>

          {/* Form Fields Card */}
          <motion.div variants={itemVariants} className="bg-base-100/60 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-sm p-6 grid grid-cols-2 gap-x-4 gap-y-5">
            {/* Custom Birthday Field */}
            <div className="col-span-2">
              <label className="text-xs font-bold text-base-content/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                تاريخ الميلاد
              </label>
              <div className="flex gap-2 w-full mt-1" dir="rtl">
                <select
                  className={`select select-bordered flex-1 bg-base-200/50 focus:bg-base-100 font-bold ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                  value={form.birthdate_d}
                  disabled={saved}
                  onChange={(e) => upd("birthdate_d", e.target.value)}
                >
                  <option value="" disabled>يوم</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                  ))}
                </select>

                <select
                  className={`select select-bordered flex-1 bg-base-200/50 focus:bg-base-100 font-bold ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                  value={form.birthdate_m}
                  disabled={saved}
                  onChange={(e) => upd("birthdate_m", e.target.value)}
                >
                  <option value="" disabled>شهر</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m).padStart(2, "0")}>{m}</option>
                  ))}
                </select>

                <select
                  className={`select select-bordered flex-1 bg-base-200/50 focus:bg-base-100 font-bold ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                  value={form.birthdate_y}
                  disabled={saved}
                  onChange={(e) => upd("birthdate_y", e.target.value)}
                >
                  <option value="" disabled>سنة</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {FORM_FIELDS.map(({ key, label, type, options, placeholder, full, required }) => (
              <div key={key} className={full ? "col-span-2" : ""}>
                <label className="text-xs font-bold text-base-content/60 uppercase tracking-widest flex items-center justify-between mb-2">
                  {label}
                  {required && <span className="text-error text-[10px] bg-error/10 px-1.5 py-0.5 rounded">required</span>}
                  {errors[key] && <span className="text-error text-[10px] animate-pulse">{errors[key]}</span>}
                </label>
                {type === "select" ? (
                  <select
                    className={`select select-bordered w-full bg-base-200/50 focus:bg-base-100 font-bold transition-colors ${errors[key] ? "select-error bg-error/5" : ""} ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                    value={form[key]}
                    disabled={saved}
                    onChange={(e) => upd(key, e.target.value)}
                  >
                    <option value="" disabled>اختر...</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`input input-bordered w-full bg-base-200/50 focus:bg-base-100 font-bold transition-colors ${errors[key] ? "input-error bg-error/5" : ""} ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    disabled={saved}
                    onChange={(e) => upd(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="mt-4 pb-10">
            {!saved ? (
              <button 
                onClick={handleSave} 
                className="btn btn-primary w-full h-16 rounded-[1.5rem] text-xl font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                حفظ بيانات الطفل
              </button>
            ) : (
              <button
                onClick={() => onGoStudent(pendingId)}
                className="btn btn-info text-white w-full h-16 rounded-[1.5rem] text-xl font-black shadow-lg shadow-info/20 hover:shadow-xl transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <UserCheck className="w-6 h-6 mr-2" />
                الذهاب للبروفايل
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </Page>
  );
}
