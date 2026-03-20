import { useState } from "react";
import { attendanceDB, studentsDB, classesDB } from "../data/storage";
import { todayISO } from "../utils/helpers";
import { Page, Navbar, Empty, Avatar } from "../components/UI";
import { Search } from "lucide-react";

export function HistoryPage({ onBack }) {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [selectedClass, setSelectedClass] = useState("all");
  const [results, setResults] = useState(null);

  const allClassesDB = classesDB.getAll();
  const classList = Object.entries(allClassesDB).map(([id, cls]) => ({
    id,
    ...cls,
  }));

  const search = () => {
    if (!from || !to) return;
    const found = [];
    Object.entries(attendanceDB.getAll()).forEach(([qrId, entries]) => {
      const student = studentsDB.get(qrId);
      if (!student) return;

      // Class Filter
      if (selectedClass !== "all") {
        const targetClass = allClassesDB[selectedClass];
        if (!targetClass || !targetClass.grades?.includes(student.year)) return;
      }

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

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-6 animate-slideUp">
        {/* Date picker card */}
        <div className="bg-[#0F2545] border border-[#1A3D63]/40 rounded-[3rem] shadow-2xl overflow-hidden p-8 gap-8 flex flex-col">
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "من تاريخ", val: from, set: setFrom },
              { label: "إلى تاريخ", val: to, set: setTo },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-[#B3CFE5]/70 uppercase tracking-[0.3em] px-2 text-right">
                  {label}
                </span>
                <input
                  type="date"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="bg-[#1A3D63]/30 border border-[#1A3D63]/40 rounded-2xl px-5 h-14 text-sm font-black text-[#F6FAFD] outline-none focus:border-[#4A7FA7] transition-all text-center"
                />
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-3">
            <span className="text-[10px] font-black text-[#B3CFE5]/70 uppercase tracking-[0.3em] px-2 text-right">
              تصفية حسب الفصل
            </span>
            <select
              className="bg-[#1A3D63]/30 border border-[#1A3D63]/40 rounded-2xl px-5 h-14 text-sm font-black text-[#F6FAFD] outline-none focus:border-[#4A7FA7] transition-all appearance-none text-right"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">كل الفصول</option>
              {classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={search}
            className="w-full h-16 bg-[#1A3D63] hover:bg-[#4A7FA7] text-[#F6FAFD] rounded-[2rem] text-xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group"
          >
            <span>بحث في السجلات</span>
            <Search className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Results */}
        {results !== null && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#B3CFE5]/60 font-bold">
                من <span className="text-[#F6FAFD]/90">{from}</span> لـ{" "}
                <span className="text-[#F6FAFD]/90">{to}</span>
              </span>
              <div className="badge badge-primary badge-outline">
                {results.length}
              </div>
            </div>

            {results.length === 0 ? (
              <Empty icon="📭" message="ما فيش بيانات مطابقة للفترة دي" />
            ) : (
              results.map((s, i) => (
                <div
                  key={s.qrId}
                  className="bg-[#0F2545] border border-[#1A3D63]/40 rounded-3xl p-6 shadow-2xl animate-fadeIn flex flex-col gap-4 group"
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={s.name}
                      accent={s.accent}
                      image={s.image}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="font-black text-lg text-[#F6FAFD] leading-none mb-1">
                        {s.name}
                      </div>
                      <div className="text-[10px] font-black tracking-widest text-[#B3CFE5]/60 uppercase opacity-50">
                        {s.qrId}
                      </div>
                    </div>
                    <div
                      className="px-4 py-1.5 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-white/5"
                      style={{
                        background: s.accent + "25",
                        color: s.accent,
                      }}
                    >
                      <span className="text-[10px] opacity-60 ml-0.5">
                        عدد المرات:
                      </span>{" "}
                      {s.sessions.length}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1A3D63]/20">
                    {s.sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="px-3 py-2 bg-[#1A3D63]/50 text-[#F6FAFD] rounded-xl text-[11px] font-black border border-[#1A3D63]/40 flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-[#4A7FA7]">📅</span>
                        <span>{sess.timestamp.slice(0, 10)}</span>
                        <span className="text-[#B3CFE5]/60 ml-1">
                          {sess.time}
                        </span>
                      </div>
                    ))}
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
