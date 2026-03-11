import { useState } from "react";
import { studentsDB, attendanceDB, visitsDB } from "../data/storage";
import { Page, Avatar } from "../components/UI";

/** Converts YYYY-MM-DD to d/m/y, or passes dd/mm/yyyy through */
const fmtDate = (v) => {
  if (!v) return v;
  // Already in dd/mm/yyyy format
  if (v.includes("/")) return v;
  // Convert from YYYY-MM-DD
  const parts = v.split("-");
  if (parts.length !== 3) return v;
  return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
};

const FIELDS = [
  { icon: "🆔", label: "الكود", key: "qrId" },
  { icon: "🏠", label: "العنوان", key: "address" },
  { icon: "🎂", label: "عيد ميلاده", key: "birthdate", fmt: fmtDate },
  { icon: "📚", label: "في سنة كام؟", key: "year" },
  { icon: "📱", label: "التليفون", key: "phone" },
];

export function StudentPage({
  currentUser,
  person,
  onBack,
  onGoAttendance,
  onGoEdit,
  onGoCoupons,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = () => {
    studentsDB.remove(person.qrId);
    attendanceDB.removeAll(person.qrId);
    visitsDB.removeAll(person.qrId);
    onBack();
  };
  return (
    <Page>
      <div className="navbar bg-base-200 border-b border-base-300 px-4 min-h-170">
        <div className="navbar-start">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm gap-1 text-base-content/50 hover:text-base-content"
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
        <div className="navbar-center"></div>
        <div className="navbar-end flex gap-2">
          {currentUser?.role === "admin" && (
            <button
              onClick={onGoAttendance}
              className="btn btn-sm border-primary/30 text-primary hover:bg-primary/10 btn-outline"
            >
              📋 سجل الحضور
            </button>
          )}
          <button
            onClick={onGoCoupons}
            className="btn btn-sm border-warning/30 text-warning hover:bg-warning/10 btn-outline"
          >
            🎟️ كوبونات
          </button>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-200 px-5 py-8 animate-slideUp">
          <div
            className="card border"
            style={{
              borderColor: person.accent + "30",
              background: "oklch(var(--b2))",
            }}
          >
            <div className="card-body gap-5">
              {/* Top row */}
              <div className="flex flex-col items-center gap-3 pb-5 border-b border-base-300 relative">
                <button
                  onClick={onGoEdit}
                  className="btn btn-sm btn-ghost text-warning/60 hover:text-warning hover:bg-warning/10 absolute top-0 right-0"
                >
                  ✏️ Edit
                </button>
                <Avatar name={person.name} accent={person.accent} image={person.image} size="xl" />
                <h2 className="text-2xl font-bold mt-2">{person.name}</h2>
              </div>
              {/* Middle Section (Toggle Details) */}
              <div className="flex justify-center -mt-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="btn btn-outline btn-primary font-bold w-full max-w-[200px]"
                >
                  {showDetails ? "اخفي البيانات⬆️" : "باقي البيانات⬇️"}
                </button>
              </div>

              {/* Info fields */}
              {showDetails && (
                <div className="divide-y divide-base-300 origin-top animate-slideDown">
                  {FIELDS.map(({ icon, label, key, fmt }) =>
                    person[key] ? (
                      <div
                        key={key}
                        className="flex justify-between items-center py-3 text-sm"
                      >
                        <span className="text-base-content/40">
                          {icon} {label}
                        </span>
                        <span className="font-medium">{fmt ? fmt(person[key]) : person[key]}</span>
                      </div>
                    ) : null,
                  )}
                </div>
              )}

              {/* Delete Button */}
              <div className="pt-4 border-t border-base-300">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="btn btn-outline btn-error btn-sm w-full"
                  >
                    🗑️ امسح الطفل
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 animate-fadeIn">
                    <p className="text-sm text-error text-center font-bold">
                      متأكد عايز تمسح {person.name}؟
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="btn btn-error btn-sm flex-1 text-white"
                      >
                        ✅ أيوة امسحه
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="btn btn-ghost btn-sm flex-1"
                      >
                        ❌ لا خلاص
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
