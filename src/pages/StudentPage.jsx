import { Page, Avatar } from "../components/UI";

const FIELDS = [
  { icon: "🏠", label: "العنوان", key: "address" },
  { icon: "🎂", label: "تاريخ الميلاد", key: "birthdate" },
  { icon: "📚", label: "السنة الدراسية", key: "year" },
  { icon: "📱", label: "رقم التليفون", key: "phone" },
];

export function StudentPage({
  person,
  onBack,
  onGoAttendance,
  onGoEdit,
  onGoCoupons,
}) {
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
          <button
            onClick={onGoAttendance}
            className="btn btn-sm border-primary/30 text-primary hover:bg-primary/10 btn-outline"
          >
            ✅ حضور
          </button>
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
              <div className="flex items-center gap-4 pb-5 border-b border-base-300">
                <Avatar name={person.name} accent={person.accent} size="lg" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{person.name}</h2>
                  <div className="badge badge-ghost badge-sm font-mono mt-1">
                    {person.qrId}
                  </div>
                </div>
                <button
                  onClick={onGoEdit}
                  className="btn btn-sm btn-ghost text-warning/60 hover:text-warning hover:bg-warning/10"
                >
                  ✏️ Edit
                </button>
              </div>

              {/* Info fields */}
              <div className="divide-y divide-base-300">
                {FIELDS.map(({ icon, label, key }) =>
                  person[key] ? (
                    <div
                      key={key}
                      className="flex justify-between items-center py-3 text-sm"
                    >
                      <span className="text-base-content/40">
                        {icon} {label}
                      </span>
                      <span className="font-medium">{person[key]}</span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
