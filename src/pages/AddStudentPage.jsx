import { useState, useRef, useEffect } from "react";
import { studentsDB } from "../data/storage";
import { randomAccent } from "../utils/helpers";
import { ImageCropperModal } from "../components/UI";
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
      setError(`الكود "${t}" مسجل مسبقاً — اختر كوداً آخر`);
    } else {
      setError("");
      onNext(t);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir="rtl"
    >
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
              NEW STUDENT
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              إضافة طفل جديد
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 sm:px-6 py-10">
        <div className="w-full bg-white border-[3px] border-black p-8 sm:p-10 shadow-[8px_8px_0px_#000000] flex flex-col items-center gap-6">
          
          <div className="w-20 h-20 bg-[#38BDF8] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-black">
            <Fingerprint className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              أدخل كود الطفل (ID)
            </h2>
            <p className="text-xs font-bold text-gray-700 mt-1">
              اكتب الكود المطبوع على الكارت أو الـ QR
            </p>
          </div>

          <div className="relative w-full flex items-center">
            <input
              ref={ref}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="Ex: 101"
              className={`w-full h-16 bg-[#FDF8F0] border-[3px] border-black text-center font-mono text-2xl font-black tracking-widest text-black placeholder:text-gray-400 focus:bg-[#FACC15] focus:outline-none transition-colors ${
                error ? "border-[#F472B6] bg-[#F472B6]/20" : ""
              }`}
              dir="ltr"
            />

            <button
              onClick={go}
              disabled={!id.trim()}
              className="absolute left-2 w-12 h-12 bg-[#A3E635] text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {error && (
            <div className="w-full bg-[#F472B6] border-2 border-black p-3 text-black font-black text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <AlertCircle className="w-4 h-4 stroke-[3] shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function AddFormPage({
  onBack,
  pendingId,
  onGoAttendance,
  onGoStudent,
}) {
  const [assignedId, setAssignedId] = useState(() => pendingId || studentsDB.getNextId());
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

  useEffect(() => {
    if (pendingId) {
      setAssignedId(pendingId);
    } else if (!assignedId) {
      setAssignedId(studentsDB.getNextId());
    }
  }, [pendingId]);

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

  const handleResetForNew = () => {
    setForm({
      name: "",
      address: "",
      birthdate_d: "",
      birthdate_m: "",
      birthdate_y: "",
      year: "",
      phone: "",
      image: null,
    });
    setErrors({});
    setSaved(false);
    setSavedPerson(null);
    setAssignedId(studentsDB.getNextId());
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "من فضلك اكتب اسم الطفل" });
      return;
    }

    let currentId = assignedId || pendingId;
    if (!currentId || (!pendingId && studentsDB.exists(currentId))) {
      currentId = studentsDB.getNextId();
      setAssignedId(currentId);
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
    studentsDB.set(currentId, data);
    setSavedPerson({ qrId: currentId, ...data });
    setSaved(true);
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir="rtl"
    >
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              REGISTRATION
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              تسجيل طفل جديد
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        
        {/* Code Badge */}
        <div className="flex justify-center">
          <div className="bg-[#38BDF8] border-[3px] border-black px-5 py-2 shadow-[4px_4px_0px_#000000] flex items-center gap-2">
            <Fingerprint className="w-5 h-5 stroke-[2.5]" />
            <span className="font-black text-xs uppercase">كود الطفل المخصص:</span>
            <span className="bg-black text-white px-2 py-0.5 font-mono font-black text-sm">
              #{savedPerson?.qrId || assignedId}
            </span>
          </div>
        </div>

        {/* Success Banner */}
        {saved && (
          <div className="bg-[#A3E635] border-[3px] border-black p-6 shadow-[6px_6px_0px_#000000] flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center font-black">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-black text-xl text-black">تم الحفظ بنجاح!</h3>
              <p className="text-xs font-bold text-gray-800 mt-0.5">
                تم تسجيل الطفل ({savedPerson?.name}) بكود #{savedPerson?.qrId}
              </p>
            </div>
          </div>
        )}

        {/* Image Uploader */}
        <div className="flex flex-col items-center justify-center gap-3">
          <label className={`cursor-pointer group ${saved ? "pointer-events-none opacity-60" : ""}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={saved}
            />
            <div className="w-36 h-36 bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] active:shadow-none transition-all flex flex-col items-center justify-center overflow-hidden relative">
              {form.image ? (
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera className="w-10 h-10 stroke-[2] text-black mb-1" />
                  <span className="text-[10px] font-black uppercase text-black">
                    إضافة صورة
                  </span>
                </>
              )}
            </div>
          </label>

          {form.image && !saved && (
            <button
              type="button"
              onClick={() => upd("image", null)}
              className="bg-[#F472B6] border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1"
            >
              <X size={14} strokeWidth={3} />
              <span>حذف الصورة</span>
            </button>
          )}
        </div>

        {/* Image Cropper Modal */}
        {cropImageSrc && (
          <ImageCropperModal
            imageSrc={cropImageSrc}
            onCropDone={handleCropDone}
            onCancel={() => setCropImageSrc(null)}
          />
        )}

        {/* Form Inputs Container */}
        <div className="bg-white border-[3px] border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000000] flex flex-col gap-6">
          
          {/* Birthday Row */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 stroke-[2.5]" />
              <span>تاريخ الميلاد</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <select
                className="h-12 bg-[#FDF8F0] border-2 border-black font-bold text-center text-sm focus:outline-none focus:bg-[#FACC15]"
                value={form.birthdate_d}
                disabled={saved}
                onChange={(e) => upd("birthdate_d", e.target.value)}
              >
                <option value="" disabled>اليوم</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                ))}
              </select>

              <select
                className="h-12 bg-[#FDF8F0] border-2 border-black font-bold text-center text-sm focus:outline-none focus:bg-[#FACC15]"
                value={form.birthdate_m}
                disabled={saved}
                onChange={(e) => upd("birthdate_m", e.target.value)}
              >
                <option value="" disabled>الشهر</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m).padStart(2, "0")}>{m}</option>
                ))}
              </select>

              <select
                className="h-12 bg-[#FDF8F0] border-2 border-black font-bold text-center text-sm focus:outline-none focus:bg-[#FACC15]"
                value={form.birthdate_y}
                disabled={saved}
                onChange={(e) => upd("birthdate_y", e.target.value)}
              >
                <option value="" disabled>السنة</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Regular Form Fields */}
          {FORM_FIELDS.map(({ key, label, type, options, placeholder, required, icon: Icon }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                  <span>{label}</span>
                </label>
                {required && (
                  <span className="bg-[#FACC15] border border-black px-1.5 py-0.2 font-black text-[10px] uppercase">
                    مطلوب
                  </span>
                )}
              </div>

              {errors[key] && (
                <div className="bg-[#F472B6] border border-black p-1.5 text-[11px] font-black flex items-center gap-1">
                  <AlertCircle size={12} strokeWidth={3} />
                  <span>{errors[key]}</span>
                </div>
              )}

              {type === "select" ? (
                <select
                  className="h-12 bg-[#FDF8F0] border-2 border-black px-3 font-bold text-sm focus:outline-none focus:bg-[#FACC15] transition-colors"
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
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  disabled={saved}
                  onChange={(e) => upd(key, e.target.value)}
                  className="h-12 bg-[#FDF8F0] border-2 border-black px-3 font-bold text-sm focus:outline-none focus:bg-[#FACC15] transition-colors placeholder:text-gray-500"
                />
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="pt-4 border-t-2 border-black">
            {!saved ? (
              <button
                type="button"
                onClick={handleSave}
                className="w-full bg-[#A3E635] text-black border-[3px] border-black py-4 px-6 font-black text-lg uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
                <span>حفظ بيانات الطفل</span>
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => onGoStudent(savedPerson?.qrId || assignedId)}
                  className="w-full bg-[#FACC15] text-black border-[3px] border-black py-4 px-6 font-black text-base uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <UserCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>الذهاب لملف الطفل</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForNew}
                  className="w-full bg-white text-black border-2 border-black py-3 px-6 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>تسجيل طفل آخر</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
