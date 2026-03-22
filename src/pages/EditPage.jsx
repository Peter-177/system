import { useState } from "react";
import { studentsDB, changeStudentId } from "../data/storage";
import {
  Page,
  ImageCropperModal,
} from "../components/UI";
import { useToast } from "../hooks/useToast";
import { 
  Plus, 
  User, 
  MapPin, 
  Phone, 
  GraduationCap, 
  CalendarDays,
  Camera,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  Fingerprint,
  Heart,
  School,
  StickyNote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FIELDS = [
  { key: "name", label: "الاسم", type: "text", full: true, required: true, icon: User },
  { key: "phone", label: "رقم التليفون", type: "text", icon: Phone },
  { key: "address", label: "العنوان", type: "text", full: true, icon: MapPin },
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
      "أولى إعدادي",
      "تانية إعدادي",
      "تالتة إعدادي",
      "ثانوي",
      "جامعة / خريجين"
    ],
  },
];

export function EditPage({ person, onBack, onSaved }) {
  const [bDay, bMonth, bYear] = (person.birthdate || "").split("/");

  const [form, setForm] = useState({
    qrId: person.qrId,
    name: person.name,
    address: person.address ?? "",
    birthdate_d: bDay || "",
    birthdate_m: bMonth || "",
    birthdate_y: bYear || "",
    phone: person.phone ?? "",
    image: person.image ?? null,
  });
  const [customFields, setCustomFields] = useState(person.customFields || []);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const [cropImageSrc, setCropImageSrc] = useState(null);
  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleCropDone = (croppedBase64) => {
    upd("image", croppedBase64);
    setCropImageSrc(null);
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { id: Date.now().toString(), label: "", value: "" }]);
  };

  const handleCustomFieldChange = (id, field, val) => {
    setCustomFields(
      customFields.map((f) => (f.id === id ? { ...f, [field]: val } : f))
    );
  };

  const handleRemoveCustomField = (id) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrors({ name: "مطلوب" });
      return;
    }
    if (!form.qrId.trim()) {
      setErrors({ qrId: "مطلوب" });
      return;
    }

    const newId = form.qrId.trim();
    if (newId !== person.qrId) {
      const ok = await changeStudentId(person.qrId, newId);
      if (!ok) {
        setErrors({ qrId: "الكود ده متسجل لطفل تاني" });
        return;
      }
    }

    const bd =
      form.birthdate_d && form.birthdate_m && form.birthdate_y
        ? `${form.birthdate_d}/${form.birthdate_m}/${form.birthdate_y}`
        : "";

    const { qrId, birthdate_d, birthdate_m, birthdate_y, ...restForm } = form; 
    
    // Filter out empty custom fields
    const validCustomFields = customFields.filter(f => f.label.trim() || f.value.trim());

    const updated = { 
        ...restForm, 
        birthdate: bd, 
        name: restForm.name.trim(),
        customFields: validCustomFields
    };

    studentsDB.update(newId, updated);
    toast.show("✅ تم التعديل!");

    setTimeout(() => onSaved({ ...person, ...updated, qrId: newId }), 700);
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
        <div className="navbar-center flex flex-col items-center text-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Edit Profile</span>
          <div className="font-black text-white text-lg tracking-tight">تعديل بيانات {person.name.split(" ")[0]}</div>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div className="flex-1 w-full max-w-lg mx-auto px-6 py-10" dir="rtl">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="flex flex-col gap-8">
            
          {/* Image Uploader */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4">
            <label className="relative cursor-pointer group transition-all duration-500 hover:scale-105">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
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
                      تغيير الصورة
                    </span>
                  </>
                )}

                {form.image && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                    <div className="bg-white/10 p-4 rounded-full border border-white/20">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </label>

            <AnimatePresence>
              {form.image && (
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

          <AnimatePresence>
            {cropImageSrc && (
              <ImageCropperModal
                imageSrc={cropImageSrc}
                onCropDone={handleCropDone}
                onCancel={() => setCropImageSrc(null)}
              />
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-2xl border-2 border-white/5 rounded-[3rem] p-8 md:p-10 space-y-10 shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
            
            {/* ID Field */}
            <div className="col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Fingerprint className="w-4 h-4 text-sky-400" />
                        الكود (ID)
                    </label>
                    <span className="text-[8px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md font-black uppercase">Required</span>
                </div>
                {errors.qrId && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[9px] text-red-400 font-bold mb-2 flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.qrId}
                    </motion.div>
                )}
                <div className="relative group">
                    <input
                        className={`tech-input h-16 w-full bg-slate-950/50 pr-12 focus:border-sky-500/40 focus:bg-slate-950 transition-all font-mono tracking-widest ${errors.qrId ? "border-red-500/40 text-red-400" : ""}`}
                        type="text"
                        value={form.qrId}
                        onChange={(e) => upd("qrId", e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-sky-500/40 transition-colors">
                        <Fingerprint size={18} />
                    </div>
                </div>
            </div>

            {/* Custom Birthday Field */}
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                تاريخ الميلاد
              </label>
              <div className="grid grid-cols-3 gap-3 w-full" dir="rtl">
                <select
                  className="tech-input h-16 w-full text-center bg-slate-950/50"
                  value={form.birthdate_d}
                  onChange={(e) => upd("birthdate_d", e.target.value)}
                >
                  <option value="" disabled>يوم</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                  ))}
                </select>

                <select
                  className="tech-input h-16 w-full text-center bg-slate-950/50"
                  value={form.birthdate_m}
                  onChange={(e) => upd("birthdate_m", e.target.value)}
                >
                  <option value="" disabled>شهر</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m).padStart(2, "0")}>{m}</option>
                  ))}
                </select>

                <select
                  className="tech-input h-16 w-full text-center bg-slate-950/50"
                  value={form.birthdate_y}
                  onChange={(e) => upd("birthdate_y", e.target.value)}
                >
                  <option value="" disabled>سنة</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {FIELDS.map(
              ({ key, label, type, options, placeholder, full, required, icon: Icon }) => (
                <div key={key} className={full ? "col-span-2" : ""}>
                   <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Icon className="w-4 h-4 text-sky-400" />
                        {label}
                    </label>
                    {required && (
                      <span className="text-[8px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md font-black uppercase">
                        Required
                      </span>
                    )}
                  </div>

                  {errors[key] && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[9px] text-red-400 font-bold mb-2 flex items-center gap-1">
                        <AlertCircle size={10} /> {errors[key]}
                    </motion.div>
                  )}

                  <div className="relative group">
                    {type === "select" ? (
                        <select
                        className={`tech-input h-16 w-full bg-slate-950/50 pr-12 focus:border-sky-500/40 focus:bg-slate-950 transition-all ${errors[key] ? "border-red-500/40" : ""}`}
                        value={form[key]}
                        onChange={(e) => upd(key, e.target.value)}
                        >
                        <option value="" disabled>اختر {label}...</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        </select>
                    ) : (
                        <input
                        className={`tech-input h-16 w-full bg-slate-950/50 pr-12 focus:border-sky-500/40 focus:bg-slate-950 transition-all ${errors[key] ? "border-red-500/40 text-red-400" : ""}`}
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
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

            {/* Dynamic Custom Fields (Appears directly after standard fields) */}
            <AnimatePresence>
                {customFields.map((field) => (
                    <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="col-span-2 space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-sky-500/50" />
                                <input
                                    className="bg-transparent border-none p-0 text-xs font-black text-sky-400 uppercase tracking-[0.3em] focus:ring-0 w-72 placeholder:text-slate-700"
                                    placeholder="تسمية الحقل الجديد... (مثلاً: اسم الأم)"
                                    value={field.label}
                                    onChange={(e) => handleCustomFieldChange(field.id, "label", e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveCustomField(field.id)}
                                className="text-[10px] font-black text-red-500/40 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                                <X size={10} /> حذف
                            </button>
                        </div>

                        <div className="relative group">
                            <input
                                className="tech-input h-16 w-full bg-slate-950/50 pr-12 focus:border-sky-500/40 focus:bg-slate-950 transition-all text-white"
                                placeholder={`اكتب ${field.label || 'بيانات إضافية'}...`}
                                value={field.value}
                                onChange={(e) => handleCustomFieldChange(field.id, "value", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-sky-500/40 transition-colors">
                                <Plus size={18} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Add Button Placeholder */}
            <div className="col-span-2 pt-4">
                <button
                    onClick={handleAddCustomField}
                    className="w-full h-16 rounded-2xl border-2 border-dashed border-white/5 hover:border-sky-500/20 hover:bg-sky-500/5 flex items-center justify-center gap-3 transition-all group"
                >
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-600 group-hover:text-sky-400 transition-colors">
                        <Plus size={16} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-sky-300">إضافة حقل مخصص جديد</span>
                </button>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="mt-4 pb-16">
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
                  <span className="font-black text-lg tracking-tight">حفظ تعديلات الطفل</span>
                </div>
              </motion.button>
          </motion.div>

        </motion.div>
      </div>
      {toast.isVisible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
           <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="bg-sky-500 text-slate-950 px-6 py-3 rounded-full font-black text-sm shadow-xl flex items-center gap-2 border border-sky-400">
               <Check className="w-4 h-4"/>
               {toast.msg}
           </motion.div>
        </div>
      )}
    </Page>
  );
}
