import { useState, useMemo, useEffect, useRef } from "react";
import { attendanceDB, studentsDB, classesDB } from "../data/storage";
import { buildAttendanceEntry, registeredToday } from "../utils/helpers";
import { Page, Navbar, StudentMiniCard, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";

export function AttendancePage({ person, onBack, onGoHistory }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [pendingList, setPendingList] = useState([]);
  const toast = useToast();
  const inputRef = useRef(null);

  const allClassesDB = classesDB.getAll();
  const classList = Object.entries(allClassesDB).map(([id, cls]) => ({ id, ...cls }));

  useEffect(() => {
    if (person && !pendingList.find((p) => p.qrId === person.qrId)) {
      setPendingList([person]);
    }
  }, [person]);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));
  }, []);

  const classRoster = useMemo(() => {
    if (!selectedClass) return [];
    const targetClass = allClassesDB[selectedClass];
    if (!targetClass) return [];
    
    return allStudents.filter(s => targetClass.grades?.includes(s.year))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [selectedClass, allStudents, allClassesDB]);

  const addPerson = (student) => {
    if (!student) return;
    if (pendingList.find((p) => p.qrId === student.qrId)) {
      toast.show("الشخص ده موجود في القائمة بالفعل");
      setQuery("");
      return;
    }
    const log = attendanceDB.get(student.qrId);
    if (registeredToday(log)) {
      toast.show(`⚠️ ${student.name} متسجل النهارده!`);
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
        toast.show("مش لاقي حد بالاسم او الـ ID ده");
      }
    }
  };

  const removePerson = (qrId) => {
    setPendingList((prev) => prev.filter((p) => p.qrId !== qrId));
  };

  const handleSave = () => {
    if (pendingList.length === 0) return;
    let registeredCount = 0;
    pendingList.forEach((p) => {
      const log = attendanceDB.get(p.qrId);
      if (!registeredToday(log)) {
        attendanceDB.add(p.qrId, buildAttendanceEntry());
        registeredCount++;
      }
    });
    toast.show(`✅ تم تسجيل حضور ${registeredCount} شخص بنجاح`);
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
      <Navbar onBack={onBack} title="✅ تسجيل الحضور" />

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-4 animate-slideUp">
        
        {/* Class Selection Dropdown */}
        <div className="w-full">
          <select 
            className="select select-bordered w-full bg-base-200 border-base-300 font-bold"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">اختر الفصل للإظهار...</option>
            {classList.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="بحث بالاسم أو الكود (Enter)..."
            className="input input-bordered flex-1 shadow-sm font-mono text-sm"
          />
          <button
            onClick={onGoHistory}
            className="btn btn-outline btn-info px-4 whitespace-nowrap"
            title="تاريخ الحضور"
          >
            📅
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-base-200 rounded-xl shadow-lg border border-base-300 p-2 flex flex-col gap-1 z-20">
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

        {/* Class Roster */}
        {selectedClass && (
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-widest px-1">
              أطفال {allClassesDB[selectedClass]?.name} ({classRoster.length})
            </h3>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {classRoster.length === 0 ? (
                <div className="text-center py-4 text-xs opacity-30">لا يوجد أطفال في هذا الفصل</div>
              ) : (
                classRoster.map(s => {
                  const hasAttended = registeredToday(attendanceDB.get(s.qrId));
                  const isPending = pendingList.some(p => p.qrId === s.qrId);
                  
                  return (
                    <button
                      key={s.qrId}
                      disabled={hasAttended}
                      onClick={() => addPerson(s)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-right ${
                        hasAttended 
                          ? "bg-success/5 border-success/20 opacity-60" 
                          : (isPending 
                              ? "bg-primary/5 border-primary/30" 
                              : "bg-base-100 border-base-200 hover:border-primary/30 hover:bg-base-200/50")
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${hasAttended ? 'bg-success text-success-content' : 'bg-base-200'}`}>
                          {hasAttended ? "✓" : s.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${hasAttended ? 'text-success' : 'text-base-content'}`}>{s.name}</span>
                          <span className="text-[10px] opacity-40 font-mono">{s.qrId}</span>
                        </div>
                      </div>
                      
                      {hasAttended && (
                        <span className="badge badge-success badge-xs text-[9px] font-bold">تم التحضير</span>
                      )}
                      {isPending && !hasAttended && (
                        <span className="badge badge-primary badge-xs text-[9px] font-bold">في القائمة</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Pending List Section */}
        <div className="divider my-0 text-[10px] font-bold text-base-content/20 uppercase">
          قائمة التحضير {pendingList.length > 0 && `(${pendingList.length})`}
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
          {pendingList.length === 0 ? (
            <div className="text-center text-base-content/40 py-10 text-sm">
              اختار الفصل أو ابحث لإضافة أطفال للقائمة
            </div>
          ) : (
            pendingList.map((p) => (
              <div
                key={p.qrId}
                className="flex items-center gap-2 animate-fadeIn bg-base-100 p-1 pr-2 rounded-2xl border border-base-300 shadow-sm"
              >
                <div className="flex-1 min-w-0 pr-2 pointer-events-none scale-90 -ml-4">
                  <StudentMiniCard person={p} />
                </div>
                <div className="flex-none px-2">
                  <button
                    onClick={() => removePerson(p.qrId)}
                    className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/20"
                    title="حذف"
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
            className="btn btn-success btn-lg w-full text-xl shadow-lg mt-auto text-white sticky bottom-6 animate-slideUp"
          >
            ✅ تسجيل الحضور ({pendingList.length})
          </button>
        )}
      </div>
    </Page>
  );
}
