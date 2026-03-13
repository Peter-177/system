import { useState, useRef, useEffect } from "react";
import { studentsDB } from "../data/storage";
import { randomAccent } from "../utils/helpers";
import { Page, Navbar, Field, ImageCropperModal } from "../components/UI";

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
    if (studentsDB.exists(t)) setError(`الـ ID "${t}" موجود قبل كده — شوف واحد غيره`);
    else {
      setError("");
      onNext(t);
    }
  };

  return (
    <Page>
      <Navbar onBack={onBack} title="إضافة طفل" />
      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full px-5 pt-14 pb-8 animate-slideUp">
        <div>
          <h2 className="text-2xl font-bold">اكتب الـ ID هنا</h2>
          <p className="text-sm text-base-content/30 mt-1">كود الطفل</p>
        </div>
        <div className="join w-full">
          <input
            ref={ref}
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="Student ID"
            className={`input input-bordered join-item flex-1 font-mono ${error ? "input-error" : ""}`}
            dir="ltr"
          />
          <button
            onClick={go}
            className="btn btn-success join-item px-6 text-lg"
          >
            →
          </button>
        </div>
        {error && (
          <div className="alert alert-error text-sm animate-fadeIn gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
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
      setErrors({ name: "required" });
      return;
    }
    const bd = (form.birthdate_d && form.birthdate_m && form.birthdate_y)
      ? `${form.birthdate_d}/${form.birthdate_m}/${form.birthdate_y}`
      : "";

    const { birthdate_d, birthdate_m, birthdate_y, ...restForm } = form;
    const data = { ...restForm, birthdate: bd, name: restForm.name.trim(), accent: randomAccent() };
    studentsDB.set(pendingId, data);
    setSavedPerson({ qrId: pendingId, ...data });
    setSaved(true);
  };

  return (
    <Page>
      <div className="navbar bg-base-200 border-b border-base-300 px-4 min-h-14">
        <div className="navbar-start">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm gap-1 text-base-content/50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Back
          </button>
        </div>
        <div className="navbar-center text-center">
          <div className="font-mono text-xs text-base-content/30">
            {pendingId}
          </div>
        </div>
        <div className="navbar-end">
          {saved && (
            <button
              onClick={() => onGoAttendance(savedPerson)}
              className="btn btn-sm btn-outline border-primary/30 text-primary hover:bg-primary/10"
            >
              ✅ حضور
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-5 py-6 animate-slideUp">
        {saved && (
          <div className="alert alert-success mb-5 animate-fadeIn">
            <span className="text-lg">✅</span>
            <div>
              <div className="font-bold">زي الفل، اتحفظ</div>
              <div className="text-xs">دوس "حضور" اللي فوق دي عشان تحضره</div>
            </div>
          </div>
        )}

        {/* Image Uploader */}
        <div className="flex flex-col items-center justify-center mb-6 gap-3">
          <label className={`relative cursor-pointer group ${saved ? "pointer-events-none opacity-50" : ""}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={saved}
            />
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-base-content/20 flex flex-col items-center justify-center bg-base-200 overflow-hidden hover:bg-base-300 transition-colors">
              {form.image ? (
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl opacity-50">📷</span>
              )}
            </div>
            {!saved && (
              <div className="absolute -bottom-2 bg-base-100 px-2 text-xs rounded-full border shadow-sm left-1/2 -translate-x-1/2 whitespace-nowrap">
                {form.image ? "غير الصورة" : "صورة الطفل"}
              </div>
            )}
          </label>
          
          {/* Explicit Remove Button */}
          {form.image && !saved && (
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
            <Field label="عيد ميلاده" required={false}>
              <div className="flex gap-2 w-full" dir="ltr">
                <select
                  className={`select select-bordered flex-1 ${saved ? "cursor-not-allowed opacity-50" : ""}`}
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
                  className={`select select-bordered flex-1 ${saved ? "cursor-not-allowed opacity-50" : ""}`}
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
                  className={`select select-bordered flex-1 ${saved ? "cursor-not-allowed opacity-50" : ""}`}
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
            </Field>
          </div>
          {FORM_FIELDS.map(({ key, label, type, options, placeholder, full, required }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <Field label={label} error={errors[key]} required={required}>
                {type === "select" ? (
                  <select
                    className={`select select-bordered w-full ${errors[key] ? "select-error" : ""} ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                    value={form[key]}
                    disabled={saved}
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
                    className={`input input-bordered w-full ${errors[key] ? "input-error" : ""} ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    disabled={saved}
                    onChange={(e) => upd(key, e.target.value)}
                  />
                )}
              </Field>
            </div>
          ))}
        </div>

        {!saved ? (
          <button onClick={handleSave} className="btn btn-success w-full">
            حفظ
          </button>
        ) : (
          <button
            onClick={() => onGoStudent(pendingId)}
            className="btn btn-primary text-lg font-bold shadow-lg w-full"
          >
            بص على البروفايل
          </button>
        )}
      </div>
    </Page>
  );
}
