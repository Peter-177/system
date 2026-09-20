import { ACCENT_COLORS } from "../data/config";

export const randomAccent = () =>
  ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

export const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const buildAttendanceEntry = (customDate) => {
  const now = new Date();
  let target;
  if (customDate) {
    const [y, m, d] = customDate.split("-").map(Number);
    target = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
  } else {
    target = now;
  }

  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  const dateISO = `${y}-${m}-${d}`;

  return {
    id:        `${dateISO}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    recordId:  `${dateISO}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: `${dateISO}T${now.toTimeString().slice(0, 8)}`,
    date:      target.toLocaleDateString("ar-EG", {
      weekday: "long",
      year:    "numeric",
      month:   "long",
      day:     "numeric",
    }),
    time: now.toLocaleTimeString("en-US", {
      hour:   "2-digit",
      minute: "2-digit",
    }),
  };
};

export const registeredToday = (log, targetDate = todayISO()) =>
  Array.isArray(log) ? log.some((e) => e.timestamp && e.timestamp.slice(0, 10) === targetDate) : false;

export const registeredOnDate = registeredToday;

export const buildCouponEntry = (amount, customDate) => {
  const now = new Date();
  let ts;
  if (customDate) {
    ts = `${customDate}T${now.toTimeString().slice(0, 8)}`;
  } else {
    ts = now.toISOString();
  }
  return {
    id:        Date.now().toString() + Math.random().toString(36).slice(2, 6),
    amount,
    timestamp: ts,
  };
};

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

export const visitedToday = (log) =>
  log.some((e) => e.timestamp.slice(0, 10) === todayISO());

export const formatTime = (isoString) =>
  new Date(isoString).toLocaleTimeString("en-Us", {
    hour:   "2-digit",
    minute: "2-digit",
  });

export const getCroppedImg = (
  imageSrc,
  pixelCrop,
  maxSize = 400,
  mimeType = "image/png",
) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = pixelCrop;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // PNG: preserve transparency; JPEG: opaque (no white fill from alpha)
      if (mimeType === "image/png") {
        ctx.clearRect(0, 0, width, height);
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        width,
        height,
      );

      const out =
        mimeType === "image/jpeg"
          ? canvas.toDataURL("image/jpeg", 0.92)
          : canvas.toDataURL("image/png");
      resolve(out);
    };
    image.onerror = (error) => reject(error);
  });
};
