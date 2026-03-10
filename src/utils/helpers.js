
import { ACCENT_COLORS } from "../data/config";

/** بيجيب لون عشوائي من قائمة الألوان */
export const randomAccent = () =>
  ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

/** بيحول التاريخ الحالي لـ YYYY-MM-DD */
export const todayISO = () => new Date().toISOString().slice(0, 10);

/** بيعمل entry جديد للحضور */
export const buildAttendanceEntry = () => {
  const now = new Date();
  return {
    id:        now.toISOString(),
    timestamp: now.toISOString(),
    date:      now.toLocaleDateString("ar-EG", {
      weekday: "long",
      year:    "numeric",
      month:   "long",
      day:     "numeric",
    }),
    time: now.toLocaleTimeString("en-Us", {
      hour:   "2-digit",
      minute: "2-digit",
    }),
  };
};

/** بيتحقق إن الطالب اتسجل النهارده */
export const registeredToday = (log) =>
  log.some((e) => e.timestamp.slice(0, 10) === todayISO());

/** بيعمل entry جديد للكوبون */
export const buildCouponEntry = (amount) => ({
  id:        Date.now().toString(),
  amount,
  timestamp: new Date().toISOString(),
});

/** بيعمل entry جديد للزيارة */
export const buildVisitEntry = () => {
  const now = new Date();
  return {
    id:        now.toISOString(),
    timestamp: now.toISOString(),
    date:      now.toLocaleDateString("ar-EG", {
      weekday: "long",
      year:    "numeric",
      month:   "long",
      day:     "numeric",
    }),
    time: now.toLocaleTimeString("en-Us", {
      hour:   "2-digit",
      minute: "2-digit",
    }),
  };
};

/** بيتحقق إن الطفل اتزار النهارده */
export const visitedToday = (log) =>
  log.some((e) => e.timestamp.slice(0, 10) === todayISO());

/** بيجيب وقت من ISO timestamp بالعربي */
export const formatTime = (isoString) =>
  new Date(isoString).toLocaleTimeString("en-Us", {
    hour:   "2-digit",
    minute: "2-digit",
  });
