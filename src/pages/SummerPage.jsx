import { useRef, useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  Target,
  CheckCircle2,
  Award,
  X,
  AlertTriangle,
  Users,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { studentsDB, summerAttendanceDB, summerClubDB } from "../data/storage";
import { buildAttendanceEntry, registeredToday, todayISO } from "../utils/helpers";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/UI";

import { SummerProfile } from "./SummerProfile";
import { SummerCoupons } from "./SummerCoupons";
import { SummerClub } from "./SummerClub";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

const CLUB_ID = "main";

export function SummerSection({ onGoHome, currentUser, onGoCheck }) {
  const sectionRef = useRef(null);

  // ── Club State ──
  const [club, setClub] = useState(null);
  const [clubLoaded, setClubLoaded] = useState(false);

  // internalView: 'club' | 'search' | 'attendance' | 'profile' | 'coupons'
  const [internalView, setInternalView] = useState("club");
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

  // ── Load Club Data with Remote Sync ──
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // 1. Quick local cache read (prevents flash of wrong state)
      const local = summerClubDB.get(CLUB_ID) || Object.values(summerClubDB.getAll())[0] || null;
      if (mounted) setClub(local);

      // 2. Async remote read
      try {
        const remote = await summerClubDB.getAsync(CLUB_ID);
        if (mounted) setClub(remote || local);
      } catch (e) {
        console.error("SummerPage: remote fetch error:", e);
      } finally {
        if (mounted) setClubLoaded(true);
      }
    };
    load();

    const handleUpdate = (e) => {
      if (e?.detail !== undefined) {
        setClub(e.detail);
      } else {
        const next = summerClubDB.get(CLUB_ID) || Object.values(summerClubDB.getAll())[0] || null;
        setClub(next);
      }
    };
    window.addEventListener("summerClubUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("summerClubUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // ── Page Title Logic ──
  // When club exists: user chosen club name (from DB, never hardcoded, never translated)
  // When no club exists: "إضافة نادي صيفي جديد" (Create New Summer Club)
  const pageTitle = useMemo(() => {
    if (!clubLoaded) return t("summerTitle");
    if (club && club.name) return club.name;
    return t("clubCreateNewTitle");
  }, [clubLoaded, club, t]);

  // ── Students List & Search Helper ──
  const filteredStudents = useMemo(() => {
    const db = studentsDB.getAll();
    const allStudents = Object.keys(db).map((id) => ({ qrId: id, ...db[id] }));

    const normalizeArabic = (text) => (text ? String(text).replace(/[أإآا]/g, "ا") : "");
    const sortAr = (arr) =>
      [...arr].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", lang === "ar" ? "ar" : "en")
      );

    const q = normalizeArabic(searchQuery.toLowerCase().trim());

    if (internalView === "attendance" && !q) {
      return sortAr(allStudents.filter((s) => summerAttendanceDB.get(s.qrId).length > 0));
    }
    if (!q) return sortAr(allStudents);

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

  // ── Attendance Handlers ──
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

  const handleBack = () => {
    if (internalView === "club") {
      if (onGoHome) onGoHome();
    } else {
      setInternalView("club");
    }
  };

  const backLabel = internalView === "club" ? t("summerBackHome") : t("summerBackClub");

  // ── LOADING GUARD: prevents any flash of State A create form before data loads ──
  if (!clubLoaded) {
    return (
      <div
        className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-4"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-3xl animate-bounce">
            ⏳
          </div>
          <p className="font-black text-xl uppercase tracking-wider">{t("loading")}</p>
        </div>
      </div>
    );
  }

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
            onClick={handleBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-[0px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] font-black text-xs sm:text-sm uppercase flex items-center gap-1.5 transition-all cursor-pointer rounded-none shrink-0"
          >
            <BackIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            <span>{backLabel}</span>
          </button>

          {/* Title — displays the chosen club name when club exists, or "إضافة نادي صيفي جديد" */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center px-2">
            <span className="bg-black text-[#A3E635] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden md:inline-block shrink-0">
              {t("summerTag")}
            </span>
            <h1 className="font-black text-base sm:text-xl lg:text-2xl tracking-tight text-black uppercase truncate text-center">
              {pageTitle}
            </h1>
          </div>

          {/* Quick-Nav Actions (Search, Attendance, Checks) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {internalView !== "club" && (
              <button
                onClick={() => setInternalView("club")}
                className="bg-white text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none cursor-pointer"
              >
                {t("summerBackClub")}
              </button>
            )}

            <button
              onClick={() => setInternalView((v) => (v === "search" ? "club" : "search"))}
              className={`border-2 border-black p-1.5 sm:px-2.5 sm:py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none transition-all cursor-pointer flex items-center gap-1 ${
                internalView === "search" ? "bg-black text-[#38BDF8]" : "bg-white text-black"
              }`}
              title={t("summerCardSearch")}
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{t("summerSearchLabel")}</span>
            </button>

            <button
              onClick={() => setInternalView((v) => (v === "attendance" ? "club" : "attendance"))}
              className={`border-2 border-black p-1.5 sm:px-2.5 sm:py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none transition-all cursor-pointer flex items-center gap-1 ${
                internalView === "attendance" ? "bg-black text-[#FACC15]" : "bg-white text-black"
              }`}
              title={t("summerCardAttendance")}
            >
              <ClipboardList className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{t("summerAttendanceLabel")}</span>
            </button>

            {onGoCheck && (
              <button
                onClick={onGoCheck}
                className="border-2 border-black p-1.5 sm:px-2.5 sm:py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none transition-all cursor-pointer flex items-center gap-1 bg-white text-black"
                title={t("summerCardChecks")}
              >
                <Award className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{t("summerCardChecks")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════════════════
              1. MAIN CLUB VIEW (State A if no club, State B if club exists)
          ═══════════════════════════════════════════════════════════════ */}
          {internalView === "club" && (
            <Motion.div
              key="club"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <SummerClub
                currentUser={currentUser}
                onClubCreated={(newClub) => {
                  setClub(newClub);
                }}
              />
            </Motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              2. SEARCH & ATTENDANCE VIEWS
          ═══════════════════════════════════════════════════════════════ */}
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
                <div className="bg-[#A3E635] text-black border-e-[3px] border-black p-3.5 sm:p-4 flex items-center justify-center shrink-0">
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
                        allPresent ? "bg-[#EF4444] text-white" : "bg-[#A3E635] text-black"
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

                        <div className={`flex flex-col min-w-0 ${lang === "ar" ? "text-right" : "text-left"}`}>
                          <span className="font-black text-base sm:text-lg text-black truncate">
                            {student.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-black/60">
                            #{student.qrId}
                          </span>
                        </div>
                      </div>

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

          {/* ═══════════════════════════════════════════════════════════════
              3. PROFILE VIEW
          ═══════════════════════════════════════════════════════════════ */}
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

          {/* ═══════════════════════════════════════════════════════════════
              4. COUPONS VIEW
          ═══════════════════════════════════════════════════════════════ */}
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

      {/* ── Attendance Removal Confirmation Modal ── */}
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
                <h3 className="text-2xl font-black text-black uppercase">{t("summerRemoveModal")}</h3>
                <p className="text-sm font-bold text-black/70">
                  {t("summerRemoveConfirm")}{" "}
                  <span className="text-black font-black underline">{studentToRemove.name}</span>{" "}
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
