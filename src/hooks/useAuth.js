import { useState, useEffect } from "react";
import { authStorage, sessionStore } from "../data/storage";
import { getGlobalAdminKeyFB, setGlobalAdminKeyFB, getUserFB, setUserFB } from "../services/firestoreService";
import { hashPassword, isHashed } from "../utils/crypto";

export function useAuth() {
  const [screen, setScreen] = useState("loading");
  const [currentUser, setCurrentUser] = useState(null); // { username, role, permissions }

  // On mount: decide the correct screen
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const remote = await getGlobalAdminKeyFB();
        if (cancelled) return;

        if (remote) {
          authStorage.set(remote);
          // Check if we have a saved session
          const savedSession = sessionStore.get();
          const savedUser = sessionStore.getUser();
          if (savedSession && savedUser) {
            setCurrentUser(savedUser);
            setScreen("app");
          } else {
            setScreen("login");
          }
        } else {
          setScreen("setup");
        }
      } catch (err) {
        console.error("Failed to check Firebase for account:", err);
        if (cancelled) return;
        if (authStorage.exists()) {
          const savedSession = sessionStore.get();
          const savedUser = sessionStore.getUser();
          if (savedSession && savedUser) {
            setCurrentUser(savedUser);
            setScreen("app");
          } else {
            setScreen("login");
          }
        } else {
          setScreen("setup");
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Login — tries admin first, then checks users collection
  const login = async (u, p) => {
    const inputHash = await hashPassword(p);
    const uTrimmed = u.trim().toLowerCase();

    // 1. Try admin login
    let a = null;
    try {
      a = await getGlobalAdminKeyFB();
      if (a) authStorage.set(a);
    } catch {
      a = authStorage.get();
    }

    if (a) {
      const adminMatch = uTrimmed === a.username.trim().toLowerCase();
      if (adminMatch) {
        let passOk = false;
        if (isHashed(a.password)) {
          passOk = inputHash === a.password;
        } else {
          if (p === a.password) {
            // Auto-migrate
            const migrated = { username: a.username, password: inputHash };
            authStorage.set(migrated);
            await setGlobalAdminKeyFB(a.username, inputHash).catch(console.error);
            passOk = true;
          }
        }
        if (passOk) {
          const user = { username: a.username, role: "admin", permissions: [] };
          setCurrentUser(user);
          sessionStore.set();
          sessionStore.setUser(user);
          setScreen("app");
          return true;
        }
      }
    }

    // 2. Try regular user login
    try {
      const userDoc = await getUserFB(uTrimmed);
      if (userDoc) {
        let passOk = false;
        if (isHashed(userDoc.password)) {
          passOk = inputHash === userDoc.password;
        } else {
          passOk = p === userDoc.password;
        }
        if (passOk) {
          const user = {
            username: userDoc.username,
            role: userDoc.role || "user",
            permissions: userDoc.permissions || [],
          };
          setCurrentUser(user);
          sessionStore.set();
          sessionStore.setUser(user);
          setScreen("app");
          return true;
        }
      }
    } catch (err) {
      console.error("Error checking user:", err);
    }

    return false;
  };

  const logout = () => {
    sessionStore.clear();
    setCurrentUser(null);
    setScreen("login");
  };

  // Setup — creates the very first admin account
  const setupAccount = async (u, p, s) => {
    try {
      const existing = await getGlobalAdminKeyFB();
      if (existing) {
        return { ok: false, error: "An account already exists. Please log in instead." };
      }
    } catch {
      // Offline — allow creation
    }

    const hashed = await hashPassword(p);
    const sHashed = await hashPassword(s);
    const data = { username: u, password: hashed, secretKeyHash: sHashed };
    authStorage.set(data);

    const user = { username: u, role: "admin", permissions: [] };
    setCurrentUser(user);
    sessionStore.set();
    sessionStore.setUser(user);

    setGlobalAdminKeyFB(u, hashed, sHashed).catch(console.error);
    setScreen("app");
    return { ok: true };
  };

  // Register — creates a regular user account
  const registerUser = async (u, p) => {
    const uLower = u.trim().toLowerCase();

    // Check if username is already taken (in users collection)
    try {
      const existing = await getUserFB(uLower);
      if (existing) {
        return { ok: false, error: "اسم المستخدم ده موجود بالفعل" };
      }
      // Also check if it matches the admin username
      const admin = await getGlobalAdminKeyFB();
      if (admin && admin.username.trim().toLowerCase() === uLower) {
        return { ok: false, error: "اسم المستخدم ده موجود بالفعل" };
      }
    } catch {
      // Offline — allow
    }

    const hashed = await hashPassword(p);
    const userData = {
      username: u.trim(),
      password: hashed,
      role: "user",
      permissions: [],
    };

    await setUserFB(uLower, userData).catch(console.error);

    // Auto-login after registration
    const user = { username: u.trim(), role: "user", permissions: [] };
    setCurrentUser(user);
    sessionStore.set();
    sessionStore.setUser(user);
    setScreen("app");
    return { ok: true };
  };

  const verifySecret = async (k) => {
    const remote = await getGlobalAdminKeyFB();
    if (!remote || !remote.secretKeyHash) return false;
    const inputHash = await hashPassword(k);
    return inputHash === remote.secretKeyHash;
  };

  const resetPassword = async (p) => {
    const hashed = await hashPassword(p);
    const a = await getGlobalAdminKeyFB();
    if (!a) return;
    const updated = { ...a, password: hashed };
    authStorage.set(updated);
    await setGlobalAdminKeyFB(updated.username, hashed).catch(console.error);
  };

  const updateSecretKey = async (s) => {
    const sHashed = await hashPassword(s);
    const a = await getGlobalAdminKeyFB();
    if (!a) return;
    await setGlobalAdminKeyFB(a.username, a.password, sHashed).catch(console.error);
  };

  const refreshUser = async () => {
    if (!currentUser || currentUser.role === "admin") return;
    try {
      const userDoc = await getUserFB(currentUser.username);
      if (userDoc) {
        const updatedUser = { ...currentUser, permissions: userDoc.permissions || [] };
        setCurrentUser(updatedUser);
        sessionStore.setUser(updatedUser);
      }
    } catch (e) {
      console.error("Failed to refresh user perms:", e);
    }
  };

  return {
    screen, setScreen, currentUser, setCurrentUser,
    login, logout, setupAccount, registerUser,
    verifySecret, resetPassword, refreshUser, updateSecretKey,
  };
}
