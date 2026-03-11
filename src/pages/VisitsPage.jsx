import { useState, useMemo, useRef } from "react";
import { visitsDB, studentsDB } from "../data/storage";
import { buildVisitEntry, visitedToday } from "../utils/helpers";
import { Page, Navbar, StudentMiniCard, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";

export function VisitsPage({ onBack, onGoVisitsHistory }) {
  const [query, setQuery] = useState("");
  const [pendingList, setPendingList] = useState([]);
  const toast = useToast();
  const inputRef = useRef(null);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));
  }, []);

  const addPerson = (student) => {
    if (!student) return;
    if (pendingList.find((p) => p.qrId === student.qrId)) {
      toast.show("ده متسجل في القائمة أصلاً");
      setQuery("");
      return;
    }
    const log = visitsDB.get(student.qrId);
    if (visitedToday(log)) {
      toast.show(`⚠️ ${student.name} زُرناه النهارده!`);
      return;
    }
    setPendingList((prev) => [student, ...prev]);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      const q = query.trim().toLowerCase();
      let match = allStudents.find((s) => s.qrId.toLowerCase() === q);
      if (!match) {
        match = allStudents.find((s) => s.name.toLowerCase().includes(q));
      }
      if (match) {
        addPerson(match);
      } else {
        toast.show("ما لقيناش حد بالاسم أو الكود ده");
      }
    }
  };

  const removePerson = (qrId) => {
    setPendingList((prev) => prev.filter((p) => p.qrId !== qrId));
  };

  const handleSave = () => {
    if (pendingList.length === 0) return;
    let count = 0;
    pendingList.forEach((p) => {
      const log = visitsDB.get(p.qrId);
      if (!visitedToday(log)) {
        visitsDB.add(p.qrId, buildVisitEntry());
        count++;
      }
    });
    toast.show(`✅ تمام، سجلنا زيارة ${count} عيل`);
    setPendingList([]);
  };

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allStudents
      .filter(
        (s) =>
          s.qrId.toLowerCase().includes(q) ||
          (s.name && s.name.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [query, allStudents]);

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="🏠 تسجيل الزيارات" />

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-4 animate-slideUp">
        {/* Top Controls */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="دور بالاسم أو الكود..."
            className="input input-bordered flex-1 shadow-sm font-mono text-sm"
            autoFocus
          />
          <button
            onClick={onGoVisitsHistory}
            className="btn btn-outline btn-info px-4 whitespace-nowrap"
            title="تاريخ الزيارات"
          >
            📅 تاريخ الزيارات
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-base-200 rounded-xl shadow-lg border border-base-300 p-2 flex flex-col gap-1 -mt-2 z-10">
            {suggestions.map((s) => (
              <button
                key={s.qrId}
                className="btn btn-ghost btn-sm justify-start font-normal"
                onClick={() => addPerson(s)}
              >
                {s.name} <span className="opacity-40 text-xs ml-auto font-mono">{s.qrId}</span>
              </button>
            ))}
          </div>
        )}

        <div className="divider my-0" />

        {/* Pending List */}
        <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
          {pendingList.length === 0 ? (
            <div className="text-center text-base-content/40 py-10 text-sm">
              اكتب اسم الطفل أو الكود ودوس Enter عشان تسجل الزيارة
            </div>
          ) : (
            pendingList.map((p) => (
              <div
                key={p.qrId}
                className="flex items-center gap-2 animate-fadeIn bg-base-100 p-1 pr-2 rounded-2xl border border-base-300 shadow-sm"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <StudentMiniCard person={p} />
                </div>
                <div className="flex-none px-2">
                  <button
                    onClick={() => removePerson(p.qrId)}
                    className="btn btn-ghost btn-circle text-error hover:bg-error/20"
                    title="امسحه"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Save Button */}
        {pendingList.length > 0 && (
          <button
            onClick={handleSave}
            className="btn btn-info btn-lg w-full text-xl shadow-lg mt-auto text-white sticky bottom-6 animate-slideUp"
          >
            🏠 تسجيل الزيارة ({pendingList.length})
          </button>
        )}
      </div>
    </Page>
  );
}
