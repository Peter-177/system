import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ClipboardList,
  Home,
  Gift,
  BookOpen,
  Settings,
  Gamepad2,
  Waves,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { settingsDB } from "../data/storage";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

const CARD_THEMES = {
  summer: {
    bgTag: "bg-[#A3E635]",
    iconBg: "bg-[#A3E635]",
    accent: "text-black",
  },
  search: {
    bgTag: "bg-[#38BDF8]",
    iconBg: "bg-[#38BDF8]",
    accent: "text-black",
  },
  attendance: {
    bgTag: "bg-[#FACC15]",
    iconBg: "bg-[#FACC15]",
    accent: "text-black",
  },
  visits: {
    bgTag: "bg-[#FB923C]",
    iconBg: "bg-[#FB923C]",
    accent: "text-black",
  },
  birthday: {
    bgTag: "bg-[#F472B6]",
    iconBg: "bg-[#F472B6]",
    accent: "text-black",
  },
  classes: {
    bgTag: "bg-[#38BDF8]",
    iconBg: "bg-[#38BDF8]",
    accent: "text-black",
  },
  admin: {
    bgTag: "bg-[#FACC15]",
    iconBg: "bg-[#FACC15]",
    accent: "text-black",
  },
  game: {
    bgTag: "bg-[#A3E635]",
    iconBg: "bg-[#A3E635]",
    accent: "text-black",
  },
};

const BrutalistCard = ({ card, index, t, lang }) => {
  const theme = CARD_THEMES[card.id] || CARD_THEMES.search;
  const ChevronIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <Motion.button
      onClick={card.onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
      }}
      className={`bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] p-6 ${lang === 'ar' ? 'text-right' : 'text-left'} flex flex-col justify-between gap-6 transition-all duration-150 group cursor-pointer w-full select-none rounded-none`}
    >
      {/* Top Row: Category Tag */}
      <div className="w-full flex items-center justify-between">
        <span
          className={`inline-block ${theme.bgTag} text-black border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]`}
        >
          {card.subLabel}
        </span>
        <span className="font-mono text-xs font-black text-black/40">
          0{index + 1}
        </span>
      </div>

      {/* Middle: Icon & Title */}
      <div className="flex items-center gap-4">
        {/* Icon Square */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 ${theme.iconBg} border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center text-black shrink-0`}
        >
          {React.cloneElement(card.icon, {
            className: "w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]",
          })}
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight group-hover:underline underline-offset-4 decoration-2">
            {card.label}
          </h3>
          <p className="text-xs font-bold text-black/60 uppercase tracking-widest mt-0.5">
            {card.subLabel}
          </p>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="pt-3 border-t-2 border-black flex items-center justify-between w-full">
        <span className="text-xs font-black uppercase text-black/60 tracking-wider">
          {t("open")}
        </span>
        <div className="bg-[#FACC15] group-hover:bg-[#A3E635] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1 transition-colors">
          <span>{t("enter")}</span>
          <ChevronIcon className="w-4 h-4 stroke-[3]" />
        </div>
      </div>
    </Motion.button>
  );
};

export function HomePage({
  currentUser,
  onGoSearch,
  onGoSummer,
  onGoAttendance,
  onGoVisits,
  onGoBirthday,
  onGoClasses,
  onGoAdmin,
  onGoGame,
  onLogout,
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const settings = settingsDB.get();
  const t = useT();
  const { lang } = useAppContext();

  const cards = [
    {
      id: "summer",
      label: t("cardSummerLabel"),
      subLabel: t("cardSummerSub"),
      icon: <Waves />,
      onClick: onGoSummer,
      show: true,
    },
    {
      id: "search",
      label: t("cardSearchLabel"),
      subLabel: t("cardSearchSub"),
      icon: <Search />,
      onClick: onGoSearch,
      show: true,
    },
    {
      id: "attendance",
      label: t("cardAttendanceLabel"),
      subLabel: t("cardAttendanceSub"),
      icon: <ClipboardList />,
      onClick: onGoAttendance,
      show: currentUser?.role === "admin",
    },
    {
      id: "visits",
      label: t("cardVisitsLabel"),
      subLabel: t("cardVisitsSub"),
      icon: <Home />,
      onClick: onGoVisits,
      show: true,
    },
    {
      id: "birthday",
      label: t("cardBirthdayLabel"),
      subLabel: t("cardBirthdaySub"),
      icon: <Gift />,
      onClick: onGoBirthday,
      show: true,
    },
    {
      id: "classes",
      label: t("cardClassesLabel"),
      subLabel: t("cardClassesSub"),
      icon: <BookOpen />,
      onClick: onGoClasses,
      show: currentUser?.role !== "admin",
    },
    {
      id: "admin",
      label: t("cardAdminLabel"),
      subLabel: t("cardAdminSub"),
      icon: <Settings />,
      onClick: onGoAdmin,
      show: currentUser?.role === "admin",
    },
    {
      id: "game",
      label: t("cardGameLabel"),
      subLabel: t("cardGameSub"),
      icon: <Gamepad2 />,
      onClick: onGoGame,
      show: true,
    },
  ].filter((c) => c.show);

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* App Brand / Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white border-2 sm:border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] overflow-hidden">
              {settings.icon?.startsWith("data:image") ? (
                <img
                  alt="App logo"
                  src={settings.icon}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl sm:text-2xl font-black">
                  {settings.icon || "⛪"}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl text-black tracking-tight uppercase leading-none">
                {t("appName")}
              </span>
              <span className="text-[10px] font-black uppercase text-black/60 tracking-wider">
                {t("appTagline")}
              </span>
            </div>
          </div>

          {/* User badge & Logout button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Role Tag */}
            <div className="bg-white text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] border border-black inline-block"></span>
              <span>{currentUser?.role ?? t("homeServant")}</span>
              {currentUser?.name && (
                <span className="text-black/60">({currentUser.name})</span>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-[#EF4444] text-white border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] font-black text-xs sm:text-sm uppercase flex items-center gap-1.5 transition-all cursor-pointer rounded-none"
              aria-label={t("logout")}
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-8 sm:gap-12">
        {/* ── Hero Banner ── */}
        <section className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 z-10">
            <div className="inline-flex items-center gap-2 bg-[#FEF08A] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t("homeWelcome")} {currentUser?.name || t("homeServant")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-none">
              {t("homeTitle")}{" "}
              <span className="bg-[#38BDF8] text-black border-[3px] border-black px-3 py-0.5 inline-block shadow-[4px_4px_0px_#000000] -rotate-1">
                {t("homeSubTitle")}
              </span>
            </h1>
            <p className="text-sm sm:text-base font-bold text-black/70 max-w-lg">
              {t("homeSubtext")}
            </p>
          </div>

          {/* Saturated Accent Tag Box */}
          <div className="bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 text-center shrink-0 self-stretch md:self-auto flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black text-black">
              {cards.length}
            </span>
            <span className="text-xs font-black uppercase text-black/80 tracking-wider">
              {t("homeActiveSections")}
            </span>
          </div>
        </section>

        {/* ── Cards Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, idx) => (
            <BrutalistCard key={card.id} card={card} index={idx} t={t} lang={lang} />
          ))}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-[3px] border-black bg-white px-4 py-4 text-center">
        <p className="font-black text-xs sm:text-sm uppercase text-black/70 tracking-wider">
          {t("homeFooter")}
        </p>
      </footer>

      {/* ── Logout Confirmation Modal (Neo-Brutalist) ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 sm:p-8 text-center flex flex-col items-center gap-5"
            >
              <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-black">
                <AlertTriangle className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-black uppercase tracking-tight">
                  {t("logoutTitle")}
                </h3>
                <p className="text-sm font-bold text-black/70">
                  {t("logoutConfirmText")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 bg-[#EF4444] text-white border-2 border-black py-3 px-4 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  {t("logoutConfirmBtn")}
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-white text-black border-2 border-black py-3 px-4 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  {t("cancel")}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



