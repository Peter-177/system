import { useState, useRef, useEffect } from "react";
import { studentsDB } from "../data/storage";
import { randomAccent } from "../utils/helpers";
import { Page, ImageCropperModal } from "../components/UI";
import { 
  User, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Camera,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Fingerprint,
  CalendarDays,
  UserCheck,
  AlertCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FORM_FIELDS = [
  { key: "name", label: "الاسم", type: "text", placeholder: "اكتب الاسم بالكامل", full: true, required: true, icon: User },
  { key: "phone", label: "رقم التليفون", type: "text", placeholder: "01xxxxxxxxx", full: true, icon: Phone },
  { key: "address", label: "العنوان", type: "text", placeholder: "المنطقة - الشارع - رقم البيت", full: true, icon: MapPin },
  { 
    key: "year", 
    label: "الفصل / المرحلة", 
    type: "select", 
    full: true, 
    icon: GraduationCap,
    options: [
      "حضانة",
      "أولى ابتدائي",
      "تانية ابتدائي",
      "تالتة ابتدائي",
      "رابعة ابتدائي",
      "خامسة ابتدائي",
      "ستة ابتدائي",
      
    ] 
  },
];

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
      setError(`الـ ID ده "${t}" موجود قبل كده — جرب واحد تاني`);
    } else {
      setError("");
      onNext(t);
    }
  };

  return (
    <Page>
      <div className="navbar bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-6 min-h-20 sticky top-0 z-50">
        <div className="navbar-start">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center transition-all hover:border-sky-500/30 hover:bg-slate-800"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="navbar-center flex flex-col items-center text-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">تسجيل جديد</span>
          <div className="font-black text-white text-lg tracking-tight">اضافة طفل جديد</div>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 py-10"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full relative"
        >
          <div className="bg-slate-900/40 backdrop-blur-2xl border-2 border-white/5 shadow-2xl rounded-[3rem] p-10 flex flex-col items-center gap-10 relative z-10 transition-all">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
            
            <div className="w-24 h-24 rounded-[2rem] bg-slate-950 border border-white/10 flex items-center justify-center text-sky-400 mb-2 relative overflow-hidden group shadow-inner">
              <Fingerprint className="w-12 h-12 relative z-10 group-hover:scale-110 transition-transform" />
              <motion.div
                animate={{ scale: [1, 1.4], opacity: [0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute inset-0 rounded-[2rem] border-2 border-sky-500/30"
              ></motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                اكتب الـ (ID)
              </h2>
              <p className="text-[10px] text-slate-500 font-black tracking-[0.3em] uppercase">
                كود الطفل المميز
              </p>
            </div>

            <div className="relative flex items-center w-full group">
              <input
                ref={ref}
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="Ex: 90909"
                className={`w-full h-24 bg-slate-950/50 border-2 border-white/5 text-center font-mono text-3xl tracking-[0.2em] rounded-3xl text-white placeholder:text-slate-800 focus:border-sky-500/40 focus:bg-slate-950 transition-all outline-none shadow-inner ${error ? "border-red-500/40 text-red-400" : ""}`}
                dir="ltr"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={go}
                className={`absolute left-3 w-16 h-16 rounded-2xl flex items-center justify-center text-slate-950 transition-all shadow-xl ${error ? "bg-red-500" : "bg-sky-500 hover:bg-sky-400"} ${!id.trim() ? "opacity-20 cursor-not-allowed" : ""}`}
                disabled={!id.trim()}
              >
                <ArrowLeft className="w-7 h-7 font-bold" />
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="w-full bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-5 flex items-center gap-4 mt-2 overflow-hidden"
                >
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <span className="text-sm font-bold leading-tight">
                    {error}
                  </span>
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

  const [cropImageSrc, setCropImageSrc] = useState(null);

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleCropDone = (croppedBase64) => {
    upd("image", croppedBase64);
    setCropImageSrc(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "من فضلك اكتب اسم الطفل" });
      return;
    }
    const bd =
      form.birthdate_d && form.birthdate_m && form.birthdate_y
        ? `${form.birthdate_d}/${form.birthdate_m}/${form.birthdate_y}`
        : "";

    const { birthdate_d, birthdate_m, birthdate_y, ...restForm } = form;
    const data = {
      ...restForm,
      birthdate: bd,
      name: restForm.name.trim(),
      accent: randomAccent(),
    };
    studentsDB.set(pendingId, data);
    setSavedPerson({ qrId: pendingId, ...data });
    setSaved(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Page>
      <div className="navbar bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-6 min-h-20 sticky top-0 z-50">
        <div className="navbar-start">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center transition-all hover:border-sky-500/30 hover:bg-slate-800"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="navbar-center flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">بيانات الطفل</span>
          <div className="font-black text-white text-lg tracking-tight">ملف الطفل</div>
        </div>
        <div className="navbar-end">
          <AnimatePresence>
            {saved && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                onClick={() => onGoAttendance(savedPerson)}
                className="w-12 h-12 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-sky-400 transition-all font-black"
              >
                <UserCheck className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 w-full max-w-lg mx-auto px-6 py-10" dir="rtl">
        <div className="mb-8 flex flex-col items-center">
            <div className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 mb-2">
                ID: {pendingId}
            </div>
        </div>
        <AnimatePresence mode="wait">
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2.5rem] p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.3)] relative z-10 mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-black text-white mb-2 tracking-tight">
                    تم الحفظ بنجاح، مبروك!
                  </div>
                  <div className="text-emerald-400/80 text-[10px] font-black uppercase tracking-[0.2em]">
                     الطفل اتسجل خلاص في القاعدة
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          {/* Image Uploader */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4"
          >
            <label
              className={`relative cursor-pointer group transition-all duration-500 ${saved ? "pointer-events-none opacity-50 scale-90" : "hover:scale-105"}`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={saved}
              />
              <div className="w-40 h-40 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-slate-900 shadow-2xl overflow-hidden group-hover:bg-slate-800 group-hover:border-sky-500/30 transition-all relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-slate-700 mb-2 group-hover:text-sky-400 transition-all duration-300" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-sky-300">
                      إضافة صورة
                    </span>
                  </>
                )}

                {form.image && !saved && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                    <div className="bg-white/10 p-4 rounded-full border border-white/20">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </label>

            <AnimatePresence>
              {form.image && !saved && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => upd("image", null)}
                  className="flex items-center gap-2 text-red-400/60 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-400 transition-all bg-slate-900 px-4 py-2 rounded-xl mt-2 border border-white/5"
                >
                  <X size={12} />
                  مسح الصورة
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
          <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-2xl border-2 border-white/5 rounded-[3rem] p-8 md:p-10 space-y-10 shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
            
            {/* Custom Birthday Field */}
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                تاريخ الميلاد
              </label>
              <div className="grid grid-cols-3 gap-3 w-full" dir="rtl">
                <select
                  className={`tech-input h-16 w-full text-center bg-slate-950/50 ${saved ? "cursor-not-allowed opacity-50" : ""}`}
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
                  className={`tech-input h-16 w-full text-center bg-slate-950/50 ${saved ? "cursor-not-allowed opacity-50" : ""}`}
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
                  className={`tech-input h-16 w-full text-center bg-slate-950/50 ${saved ? "cursor-not-allowed opacity-50" : ""}`}
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

            {FORM_FIELDS.map(
              ({ key, label, type, options, placeholder, full, required, icon: Icon }) => (
                <div key={key} className={full ? "col-span-2" : ""}>
                   <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Icon className="w-4 h-4 text-sky-400" />
                        {label}
                    </label>
                    {required && (
                      <span className="text-[8px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md font-black uppercase">
                        مطلوب
                      </span>
                    )}
                  </div>

                  {errors[key] && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[9px] text-red-400 font-bold mb-2 flex items-center gap-1"
                    >
                        <AlertCircle size={10} />
                        {errors[key]}
                    </motion.div>
                  )}

                  <div className="relative group">
                    {type === "select" ? (
                        <select
                        className={`tech-input h-16 w-full bg-slate-950/50 pr-12 focus:border-sky-500/40 focus:bg-slate-950 transition-all ${errors[key] ? "border-red-500/40" : ""} ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                        value={form[key]}
                        disabled={saved}
                        onChange={(e) => upd(key, e.target.value)}
                        >
                        <option value="" disabled>اختر {label}...</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        </select>
                    ) : (
                        <input
                        className={`tech-input h-16 w-full bg-slate-950/50 pr-12 focus:border-sky-500/40 focus:bg-slate-950 transition-all ${errors[key] ? "border-red-500/40 text-red-400" : ""} ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        disabled={saved}
                        onChange={(e) => upd(key, e.target.value)}
                        />
                    )}
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-sky-500/40 transition-colors">
                        <Icon size={18} />
                    </div>
                  </div>
                </div>
              ),
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="mt-4 pb-16">
            {!saved ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="relative w-full h-20 rounded-3xl overflow-hidden group shadow-[0_20px_40px_rgba(14,165,233,0.15)] border border-white/5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-600 transition-all group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex items-center justify-center gap-4 text-white">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <span className="font-black text-lg tracking-tight">حفظ بيانات الطفل</span>
                </div>
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onGoStudent(pendingId)}
                className="w-full h-20 rounded-3xl bg-slate-900 border border-white/10 text-white font-black hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-lg">الذهاب لملف الطفل</span>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:translate-x-[-10px] transition-transform" />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </Page>
  );
}
