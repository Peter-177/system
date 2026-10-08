import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  X,
  LogOut,
  Menu,
  Home,
  Waves,
  Layout,
  Search,
  Settings,
  Award,
} from "lucide-react";
import { settingsDB } from "../../data/storage";
import { useNavbarScroll } from "../../hooks/useNavbarScroll";

/**
 * @typedef {Object} ModernNavbarProps
 * @property {import('../../types/index.d.ts').User}  currentUser
 * @property {() => void} onLogout
 * @property {() => void} onGoHome
 * @property {() => void} onGoClasses
 * @property {() => void} onGoSearch
 * @property {() => void} onGoSummer
 * @property {() => void} [onGoCheck]
 * @property {() => void} [onGoAdmin]
 * @property {'home'|'summer'|'classes'|'search'|'check'|'admin'} [activePage]
 */

/**
 * LogoutConfirmDialog — rendered in-place when the user clicks Sign Out.
 * Separate sub-component so ModernNavbar stays under 150 lines.
 */
function LogoutConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 sm:p-8"
      dir="rtl"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-8 sm:p-12 text-center animate-reveal relative overflow-hidden">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-4xl sm:text-5xl mx-auto mb-8 sm:mb-10 shadow-2xl">
          🚪
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-sky-50 mb-4 tracking-tighter">
          عايز تخرج؟
        </h3>
        <p className="text-slate-500 font-bold mb-10 sm:mb-12 uppercase tracking-widest text-xs opacity-60">
          هل أنت متأكد من تسجيل الخروج؟
        </p>
        <div className="flex flex-col gap-3 sm:gap-4">
          <button
            onClick={onConfirm}
            className="w-full h-14 sm:h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-base sm:text-lg transition-all active:scale-95 shadow-2xl shadow-red-500/20"
          >
            تأكيد الخروج
          </button>
          <button
            onClick={onCancel}
            className="w-full h-14 sm:h-16 bg-slate-800 text-slate-400 rounded-2xl font-bold transition-all hover:bg-slate-700"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * MobileMenuOverlay — full-screen nav drawer shown on small screens.
 */
function MobileMenuOverlay({ navLinks, onLogout, onClose }) {
  return (
    <div
      className="fixed inset-0 top-0 z-[150] bg-slate-950/95 backdrop-blur-3xl md:hidden animate-reveal pt-24 pb-safe px-4 sm:px-8 overflow-y-auto"
      dir="rtl"
    >
      <div className="flex flex-col gap-4">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => { link.onClick(); onClose(); }}
            className="flex items-center justify-between p-5 sm:p-6 bg-slate-900 border border-white/5 rounded-[2rem] text-right group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-11 h-11 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400 shrink-0">
                {React.cloneElement(link.icon, { size: 22 })}
              </div>
              <span className="text-lg sm:text-xl font-black text-sky-50">
                {link.label}
              </span>
            </div>
            <ChevronLeft className="text-slate-600 shrink-0" aria-hidden="true" />
          </button>
        ))}

        {/* Logout row */}
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="flex items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-500 font-black text-lg sm:text-xl"
        >
          <LogOut size={22} aria-hidden="true" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

/**
 * ModernNavbar — fixed top navigation bar with responsive mobile drawer.
 * @property {boolean} [hidden]
 */
export function ModernNavbar({
  currentUser,
  onLogout,
  onGoHome,
  onGoClasses,
  onGoSearch,
  onGoSummer,
  onGoCheck,
  onGoAdmin,
  activePage = "home",
  hidden = false,
}) {
  const isScrolled = useNavbarScroll(40);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const settings = settingsDB.get();

  useEffect(() => {
    if (hidden && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [hidden, isMenuOpen]);

  const navLinks = [
    { label: "الرئيسية",    id: "home",    onClick: onGoHome,    icon: <Home /> },
    { label: "النادي الصيفي", id: "summer",  onClick: onGoSummer,  icon: <Waves /> },
    { label: "الفصول",      id: "classes", onClick: onGoClasses,  icon: <Layout /> },
    { label: "البحث",       id: "search",  onClick: onGoSearch,   icon: <Search /> },
    ...(currentUser?.role === "admin"
      ? [{ label: "الإعدادات", id: "admin", onClick: onGoAdmin, icon: <Settings /> }]
      : []),
  ];

  // Suppress activePage warning — prop accepted for future active-link styling
  void activePage;

  return (
    <>
      <nav
        className={`modern-navbar-container fixed top-0 left-0 right-0 z-[200] transition-all duration-500 pt-safe ${
          hidden
            ? "opacity-0 pointer-events-none -translate-y-full"
            : "opacity-100 pointer-events-auto translate-y-0"
        } ${
          isScrolled
            ? "bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-3 sm:py-4 shadow-2xl"
            : "bg-transparent py-5 sm:py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center">
          {/* Left actions */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${
                isMenuOpen
                  ? "bg-sky-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 border border-white/5"
              }`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 lg:px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-xl active:scale-95"
              >
                Sign Out
              </button>
              <div className="h-6 w-px bg-white/10" aria-hidden="true" />
              <div className="flex flex-col items-end px-5 lg:px-7 py-3 sm:py-3.5 bg-slate-900/60 border border-white/10 rounded-[1.8rem] shadow-2xl cursor-default">
                <span className="text-[11px] font-black text-sky-400 uppercase tracking-[0.2em] leading-none mb-2">
                  {currentUser?.role ?? "Servant"}
                </span>
                <span className="text-base lg:text-lg font-black text-white tracking-tight leading-none">
                  {currentUser?.name ?? currentUser?.username}
                </span>
              </div>
            </div>
          </div>

          {/* Logo / home link */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-5 group"
            aria-label="Go to home"
            dir="ltr"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-sky-400 shadow-2xl border border-white/10 group-hover:border-sky-400/50 group-hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-400/5 blur-xl group-hover:bg-sky-400/10 transition-colors" />
              {settings.icon?.startsWith("data:image") ? (
                <img
                  alt="App logo"
                  src={settings.icon}
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black relative z-10 drop-shadow-lg">
                  {settings.icon}
                </span>
              )}
            </div>
          </button>
        </div>
      </nav>

      {showLogoutConfirm && (
        <LogoutConfirmDialog
          onConfirm={onLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {isMenuOpen && (
        <MobileMenuOverlay
          navLinks={navLinks}
          onLogout={onLogout}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
