import { useState, useEffect, useMemo } from "react";
import { studentsDB } from "../data/storage";
import { ArrowRight, Gift, Calendar, Sparkles } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

/** Converts YYYY-MM-DD to d/m/y, or passes dd/mm/yyyy through */
const fmtDate = (v) => {
  if (!v) return v;
  if (v.includes("/")) return v;
  const parts = v.split("-");
  if (parts.length !== 3) return v;
  return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
};

/**
 * Parse a birthdate string from either dd/mm/yyyy or YYYY-MM-DD format into a Date.
 * Returns null if parsing fails.
 */
function parseBirthdate(str) {
  if (!str) return null;
  if (str.includes("/")) {
    const [d, m, y] = str.split("/").map(Number);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }
  if (str.includes("-")) {
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Get days remaining until birthday this year/month.
 * Returns 0 if today IS the birthday.
 */
function daysUntilBirthday(birthdateStr) {
  const today = new Date();
  const bd = parseBirthdate(birthdateStr);
  if (!bd) return null;
  const thisYear = today.getFullYear();
  const bday = new Date(thisYear, bd.getMonth(), bd.getDate());
  const diffMs =
    bday.getTime() -
    new Date(thisYear, today.getMonth(), today.getDate()).getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function sendNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "🎂" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification(title, { body, icon: "🎂" });
      }
    });
  }
}

export function BirthdayPage({ onBack }) {
  const [notified, setNotified] = useState(false);
  const today = new Date();
  const currentMonthIdx = today.getMonth(); // 0-11
  const [selectedMonths, setSelectedMonths] = useState([currentMonthIdx]);

  const toggleMonth = (idx) => {
    if (selectedMonths.includes(idx)) {
      if (selectedMonths.length === 1) return;
      setSelectedMonths(selectedMonths.filter((m) => m !== idx));
    } else {
      setSelectedMonths([...selectedMonths, idx]);
    }
  };

  const MONTHS = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const birthdayStudents = useMemo(() => {
    const all = studentsDB.getAll();
    const result = [];

    Object.entries(all).forEach(([qrId, student]) => {
      if (!student.birthdate) return;
      const bd = parseBirthdate(student.birthdate);
      if (!bd || !selectedMonths.includes(bd.getMonth())) return;

      const days = daysUntilBirthday(student.birthdate);
      result.push({
        qrId,
        ...student,
        birthdayDay: bd.getDate(),
        daysLeft: days,
        isToday: days === 0,
      });
    });

    result.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.daysLeft - b.daysLeft;
    });

    return result;
  }, [selectedMonths]);

  useEffect(() => {
    if (notified) return;
    const all = studentsDB.getAll();
    const todayBirthdays = [];
    Object.values(all).forEach((student) => {
      if (!student.birthdate) return;
      const bd = parseBirthdate(student.birthdate);
      if (!bd) return;
      const days = daysUntilBirthday(student.birthdate);
      if (days === 0 && bd.getMonth() === currentMonthIdx) {
        todayBirthdays.push(student);
      }
    });

    if (todayBirthdays.length > 0) {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      todayBirthdays.forEach((s) => {
        sendNotification(
          "🎂 كل سنة وأنت طيب!",
          `النهارده عيد ميلاد ${s.name}! 🎉`
        );
      });
      setNotified(true);
    }
  }, [notified, currentMonthIdx]);

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
      <header className="sticky top-0 z-50 bg-[#F472B6] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
          {onBack ? (
            <button
              onClick={onBack}
              className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              <span>رجوع</span>
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#F472B6] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              CELEBRATIONS
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase flex items-center gap-2">
              <span>أعياد الميلاد</span>
              <Gift className="w-6 h-6 stroke-[2.5]" />
            </h1>
          </div>

          {/* Count Badge */}
          <div className="bg-white text-black border-2 border-black px-3 py-1 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000]">
            <span>{birthdayStudents.length} طفل</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Months Filter Bar */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-black/60 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              اختر الشهور
            </span>
            <button
              onClick={() => {
                if (selectedMonths.length === 12) {
                  setSelectedMonths([currentMonthIdx]);
                } else {
                  setSelectedMonths([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
                }
              }}
              className="text-xs font-black text-black underline hover:bg-[#FEF08A] px-2 py-0.5 transition-colors cursor-pointer"
            >
              {selectedMonths.length === 12 ? "الشهر الحالي فقط" : "كل الشهور"}
            </button>
          </div>

          <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-hide transition-all">
            {MONTHS.map((m, idx) => {
              const isActive = selectedMonths.includes(idx);
              const isNow = idx === currentMonthIdx;
              return (
                <button
                  key={idx}
                  onClick={() => toggleMonth(idx)}
                  className={`px-4 py-2.5 shrink-0 border-2 sm:border-[3px] border-black font-black text-sm uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#FACC15] text-black shadow-[3px_3px_0px_#000000] translate-x-[-1px] translate-y-[-1px]"
                      : "bg-[#FDF8F0] text-black/60 hover:bg-white hover:text-black"
                  }`}
                >
                  <span>{m}</span>
                  {isNow && (
                    <span className="w-2 h-2 bg-black border border-black inline-block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List Header Summary */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">
            {selectedMonths.length === 12
              ? "أعياد ميلاد السنة كاملة"
              : selectedMonths.map((m) => MONTHS[m]).join("، ")}
          </h2>
          <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-wider border border-black">
            {birthdayStudents.length} عيد ميلاد
          </span>
        </div>

        {/* Birthday Cards Grid */}
        {birthdayStudents.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-white border-[3px] border-black border-dashed p-8 shadow-[6px_6px_0px_#000000]">
            <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-3xl">
              🎂
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-black uppercase">
                لا توجد أعياد ميلاد في الشهور المختارة
              </h3>
              <p className="text-sm text-black/60 font-bold">
                جرب تحديد شهور أخرى من القائمة بالأعلى
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {birthdayStudents.map((s, i) => {
                const avatarBg = getAvatarBg(s.name);
                return (
                  <Motion.div
                    key={s.qrId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className={`border-[3px] border-black p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all duration-150 ${
                      s.isToday
                        ? "bg-[#FACC15] shadow-[6px_6px_0px_#000000]"
                        : "bg-white shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <div
                            className={`w-14 h-14 border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center overflow-hidden shrink-0 ${
                              s.isToday ? "bg-white" : avatarBg
                            }`}
                          >
                            {s.image ? (
                              <img
                                src={s.image}
                                alt={s.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-black text-2xl text-black">
                                {(s.name || "م")?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          {s.isToday && (
                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-black text-[#FACC15] border-2 border-black flex items-center justify-center text-xs font-black">
                              👑
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0 text-right">
                          <h4 className="text-lg sm:text-xl font-black text-black truncate">
                            {s.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-black text-white font-mono font-black text-[10px] px-2 py-0.5 border border-black">
                              #{s.qrId}
                            </span>
                            <span className="bg-[#FEF08A] text-black font-black text-[10px] px-2 py-0.5 border border-black">
                              {fmtDate(s.birthdate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Days remaining / Today badge */}
                      <div className="text-left shrink-0">
                        {s.isToday ? (
                          <div className="bg-black text-[#A3E635] border-2 border-black px-3 py-1.5 font-black text-xs uppercase tracking-wider text-center shadow-[2px_2px_0px_#000000] animate-bounce">
                            النهارده! 🎉
                          </div>
                        ) : (
                          <div className="bg-[#FDF8F0] border-2 border-black px-3 py-1 text-center shadow-[2px_2px_0px_#000000]">
                            <span className="text-xl sm:text-2xl font-black text-black tabular-nums block leading-tight">
                              {Math.abs(s.daysLeft)}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-tighter text-black/60">
                              {s.daysLeft < 0 ? "يوم مضى" : "يوم باقٍ"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Celebration Banner for Today */}
                    {s.isToday && (
                      <div className="pt-3 border-t-[3px] border-black flex justify-between items-center bg-black text-white px-3 py-2 -mx-1 -mb-1">
                        <span className="text-xs font-black uppercase text-[#FACC15]">
                          🎂 كل سنة وأنت طيب يا بطل!
                        </span>
                        <div className="flex gap-1 text-base">
                          <span>🎈</span>
                          <span>🎁</span>
                          <span>👑</span>
                        </div>
                      </div>
                    )}
                  </Motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
