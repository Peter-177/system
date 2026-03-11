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
  const diffMs = bday.getTime() - new Date(thisYear, today.getMonth(), today.getDate()).getTime();
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
       setSelectedMonths(selectedMonths.filter(m => m !== idx));
    } else {
       setSelectedMonths([...selectedMonths, idx]);
    }
  };

  const MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
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
          "🎂 عيد ميلاد سعيد!",
          `النهارده عيد ميلاد ${s.name}! 🎉`
        );
      });
      setNotified(true);
    }
  }, [notified, currentMonthIdx]);

  return (
    <Page>
      <Navbar onBack={onBack} title="🎂 أعياد الميلاد" />

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-5 animate-slideUp" dir="rtl">
        {/* Months Filter */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
          {MONTHS.map((m, idx) => (
            <button
              key={idx}
              onClick={() => toggleMonth(idx)}
              className={`btn btn-sm snap-center shrink-0 rounded-full border-solid border-2 ${
                selectedMonths.includes(idx)
                  ? "bg-primary text-primary-content border-primary shadow-md hover:bg-primary/90"
                  : "bg-base-200 text-base-content border-transparent hover:bg-base-300"
              }`}
            >
              {m}
              {idx === currentMonthIdx && <span className="ml-1 text-[10px] opacity-70">(الحالي)</span>}
            </button>
          ))}
        </div>

        {/* Month Header */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-4 flex-row items-center justify-between">
            <div>
               <div className="text-lg font-bold">الأشهر المحددة: {selectedMonths.map(m => MONTHS[m]).join("، ")}</div>
               <div className="text-xs text-base-content/50">أعياد ميلاد الأطفال في هذه الأشهر</div>
            </div>
            <div className="badge badge-primary badge-lg px-3 py-4 text-lg font-bold">
               {birthdayStudents.length}
            </div>
          </div>
        </div>

        {/* Birthday List */}
        {birthdayStudents.length === 0 ? (
          <Empty icon="🎂" message={`مافيش أعياد ميلاد متسجلة في الأشهر المحددة`} />
        ) : (
          <div className="flex flex-col gap-3">
            {birthdayStudents.map((s, i) => (
              <div
                key={s.qrId}
                className={`card border animate-fadeIn ${
                  s.isToday
                    ? "bg-gradient-to-r from-warning/10 to-primary/10 border-warning/40 shadow-lg"
                    : "bg-base-200 border-base-300"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="card-body p-4 gap-2">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {s.isToday && !s.image ? (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden relative"
                        style={{
                          background: (s.accent || "#6366f1") + "20",
                          border: `2px solid ${s.accent || "#6366f1"}`,
                          color: s.accent || "#6366f1",
                        }}
                      >
                        🎂
                      </div>
                    ) : (
                      <Avatar name={s.name} accent={s.accent} image={s.image} size="md" />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-base-content/40 font-mono">
                        {fmtDate(s.birthdate) || "لا يوجد تاريخ ميلاد"}
                      </div>
                    </div>

                    {/* Countdown Badge */}
                    {s.birthdate == null ? (
                      <div className="badge badge-ghost gap-1 text-xs px-3 py-3">
                        ❓
                      </div>
                    ) : s.isToday ? (
                      <div className="badge badge-warning gap-1 text-sm font-bold px-3 py-3 animate-pulse">
                        🎉 النهارده!
                      </div>
                    ) : s.daysLeft < 0 ? (
                      <div className="badge badge-ghost gap-1 text-xs px-3 py-3">
                        فات 🗓️
                      </div>
                    ) : (
                      <div
                        className="badge gap-1 text-sm font-bold px-3 py-3"
                        style={{
                          background: (s.accent || "#6366f1") + "15",
                          border: `1px solid ${(s.accent || "#6366f1")}30`,
                          color: s.accent || "#6366f1",
                        }}
                      >
                        ⏳ فاضل {s.daysLeft} {s.daysLeft === 1 ? "يوم" : "يوم"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
