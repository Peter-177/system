import { ACCENT_COLORS } from "../data/config";

export const randomAccent = () =>
  ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

export const todayISO = () => new Date().toISOString().slice(0, 10);

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

export const registeredToday = (log) =>
  log.some((e) => e.timestamp.slice(0, 10) === todayISO());

export const buildCouponEntry = (amount) => ({
  id:        Date.now().toString(),
  amount,
  timestamp: new Date().toISOString(),
});

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

export const getCroppedImg = (imageSrc, pixelCrop, maxSize = 400) => {
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

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        width,
        height
      );

      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    image.onerror = (error) => reject(error);
  });
};
