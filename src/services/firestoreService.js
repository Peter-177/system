import { db } from "../firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
} from "firebase/firestore";

// --- STUDENTS API --- //

export const addStudentFB = async (id, data) => {
  if (!db) return;
  await setDoc(doc(db, "students", id), data);
};

export const updateStudentFB = async (id, data) => {
  if (!db) return;
  await updateDoc(doc(db, "students", id), data);
};

export const deleteStudentFB = async (id) => {
  if (!db) return;
  await deleteDoc(doc(db, "students", id));
};

export const getStudentFB = async (id) => {
  if (!db) return null;
  const ds = await getDoc(doc(db, "students", id));
  if (ds.exists()) {
    return ds.data();
  }
  return null;
};

export const getAllStudentsFB = async () => {
  if (!db) return {};
  const querySnapshot = await getDocs(collection(db, "students"));
  const students = {};
  querySnapshot.forEach((doc) => {
    students[doc.id] = doc.data();
  });
  return students;
};

// --- ATTENDANCE API --- //

export const getAttendanceFB = async (studentId) => {
  if (!db) return [];
  const ds = await getDoc(doc(db, "attendance", studentId));
  if (ds.exists()) {
    return ds.data().log || [];
  }
  return [];
};

export const getAllAttendanceFB = async () => {
  if (!db) return {};
  const querySnapshot = await getDocs(collection(db, "attendance"));
  const attendance = {};
  querySnapshot.forEach((doc) => {
    attendance[doc.id] = doc.data().log || [];
  });
  return attendance;
};

export const addAttendanceFB = async (studentId, entry) => {
  if (!db) return;
  const ref = doc(db, "attendance", studentId);
  const ds = await getDoc(ref);
  if (!ds.exists()) {
    await setDoc(ref, { log: [entry] });
  } else {
    // We add to the beginning by updating the whole array or using arrayUnion
    // But arrayUnion adds to the end. The local version prepended (unshift).
    const log = ds.data().log || [];
    log.unshift(entry);
    await updateDoc(ref, { log });
  }
};

export const removeAttendanceFB = async (studentId, entryId) => {
  if (!db) return;
  const ref = doc(db, "attendance", studentId);
  const ds = await getDoc(ref);
  if (ds.exists()) {
    const log = ds.data().log || [];
    const newLog = log.filter(x => x.id !== entryId);
    await updateDoc(ref, { log: newLog });
  }
};

export const resetAttendanceFB = async (studentId) => {
  if (!db) return;
  await deleteDoc(doc(db, "attendance", studentId));
};

// --- COUPONS API --- //

export const getCouponsFB = async (studentId) => {
  if (!db) return [];
  const ds = await getDoc(doc(db, "coupons", studentId));
  if (ds.exists()) {
    return ds.data().log || [];
  }
  return [];
};

export const addCouponFB = async (studentId, entry) => {
  if (!db) return;
  const ref = doc(db, "coupons", studentId);
  const ds = await getDoc(ref);
  if (!ds.exists()) {
    await setDoc(ref, { log: [entry] });
  } else {
    const log = ds.data().log || [];
    log.push(entry);
    await updateDoc(ref, { log });
  }
};

export const removeCouponFB = async (studentId, entryId) => {
  if (!db) return;
  const ref = doc(db, "coupons", studentId);
  const ds = await getDoc(ref);
  if (ds.exists()) {
    const log = ds.data().log || [];
    const newLog = log.filter(x => x.id !== entryId);
    await updateDoc(ref, { log: newLog });
  }
};

export const resetCouponsFB = async (studentId) => {
  if (!db) return;
  await deleteDoc(doc(db, "coupons", studentId));
};

// --- VISITS API --- //

export const getAllVisitsFB = async () => {
  if (!db) return {};
  const querySnapshot = await getDocs(collection(db, "visits"));
  const visits = {};
  querySnapshot.forEach((doc) => {
    visits[doc.id] = doc.data().log || [];
  });
  return visits;
};

export const addVisitFB = async (studentId, entry) => {
  if (!db) return;
  const ref = doc(db, "visits", studentId);
  const ds = await getDoc(ref);
  if (!ds.exists()) {
    await setDoc(ref, { log: [entry] });
  } else {
    const log = ds.data().log || [];
    log.unshift(entry);
    await updateDoc(ref, { log });
  }
};

export const removeVisitFB = async (studentId, entryId) => {
  if (!db) return;
  const ref = doc(db, "visits", studentId);
  const ds = await getDoc(ref);
  if (ds.exists()) {
    const log = ds.data().log || [];
    const newLog = log.filter(x => x.id !== entryId);
    await updateDoc(ref, { log: newLog });
  }
};

export const resetVisitsFB = async (studentId) => {
  if (!db) return;
  await deleteDoc(doc(db, "visits", studentId));
};

// --- SYSTEM API --- //

export const getGlobalAdminKeyFB = async () => {
  if (!db) return null;
  const ds = await getDoc(doc(db, "system", "admin"));
  if (ds.exists()) {
    return ds.data();
  }
  return null;
};

export const setGlobalAdminKeyFB = async (username, password) => {
  if (!db) return;
  await setDoc(doc(db, "system", "admin"), { username, password });
};
