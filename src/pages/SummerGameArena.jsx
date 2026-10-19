import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Minus,
  Trophy,
  Users,
  Settings,
  X,
  Pencil,
  Crown,
  Medal,
  Calendar,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { studentsDB, summerGameArenaDB, summerClubDB } from "../data/storage";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

// ─── Default Team Colors Fallback ───────────────────────────────────────────
const FALLBACK_COLORS = [
  "#38BDF8", // sky
  "#A3E635", // lime
  "#F472B6", // pink
  "#FB923C", // orange
  "#FACC15", // yellow
  "#A78BFA", // purple
  "#34D399", // emerald
  "#F87171", // red
];

function getContrastColor(hexColor) {
  if (!hexColor || typeof hexColor !== "string") return "#000000";
  // Return black text for neo-brutalism vibrant colors
  return "#000000";
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SummerGameArena({ onGoClubBuilder }) {
  const t = useT();
  const { lang } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(() => summerClubDB.get("main") || Object.values(summerClubDB.getAll())[0] || null);

  const [selectedDay, setSelectedDay] = useState(1); // 1..N or 'all'
  const [games, setGames] = useState([]);
  const [showMembers, setShowMembers] = useState(true);
  const [nameModal, setNameModal] = useState(null); // 'game' | 'renameTeam'
  const [modalNameInput, setModalNameInput] = useState("");
  const [modalDayInput, setModalDayInput] = useState(1);
  const [renameTeamId, setRenameTeamId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ── Database Fetching & Live Sync ──
  const refreshClubFromDB = async () => {
    setSyncing(true);
    try {
      const remote = await summerClubDB.getAsync("main");
      if (remote) {
        setClub(remote);
      } else {
        const local = summerClubDB.get("main") || Object.values(summerClubDB.getAll())[0] || null;
        setClub(local);
      }
    } catch (e) {
      console.error("Failed to sync club:", e);
      const local = summerClubDB.get("main") || Object.values(summerClubDB.getAll())[0] || null;
      setClub(local);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const local = summerClubDB.get("main") || Object.values(summerClubDB.getAll())[0] || null;
      if (local && mounted) {
        setClub(local);
      }
      try {
        const remote = await summerClubDB.getAsync("main");
        if (remote && mounted) {
          setClub(remote);
        }
      } catch (e) {
        console.error("Failed to load summer club in arena:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const handleClubUpdate = (e) => {
      if (e?.detail) {
        setClub(e.detail);
      } else {
        const next = summerClubDB.get("main") || Object.values(summerClubDB.getAll())[0] || null;
        setClub(next);
      }
    };

    window.addEventListener("summerClubUpdated", handleClubUpdate);
    window.addEventListener("storage", handleClubUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("summerClubUpdated", handleClubUpdate);
      window.removeEventListener("storage", handleClubUpdate);
    };
  }, []);

  // Teams directly from Database
  const teams = useMemo(() => {
    if (!club || !Array.isArray(club.teams)) return [];
    return club.teams.map((tm, idx) => ({
      id: String(tm.id || `t_${idx}`),
      name: tm.name || `${lang === "ar" ? "فريق" : "Team"} ${idx + 1}`,
      color: tm.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
      members: Array.isArray(tm.members) ? tm.members : [],
    }));
  }, [club, lang]);

  // Number of Days directly from Database
  const totalDays = useMemo(() => {
    return Math.max(1, Number(club?.days) || 5);
  }, [club]);

  // Days Array [1, 2, 3, 4, 5, ...]
  const daysList = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => i + 1);
  }, [totalDays]);

  // Load / initialize games for this club
  useEffect(() => {
    if (!club || teams.length === 0) return;

    const savedArena = summerGameArenaDB.get();
    const teamIds = new Set(teams.map((t) => t.id));

    if (savedArena && Array.isArray(savedArena.games) && savedArena.games.length > 0) {
      // Sync loaded games with existing team IDs
      const cleanGames = savedArena.games.map((g, i) => {
        const scores = { ...(g.scores || {}) };
        for (const k of Object.keys(scores)) {
          if (!teamIds.has(k)) delete scores[k];
        }
        for (const tid of teamIds) {
          if (!(tid in scores)) scores[tid] = "";
        }
        return {
          id: g.id || Date.now() + i,
          day: Math.min(totalDays, Math.max(1, Number(g.day) || 1)),
          name: g.name || `${lang === "ar" ? "الجولة" : "Round"} ${i + 1}`,
          scores,
        };
      });
      setGames(cleanGames);
    } else {
      // Seed default rounds across the days
      const seeded = daysList.map((d) => {
        const scores = {};
        teams.forEach((t) => {
          scores[t.id] = "";
        });
        return {
          id: Date.now() + d,
          day: d,
          name: lang === "ar" ? `ألعاب اليوم ${d}` : `Day ${d} Games`,
          scores,
        };
      });
      setGames(seeded);
    }
  }, [club?.id, teams.length, totalDays, lang]);

  // Save games to storage whenever they change
  useEffect(() => {
    if (games.length > 0) {
      summerGameArenaDB.set({
        clubId: club?.id || "main",
        games,
        showMembers,
      });
    }
  }, [games, showMembers, club?.id]);

  // Reset selectedDay if totalDays changed and selectedDay > totalDays
  useEffect(() => {
    if (selectedDay !== "all" && selectedDay > totalDays) {
      setSelectedDay(1);
    }
  }, [totalDays, selectedDay]);

  // All Students lookup map from Database
  const studentsMap = useMemo(() => {
    const all = studentsDB.getAll();
    const map = {};
    Object.keys(all).forEach((id) => {
      map[id] = { id, qrId: id, ...all[id] };
    });
    return map;
  }, []);

  const totalAssignedChildren = useMemo(() => {
    return teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
  }, [teams]);

  // Filter games based on selected day
  const displayedGames = useMemo(() => {
    if (selectedDay === "all") return games;
    return games.filter((g) => Number(g.day) === Number(selectedDay));
  }, [games, selectedDay]);

  // ── Game Handlers ──
  const closeNameModal = () => {
    setNameModal(null);
    setModalNameInput("");
    setModalDayInput(1);
    setRenameTeamId(null);
  };

  const handleUpdateScore = (gameId, teamId, val) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId ? { ...g, scores: { ...g.scores, [teamId]: val } } : g
      )
    );
  };

  const openGameModalForDay = (dayNum) => {
    const targetDay = dayNum === "all" ? 1 : dayNum;
    setModalDayInput(targetDay);
    const dayGamesCount = games.filter((g) => Number(g.day) === Number(targetDay)).length;
    setModalNameInput(
      lang === "ar"
        ? `جولة ${dayGamesCount + 1} - اليوم ${targetDay}`
        : `Round ${dayGamesCount + 1} - Day ${targetDay}`
    );
    setNameModal("game");
  };

  const confirmAddGame = () => {
    const name = modalNameInput.trim();
    if (!name) return;
    const initialScores = {};
    teams.forEach((t) => {
      initialScores[t.id] = "";
    });
    const newGame = {
      id: Date.now(),
      day: Math.min(totalDays, Math.max(1, Number(modalDayInput) || 1)),
      name,
      scores: initialScores,
    };
    setGames((prev) => [...prev, newGame]);
    closeNameModal();
  };

  const handleRemoveGame = (id) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  // ── 1. LOADING STATE ──
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-10 flex flex-col items-center justify-center text-center gap-5">
          <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-3xl animate-bounce">
            ⏳
          </div>
          <h3 className="text-2xl font-black uppercase text-black tracking-tight">
            {t("gameLoadingClub")}
          </h3>
          <p className="text-sm font-bold text-black/60 max-w-md">
            {lang === "ar" ? "جاري فحص قاعدة البيانات وتحديث الفرق والأيام..." : "Fetching summer club data and teams from database..."}
          </p>
        </div>
      </div>
    );
  }

  // ── 2. EMPTY STATE: NO CLUB CREATED YET ──
  if (!club || !club.name || teams.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-[4px] border-black shadow-[10px_10px_0px_#000000] p-8 sm:p-12 flex flex-col items-center text-center gap-6"
        >
          {/* Warning Banner Icon */}
          <div className="relative">
            <div className="w-20 h-20 bg-[#EF4444] text-white border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 stroke-[3]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-sm">
              !
            </div>
          </div>

          <div className="space-y-3">
            <span className="inline-block bg-[#FACC15] border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
              {lang === "ar" ? "تنبيه قاعدة البيانات" : "DATABASE NOTICE"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              {t("gameNoClubYet")}
            </h2>
            <p className="text-sm sm:text-base font-bold text-black/70 max-w-lg leading-relaxed">
              {t("gameNoClubDesc")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
            {onGoClubBuilder && (
              <button
                type="button"
                onClick={onGoClubBuilder}
                className="bg-[#A3E635] text-black border-[3px] border-black shadow-[5px_5px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95 transition-all font-black text-base uppercase px-8 py-3.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
                <span>{t("gameCreateClubBtn")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={refreshClubFromDB}
              className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-black text-sm uppercase px-6 py-3.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 stroke-[3] ${syncing ? "animate-spin" : ""}`} />
              <span>{t("gameSyncDatabase")}</span>
            </button>
          </div>
        </Motion.div>
      </div>
    );
  }

  // ── 3. RESULTS / LEADERBOARD VIEW ──
  if (showResults) {
    return (
      <ResultsView
        teams={teams}
        games={games}
        onBack={() => setShowResults(false)}
        lang={lang}
        t={t}
      />
    );
  }

  // ── 4. MAIN ARENA VIEW WITH TEAMS & DAYS ──
  return (
    <div className="w-full flex flex-col gap-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* ── Top Header / Club Info Banner ── */}
      <div className="w-full max-w-[95rem] mx-auto bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FACC15] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center text-2xl shrink-0">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-black text-[#A3E635] text-[10px] font-black uppercase px-2 py-0.5 border border-black">
                {t("summerCardGames")}
              </span>
              <span className="text-xs font-bold text-black/50">
                {new Date(club.createdAt || Date.now()).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
              {club.name}
            </h1>
          </div>
        </div>

        {/* Club Statistics Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-[#FEF08A] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] flex items-center gap-2">
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span className="font-black text-xs sm:text-sm">
              {totalDays} {t("clubDaysUnit")}
            </span>
          </div>

          <div className="bg-[#38BDF8] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] flex items-center gap-2">
            <Users className="w-4 h-4 stroke-[2.5]" />
            <span className="font-black text-xs sm:text-sm">
              {teams.length} {t("clubTotalTeams")}
            </span>
          </div>

          <div className="bg-[#A3E635] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] flex items-center gap-2">
            <span className="font-black text-xs sm:text-sm">
              🎒 {totalAssignedChildren} {t("gameAssignedChildren")}
            </span>
          </div>

          <button
            type="button"
            onClick={refreshClubFromDB}
            title={t("gameSyncDatabase")}
            className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 stroke-[3] ${syncing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Feature 2: Games Schedule by Day (جدول ألعاب الأيام) ── */}
      <div className="w-full max-w-[95rem] mx-auto bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A78BFA] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.5] text-black" />
            </div>
            <div>
              <h3 className="font-black text-lg text-black uppercase tracking-tight">
                {t("gameScheduleTitle")} ({totalDays} {t("clubDaysUnit")})
              </h3>
              <p className="text-xs font-bold text-black/60">
                {lang === "ar"
                  ? `اختر يوماً لمتابعة ألعابه ونقاط الفرق أو اعرض جميع الأيام`
                  : `Select a day to view games and team scores or view all days`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openGameModalForDay(selectedDay === "all" ? 1 : selectedDay)}
              className="bg-[#A3E635] text-black border-2 border-black px-3.5 py-1.5 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 font-black text-xs uppercase cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>
                {selectedDay === "all"
                  ? `${t("gameNewRound")}`
                  : `${t("gameAddRoundForDay")} ${selectedDay}`}
              </span>
            </button>
          </div>
        </div>

        {/* Days Selector Tabs (e.g. Day 1, Day 2, Day 3, ... Day N) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {daysList.map((dayNum) => {
            const isActive = selectedDay === dayNum;
            const dayGames = games.filter((g) => Number(g.day) === dayNum);
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum)}
                className={`flex items-center gap-2 border-[3px] border-black px-4 py-2.5 font-black text-sm uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#FACC15] text-black shadow-[4px_4px_0px_#000000] -translate-y-0.5"
                    : "bg-[#FDF8F0] text-black/80 shadow-[2px_2px_0px_#000000] hover:bg-white hover:text-black"
                }`}
              >
                <span>
                  {t("gameDayPrefix")} {dayNum}
                </span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 border border-black ${
                    isActive ? "bg-black text-[#FACC15]" : "bg-white text-black"
                  }`}
                >
                  {dayGames.length}
                </span>
              </button>
            );
          })}

          {/* All Days Tab */}
          <button
            type="button"
            onClick={() => setSelectedDay("all")}
            className={`border-[3px] border-black px-4 py-2.5 font-black text-sm uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedDay === "all"
                ? "bg-black text-[#A3E635] shadow-[4px_4px_0px_#000000] -translate-y-0.5"
                : "bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-[#FDF8F0]"
            }`}
          >
            {t("gameAllDays")}
          </button>
        </div>
      </div>

      {/* ── Main Arena Content: Sidebar & Team Cards ── */}
      <div className="w-full max-w-[95rem] mx-auto flex flex-col lg:flex-row gap-6 pb-12">
        {/* ── Admin & Rounds Panel (Sidebar) ── */}
        <Motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[380px] bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4 sm:p-6 flex flex-col shrink-0 gap-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FB923C] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center">
                <Settings className="w-4 h-4 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-base text-black uppercase">
                {t("gameManage")}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowMembers(!showMembers)}
              className="bg-white border-2 border-black px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_#000000] hover:shadow-none transition-all cursor-pointer"
            >
              {showMembers ? t("gameHide") : t("gameShow")} {t("gameMembers")}
            </button>
          </div>

          {/* Current Day Filter Info */}
          <div className="bg-[#FEF08A] border-2 border-black p-3 flex items-center justify-between">
            <span className="font-black text-xs uppercase">
              {selectedDay === "all"
                ? t("gameAllDays")
                : `${t("gameDayPrefix")} ${selectedDay}`}
            </span>
            <span className="text-xs font-bold text-black/70">
              {displayedGames.length} {t("gameRoundsPoints")}
            </span>
          </div>

          {/* Games and Scores Input list for Current Day */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-black">
                {t("gameRoundsPoints")}
              </span>
              <button
                type="button"
                onClick={() => openGameModalForDay(selectedDay === "all" ? 1 : selectedDay)}
                className="bg-[#38BDF8] text-black border-2 border-black px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_#000000] hover:shadow-none transition-all cursor-pointer"
              >
                + {t("gameNewRound")}
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
              {displayedGames.length === 0 ? (
                <div className="bg-[#FDF8F0] border-2 border-dashed border-black/30 p-6 text-center font-bold text-xs text-black/50">
                  {t("gameNoRoundsYet")}
                </div>
              ) : (
                displayedGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-[#FDF8F0] border-2 border-black p-3 flex flex-col gap-2 group/game"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="bg-[#FACC15] border border-black text-[10px] font-black px-1.5 py-0.2 shrink-0">
                          {t("gameDayPrefix")} {game.day || 1}
                        </span>
                        <span className="text-xs font-black text-black truncate">
                          {game.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGame(game.id)}
                        className="text-black/40 hover:text-[#EF4444] transition-colors p-1 cursor-pointer shrink-0"
                        title={t("gameDeleteRound")}
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {teams.map((tm) => (
                        <div key={tm.id} className="flex flex-col gap-0.5">
                          <span
                            className="text-[10px] font-black uppercase truncate text-right px-1"
                            style={{ color: "#000000" }}
                          >
                            ● {tm.name}
                          </span>
                          <input
                            type="text"
                            value={game.scores[tm.id] || ""}
                            onChange={(e) =>
                              handleUpdateScore(game.id, tm.id, e.target.value)
                            }
                            placeholder="0"
                            className="h-8 bg-white border-2 border-black text-black font-black text-xs text-center outline-none focus:bg-[#FEF08A] transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Standings Leaderboard in Sidebar */}
          <div className="border-t-[3px] border-black pt-4 flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-black">
              🏆 {t("gameCurrentTotal")}
            </span>
            <div className="flex flex-col gap-1.5">
              {[...teams]
                .map((tm) => {
                  const score = games.reduce(
                    (acc, g) => acc + (Number(g.scores[tm.id]) || 0),
                    0
                  );
                  return { ...tm, score };
                })
                .sort((a, b) => b.score - a.score)
                .map((tm, idx) => (
                  <div
                    key={tm.id}
                    className="flex items-center justify-between bg-white border-2 border-black px-3 py-1.5 text-xs font-black"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        style={{ backgroundColor: tm.color }}
                        className="w-3.5 h-3.5 border border-black shrink-0 inline-block"
                      />
                      <span className="truncate">{tm.name}</span>
                    </div>
                    <span className="font-mono text-sm">{tm.score}</span>
                  </div>
                ))}
            </div>
          </div>
        </Motion.div>

        {/* ── Feature 1: Team Cards with Name, Color, and Assigned Children ── */}
        <div className="flex-1 flex flex-col gap-6">
          <div
            className={`grid gap-5 sm:gap-6 ${
              teams.length === 1
                ? "grid-cols-1"
                : teams.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {teams.map((team, idx) => (
              <TeamCard
                key={team.id}
                team={team}
                games={games}
                selectedDay={selectedDay}
                studentsMap={studentsMap}
                showMembers={showMembers}
                delay={idx * 0.06}
                lang={lang}
                t={t}
              />
            ))}
          </div>

          {/* Big Results Reveal Button */}
          <div className="w-full flex justify-center pt-4">
            <Motion.button
              type="button"
              onClick={() => setShowResults(true)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#FACC15] text-black border-[3px] border-black shadow-[6px_6px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] active:scale-95 transition-all flex items-center gap-4 px-10 py-5 font-black text-xl sm:text-2xl uppercase cursor-pointer"
            >
              <Trophy className="w-7 h-7 stroke-[2.5]" />
              <span>{t("gameArenaResults")}</span>
            </Motion.button>
          </div>
        </div>
      </div>

      {/* ── Add Game Modal ── */}
      <AnimatePresence>
        {nameModal === "game" && (
          <Motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeNameModal();
            }}
          >
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                <h4 className="text-lg font-black uppercase text-black">
                  {t("gameAddRoundModal")}
                </h4>
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="bg-white border-2 border-black p-1 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Day selection */}
              <div className="mb-4">
                <label className="block text-xs font-black uppercase mb-1">
                  📅 {t("gameDayPrefix")}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {daysList.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setModalDayInput(d)}
                      className={`px-3 py-1.5 border-2 border-black font-black text-xs uppercase cursor-pointer ${
                        modalDayInput === d
                          ? "bg-[#FACC15] shadow-[2px_2px_0px_#000000]"
                          : "bg-white"
                      }`}
                    >
                      {t("gameDayPrefix")} {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Round Name */}
              <label className="block text-xs font-black uppercase mb-1">
                {t("gameRoundNameLabel")}
              </label>
              <input
                type="text"
                value={modalNameInput}
                onChange={(e) => setModalNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmAddGame();
                  }
                }}
                placeholder={t("gameTypeRoundName")}
                className="w-full h-12 bg-white border-[3px] border-black text-black font-black text-base px-4 outline-none focus:bg-[#FEF08A] transition-colors mb-5"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="flex-1 h-11 bg-white border-[3px] border-black font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmAddGame}
                  className="flex-1 h-11 bg-[#A3E635] border-[3px] border-black font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
                >
                  {t("gameSaveRound")}
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Team Card with Name, Color, and Children Roster ─────────────────────────
function TeamCard({ team, games, selectedDay, studentsMap, showMembers, delay, lang, t }) {
  // Day Score
  const dayGames = useMemo(() => {
    if (selectedDay === "all") return games;
    return games.filter((g) => Number(g.day) === Number(selectedDay));
  }, [games, selectedDay]);

  const dayScore = useMemo(() => {
    return dayGames.reduce((acc, g) => acc + (Number(g.scores[team.id]) || 0), 0);
  }, [dayGames, team.id]);

  // Overall Total Score
  const totalScore = useMemo(() => {
    return games.reduce((acc, g) => acc + (Number(g.scores[team.id]) || 0), 0);
  }, [games, team.id]);

  const members = team.members || [];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col relative group h-full"
    >
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] flex-1 flex flex-col overflow-hidden">
        {/* Team Color Top Header */}
        <div
          style={{ backgroundColor: team.color }}
          className="border-b-[3px] border-black p-4 sm:p-5 flex items-center justify-between"
        >
          <div className="min-w-0 pr-1">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase truncate">
              {team.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-black text-white text-[11px] font-black px-2 py-0.5 border border-black uppercase tracking-wide">
                {members.length} {t("clubTeamMembers")}
              </span>
            </div>
          </div>

          {/* Color swatch dot */}
          <div className="w-8 h-8 rounded-none border-[3px] border-black bg-white shadow-[2px_2px_0px_#000000] flex items-center justify-center font-black text-xs">
            ⚽
          </div>
        </div>

        {/* Score Display Area */}
        <div className="p-4 bg-[#FDF8F0] border-b-[3px] border-black grid grid-cols-2 gap-3 text-center">
          {/* Day Score */}
          <div className="bg-white border-2 border-black p-2.5 shadow-[2px_2px_0px_#000000]">
            <span className="text-2xl sm:text-3xl font-black text-black tabular-nums block leading-none">
              {dayScore}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60 tracking-wider mt-1 block">
              {selectedDay === "all" ? t("gameAllDays") : `${t("gameDayPrefix")} ${selectedDay}`}
            </span>
          </div>

          {/* Total Overall Tournament Score */}
          <div className="bg-black text-white border-2 border-black p-2.5 shadow-[2px_2px_0px_#000000]">
            <span className="text-2xl sm:text-3xl font-black text-[#A3E635] tabular-nums block leading-none">
              {totalScore}
            </span>
            <span className="text-[10px] font-black uppercase text-white/70 tracking-wider mt-1 block">
              {t("gameOverallScore")}
            </span>
          </div>
        </div>

        {/* ── Feature 1: List of Children Assigned to this Team ── */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wide text-black flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
              {t("gameAssignedChildren")} ({members.length})
            </span>
          </div>

          {/* Members list */}
          {members.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-black/30 p-4 text-center text-xs font-bold text-black/50">
              {t("gameNoChildrenInTeam")}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {members.map((qrId) => {
                const student = studentsMap[qrId];
                const displayName = student?.name || `#${qrId}`;
                const initial = (displayName || "M")[0]?.toUpperCase();
                return (
                  <div
                    key={qrId}
                    className="flex items-center justify-between bg-white border-2 border-black px-3 py-2 shadow-[2px_2px_0px_#000000]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        style={{ backgroundColor: team.color }}
                        className="w-7 h-7 border-2 border-black font-black text-xs flex items-center justify-center shrink-0 text-black"
                      >
                        {initial}
                      </span>
                      <span className="font-black text-xs text-black truncate">
                        {displayName}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] font-bold text-black/40 shrink-0">
                      #{qrId}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Day Rounds / Scores list */}
          <div className="mt-2 pt-3 border-t-2 border-black/10 flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase text-black/60">
              {lang === "ar"
                ? `جولات ${selectedDay === "all" ? "جميع الأيام" : `اليوم ${selectedDay}`}`
                : `Rounds for ${selectedDay === "all" ? "All Days" : `Day ${selectedDay}`}`}
            </span>
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {dayGames.map((g) => (
                <div
                  key={g.id}
                  className="bg-[#FDF8F0] border border-black px-2.5 py-1.5 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-black/80 truncate pr-2">
                    {g.name}
                  </span>
                  <span className="font-black text-sm tabular-nums text-black shrink-0">
                    {g.scores[team.id] || "0"}
                  </span>
                </div>
              ))}
              {dayGames.length === 0 && (
                <span className="text-[11px] font-bold text-black/40 italic">
                  {t("gameNoRoundsYet")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}

// ─── Results / Celebration View ───────────────────────────────────────────────
function ResultsView({ teams, games, onBack, lang, t }) {
  const [step, setStep] = useState(0);

  const results = useMemo(() => {
    return teams
      .map((tm) => {
        const score = games.reduce(
          (acc, g) => acc + (Number(g.scores[tm.id]) || 0),
          0
        );
        return { ...tm, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [teams, games]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter") {
        setStep((prev) => Math.min(prev + 1, results.length));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [results.length]);

  const isFinalStep = step === results.length;
  const currentTeam = results[results.length - 1 - step];

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center p-4 relative"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white text-black border-[3px] border-black px-4 py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:scale-95 font-black text-sm uppercase transition-all cursor-pointer"
      >
        ← {t("summerBackClub")}
      </button>

      <AnimatePresence mode="wait">
        {!isFinalStep && currentTeam ? (
          <Motion.div
            key={`reveal-${step}`}
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -40 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-6 text-center w-full max-w-2xl px-4"
          >
            <div className="space-y-2">
              <span className="bg-black text-[#A3E635] font-black text-xs uppercase tracking-widest px-3 py-1 border-2 border-black inline-block">
                {t("gameTeamResultTag")}
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-black tracking-tight break-words">
                {currentTeam.name}
              </h2>
            </div>

            {/* Score Box */}
            <div
              onClick={() => setStep((prev) => Math.min(prev + 1, results.length))}
              style={{ backgroundColor: currentTeam.color }}
              className="border-[4px] border-black shadow-[8px_8px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all cursor-pointer px-12 py-8 text-center"
            >
              <Motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-7xl sm:text-9xl md:text-[10rem] font-black tabular-nums text-black block leading-none"
              >
                {currentTeam.score}
              </Motion.span>
              <span className="text-sm font-black uppercase tracking-widest text-black/80 mt-2 block">
                {t("gameTotalPointsTag")}
              </span>
            </div>

            <button
              onClick={() => setStep((prev) => Math.min(prev + 1, results.length))}
              className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-3 px-6 py-3 font-black text-sm uppercase cursor-pointer"
            >
              <span>{t("gamePressText")}</span>
              <div className="bg-black text-white font-mono text-xs px-2 py-1 border border-black">
                Enter
              </div>
              <span>{t("gamePressEnterOrClick")}</span>
            </button>
          </Motion.div>
        ) : (
          <Motion.div
            key="final-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl flex flex-col items-center gap-6 py-8 px-4"
          >
            <div className="text-center space-y-1">
              <span className="text-3xl">👑</span>
              <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
                {t("gameFinalRankings")}
              </h1>
              <span className="text-xs text-black/50 uppercase tracking-widest font-black block">
                {t("gameFinalRankingsTag")}
              </span>
            </div>

            <div className="w-full flex flex-col gap-3">
              {results.map((tm, index) => {
                const isWinner = index === 0;
                const medalBg =
                  index === 0
                    ? "bg-[#FACC15]"
                    : index === 1
                    ? "bg-[#E5E7EB]"
                    : index === 2
                    ? "bg-[#FB923C]"
                    : "bg-white";

                return (
                  <Motion.div
                    key={tm.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`flex items-center justify-between p-4 sm:p-5 border-[3px] border-black shadow-[4px_4px_0px_#000000] gap-4 ${
                      isWinner ? "bg-[#FEF08A]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${medalBg} border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center font-black text-lg sm:text-xl text-black shrink-0`}
                      >
                        {index === 0 ? (
                          <Crown className="w-6 h-6 stroke-[2.5]" />
                        ) : index === 1 ? (
                          <Medal className="w-6 h-6 stroke-[2.5]" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{ backgroundColor: tm.color }}
                          className="w-4 h-4 border-2 border-black shrink-0 inline-block"
                        />
                        <span className="text-xl sm:text-2xl font-black text-black tracking-tight truncate">
                          {tm.name}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-3xl sm:text-4xl font-black text-black tabular-nums block leading-none">
                        {tm.score}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/50">
                        {t("gamePointsUnit")}
                      </span>
                    </div>
                  </Motion.div>
                );
              })}
            </div>

            <button
              onClick={onBack}
              className="bg-[#A3E635] text-black border-[3px] border-black px-8 py-3.5 font-black text-base uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer mt-4"
            >
              {t("gameBackToArena")}
            </button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
