import { useState, useEffect, useMemo } from "react";
import { studentsDB } from "../data/storage";
import { Page, Navbar, Empty } from "../components/UI";

/**
 * Get days remaining until birthday this year/month.
 * Returns 0 if today IS the birthday.
 */
function daysUntilBirthday(birthdateStr) {
  const today = new Date();
  const bd = new Date(birthdateStr);
  // Build this year's birthday
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
  const [query, setQuery] = useState("");

  const today = new Date();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentDay = today.getDate();

  // Get all students with birthdays in the current month
  const birthdayStudents = useMemo(() => {
    const all = studentsDB.getAll();
    const result = [];

    Object.entries(all).forEach(([qrId, student]) => {
      if (!student.birthdate) return;
      const bd = new Date(student.birthdate);
      if (bd.getMonth() !== currentMonth) return;

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
  }, [currentMonth]);

  // Filter by search query — search across ALL students when typing
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return birthdayStudents;

    // Search all students, not just current month
    const all = studentsDB.getAll();
    const results = [];
    Object.entries(all).forEach(([qrId, student]) => {
      if (!student.name.toLowerCase().includes(q) && !qrId.toLowerCase().includes(q)) return;
      const bd = student.birthdate ? new Date(student.birthdate) : null;
      const days = student.birthdate ? daysUntilBirthday(student.birthdate) : null;
      results.push({
        qrId,
        ...student,
        birthdayDay: bd ? bd.getDate() : null,
        daysLeft: days,
        isToday: days === 0,
      });
    });
    results.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    return results;
  }, [query, birthdayStudents]);

  // Send notification for today's birthdays (once per page visit)
  useEffect(() => {
    if (notified) return;
    const todayBirthdays = birthdayStudents.filter((s) => s.isToday);
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
  }, [birthdayStudents, notified]);

  const monthName = today.toLocaleDateString("ar-EG", { month: "long" });

  return (
    <Page>
      <Navbar onBack={onBack} title="🎂 أعياد الميلاد" />

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-5 animate-slideUp">
        {/* Search Bar */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 بحث بالاسم..."
          className="input input-bordered w-full shadow-sm text-sm"
        />

        {/* Month Header */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-4 flex-row items-center justify-between">
            <div>
              <div className="text-lg font-bold">شهر {monthName}</div>
              <div className="text-xs text-base-content/40">
                أعياد ميلاد الأطفال في الشهر الحالي
              </div>
            </div>
            <div className="badge badge-primary badge-lg text-lg px-4">
              {birthdayStudents.length}
            </div>
          </div>
        </div>

        {/* Birthday List */}
        {filtered.length === 0 ? (
          <Empty icon="🎂" message="مافيش أعياد ميلاد في الشهر ده" />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((s, i) => (
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
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                      style={{
                        background: (s.accent || "#6366f1") + "20",
                        border: `2px solid ${s.accent || "#6366f1"}`,
                        color: s.accent || "#6366f1",
                      }}
                    >
                      {s.isToday ? "🎂" : s.name[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-base-content/40 font-mono">
                        {s.birthdate || "لا يوجد تاريخ ميلاد"}
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
