import { useMemo, useState } from "react";
import { studentsDB, classesDB } from "../data/storage";
import { Page, Navbar, Empty, Avatar, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";

export function ClassDetailPage({
  classId,
  currentUser,
  onBack,
  onGoStudent,
  onGoCoupons,
}) {
  const cls = classesDB.get(classId);
  const [query, setQuery] = useState("");
  const toast = useToast();

  // Security check: ensure user has permission for this class, or is admin
  const hasAccess =
    currentUser?.role === "admin" ||
    (currentUser?.permissions || []).includes(classId);

  // Get all students
  const allStudents = useMemo(() => {
    if (!cls || !hasAccess) return [];
    const students = studentsDB.getAll();
    const result = [];
    Object.entries(students).forEach(([qrId, student]) => {
      // Filter by grades assigned to this class
      if (student.year && cls.grades.includes(student.year)) {
        result.push({ qrId, ...student });
      }
    });

    // Sort alphabetically
    return result.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [cls, hasAccess]);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return allStudents;
    const q = query.trim().toLowerCase();
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.qrId.toLowerCase().includes(q),
    );
  }, [allStudents, query]);

  if (!cls) {
    return (
      <Page>
        <Navbar title="مش موجود" onBack={onBack} />
        <Empty message="الفصل ده مش موجود أو اتمسح" icon="🚫" />
      </Page>
    );
  }

  if (!hasAccess) {
    return (
      <Page>
        <Navbar title="مينفعش تدخل هنا" onBack={onBack} />
        <Empty message="معندكش صلاحية تدخل الفصل ده" icon="🔒" />
      </Page>
    );
  }

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar title={cls.name} onBack={onBack} />

      <div
        className="flex-1 px-5 py-6 max-w-lg mx-auto w-full animate-slideUp"
        dir="rtl"
      >
        {/* Search Bar - Modern Floating Pill */}
        <div className="relative group mb-6">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="دور بالاسم أو الكود..."
            className="input w-full bg-[#0F2545] shadow-inner hover:shadow-md focus:shadow-md border-[#1A3D63]/40 focus:border-[#4A7FA7] rounded-full pl-4 pr-11 h-14 text-[15px] font-bold text-[#F6FAFD] transition-all duration-300 placeholder:text-[#B3CFE5]/30 outline-none"
          />
        </div>

        {/* Results Info */}
        <div className="text-xs font-bold text-base-content/40 px-2 mb-3">
          العدد: {filtered.length} من {allStudents.length}
        </div>

        {/* Student List */}
        {filtered.length === 0 ? (
          <Empty message="مافيش عيال هنا" icon="👥" />
        ) : (
          <div className="flex flex-col gap-3 pb-24">
            {filtered.map((s, i) => (
              <div
                key={s.qrId}
                className="group relative rounded-[1.25rem] p-3.5 flex items-center gap-3.5 bg-base-100 hover:bg-base-200 border border-base-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Edge Highlight */}
                <div
                  className="absolute inset-y-0 right-0 w-1.5 rounded-r-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: s.accent }}
                ></div>

                <div
                  className="cursor-pointer"
                  onClick={() => onGoStudent(s.qrId)}
                >
                  <Avatar
                    src={s.image}
                    accent={s.accent}
                    fallback={s.name?.charAt(0)}
                    size="sm"
                  />
                </div>

                <div
                  className="flex-1 min-w-0 pr-1 cursor-pointer"
                  onClick={() => onGoStudent(s.qrId)}
                >
                  <div className="font-bold text-[15px] truncate group-hover:text-primary transition-colors">
                    {s.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] font-semibold text-base-content/40 tracking-wider bg-base-200 px-1.5 py-0.5 rounded-md">
                      {s.qrId}
                    </span>
                    {s.year && (
                      <span className="text-[11px] text-base-content/50">
                        {s.year}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    className="btn btn-xs rounded-lg bg-warning/10 text-warning-content border-warning/20 hover:bg-warning hover:border-warning transition-colors w-16 shadow-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGoCoupons(s);
                    }}
                  >
                    كوبون
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
