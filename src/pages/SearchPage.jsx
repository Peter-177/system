import { useState, useMemo } from "react";
import { Page, Navbar, StudentMiniCard } from "../components/UI";
import { studentsDB } from "../data/storage";

export function SearchPage({ onBack, onGoStudent, onGoAdd }) {
  const [query, setQuery] = useState("");
  
  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map(id => ({ qrId: id, ...db[id] }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allStudents;
    return allStudents.filter(s => 
      s.qrId.toLowerCase().includes(q) || 
      (s.name && s.name.toLowerCase().includes(q))
    );
  }, [query, allStudents]);

  return (
    <Page>
      <Navbar title="بحث / Search" onBack={onBack} />
      
      <div className="p-4 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* Search Bar */}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Name or ID..."
          className="input input-bordered w-full text-lg shadow-sm"
          autoFocus
        />

        <button
          onClick={onGoAdd}
          className="btn btn-outline btn-success w-full text-lg"
        >
          ➕ Register New Child
        </button>

        <div className="divider my-0" />

        <div className="flex flex-col gap-3 pb-20">
          {filtered.length === 0 ? (
            <div className="text-center text-base-content/50 py-8">
              No results found
            </div>
          ) : (
            filtered.map((student) => (
              <button
                key={student.qrId}
                onClick={() => onGoStudent(student.qrId)}
                className="btn btn-ghost h-auto p-0 flex text-left w-full hover:bg-base-200 border border-transparent rounded-2xl overflow-hidden"
              >
                <div className="w-full pointer-events-none">
                  <StudentMiniCard person={student} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Page>
  );
}
