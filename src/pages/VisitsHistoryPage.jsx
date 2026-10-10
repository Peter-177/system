import { useState } from "react";
import { visitsDB, studentsDB } from "../data/storage";
import { todayISO } from "../utils/helpers";
import { ArrowRight, Calendar, Search, MapPin } from "lucide-react";

export function VisitsHistoryPage({ onBack }) {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [results, setResults] = useState(null);

  const search = () => {
    if (!from || !to) return;
    const found = [];
    Object.entries(visitsDB.getAll()).forEach(([qrId, entries]) => {
      const student = studentsDB.get(qrId);
      if (!student) return;
      const sessions = entries.filter((e) => {
        const d = e.timestamp.slice(0, 10);
        return d >= from && d <= to;
      });
      if (sessions.length > 0) found.push({ qrId, ...student, sessions });
    });
    found.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
    setResults(found);
  };

  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col" dir="rtl">
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FB923C] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FB923C] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              VISIT LOGS
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              سجل الزيارات والافتقاد
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Date Filter Card */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "من تاريخ", val: from, set: setFrom },
              { label: "إلى تاريخ", val: to, set: setTo },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex flex-col gap-2">
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  {label}
                </span>
                <input
                  type="date"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="bg-[#FDF8F0] border-[3px] border-black p-3 text-base font-black text-black outline-none focus:bg-[#FEF08A] transition-colors"
                />
              </div>
            ))}
          </div>

          <button
            onClick={search}
            className="w-full bg-[#FACC15] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none py-4 font-black text-lg uppercase transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[3]" />
            <span>عرض نتائج الزيارات</span>
          </button>
        </div>

        {/* Results */}
        {results !== null && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black uppercase text-black/70">
                الزيارات من {from} إلى {to}
              </span>
              <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase border border-black">
                {results.length} مخدوم
              </span>
            </div>

            {results.length === 0 ? (
              <div className="py-16 text-center bg-white border-[3px] border-black border-dashed p-8 shadow-[6px_6px_0px_#000000]">
                <p className="font-black text-black text-lg uppercase">
                  لم يتم تسجيل أي زيارات في هذا النطاق الزمني
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {results.map((s) => (
                  <div
                    key={s.qrId}
                    className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 border-[3px] border-black shadow-[2px_2px_0px_#000000] ${getAvatarBg(s.name)} flex items-center justify-center overflow-hidden shrink-0`}>
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-xl text-black">
                              {(s.name || "م")?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-lg text-black truncate">
                            {s.name}
                          </span>
                          <span className="font-mono text-xs font-black text-black/60">
                            #{s.qrId}
                          </span>
                        </div>
                      </div>

                      <span className="bg-[#A3E635] text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
                        {s.sessions.length} زيارة
                      </span>
                    </div>

                    {/* Sessions list */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t-2 border-black">
                      {s.sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="bg-[#FEF08A] border-2 border-black px-3 py-1.5 text-xs font-black text-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                        >
                          <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{sess.timestamp.slice(0, 10)}</span>
                          <span className="opacity-60 text-[10px]">{sess.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
