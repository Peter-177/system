import { useState, useRef, useEffect } from "react";
import { studentsDB } from "../data/storage";
import { randomAccent } from "../utils/helpers";
import { Page, Navbar, Field } from "../components/UI";

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
    if (studentsDB.exists(t)) setError(`الـ ID "${t}" موجود — جرب ID تاني`);
    else {
      setError("");
      onNext(t);
    }
  };

  return (
    <Page>
      <Navbar onBack={onBack} title="Add" />
      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full px-5 pt-14 pb-8 animate-slideUp">
        <div>
          <h2 className="text-2xl font-bold">Enter the id</h2>
          <p className="text-sm text-base-content/30 mt-1">Enter the id</p>
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
  { key: "phone", label: "رقم التليفون", type: "text" },
  { key: "address", label: "العنوان", type: "text", full: true },
  { key: "birthdate", label: "تاريخ الميلاد", type: "date" },
  { key: "year", label: "السنة الدراسية", type: "text" },
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
    birthdate: "",
    year: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [savedPerson, setSavedPerson] = useState(null);
  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "required" });
      return;
    }
    const data = { ...form, name: form.name.trim(), accent: randomAccent() };
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
              <div className="font-bold">Saved</div>
              <div className="text-xs">دوس "حضور" فوق لتسجيل الحضور</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {FORM_FIELDS.map(({ key, label, type, full, required }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <Field label={label} error={errors[key]} required={required}>
                <input
                  className={`input input-bordered w-full ${errors[key] ? "input-error" : ""} ${saved ? "cursor-not-allowed opacity-50" : ""}`}
                  type={type}
                  value={form[key]}
                  disabled={saved}
                  onChange={(e) => upd(key, e.target.value)}
                />
              </Field>
            </div>
          ))}
        </div>

        {!saved ? (
          <button onClick={handleSave} className="btn btn-success w-full">
            Save
          </button>
        ) : (
          <button
            onClick={() => onGoStudent(pendingId)}
            className="btn btn-ghost w-full border border-base-300 capitalize"
          >
            show page
          </button>
        )}
      </div>
    </Page>
  );
}
