import { useState } from "react";
import { studentsDB, changeStudentId } from "../data/storage";
import { Page, Navbar, Field, Toast, ImageCropperModal } from "../components/UI";
import { useToast } from "../hooks/useToast";

const FIELDS = [
  { key: "name", label: "الاسم", type: "text", full: true, required: true },
  { key: "phone", label: "رقم التليفون", type: "text" },
  { key: "address", label: "العنوان", type: "text", full: true },
  {
    key: "year",
    label: "الفصل",
    type: "select",
    options: ["حضانه", "كيجي", "أولى ابتدائي", "تانية ابتدائي", "تالتة ابتدائي", "رابعة ابتدائي", "خامسة ابتدائي", "ستة ابتدائي"],
  },
];

export function EditPage({ person, onBack, onSaved }) {
  // Parse existing birthdate if available (expected format: DD/MM/YYYY)
  const [bDay, bMonth, bYear] = (person.birthdate || "").split("/");

  const [form, setForm] = useState({
    qrId: person.qrId,
    name: person.name,
    address: person.address ?? "",
    birthdate_d: bDay || "",
    birthdate_m: bMonth || "",
    birthdate_y: bYear || "",
    year: person.year ?? "",
    phone: person.phone ?? "",
    image: person.image ?? null,
  });
  const [errors, setErrors] = useState({});
  const toast = useToast();
  
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
    e.target.value = null;
  };

  const handleCropDone = (croppedBase64) => {
    upd("image", croppedBase64);
    setCropImageSrc(null);
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
    // Check if ID changed
    if (newId !== person.qrId) {
      const ok = await changeStudentId(person.qrId, newId);
      if (!ok) {
        setErrors({ qrId: "الكود ده متسجل لطفل تاني" });
        return;
      }
    }

    const bd = (form.birthdate_d && form.birthdate_m && form.birthdate_y)
      ? `${form.birthdate_d}/${form.birthdate_m}/${form.birthdate_y}`
      : "";

    const { qrId, birthdate_d, birthdate_m, birthdate_y, ...restForm } = form; // Don't save qrId inside the document body
    const updated = { ...restForm, birthdate: bd, name: restForm.name.trim() };
    
    // Save to the (possibly new) ID
    studentsDB.update(newId, updated);
    toast.show("✅ تم التعديل!");
    
    setTimeout(() => onSaved({ ...person, ...updated, qrId: newId }), 700);
  };

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title={`تعديل — ${person.name}`} />
      <div className="flex-1 max-w-md mx-auto w-full px-5 py-6 animate-slideUp">
        
        {/* Image Uploader */}
        <div className="flex flex-col items-center justify-center mb-6 gap-3">
          <label className="relative cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-base-content/20 flex flex-col items-center justify-center bg-base-200 overflow-hidden hover:bg-base-300 transition-colors">
              {form.image ? (
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold opacity-50 text-base-content/30" style={{ color: person.accent }}>
                  {form.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 bg-base-100 px-2 text-xs rounded-full border shadow-sm left-1/2 -translate-x-1/2 whitespace-nowrap">
              {form.image ? "تغيير الصورة" : "اضافة صورة"}
            </div>
          </label>
          
          {/* Explicit Remove Button */}
          {form.image && (
            <button
              onClick={() => upd("image", null)}
              className="btn btn-xs btn-ghost text-error hover:bg-error/10"
            >
              🗑️ مسح الصورة
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <Field label="الكود (ID)" error={errors.qrId} required>
              <input
                className={`input input-bordered w-full font-mono font-bold text-center ${errors.qrId ? "input-error bg-error/10 text-error" : ""}`}
                type="text"
                value={form.qrId}
                onChange={(e) => upd("qrId", e.target.value)}
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="تاريخ الميلاد" required={false}>
              <div className="flex gap-2 w-full" dir="ltr">
                <select
                  className="select select-bordered flex-1"
                  value={form.birthdate_d}
                  onChange={(e) => upd("birthdate_d", e.target.value)}
                >
                  <option value="" disabled>اليوم</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                  ))}
                </select>

                <select
                  className="select select-bordered flex-1"
                  value={form.birthdate_m}
                  onChange={(e) => upd("birthdate_m", e.target.value)}
                >
                  <option value="" disabled>الشهر</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m).padStart(2, "0")}>{m}</option>
                  ))}
                </select>

                <select
                  className="select select-bordered flex-1"
                  value={form.birthdate_y}
                  onChange={(e) => upd("birthdate_y", e.target.value)}
                >
                  <option value="" disabled>السنة</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </Field>
          </div>
          {FIELDS.map(({ key, label, type, options, placeholder, full, required }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <Field label={label} error={errors[key]} required={required}>
                {type === "select" ? (
                  <select
                    className={`select select-bordered w-full ${errors[key] ? "select-error" : ""}`}
                    value={form[key]}
                    onChange={(e) => upd(key, e.target.value)}
                  >
                    <option value="" disabled>اختر الفصل...</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`input input-bordered w-full ${errors[key] ? "input-error" : ""}`}
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => upd(key, e.target.value)}
                  />
                )}
              </Field>
            </div>
          ))}
        </div>
        <button onClick={handleSave} className="btn btn-warning w-full">
         Save Changes✏️
        </button>
      </div>
    </Page>
  );
}
