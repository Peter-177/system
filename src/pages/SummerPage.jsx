import { useRef, useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ClipboardList,
  Gamepad2,
  ArrowRight,
  ArrowLeft,
  Target,
  CheckCircle2,
  Award,
  X,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { studentsDB, summerAttendanceDB } from "../data/storage";
import { buildAttendanceEntry, registeredToday, todayISO } from "../utils/helpers";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/UI";

import { SummerGameArena } from "./SummerGameArena";
import { SummerProfile } from "./SummerProfile";
import { SummerCoupons } from "./SummerCoupons";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

export function SummerSection({ onGoHome, currentUser, onGoCheck }) {
  const sectionRef = useRef(null);
  const [internalView, setInternalView] = useState("menu"); // 'menu' | 'search' | 'attendance' | 'games' | 'profile' | 'coupons'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [prevView, setPrevView] = useState("search");
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const toast = useToast();
  const t = useT();
  const { lang } = useAppContext();

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const ChevronIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  const filteredStudents = useMemo(() => {
    const db = studentsDB.getAll();
    const allStudents = Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));

    const normalizeArabic = (text) => {
      if (!text) return "";
      return text.replace(/[أإآا]/g, "ا");
    };

    const sortAr = (arr) =>
      [...arr].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", lang === "ar" ? "ar" : "en"));

    const q = normalizeArabic(searchQuery.toLowerCase().trim());

    if (internalView === "attendance" && !q) {
      // Default: show only students with prior summer attendance
      return sortAr(allStudents.filter((s) => summerAttendanceDB.get(s.qrId).length > 0));
    }

    if (!q) {
      return sortAr(allStudents);
    }

    return sortAr(
      allStudents.filter((s) => {
        const normalizedName = normalizeArabic(s.name?.toLowerCase());
        const normalizedId = normalizeArabic(s.qrId?.toLowerCase());
        return normalizedName.startsWith(q) || normalizedId.includes(q);
      })
    );
  }, [searchQuery, internalView, updateTrigger, lang]);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [internalView]);

  const handleToggleAttendance = (student) => {
    const log = summerAttendanceDB.get(student.qrId);
    if (registeredToday(log)) {
      setStudentToRemove(student);
    } else {
      summerAttendanceDB.add(student.qrId, buildAttendanceEntry());
      setUpdateTrigger((prev) => prev + 1);
      toast.show(`⚽ ${student.name}`);
    }
  };

  const confirmRemoveAttendance = () => {
    if (!studentToRemove) return;
    const log = summerAttendanceDB.get(studentToRemove.qrId);
    const todayEntry = log.find((e) => e.timestamp && e.timestamp.slice(0, 10) === todayISO());
    if (todayEntry) {
      summerAttendanceDB.remove(studentToRemove.qrId, todayEntry.recordId || todayEntry.id);
      setUpdateTrigger((prev) => prev + 1);
      toast.show(`🗑️ ${studentToRemove.name}`);
    }
    setStudentToRemove(null);
  };

  const handleMarkAllPresent = () => {
    let addedCount = 0;
    filteredStudents.forEach((student) => {
      const log = summerAttendanceDB.get(student.qrId);
      if (!registeredToday(log)) {
        summerAttendanceDB.add(student.qrId, buildAttendanceEntry());
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setUpdateTrigger((prev) => prev + 1);
      toast.show(`✅ ${addedCount}`);
    }
  };

  const handleRemoveAll = () => {
    let removedCount = 0;
    filteredStudents.forEach((student) => {
      const log = summerAttendanceDB.get(student.qrId);
      const todayEntry = log.find((e) => e.timestamp && e.timestamp.slice(0, 10) === todayISO());
      if (todayEntry) {
        summerAttendanceDB.remove(student.qrId, todayEntry.recordId || todayEntry.id);
        removedCount++;
      }
    });
    if (removedCount > 0) {
      setUpdateTrigger((prev) => prev + 1);
      toast.show(`🗑️ ${removedCount}`);
    }
  };

  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const summerCards = [
    {
      id: "search",
      label: t("summerCardSearch"),
      subLabel: "SEARCH",
      icon: <Search className="w-8 h-8 stroke-[2.5]" />,
      tagBg: "bg-[#38BDF8]",
      iconBg: "bg-[#38BDF8]",
    },
    {
      id: "attendance",
      label: t("summerCardAttendance"),
      subLabel: "ATTENDANCE",
      icon: <ClipboardList className="w-8 h-8 stroke-[2.5]" />,
      tagBg: "bg-[#FACC15]",
      iconBg: "bg-[#FACC15]",
    },
    {
      id: "check",
      label: t("summerCardChecks"),
      subLabel: "REWARD CHECKS",
      icon: <Award className="w-8 h-8 stroke-[2.5]" />,
      tagBg: "bg-[#FB923C]",
      iconBg: "bg-[#FB923C]",
    },
    {
      id: "games",
      label: t("summerCardGames"),
      subLabel: "GAME ARENA",
      icon: <Gamepad2 className="w-8 h-8 stroke-[2.5]" />,
      tagBg: "bg-[#A3E635]",
      iconBg: "bg-[#A3E635]",
    },
  ];

  return (
    <div
      ref={sectionRef}
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Toast msg={toast.msg} />

      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#A3E635] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
          <button
            onClick={() => {
              if (internalView !== "menu") {
                setInternalView("menu");
              } else {
                if (onGoHome) onGoHome();
              }
            }}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] font-black text-xs sm:text-sm uppercase flex items-center gap-1.5 transition-all cursor-pointer rounded-none"
          >
            <BackIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            <span>{internalView === "menu" ? t("summerBackHome") : t("summerBackClub")}</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#A3E635] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              {t("summerTag")}
            </span>
            <h1 className="font-black text-xl sm:text-2xl tracking-tight text-black uppercase">
              {t("summerTitle")}
            </h1>
          </div>

          {/* Current Section Tag */}
          <div className="bg-white text-black border-2 border-black px-3 py-1 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000]">
            <span>
              {internalView === "menu"
                ? t("summerMenuLabel")
                : internalView === "search"
                ? t("summerSearchLabel")
                : internalView === "attendance"
                ? t("summerAttendanceLabel")
                : internalView === "games"
                ? t("summerGamesLabel")
                : internalView === "profile"
                ? t("summerProfileLabel")
                : t("summerCouponsLabel")}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {/* ── 1. MENU VIEW ── */}
          {internalView === "menu" && (
            <Motion.div
              key="menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-8"
            >
              {/* Summer Hero Banner */}
              <section className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 bg-[#FEF08A] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
                    <Sparkles className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t("summerWelcome")}</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-none">
                    {t("summerHeroTitle")}{" "}
                    <span className="bg-[#A3E635] text-black border-[3px] border-black px-3 py-0.5 inline-block shadow-[4px_4px_0px_#000000] -rotate-1">
                      {t("summerHeroAccent")}
                    </span>
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-black/70 max-w-lg">
                    {t("summerHeroText")}
                  </p>
                </div>

                <div className="bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 text-center shrink-0 self-stretch md:self-auto flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-black">
                    ⚽ 4
                  </span>
                  <span className="text-xs font-black uppercase text-black/80 tracking-wider">
                    {t("summerSections")}
                  </span>
                </div>
              </section>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summerCards.map((card, idx) => (
                  <Motion.button
                    key={card.id}
                    onClick={() => {
                      if (card.id === "check" && onGoCheck) {
                        onGoCheck();
                      } else {
                        setInternalView(card.id);
                      }
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] p-6 ${lang === 'ar' ? 'text-right' : 'text-left'} flex flex-col justify-between gap-6 transition-all duration-150 group cursor-pointer w-full select-none rounded-none`}
                  >
                    {/* Top Tag */}
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`inline-block ${card.tagBg} text-black border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]`}
                      >
                        {card.subLabel}
                      </span>
                      <span className="font-mono text-xs font-black text-black/40">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Middle: Icon & Title */}
                    <div className="flex flex-col items-start gap-4">
                      <div
                        className={`w-14 h-14 ${card.iconBg} border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center text-black shrink-0`}
                      >
                        {card.icon}
                      </div>

                      <div>
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
                ))}
              </div>
            </Motion.div>
          )}

          {/* ── 2. SEARCH & ATTENDANCE VIEWS ── */}
          {(internalView === "search" || internalView === "attendance") && (
            <Motion.div
              key={internalView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-5xl mx-auto flex flex-col gap-6"
            >
              {/* Search Bar */}
              <div className="relative flex items-center bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] focus-within:shadow-[8px_8px_0px_#000000] transition-all">
                <div className="bg-[#A3E635] text-black border-x-[3px] border-black p-3.5 sm:p-4.5 flex items-center justify-center shrink-0">
                  <Search className="w-6 h-6 stroke-[3]" />
                </div>
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("summerSearchPlaceholder")}
                  className="w-full bg-transparent px-4 sm:px-6 py-3.5 sm:py-4 text-black font-black text-lg sm:text-xl placeholder:text-black/40 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mx-3 bg-[#F472B6] text-black border-2 border-black p-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5 stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Attendance Batch Actions */}
              {internalView === "attendance" && filteredStudents.length > 0 && (() => {
                const allPresent = filteredStudents.every((s) =>
                  registeredToday(summerAttendanceDB.get(s.qrId))
                );
                return (
                  <div className="flex justify-between items-center bg-[#FEF08A] border-2 border-black p-3 shadow-[3px_3px_0px_#000000]">
                    <span className="font-black text-sm uppercase">
                      {t("summerTotalShown")}: {filteredStudents.length} {t("summerServant")}
                    </span>
                    <button
                      onClick={allPresent ? handleRemoveAll : handleMarkAllPresent}
                      className={`flex items-center gap-2 px-5 py-2 border-2 border-black font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer ${
                        allPresent
                          ? "bg-[#EF4444] text-white"
                          : "bg-[#A3E635] text-black"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                      <span>{allPresent ? t("summerRemoveAll") : t("summerMarkAllPresent")}</span>
                    </button>
                  </div>
                );
              })()}

              {/* Student Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudents.map((student) => {
                  const isPresent = registeredToday(summerAttendanceDB.get(student.qrId));
                  const avatarBg = getAvatarBg(student.name || student.qrId);

                  return (
                    <div
                      key={student.qrId}
                      onClick={
                        internalView === "search"
                          ? () => {
                              setSelectedStudent(student);
                              setPrevView(internalView);
                              setInternalView("profile");
                            }
                          : undefined
                      }
                      className={`border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 flex items-center justify-between gap-3 transition-all ${
                        internalView === "search"
                          ? "cursor-pointer hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                          : ""
                      } ${isPresent ? "bg-[#FEF08A]" : "bg-white"}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-1">
                        {/* Brutalist Avatar */}
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 border-2 border-black shadow-[2px_2px_0px_#000000] ${avatarBg} text-black font-black text-xl flex items-center justify-center overflow-hidden`}
                        >
                          {student.image ? (
                            <img
                              src={student.image}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{(student.name || "M")?.[0]?.toUpperCase()}</span>
                          )}
                        </div>

                        <div className={`flex flex-col min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <span className="font-black text-base sm:text-lg text-black truncate">
                            {student.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-black/60">
                            #{student.qrId}
                          </span>
                        </div>
                      </div>

                      {/* Attendance Toggle Button */}
                      {internalView === "attendance" && (
                        <button
                          onClick={() => handleToggleAttendance(student)}
                          className={`px-3 py-2 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer ${
                            isPresent
                              ? "bg-[#A3E635] text-black hover:bg-[#EF4444] hover:text-white"
                              : "bg-white text-black hover:bg-[#A3E635]"
                          }`}
                          title={isPresent ? t("summerRemoveAll") : t("summerRegister")}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                              <span>{t("summerPresent")}</span>
                            </>
                          ) : (
                            <>
                              <Target className="w-4 h-4 stroke-[2.5]" />
                              <span>{t("summerRegister")}</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Search View: Open Profile arrow */}
                      {internalView === "search" && (
                        <div className="bg-[#FACC15] text-black border-2 border-black p-2 shadow-[2px_2px_0px_#000000] shrink-0">
                          <ChevronIcon className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Motion.div>
          )}

          {/* ── 3. GAMES VIEW ── */}
          {internalView === "games" && (
            <Motion.div
              key="games"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <SummerGameArena />
            </Motion.div>
          )}

          {/* ── 4. PROFILE VIEW ── */}
          {internalView === "profile" && selectedStudent && (
            <Motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <SummerProfile
                person={selectedStudent}
                onBack={() => setInternalView(prevView)}
                onGoCoupons={() => setInternalView("coupons")}
                onGoCheck={() => onGoCheck && onGoCheck(selectedStudent.qrId)}
              />
            </Motion.div>
          )}

          {/* ── 5. COUPONS VIEW ── */}
          {internalView === "coupons" && selectedStudent && (
            <Motion.div
              key="coupons"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <SummerCoupons
                currentUser={currentUser}
                person={selectedStudent}
                onBack={() => setInternalView("profile")}
              />
            </Motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Attendance Removal Confirmation Modal (Neo-Brutalist) ── */}
      <AnimatePresence>
        {studentToRemove && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 text-center flex flex-col items-center gap-5"
            >
              <div className="w-16 h-16 bg-[#EF4444] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-white">
                <AlertTriangle className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-black uppercase">
                  {t("summerRemoveModal")}
                </h3>
                <p className="text-sm font-bold text-black/70">
                  {t("summerRemoveConfirm")}{" "}
                  <span className="text-black font-black underline">
                    {studentToRemove.name}
                  </span>{" "}
                  {t("summerRemoveToday")}
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={confirmRemoveAttendance}
                  className="flex-1 bg-[#EF4444] text-white border-2 border-black py-2.5 px-4 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  {t("summerRemoveBtn")}
                </button>
                <button
                  onClick={() => setStudentToRemove(null)}
                  className="flex-1 bg-white text-black border-2 border-black py-2.5 px-4 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
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

export function SummerPage({ onBack, currentUser, onGoCheck }) {
  return (
    <SummerSection
      onGoHome={onBack}
      currentUser={currentUser}
      onGoCheck={onGoCheck}
    />
  );
}




