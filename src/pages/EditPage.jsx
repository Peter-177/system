import { useState } from "react";
import { studentsDB } from "../data/storage";
import { Page, Navbar, Field, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";

const FIELDS = [
  { key: "name", label: "الاسم", type: "text", full: true, required: true },
  { key: "phone", label: "رقم التليفون", type: "text" },
  { key: "address", label: "العنوان", type: "text", full: true },
  { key: "birthdate", label: "تاريخ الميلاد", type: "date" },
  { key: "year", label: "السنة الدراسية", type: "text" },
];

export function EditPage({ person, onBack, onSaved }) {
  const [form, setForm] = useState({
    name: person.name,
    address: person.address ?? "",
    birthdate: person.birthdate ?? "",
    year: person.year ?? "",
    phone: person.phone ?? "",
  });
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "مطلوب" });
      return;
    }
    const updated = { ...form, name: form.name.trim() };
    studentsDB.update(person.qrId, updated);
    toast.show("✅ تم التعديل!");
    setTimeout(() => onSaved({ ...person, ...updated }), 700);
  };

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title={`تعديل — ${person.name}`} />
      <div className="flex-1 max-w-md mx-auto w-full px-5 py-6 animate-slideUp">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {FIELDS.map(({ key, label, type, full, required }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <Field label={label} error={errors[key]} required={required}>
                <input
                  className={`input input-bordered w-full ${errors[key] ? "input-error" : ""}`}
                  type={type}
                  value={form[key]}
                  onChange={(e) => upd(key, e.target.value)}
                />
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
