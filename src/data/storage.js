import { STORAGE_KEYS } from "./config";
import {
  addStudentFB, updateStudentFB, deleteStudentFB,
  addAttendanceFB, removeAttendanceFB, resetAttendanceFB,
  addCouponFB, removeCouponFB, resetCouponsFB,
  addVisitFB, removeVisitFB, resetVisitsFB,
  getAllStudentsFB, getAllAttendanceFB, getAllVisitsFB
} from "../services/firestoreService";

// ── In-memory data store (populated from Firebase on startup) ──
const mem = {
  [STORAGE_KEYS.students]:   {},
  [STORAGE_KEYS.attendance]: {},
  [STORAGE_KEYS.coupons]:    {},
  [STORAGE_KEYS.visits]:     {},
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
  clear: () => sessionStorage.removeItem(STORAGE_KEYS.session),
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

// ── Sync: Fetch everything from Firebase into memory ──
export const syncFromFirebase = async () => {
  try {
    const students = await getAllStudentsFB();
    const attendance = await getAllAttendanceFB();
    const visits = await getAllVisitsFB();
    // Always overwrite in-memory cache with Firebase data
    saveMem(STORAGE_KEYS.students, students);
    saveMem(STORAGE_KEYS.attendance, attendance);
    saveMem(STORAGE_KEYS.visits, visits);
    return true;
  } catch (error) {
    console.error("Failed to sync from Firebase:", error);
    return false;
  }
};
