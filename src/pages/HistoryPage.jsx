import { useState } from "react";
import { attendanceDB, studentsDB } from "../data/storage";
import { todayISO } from "../utils/helpers";
import { Page, Navbar, Empty } from "../components/UI";

export function HistoryPage({ onBack }) {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [results, setResults] = useState(null);

  const search = () => {
    if (!from || !to) return;
    const found = [];
    Object.entries(attendanceDB.getAll()).forEach(([qrId, entries]) => {
      const student = studentsDB.get(qrId);
      if (!student) return;
      const sessions = entries.filter((e) => {
        const d = e.timestamp.slice(0, 10);
        return d >= from && d <= to;
      });
      if (sessions.length > 0) found.push({ qrId, ...student, sessions });
    });
    found.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    setResults(found);
  };

  return (
    <Page>
      <Navbar onBack={onBack} title="📅 تاريخ الحضور" />

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-5 animate-slideUp">
        {/* Date picker card */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-5 gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "من", val: from, set: setFrom },
                { label: "إلى", val: to, set: setTo },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="label py-1">
                    <span className="label-text text-xs text-base-content/40">
                      {label}
                    </span>
                  </label>
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="input input-bordered w-full text-sm"
                  />
                </div>
              ))}
            </div>
            <button onClick={search} className="btn btn-primary w-full">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Results */}
        {results !== null && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-xs text-base-content/40">
                من <span className="text-base-content/70">{from}</span> لـ{" "}
                <span className="text-base-content/70">{to}</span>
              </span>
              <div className="badge badge-primary badge-outline">
                {results.length} 
              </div>
            </div>

            {results.length === 0 ? (
              <Empty icon="📭" message="مافيش طلاب حضروا في الفترة دي" />
            ) : (
              results.map((s, i) => (
                <div
                  key={s.qrId}
                  className="card bg-base-200 border animate-fadeIn"
                  style={{
                    borderColor: s.accent + "25",
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                        style={{
                          background: s.accent + "20",
                          border: `2px solid ${s.accent}`,
                          color: s.accent,
                        }}
                      >
                        {s.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{s.name}</div>
                        <div className="text-xs font-mono text-base-content/30">
                          {s.qrId}
                        </div>
                      </div>
                      <div
                        className="badge badge-sm"
                        style={{
                          background: s.accent + "20",
                          border: `1px solid ${s.accent}40`,
                          color: s.accent,
                        }}
                      >
                        {s.sessions.length}{" "}
                        {s.sessions.length === 1 ? "يوم" : "أيام"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-base-300">
                      {s.sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="badge badge-ghost badge-sm font-mono gap-1"
                        >
                          {sess.timestamp.slice(0, 10)}
                          <span className="opacity-40">{sess.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
