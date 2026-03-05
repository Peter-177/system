import { useState } from "react";
import { authStorage, sessionStore } from "../data/storage";
import { SECRET_RESET_KEY } from "../data/config";
import { getGlobalAdminKeyFB, setGlobalAdminKeyFB } from "../services/firestoreService";

export function useAuth() {
  const [screen, setScreen] = useState(() => {
    if (!authStorage.exists()) return "setup";
    if (sessionStore.get()) return "app";
    return "login";
  });

  const login = async (u, p) => {
    let a = authStorage.get();
    // If no local account, try fetching from Firebase (cross-device login)
    if (!a) {
      a = await getGlobalAdminKeyFB();
      if (a) {
        authStorage.set(a); // cache it locally
      }
    }
    if (!a) return false;
    if (u === a.username && p === a.password) {
      sessionStore.set();
      setScreen("app");
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStore.clear();
    setScreen("login");
  };

  const setupAccount = (u, p) => {
    const data = { username: u, password: p };
    authStorage.set(data);
    sessionStore.set();
    setGlobalAdminKeyFB(u, p).catch(console.error); // sync to Firebase
    setScreen("app");
  };

  const verifySecret = (k) => k.trim() === SECRET_RESET_KEY;
  const resetPassword = (p) => {
    const updated = { ...authStorage.get(), password: p };
    authStorage.set(updated);
    setGlobalAdminKeyFB(updated.username, p).catch(console.error); // sync to Firebase
  };

  return { screen, setScreen, login, logout, setupAccount, verifySecret, resetPassword };
}
