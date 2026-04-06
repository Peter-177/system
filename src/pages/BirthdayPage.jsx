import { useState, useEffect, useMemo } from "react";
import { studentsDB } from "../data/storage";
import { Page, Navbar, Empty, Avatar } from "../components/UI";

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
  // Try dd/mm/yyyy
  if (str.includes("/")) {
    const [d, m, y] = str.split("/").map(Number);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }
  // Try YYYY-MM-DD (old format)
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

/**
 * Request browser notification permission and send a notification.
 */

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
      // Prevent empty selection
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

  // Get all students with birthdays in the selected month
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

    // Sort: today first, then by days remaining ascending
    result.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.daysLeft - b.daysLeft;
    });

    return result;
  }, [selectedMonths]);

  // Send notification for today's birthdays (once per page visit)
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
      // Request permission on page load
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      todayBirthdays.forEach((s) => {
        sendNotification(
          "🎂 كل سنة وأنت طيب!",
          `النهارده عيد ميلاد ${s.name}! 🎉`,
        );
      });
      setNotified(true);
    }
  }, [notified, currentMonthIdx]);

  return (
    <Page className="bg-background">
      <Navbar onBack={onBack} title="🎂 أعياد الميلاد" />

      <div
        className="flex-1 max-w-4xl mx-auto w-full px-5 py-10 flex flex-col gap-8 animate-slideUp pb-32"
        dir="rtl"
      >
        {/* Header Section */}
        <header className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-admin-secondary rounded-full glow-orange"></div>
            <h2 className="text-4xl font-black text-text tracking-tight">
              احتفالاتنا
            </h2>
          </div>
        </header>

        {/* Months Filter - Refined Chips */}
        <div className="bg-surface/30 backdrop-blur-md p-4 rounded-3xl border border-white/5 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text mb-4 px-2">
            اختر الشهور
          </p>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x transition-all">
            {MONTHS.map((m, idx) => {
              const isActive = selectedMonths.includes(idx);
              const isNow = idx === currentMonthIdx;
              return (
                <button
                  key={idx}
                  onClick={() => toggleMonth(idx)}
                  className={`px-6 py-3 snap-center shrink-0 rounded-2xl flex items-center gap-2 border-2 transition-all duration-300 transform-gpu active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-admin-primary/10 border-admin-primary/40 text-admin-primary shadow-lg shadow-admin-primary/10"
                      : "bg-surface/40 text-secondary-text border-transparent hover:border-white/10 hover:text-text"
                  }`}
                >
                  <span
                    className={`font-black ${isActive ? "text-lg" : "text-sm"}`}
                  >
                    {m}
                  </span>
                  {isNow && (
                    <span className="w-2 h-2 rounded-full bg-admin-secondary animate-pulse shadow-[0_0_8px_var(--color-admin-secondary)]"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List Header / Summary */}
        <section className="flex items-end justify-between px-2">
          <div>
            <h3 className="text-xl font-black text-text mb-1">
              {selectedMonths.length === 12
                ? "كل السنة"
                : selectedMonths.map((m) => MONTHS[m]).join("، ")}
            </h3>
            <p className="text-sm font-medium text-secondary-text">
              قائمة أعياد الميلاد المختارة
            </p>
          </div>
          <div className="admin-badge-primary !text-lg !px-5 !py-3">
            {birthdayStudents.length} طفل
          </div>
        </section>

        {/* Birthday List Grid */}
        {birthdayStudents.length === 0 ? (
          <div className="py-20">
            <Empty
              icon="🎂"
              message={`مافيش عيال عندها أعياد ميلاد في الشهور دي`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {birthdayStudents.map((s, i) => (
              <div
                key={s.qrId}
                className={`admin-panel !p-5 group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  s.isToday
                    ? "border-admin-secondary/40 shadow-lg shadow-admin-secondary/5 !bg-admin-secondary/5"
                    : "hover:border-admin-primary/30"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-5">
                  {/* Status Indicator / Avatar Wrapper */}
                  <div className="relative shrink-0">
                    <Avatar
                      name={s.name}
                      accent={
                        s.isToday ? "var(--color-admin-secondary)" : s.accent
                      }
                      image={s.image}
                      size="lg"
                    />
                    {s.isToday && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-admin-secondary text-white flex items-center justify-center text-xs animate-bounce shadow-lg shadow-admin-secondary/20 border-2 border-background">
                        🎉
                      </div>
                    )}
                  </div>

                  {/* Information Overlay */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4
                      className={`text-xl font-black truncate mb-1 transition-colors ${s.isToday ? "text-admin-secondary" : "text-text group-hover:text-admin-primary"}`}
                    >
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.isToday ? "bg-admin-secondary/10 text-admin-secondary" : "bg-surface-card text-admin-text-dim"}`}
                      >
                        {fmtDate(s.birthdate)}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Action Button / Text */}
                  <div className="text-left shrink-0">
                    {s.isToday ? (
                      <div className="flex flex-col items-center gap-1 animate-fadeIn">
                        <span className="text-[10px] font-black uppercase text-admin-secondary tracking-widest">
                          النهارده!
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-admin-secondary/20 flex items-center justify-center text-xl shadow-inner border border-admin-secondary/20">
                          🎈
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-text tracking-tighter">
                          {Math.abs(s.daysLeft)}
                        </span>
                        <span className="text-[8px] font-black uppercase text-admin-text-dim mt-[-4px] tracking-widest">
                          {s.daysLeft < 0 ? "يوم مضى" : "يوم باقٍ"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Celebration Card Action - Visual only */}
                {s.isToday && (
                  <div className="mt-4 pt-4 border-t border-admin-secondary/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-admin-secondary/60">
                      كل سنة وأنت طيب يا بطل!
                    </span>
                    <div className="flex gap-1">
                      <span className="text-lg">🍭</span>
                      <span className="text-lg">👑</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
