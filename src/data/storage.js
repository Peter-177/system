import { STORAGE_KEYS } from "./config";
import {
  addStudentFB, updateStudentFB, deleteStudentFB,
  addAttendanceFB, removeAttendanceFB, resetAttendanceFB,
  addCouponFB, removeCouponFB, resetCouponsFB,
  getAllStudentsFB, getAllAttendanceFB
} from "../services/firestoreService";

const load = (key, fb) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fb;
  } catch {
    return fb;
  }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const authStorage = {
  get: () => load(STORAGE_KEYS.auth, null),
  set: (d) => save(STORAGE_KEYS.auth, d),
  exists: () => !!localStorage.getItem(STORAGE_KEYS.auth),
};

export const sessionStore = {
  get: () => !!sessionStorage.getItem(STORAGE_KEYS.session),
  set: () => sessionStorage.setItem(STORAGE_KEYS.session, "1"),
  clear: () => sessionStorage.removeItem(STORAGE_KEYS.session),
};

export const studentsDB = {
  getAll: () => load(STORAGE_KEYS.students, {}),
  get: (id) => load(STORAGE_KEYS.students, {})[id] ?? null,
  exists: (id) => !!load(STORAGE_KEYS.students, {})[id],
  set: (id, d) => {
    const a = load(STORAGE_KEYS.students, {});
    a[id] = d;
    save(STORAGE_KEYS.students, a);
    addStudentFB(id, d).catch(console.error); // FB sync
  },
  update: (id, d) => {
    const a = load(STORAGE_KEYS.students, {});
    a[id] = { ...a[id], ...d };
    save(STORAGE_KEYS.students, a);
    updateStudentFB(id, d).catch(console.error); // FB sync
  },
  remove: (id) => {
    const a = load(STORAGE_KEYS.students, {});
    delete a[id];
    save(STORAGE_KEYS.students, a);
    deleteStudentFB(id).catch(console.error); // FB sync
  },
};

export const attendanceDB = {
  getAll: () => load(STORAGE_KEYS.attendance, {}),
  get: (sid) => load(STORAGE_KEYS.attendance, {})[sid] ?? [],
  add: (sid, e) => {
    const a = load(STORAGE_KEYS.attendance, {});
    if (!a[sid]) a[sid] = [];
    a[sid].unshift(e);
    save(STORAGE_KEYS.attendance, a);
    addAttendanceFB(sid, e).catch(console.error); // FB sync
  },
  remove: (sid, eid) => {
    const a = load(STORAGE_KEYS.attendance, {});
    a[sid] = (a[sid] ?? []).filter((x) => x.id !== eid);
    save(STORAGE_KEYS.attendance, a);
    removeAttendanceFB(sid, eid).catch(console.error); // FB sync
  },
  removeAll: (sid) => {
    const a = load(STORAGE_KEYS.attendance, {});
    delete a[sid];
    save(STORAGE_KEYS.attendance, a);
    resetAttendanceFB(sid).catch(console.error); // FB sync
  },
};

export const couponsDB = {
  get: (sid) => load(STORAGE_KEYS.coupons, {})[sid] ?? [],
  add: (sid, e) => {
    const c = load(STORAGE_KEYS.coupons, {});
    if (!c[sid]) c[sid] = [];
    c[sid].push(e);
    save(STORAGE_KEYS.coupons, c);
    addCouponFB(sid, e).catch(console.error); // FB sync
  },
  remove: (sid, eid) => {
    const c = load(STORAGE_KEYS.coupons, {});
    c[sid] = (c[sid] ?? []).filter((x) => x.id !== eid);
    save(STORAGE_KEYS.coupons, c);
    removeCouponFB(sid, eid).catch(console.error); // FB sync
  },
  reset: (sid) => {
    const c = load(STORAGE_KEYS.coupons, {});
    c[sid] = [];
    save(STORAGE_KEYS.coupons, c);
    resetCouponsFB(sid).catch(console.error); // FB sync
  },
};

export const syncFromFirebase = async () => {
  try {
    const students = await getAllStudentsFB();
    const attendance = await getAllAttendanceFB();
    // Assuming coupons could be mapped similarly if we wrote `getAllCouponsFB`
    // but for now, syncing students and attendance is the priority.
    if (Object.keys(students).length > 0) save(STORAGE_KEYS.students, students);
    if (Object.keys(attendance).length > 0) save(STORAGE_KEYS.attendance, attendance);
    return true;
  } catch (error) {
    console.error("Failed to sync from Firebase:", error);
    return false;
  }
};
