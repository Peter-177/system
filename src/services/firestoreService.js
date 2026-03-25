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
    const data = doc.data();
    const sid = data.sid || doc.id; // Use stored sid or fallback to doc id
    attendance[sid] = data.log || [];
  });
  return attendance;
};

export const addAttendanceFB = async (studentId, entry, originalSid) => {
  if (!db) return;
  const ref = doc(db, "attendance", studentId);
  const ds = await getDoc(ref);
  if (!ds.exists()) {
    await setDoc(ref, { 
      sid: originalSid || studentId, 
      log: [entry] 
    });
  } else {
    const log = ds.data().log || [];
    log.unshift(entry);
    await updateDoc(ref, { 
      sid: originalSid || ds.data().sid || studentId,
      log 
    });
  }
};

export const removeAttendanceFB = async (studentId, entryId) => {
  if (!db) return;
  const ref = doc(db, "attendance", studentId);
  const ds = await getDoc(ref);
  if (ds.exists()) {
    const log = ds.data().log || [];
    const newLog = log.filter(x => (x.recordId || x.id) !== entryId);
    await updateDoc(ref, { log: newLog });
  }
};

export const resetAttendanceFB = async (studentId) => {
  if (!db) return;
  await deleteDoc(doc(db, "attendance", studentId));
};

// --- SUMMER ATTENDANCE API --- //

export const getAllSummerAttendanceFB = async () => {
  if (!db) return {};
  const querySnapshot = await getDocs(collection(db, "summerAttendance"));
  const attendance = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const sid = data.sid || doc.id;
    attendance[sid] = data.log || [];
  });
  return attendance;
};

export const addSummerAttendanceFB = async (studentId, entry, originalSid) => {
  if (!db) return;
  const ref = doc(db, "summerAttendance", studentId);
  const ds = await getDoc(ref);
  if (!ds.exists()) {
    await setDoc(ref, { 
      sid: originalSid || studentId,
      log: [entry] 
    });
  } else {
    const log = ds.data().log || [];
    log.unshift(entry);
    await updateDoc(ref, { 
      sid: originalSid || ds.data().sid || studentId,
      log 
    });
  }
};

export const removeSummerAttendanceFB = async (studentId, entryId) => {
  if (!db) return;
  const ref = doc(db, "summerAttendance", studentId);
  const ds = await getDoc(ref);
  if (ds.exists()) {
    const log = ds.data().log || [];
    const newLog = log.filter(x => (x.recordId || x.id) !== entryId);
    await updateDoc(ref, { log: newLog });
  }
};

export const resetSummerAttendanceFB = async (studentId) => {
  if (!db) return;
  await deleteDoc(doc(db, "summerAttendance", studentId));
};


export const getAllCouponsFB = async () => {
  if (!db) return {};
  const querySnapshot = await getDocs(collection(db, "coupons"));
  const coupons = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const sid = data.sid || doc.id;
    coupons[sid] = data.log || [];
  });
  return coupons;
};

export const getCouponsFB = async (studentId) => {
  if (!db) return [];
  const ds = await getDoc(doc(db, "coupons", studentId));
  if (ds.exists()) {
    return ds.data().log || [];
  }
  return [];
};

export const addCouponFB = async (studentId, entry, originalSid) => {
  if (!db) return;
  const ref = doc(db, "coupons", studentId);
  const ds = await getDoc(ref);
  if (!ds.exists()) {
    await setDoc(ref, { 
      sid: originalSid || studentId,
      log: [entry] 
    });
  } else {
    const log = ds.data().log || [];
    log.push(entry);
    await updateDoc(ref, { 
      sid: originalSid || ds.data().sid || studentId,
      log 
    });
  }
};

export const removeCouponFB = async (studentId, entryId) => {
  if (!db) return;
  const ref = doc(db, "coupons", studentId);
  const ds = await getDoc(ref);
  if (ds.exists()) {
    const log = ds.data().log || [];
    // Check both recordId and id for compatibility
    const newLog = log.filter(x => (x.recordId || x.id) !== entryId);
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
    const data = doc.data();
    const sid = data.sid || doc.id;
    visits[sid] = data.log || [];
  });
  return visits;
};

export const addVisitFB = async (studentId, entry, originalSid) => {
  if (!db) return;
  const ref = doc(db, "visits", studentId);
  const ds = await getDoc(ref);
  if (!ds.exists()) {
    await setDoc(ref, { 
      sid: originalSid || studentId,
      log: [entry] 
    });
  } else {
    const log = ds.data().log || [];
    log.unshift(entry);
    await updateDoc(ref, { 
      sid: originalSid || ds.data().sid || studentId,
      log 
    });
  }
};

export const removeVisitFB = async (studentId, entryId) => {
  if (!db) return;
  const ref = doc(db, "visits", studentId);
  const ds = await getDoc(ref);
  if (ds.exists()) {
    const log = ds.data().log || [];
    // Check both recordId and id for compatibility
    const newLog = log.filter(x => (x.recordId || x.id) !== entryId);
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

export const setGlobalAdminKeyFB = async (username, password, secretKeyHash = null) => {
  if (!db) return;
  const data = { username, password };
  if (secretKeyHash) data.secretKeyHash = secretKeyHash;
  await setDoc(doc(db, "system", "admin"), data, { merge: true });
};

export const getAppSettingsFB = async () => {
  if (!db) return null;
  const ds = await getDoc(doc(db, "system", "settings"));
  return ds.exists() ? ds.data() : null;
};

export const setAppSettingsFB = async (data) => {
  if (!db) return;
  await setDoc(doc(db, "system", "settings"), data, { merge: true });
};

// --- USERS API --- //

export const getUserFB = async (username) => {
  if (!db) return null;
  const ds = await getDoc(doc(db, "users", username.toLowerCase()));
  return ds.exists() ? ds.data() : null;
};

export const setUserFB = async (username, data) => {
  if (!db) return;
  await setDoc(doc(db, "users", username.toLowerCase()), data);
};

export const getAllUsersFB = async () => {
  if (!db) return {};
  const snap = await getDocs(collection(db, "users"));
  const users = {};
  snap.forEach((d) => { users[d.id] = d.data(); });
  return users;
};

export const updateUserPermissionsFB = async (username, permissions) => {
  if (!db) return;
  const role = permissions.includes("perm_admin") ? "admin" : "user";
  await updateDoc(doc(db, "users", username.toLowerCase()), { 
    permissions,
    role 
  });
};

export const deleteUserFB = async (username) => {
  if (!db) return;
  await deleteDoc(doc(db, "users", username.toLowerCase()));
};

// --- CLASSES API --- //

export const getClassFB = async (classId) => {
  if (!db) return null;
  const ds = await getDoc(doc(db, "classes", classId));
  return ds.exists() ? ds.data() : null;
};

export const setClassFB = async (classId, data) => {
  if (!db) return;
  await setDoc(doc(db, "classes", classId), data);
};

export const getAllClassesFB = async () => {
  if (!db) return {};
  const snap = await getDocs(collection(db, "classes"));
  const classes = {};
  snap.forEach((d) => { 
    const data = d.data();
    const id = data.id || d.id; // Correctly map back to internal ID
    classes[id] = data; 
  });
  return classes;
};

export const deleteClassFB = async (classId) => {
  if (!db) return;
  await deleteDoc(doc(db, "classes", classId));
};
