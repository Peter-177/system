import { useState } from "react";
import { attendanceDB } from "../data/storage";
import { buildAttendanceEntry, registeredToday } from "../utils/helpers";
import {
  Page,
  Navbar,
  StudentMiniCard,
  Toast,
  DeleteBtn,
} from "../components/UI";
import { useToast } from "../hooks/useToast";

export function AttendancePage({ person, onBack }) {
  const [log, setLog] = useState(() => attendanceDB.get(person?.qrId));
  const toast = useToast();
  const alreadyToday = registeredToday(log);

  const handleRegister = () => {
    if (alreadyToday) {
      toast.show("الشخص ده اتسجل النهارده");
      return;
    }
    const entry = buildAttendanceEntry();
    attendanceDB.add(person.qrId, entry);
    setLog(attendanceDB.get(person.qrId));
    toast.show("✅ تم تسجيل الحضور!");
  };

  const handleRemove = (eid) => {
    attendanceDB.remove(person.qrId, eid);
    setLog(attendanceDB.get(person.qrId));
    toast.show("🗑️ تم مسح التسجيل");
  };

  if (!person) return null;

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="✅ تسجيل الحضور" />

      <div className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col gap-5 animate-slideUp">
        <StudentMiniCard person={person} />

        {/* Register button */}
        <button
          onClick={handleRegister}
          disabled={alreadyToday}
          className={`btn w-full text-base h-14 text-white ${
            alreadyToday
              ? "btn-disabled opacity-40 border border-success/20 bg-success/5"
              : "btn-success shadow-lg shadow-success/20"
          }`}
        >
          {alreadyToday ? "✅ تم التسجيل النهارده" : "✅ تسجيل"}
        </button>

        {/* Log */}
        {log.length > 0 ? (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body p-4 gap-3">
              <div className="text-xs text-base-content/40 font-medium">
                📋 سجل الحضور ({log.length})
              </div>
              <div className="flex flex-col gap-2">
                {log.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`flex justify-between items-center p-3 rounded-xl border text-sm ${
                      i === 0
                        ? "bg-success/5 border-success/20 animate-fadeIn"
                        : "bg-base-300/50 border-base-300"
                    }`}
                  >
                    <span
                      className={
                        i === 0 ? "text-success" : "text-base-content/60"
                      }
                    >
                      📅 {entry.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-base-content/30">
                        {entry.time}
                      </span>
                      <DeleteBtn onClick={() => handleRemove(entry.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body items-center text-base-content/20 py-8">
              <span className="text-3xl">📋</span>
              <span className="text-sm">مفيش سجل حضور لسه</span>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
