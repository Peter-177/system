import { useState, useEffect } from "react";
import { authStorage, sessionStore } from "../data/storage";
import { SECRET_RESET_KEY } from "../data/config";
import { getGlobalAdminKeyFB, setGlobalAdminKeyFB } from "../services/firestoreService";
import { hashPassword, isHashed } from "../utils/crypto";

export function useAuth() {
  const [screen, setScreen] = useState("loading");

  // On mount: decide the correct screen by checking Firebase first
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const remote = await getGlobalAdminKeyFB();
        if (cancelled) return;

        if (remote) {
          // Admin account exists in Firebase → go to login
          authStorage.set(remote); // always sync latest from Firebase
          setScreen(sessionStore.get() ? "app" : "login");
        } else {
          // No account in Firebase → allow creation
          setScreen("setup");
        }
      } catch (err) {
        console.error("Failed to check Firebase for account:", err);
        if (cancelled) return;
        // Offline fallback: check localStorage
        if (authStorage.exists()) {
          setScreen(sessionStore.get() ? "app" : "login");
        } else {
          setScreen("setup");
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const login = async (u, p) => {
    // Always fetch fresh credentials from Firebase (cross-device support)
    let a = null;
    try {
      a = await getGlobalAdminKeyFB();
      if (a) authStorage.set(a); // update local cache
    } catch {
      // Firebase unreachable — fall back to local cache
      a = authStorage.get();
    }

    if (!a) return false;

    const inputHash = await hashPassword(p);

    // Case-insensitive username comparison
    const usernameMatch = u.trim().toLowerCase() === a.username.trim().toLowerCase();

    if (usernameMatch) {
      if (isHashed(a.password)) {
        // Modern path: compare hashes
        if (inputHash === a.password) {
          sessionStore.set();
          setScreen("app");
          return true;
        }
      } else {
        // Migration path: stored password is plaintext
        if (p === a.password) {
          // Auto-migrate to hashed password
          const migrated = { username: a.username, password: inputHash };
          authStorage.set(migrated);
          await setGlobalAdminKeyFB(a.username, inputHash).catch(console.error);
          sessionStore.set();
          setScreen("app");
          return true;
        }
      }
    }

    return false;
  };

  const logout = () => {
    sessionStore.clear();
    setScreen("login");
  };

  // Returns { ok, error } — blocks creation if an account already exists
  const setupAccount = async (u, p) => {
    try {
      const existing = await getGlobalAdminKeyFB();
      if (existing) {
        return { ok: false, error: "An account already exists. Please log in instead." };
      }
    } catch {
      // Offline — allow creation
    }

    const hashed = await hashPassword(p);
    const data = { username: u, password: hashed };
    authStorage.set(data);
    sessionStore.set();
    setGlobalAdminKeyFB(u, hashed).catch(console.error);
    setScreen("app");
    return { ok: true };
  };

  const verifySecret = (k) => k.trim() === SECRET_RESET_KEY;

  const resetPassword = async (p) => {
    const hashed = await hashPassword(p);
    const current = authStorage.get();
    const updated = { ...current, password: hashed };
    authStorage.set(updated);
    await setGlobalAdminKeyFB(updated.username, hashed).catch(console.error);
  };

  return { screen, setScreen, login, logout, setupAccount, verifySecret, resetPassword };
}
