import { useState, useEffect } from "react";
import { authStorage, sessionStore } from "../data/storage";
import { SECRET_RESET_KEY } from "../data/config";
import { getGlobalAdminKeyFB, setGlobalAdminKeyFB } from "../services/firestoreService";

export function useAuth() {
  const [screen, setScreen] = useState("loading");

  // On mount: decide the correct screen by checking localStorage first, then Firebase
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Fast path: credentials already cached locally
      if (authStorage.exists()) {
        if (!cancelled) setScreen(sessionStore.get() ? "app" : "login");
        return;
      }

      // Slow path: check Firebase for an existing account
      try {
        const remote = await getGlobalAdminKeyFB();
        if (cancelled) return;
        if (remote) {
          authStorage.set(remote); // cache locally for next time
          setScreen("login");
        } else {
          setScreen("setup"); // no account anywhere → allow creation
        }
      } catch (err) {
        console.error("Failed to check Firebase for account:", err);
        if (!cancelled) setScreen("setup"); // offline fallback
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const login = async (u, p) => {
    let a = authStorage.get();
    // Always try Firebase too (handles cross-device + stale cache)
    if (!a) {
      a = await getGlobalAdminKeyFB();
      if (a) {
        authStorage.set(a); // cache it locally
      }
    }
    if (!a) return false;
    // Case-insensitive username comparison so "peter" matches "Peter"
    if (u.trim().toLowerCase() === a.username.trim().toLowerCase() && p === a.password) {
      sessionStore.set();
      setScreen("app");
      return true;
    }
    // Local cache might be stale — try fetching fresh from Firebase
    const fresh = await getGlobalAdminKeyFB();
    if (fresh) {
      authStorage.set(fresh);
      if (u.trim().toLowerCase() === fresh.username.trim().toLowerCase() && p === fresh.password) {
        sessionStore.set();
        setScreen("app");
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    sessionStore.clear();
    setScreen("login");
  };

  // Returns { ok, error } — blocks creation if an account already exists in Firebase
  const setupAccount = async (u, p) => {
    try {
      const existing = await getGlobalAdminKeyFB();
      if (existing) {
        // Account already exists — don't allow a second one
        return { ok: false, error: "An account already exists. Please log in instead." };
      }
    } catch {
      // If we can't reach Firebase, allow creation (offline-first)
    }

    const data = { username: u, password: p };
    authStorage.set(data);
    sessionStore.set();
    setGlobalAdminKeyFB(u, p).catch(console.error); // sync to Firebase
    setScreen("app");
    return { ok: true };
  };

  const verifySecret = (k) => k.trim() === SECRET_RESET_KEY;
  const resetPassword = (p) => {
    const updated = { ...authStorage.get(), password: p };
    authStorage.set(updated);
    setGlobalAdminKeyFB(updated.username, p).catch(console.error); // sync to Firebase
  };

  return { screen, setScreen, login, logout, setupAccount, verifySecret, resetPassword };
}
