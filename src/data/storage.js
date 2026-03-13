import { STORAGE_KEYS } from "./config";
import {
  addStudentFB, updateStudentFB, deleteStudentFB,
  addAttendanceFB, removeAttendanceFB, resetAttendanceFB,
  addCouponFB, removeCouponFB, resetCouponsFB,
  addVisitFB, removeVisitFB, resetVisitsFB,
  getAllStudentsFB, getAllAttendanceFB, getAllVisitsFB,
  getAllClassesFB, setClassFB, deleteClassFB,
  getAppSettingsFB, setAppSettingsFB
} from "../services/firestoreService";

// ── In-memory data store (populated from Firebase on startup) ──
const mem = {
  [STORAGE_KEYS.students]:   {},
  [STORAGE_KEYS.attendance]: {},
  [STORAGE_KEYS.coupons]:    {},
  [STORAGE_KEYS.visits]:     {},
  [STORAGE_KEYS.classes]:    {},
  [STORAGE_KEYS.settings]:   {
    nameTop: "SUNDAY",
    nameBottom: "SCHOOL",
    icon: "⛪"
  },
};

const loadMem = (key, fb) => mem[key] ?? fb;
const saveMem = (key, val) => { mem[key] = val; };

// ── Auth & Session (kept in localStorage/sessionStorage) ──
const loadLocal = (key, fb) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fb; }
  catch { return fb; }
};

export const authStorage = {
  get: () => loadLocal(STORAGE_KEYS.auth, null),
  set: (d) => localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(d)),
  exists: () => !!localStorage.getItem(STORAGE_KEYS.auth),
};

export const sessionStore = {
  get: () => !!sessionStorage.getItem(STORAGE_KEYS.session),
  set: () => sessionStorage.setItem(STORAGE_KEYS.session, "1"),
  clear: () => {
    sessionStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  },
  getUser: () => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.currentUser)); }
    catch { return null; }
  },
  setUser: (u) => sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(u)),
};

// ── Students (Firebase-only) ──
export const studentsDB = {
  getAll: () => loadMem(STORAGE_KEYS.students, {}),
  get: (id) => loadMem(STORAGE_KEYS.students, {})[id] ?? null,
  exists: (id) => !!loadMem(STORAGE_KEYS.students, {})[id],
  set: (id, d) => {
    const a = loadMem(STORAGE_KEYS.students, {});
    a[id] = d;
    saveMem(STORAGE_KEYS.students, a);
    addStudentFB(id, d).catch(console.error);
  },
  update: (id, d) => {
    const a = loadMem(STORAGE_KEYS.students, {});
    a[id] = { ...a[id], ...d };
    saveMem(STORAGE_KEYS.students, a);
    updateStudentFB(id, d).catch(console.error);
  },
  remove: (id) => {
    const a = loadMem(STORAGE_KEYS.students, {});
    delete a[id];
    saveMem(STORAGE_KEYS.students, a);
    deleteStudentFB(id).catch(console.error);
  },
};

// ── Attendance (Firebase-only) ──
export const attendanceDB = {
  getAll: () => loadMem(STORAGE_KEYS.attendance, {}),
  get: (sid) => loadMem(STORAGE_KEYS.attendance, {})[sid] ?? [],
  add: (sid, e) => {
    const a = loadMem(STORAGE_KEYS.attendance, {});
    if (!a[sid]) a[sid] = [];
    a[sid].unshift(e);
    saveMem(STORAGE_KEYS.attendance, a);
    addAttendanceFB(sid, e).catch(console.error);
  },
  remove: (sid, eid) => {
    const a = loadMem(STORAGE_KEYS.attendance, {});
    a[sid] = (a[sid] ?? []).filter((x) => x.id !== eid);
    saveMem(STORAGE_KEYS.attendance, a);
    removeAttendanceFB(sid, eid).catch(console.error);
  },
  removeAll: (sid) => {
    const a = loadMem(STORAGE_KEYS.attendance, {});
    delete a[sid];
    saveMem(STORAGE_KEYS.attendance, a);
    resetAttendanceFB(sid).catch(console.error);
  },
};

// ── Coupons (Firebase-only) ──
export const couponsDB = {
  get: (sid) => loadMem(STORAGE_KEYS.coupons, {})[sid] ?? [],
  add: (sid, e) => {
    const c = loadMem(STORAGE_KEYS.coupons, {});
    if (!c[sid]) c[sid] = [];
    c[sid].push(e);
    saveMem(STORAGE_KEYS.coupons, c);
    addCouponFB(sid, e).catch(console.error);
  },
  remove: (sid, eid) => {
    const c = loadMem(STORAGE_KEYS.coupons, {});
    c[sid] = (c[sid] ?? []).filter((x) => x.id !== eid);
    saveMem(STORAGE_KEYS.coupons, c);
    removeCouponFB(sid, eid).catch(console.error);
  },
  reset: (sid) => {
    const c = loadMem(STORAGE_KEYS.coupons, {});
    c[sid] = [];
    saveMem(STORAGE_KEYS.coupons, c);
    resetCouponsFB(sid).catch(console.error);
  },
};

// ── Visits (Firebase-only) ──
export const visitsDB = {
  getAll: () => loadMem(STORAGE_KEYS.visits, {}),
  get: (sid) => loadMem(STORAGE_KEYS.visits, {})[sid] ?? [],
  add: (sid, e) => {
    const a = loadMem(STORAGE_KEYS.visits, {});
    if (!a[sid]) a[sid] = [];
    a[sid].unshift(e);
    saveMem(STORAGE_KEYS.visits, a);
    addVisitFB(sid, e).catch(console.error);
  },
  remove: (sid, eid) => {
    const a = loadMem(STORAGE_KEYS.visits, {});
    a[sid] = (a[sid] ?? []).filter((x) => x.id !== eid);
    saveMem(STORAGE_KEYS.visits, a);
    removeVisitFB(sid, eid).catch(console.error);
  },
  removeAll: (sid) => {
    const a = loadMem(STORAGE_KEYS.visits, {});
    delete a[sid];
    saveMem(STORAGE_KEYS.visits, a);
    resetVisitsFB(sid).catch(console.error);
  },
};

// ── Classes (Firebase-only) ──
export const classesDB = {
  getAll: () => loadMem(STORAGE_KEYS.classes, {}),
  get: (id) => loadMem(STORAGE_KEYS.classes, {})[id] ?? null,
  set: (id, data) => {
    const a = loadMem(STORAGE_KEYS.classes, {});
    a[id] = data;
    saveMem(STORAGE_KEYS.classes, a);
    setClassFB(id, data).catch(console.error);
  },
  remove: (id) => {
    const a = loadMem(STORAGE_KEYS.classes, {});
    delete a[id];
    saveMem(STORAGE_KEYS.classes, a);
    deleteClassFB(id).catch(console.error);
  },
};

// ── Settings (Global App Settings) ──
export const settingsDB = {
  get: () => loadMem(STORAGE_KEYS.settings, {
    nameTop: "SUNDAY",
    nameBottom: "SCHOOL",
    icon: "⛪"
  }),
  set: (data) => {
    const s = { ...settingsDB.get(), ...data };
    saveMem(STORAGE_KEYS.settings, s);
    setAppSettingsFB(s).catch(console.error);
  },
};
export const syncFromFirebase = async () => {
  try {
    const students = await getAllStudentsFB();
    const attendance = await getAllAttendanceFB();
    const visits = await getAllVisitsFB();
    const classes = await getAllClassesFB();
    const settings = await getAppSettingsFB();
    
    saveMem(STORAGE_KEYS.students, students);
    saveMem(STORAGE_KEYS.attendance, attendance);
    saveMem(STORAGE_KEYS.visits, visits);
    saveMem(STORAGE_KEYS.classes, classes);
    if (settings) saveMem(STORAGE_KEYS.settings, settings);
    return true;
  } catch (error) {
    console.error("Failed to sync from Firebase:", error);
    return false;
  }
};

// ── Migration: Change Student ID ──
// Moves a student's data across all 4 collections (students, attendance, visits, coupons)
// to a new ID, then deletes the old one. Returns true if successful, false if newId exists.
export const changeStudentId = async (oldId, newId) => {
  if (studentsDB.exists(newId)) {
    return false; // Cannot overwrite another student!
  }

  // 1. Get all current data
  const student = studentsDB.get(oldId);
  const attendance = attendanceDB.get(oldId);
  const visits = visitsDB.get(oldId);
  const coupons = couponsDB.get(oldId);

  if (!student) return false;

  // 2. Write to new ID
  studentsDB.set(newId, student);
  if (attendance.length > 0) {
    // Write directly to Firebase and Memory to bypass `add` unshift
    const memAtt = loadMem(STORAGE_KEYS.attendance, {});
    memAtt[newId] = attendance;
    saveMem(STORAGE_KEYS.attendance, memAtt);
    
    // Reverse it because addAttendanceFB unshifts each entry individually
    for (const e of [...attendance].reverse()) {
      await addAttendanceFB(newId, e).catch(console.error);
    }
  }
  if (visits.length > 0) {
    const memVis = loadMem(STORAGE_KEYS.visits, {});
    memVis[newId] = visits;
    saveMem(STORAGE_KEYS.visits, memVis);
    
    for (const e of [...visits].reverse()) {
      await visitsDB.add(newId, e); // addVisitFB does unshift
    }
  }
  if (coupons.length > 0) {
    const memCoup = loadMem(STORAGE_KEYS.coupons, {});
    memCoup[newId] = coupons;
    saveMem(STORAGE_KEYS.coupons, memCoup);
    
    for (const e of coupons) {
      await couponsDB.add(newId, e);
    }
  }

  // 3. Delete old ID
  studentsDB.remove(oldId);
  attendanceDB.removeAll(oldId);
  visitsDB.removeAll(oldId);
  couponsDB.reset(oldId);

  return true;
};
