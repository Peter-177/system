import { useState } from "react";
import { studentsDB, changeStudentId } from "../data/storage";
import { ImageCropperModal } from "../components/UI";
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
} from "lucide-react";

const FIELDS = [
  { key: "name", label: "الاسم", type: "text", full: true, required: true, icon: User },
  { key: "phone", label: "رقم التليفون", type: "text", placeholder: "01xxxxxxxxx", icon: Phone },
  { key: "address", label: "العنوان", type: "text", placeholder: "المنطقة - الشارع", full: true, icon: MapPin },
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
    year: person.year ?? "",
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
      setErrors({ name: "من فضلك اكتب الاسم" });
      return;
    }
    if (!form.qrId.trim()) {
      setErrors({ qrId: "الكود مطلوب" });
      return;
    }

    const newId = form.qrId.trim();
    if (newId !== person.qrId) {
      const ok = await changeStudentId(person.qrId, newId);
      if (!ok) {
        setErrors({ qrId: "هذا الكود مسجل لطفل آخر بالفعل" });
        return;
      }
    }

    const bd =
      form.birthdate_d && form.birthdate_m && form.birthdate_y
        ? `${form.birthdate_d}/${form.birthdate_m}/${form.birthdate_y}`
        : "";

    const { qrId, birthdate_d, birthdate_m, birthdate_y, ...restForm } = form; 
    
    const validCustomFields = customFields.filter(f => f.label.trim() || f.value.trim());

    const updated = { 
      ...restForm, 
      birthdate: bd, 
      name: restForm.name.trim(),
      customFields: validCustomFields
    };

    studentsDB.update(newId, updated);
    toast.show("✅ تم حفظ التعديلات بنجاح!");

    setTimeout(() => onSaved({ ...person, ...updated, qrId: newId }), 600);
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir="rtl"
    >
      {/* Toast */}
      {toast.msg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black text-white border-[3px] border-black px-6 py-3 shadow-[4px_4px_0px_#A3E635] font-black text-sm uppercase">
          {toast.msg}
        </div>
      )}

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
              EDIT
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase truncate max-w-[200px] sm:max-w-none">
              تعديل بيانات {person.name.split(" ")[0]}
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        
        {/* Image Uploader */}
        <div className="flex flex-col items-center justify-center gap-3">
          <label className="cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
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
                    تغيير الصورة
                  </span>
                </>
              )}
            </div>
          </label>

          {form.image && (
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

        {/* Cropper Modal */}
        {cropImageSrc && (
          <ImageCropperModal
            imageSrc={cropImageSrc}
            onCropDone={handleCropDone}
            onCancel={() => setCropImageSrc(null)}
          />
        )}

        {/* Form Container */}
        <div className="bg-white border-[3px] border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000000] flex flex-col gap-6">
          
          {/* ID Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                <Fingerprint className="w-4 h-4 stroke-[2.5]" />
                <span>كود الطفل (ID)</span>
              </label>
              <span className="bg-[#FACC15] border border-black px-1.5 py-0.2 font-black text-[10px] uppercase">
                مطلوب
              </span>
            </div>

            {errors.qrId && (
              <div className="bg-[#F472B6] border border-black p-1.5 text-[11px] font-black flex items-center gap-1">
                <AlertCircle size={12} strokeWidth={3} />
                <span>{errors.qrId}</span>
              </div>
            )}

            <input
              type="text"
              value={form.qrId}
              onChange={(e) => upd("qrId", e.target.value)}
              className="h-12 bg-[#FDF8F0] border-2 border-black px-3 font-mono font-black text-base focus:outline-none focus:bg-[#FACC15] transition-colors"
            />
          </div>

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
                onChange={(e) => upd("birthdate_y", e.target.value)}
              >
                <option value="" disabled>السنة</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Regular Fields */}
          {FIELDS.map(({ key, label, type, options, placeholder, required, icon: Icon }) => (
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
                  onChange={(e) => upd(key, e.target.value)}
                  className="h-12 bg-[#FDF8F0] border-2 border-black px-3 font-bold text-sm focus:outline-none focus:bg-[#FACC15] transition-colors placeholder:text-gray-500"
                />
              )}
            </div>
          ))}

          {/* Dynamic Custom Fields */}
          {customFields.map((field) => (
            <div key={field.id} className="bg-[#FDF8F0] border-2 border-black p-4 shadow-[3px_3px_0px_#000000] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 stroke-[2.5] text-black" />
                  <input
                    className="bg-transparent border-b-2 border-black px-1 py-0.5 text-xs font-black text-black uppercase focus:outline-none focus:bg-[#FACC15]"
                    placeholder="اسم الحقل المخصص..."
                    value={field.label}
                    onChange={(e) => handleCustomFieldChange(field.id, "label", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="text-black hover:bg-[#F472B6] border border-black px-2 py-0.5 text-xs font-black"
                >
                  حذف
                </button>
              </div>

              <input
                className="h-10 bg-white border-2 border-black px-3 font-bold text-sm focus:outline-none focus:bg-[#FACC15]"
                placeholder={`اكتب ${field.label || 'بيانات إضافية'}...`}
                value={field.value}
                onChange={(e) => handleCustomFieldChange(field.id, "value", e.target.value)}
              />
            </div>
          ))}

          {/* Add Custom Field Button */}
          <button
            type="button"
            onClick={handleAddCustomField}
            className="w-full bg-[#FDF8F0] hover:bg-gray-100 border-2 border-dashed border-black py-3 px-4 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            <span>إضافة حقل مخصص جديد</span>
          </button>

          {/* Save Action */}
          <div className="pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-[#A3E635] text-black border-[3px] border-black py-4 px-6 font-black text-lg uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
              <span>حفظ تعديلات الطفل</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
