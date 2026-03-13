import { useState, useMemo } from "react";
import { Page, Navbar, StudentMiniCard } from "../components/UI";
import { studentsDB } from "../data/storage";

export function SearchPage({ currentUser, onBack, onGoStudent, onGoAdd }) {
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
      <div className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col gap-6 animate-slideUp" dir="rtl">
        {/* Search Bar - Modern Floating Pill */}
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="اكتب الاسم أو الكود هنا..."
            className="input w-full bg-base-100 shadow-sm hover:shadow-md focus:shadow-md border-base-200 focus:border-primary/30 rounded-full pl-4 pr-11 h-14 text-[15px] transition-all duration-300"
            autoFocus
          />
        </div>

        {(currentUser?.role === "admin" || currentUser?.permissions?.includes("perm_add_student")) && (
          <button
            onClick={onGoAdd}
            className="btn btn-outline border-dashed border-2 border-primary/30 text-primary w-full text-base font-bold rounded-2xl h-14 hover:bg-primary hover:border-primary hover:text-primary-content transition-all"
          >
            <span className="text-xl mr-1">+</span> ضيف طفل جديد
          </button>
        )}

        {/* Results Info */}
        {query.trim() && (
          <div className="text-xs font-bold text-base-content/40 px-2 -mb-2">
            لقينا: {filtered.length}
          </div>
        )}
        
        <div className="flex flex-col gap-3 pb-20">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-base-content/30 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">ما لقيناش حد</span>
            </div>
          ) : (
            filtered.map((student, i) => (
              <button
                key={student.qrId}
                onClick={() => onGoStudent(student.qrId)}
                className="block text-right w-full animate-fadeIn"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <StudentMiniCard person={student} />
              </button>
            ))
          )}
        </div>
      </div>
    </Page>
  );
}
