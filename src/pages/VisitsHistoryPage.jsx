import { useState } from "react";
import { visitsDB, studentsDB } from "../data/storage";
import { todayISO } from "../utils/helpers";
import { Page, Navbar, Empty, Avatar } from "../components/UI";

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
    found.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    setResults(found);
  };

  return (
    <Page>
      <Navbar onBack={onBack} title="📅 تاريخ الزيارات" />

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-5 animate-slideUp">
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
          <button
            onClick={search}
            className="w-full h-16 bg-[#1A3D63] hover:bg-[#4A7FA7] text-[#F6FAFD] rounded-[2rem] text-xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
          >
            🔍 بحث
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
              <div className="px-3 py-1 rounded-lg text-xs font-black bg-[#1A3D63]/50 text-[#4A7FA7] border border-[#1A3D63]/40">
                {results.length}
              </div>
            </div>

            {results.length === 0 ? (
              <Empty icon="📭" message="مافيش اطفال اتزارت في الوقت ده" />
            ) : (
              results.map((s, i) => (
                <div
                  key={s.qrId}
                  className="bg-[#0F2545] border border-[#1A3D63]/40 rounded-3xl p-6 shadow-2xl animate-fadeIn flex flex-col gap-4 group"
                  style={{
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
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
                          <span className="text-[#4A7FA7]">📍</span>
                          <span>{sess.timestamp.slice(0, 10)}</span>
                          <span className="text-[#B3CFE5]/60 ml-1">
                            {sess.time}
                          </span>
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
