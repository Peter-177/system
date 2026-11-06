import { useMemo, useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Check,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Pencil,
  UserPlus,
  Sparkles,
  AlertTriangle,
  Minus,
  Trophy,
  Crown,
  Medal,
  Calendar,
  Settings2,
  Palette,
  RotateCcw,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { studentsDB, summerClubDB, summerGameArenaDB } from "../data/storage";
import { CLUB_TEAM_COLORS } from "../data/config";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/UI";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

const CLUB_ID = "main";

const normalizeArabic = (text) => (text ? String(text).replace(/[أإآا]/g, "ا") : "");

export function SummerClub({ onClubCreated, currentUser }) {
  const t = useT();
  const { lang } = useAppContext();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(() => summerClubDB.get(CLUB_ID) || null);

  // Stepper: 1: Info (Name, Days, Teams count) -> 2: Teams setup (names & colors) -> 3: Assign children -> 4: Dashboard
  const [step, setStep] = useState(1);

  // State A Form fields
  const [name, setName] = useState("");
  const [days, setDays] = useState(5);
  const [teamsCount, setTeamsCount] = useState(2);
  const [teamsList, setTeamsList] = useState([]);

  // Search & Filters
  const [search, setSearch] = useState("");

  // Modals & Secondary Menu
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [editingDaysModal, setEditingDaysModal] = useState(false);
  const [tempDays, setTempDays] = useState(5);

  // Games Section State
  const [selectedDay, setSelectedDay] = useState(1); // 1..N or 'all'
  const [games, setGames] = useState([]);
  const [showAddRoundModal, setShowAddRoundModal] = useState(false);
  const [modalRoundName, setModalRoundName] = useState("");
  const [modalRoundDay, setModalRoundDay] = useState(1);
  const [showResultsView, setShowResultsView] = useState(false);
  const [showMembersInDashboard, setShowMembersInDashboard] = useState(true);

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const ChevronIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  // ── Database Initial Load & Live Sync ──
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const local = summerClubDB.get(CLUB_ID) || Object.values(summerClubDB.getAll())[0] || null;
      if (mounted && local) {
        setClub(local);
        setName(local.name || "");
        setDays(Number(local.days) || 5);
        setTempDays(Number(local.days) || 5);
        setTeamsList(local.teams || []);
        setTeamsCount((local.teams || []).length || 2);
        setStep(4); // Show dashboard if club exists
      }
      try {
        const remote = await summerClubDB.getAsync(CLUB_ID);
        if (mounted) {
          const finalClub = remote || local;
          setClub(finalClub);
          if (finalClub) {
            setName(finalClub.name || "");
            setDays(Number(finalClub.days) || 5);
            setTempDays(Number(finalClub.days) || 5);
            setTeamsList(finalClub.teams || []);
            setTeamsCount((finalClub.teams || []).length || 2);
            setStep(4);
          } else {
            setStep(1);
          }
        }
      } catch (e) {
        console.error("SummerClub: loadAsync failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const handleClubUpdate = (e) => {
      if (e?.detail !== undefined) {
        setClub(e.detail);
        if (e.detail) {
          setName(e.detail.name || "");
          setDays(Number(e.detail.days) || 5);
          setTempDays(Number(e.detail.days) || 5);
          setTeamsList(e.detail.teams || []);
          setTeamsCount((e.detail.teams || []).length || 2);
          setStep(4);
        } else {
          setStep(1);
        }
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

  // ── Games Data Sync ──
  const totalDays = useMemo(() => Math.max(1, Number(club?.days || days) || 5), [club, days]);
  const daysList = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);
  const currentTeams = useMemo(() => club?.teams || teamsList || [], [club, teamsList]);

  useEffect(() => {
    if (!club || currentTeams.length === 0) return;

    const savedArena = summerGameArenaDB.get();
    const teamIds = new Set(currentTeams.map((t) => t.id));

    if (savedArena && Array.isArray(savedArena.games) && savedArena.games.length > 0) {
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
      // Seed initial round for each day
      const seeded = daysList.map((d) => {
        const scores = {};
        currentTeams.forEach((t) => {
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
  }, [club?.id, currentTeams.length, totalDays, lang]);

  // Save games whenever updated
  const persistGames = (nextGames) => {
    setGames(nextGames);
    summerGameArenaDB.set({
      clubId: club?.id || CLUB_ID,
      games: nextGames,
    });
  };

  // ── Database Persist for Club ──
  const persistClub = (nextClub) => {
    setClub(nextClub);
    summerClubDB.set(CLUB_ID, nextClub);
    if (onClubCreated) onClubCreated(nextClub);
  };

  // ── Students List & Assignment Helpers ──
  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db)
      .map((id) => ({ qrId: id, ...db[id] }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", lang === "ar" ? "ar" : "en"));
  }, [lang]);

  const teamOf = (qrId) => currentTeams.find((tm) => tm.members && tm.members.includes(qrId));

  const assignedCount = useMemo(
    () => new Set(currentTeams.flatMap((tm) => tm.members || [])).size,
    [currentTeams]
  );

  const filteredStudents = useMemo(() => {
    const q = normalizeArabic(search.toLowerCase().trim());
    if (!q) return allStudents;
    return allStudents.filter(
      (s) => normalizeArabic(s.name?.toLowerCase()).includes(q) || String(s.qrId).includes(q)
    );
  }, [allStudents, search]);

  // ── Step 1 Submit: Name, Days, Teams Count ──
  const handleStep1Submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.show(t("clubEmptyName"));
      return;
    }

    const validDays = Math.max(1, Number(days) || 5);
    const validCount = Math.max(1, Number(teamsCount) || 2);

    // Initialize or adjust teamsList to match count
    let updatedTeams = [...teamsList];
    if (updatedTeams.length < validCount) {
      const needed = validCount - updatedTeams.length;
      const startIdx = updatedTeams.length;
      for (let i = 0; i < needed; i++) {
        const idx = startIdx + i;
        updatedTeams.push({
          id: `t_${Date.now()}_${idx}`,
          name: `${lang === "ar" ? "فريق" : "Team"} ${idx + 1}`,
          color: CLUB_TEAM_COLORS[idx % CLUB_TEAM_COLORS.length],
          members: [],
        });
      }
    } else if (updatedTeams.length > validCount) {
      updatedTeams = updatedTeams.slice(0, validCount);
    }

    setTeamsList(updatedTeams);
    setDays(validDays);
    setStep(2);
  };

  // ── Step 2 Handlers: Team Names and Colors ──
  const handleUpdateTeamName = (teamId, newName) => {
    setTeamsList((prev) =>
      prev.map((tm) => (tm.id === teamId ? { ...tm, name: newName } : tm))
    );
  };

  const handleUpdateTeamColor = (teamId, newColor) => {
    setTeamsList((prev) =>
      prev.map((tm) => (tm.id === teamId ? { ...tm, color: newColor } : tm))
    );
  };

  const handleAddNewTeam = () => {
    const nextIdx = teamsList.length;
    const newTeam = {
      id: `t_${Date.now()}_${nextIdx}`,
      name: `${lang === "ar" ? "فريق" : "Team"} ${nextIdx + 1}`,
      color: CLUB_TEAM_COLORS[nextIdx % CLUB_TEAM_COLORS.length],
      members: [],
    };
    setTeamsList((prev) => [...prev, newTeam]);
    setTeamsCount((c) => c + 1);
  };

  const handleDeleteTeam = (teamId) => {
    if (teamsList.length <= 1) return;
    setTeamsList((prev) => prev.filter((tm) => tm.id !== teamId));
    setTeamsCount((c) => Math.max(1, c - 1));
  };

  // ── Step 3 Handlers: Assigning Children ──
  const handleAssignChild = (qrId, teamId) => {
    setTeamsList((prev) =>
      prev.map((tm) => {
        const without = (tm.members || []).filter((m) => m !== qrId);
        return tm.id === teamId ? { ...tm, members: [...without, qrId] } : { ...tm, members: without };
      })
    );
  };

  const handleUnassignChild = (qrId) => {
    setTeamsList((prev) =>
      prev.map((tm) => ({ ...tm, members: (tm.members || []).filter((m) => m !== qrId) }))
    );
  };

  // ── Save Whole Club to Database ──
  const handleSaveWholeClub = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.show(t("clubEmptyName"));
      return;
    }
    const finalClub = {
      id: CLUB_ID,
      name: trimmed,
      days: Math.max(1, Number(days) || 5),
      createdAt: club?.createdAt || Date.now(),
      teams: teamsList,
    };
    persistClub(finalClub);
    toast.show(t("clubCreated"));
    setStep(4);
  };

  // ── Start New Club Action ──
  const handleStartNewClub = () => {
    summerClubDB.remove(CLUB_ID);
    summerGameArenaDB.clear();
    setClub(null);
    setName("");
    setDays(5);
    setTempDays(5);
    setTeamsCount(2);
    setTeamsList([]);
    setGames([]);
    setConfirmReset(false);
    setShowAdminMenu(false);
    if (onClubCreated) onClubCreated(null);
    setStep(1);
    toast.show(t("clubReset"));
  };

  // ── Quick Update Days Modal ──
  const handleSaveDaysOnly = () => {
    const valid = Math.max(1, Number(tempDays) || 5);
    const updated = { ...club, days: valid };
    persistClub(updated);
    setDays(valid);
    setEditingDaysModal(false);
    toast.show(t("clubSaved"));
  };

  // ── Games Management Handlers ──
  const handleUpdateScore = (gameId, teamId, val) => {
    const nextGames = games.map((g) =>
      g.id === gameId ? { ...g, scores: { ...g.scores, [teamId]: val } } : g
    );
    persistGames(nextGames);
  };

  const handleAddRound = () => {
    const rName = modalRoundName.trim() || `${lang === "ar" ? "الجولة" : "Round"} ${games.length + 1}`;
    const initialScores = {};
    currentTeams.forEach((t) => {
      initialScores[t.id] = "";
    });
    const newGame = {
      id: Date.now(),
      day: Math.min(totalDays, Math.max(1, Number(modalRoundDay) || 1)),
      name: rName,
      scores: initialScores,
    };
    persistGames([...games, newGame]);
    setModalRoundName("");
    setShowAddRoundModal(false);
    toast.show(t("clubSaved"));
  };

  const handleRemoveRound = (gameId) => {
    persistGames(games.filter((g) => g.id !== gameId));
  };

  const displayedGames = useMemo(() => {
    if (selectedDay === "all") return games;
    return games.filter((g) => Number(g.day) === Number(selectedDay));
  }, [games, selectedDay]);

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-10 flex flex-col items-center justify-center text-center gap-5">
          <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-3xl animate-bounce">
            ⏳
          </div>
          <h3 className="text-2xl font-black uppercase text-black tracking-tight">{t("loading")}</h3>
        </div>
      </div>
    );
  }

  // ── RESULTS CELEBRATION VIEW ──
  if (showResultsView) {
    return (
      <ResultsCelebrationView
        teams={currentTeams}
        games={games}
        onBack={() => setShowResultsView(false)}
        lang={lang}
        t={t}
      />
    );
  }

  // ── WIZARD STEPS DEFINITIONS ──
  const wizardSteps = [
    { id: 1, label: t("clubStep1"), icon: <Sparkles className="w-4 h-4 stroke-[3]" /> },
    { id: 2, label: t("clubStep2"), icon: <Users className="w-4 h-4 stroke-[3]" /> },
    { id: 3, label: t("clubStep3"), icon: <UserPlus className="w-4 h-4 stroke-[3]" /> },
    { id: 4, label: t("clubStep4"), icon: <LayoutDashboard className="w-4 h-4 stroke-[3]" /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toast msg={toast.msg} />

      {/* ── Stepper Header (Only shown during Setup/Edit Mode steps 1, 2, 3) ── */}
      {step < 4 && (
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="bg-[#A3E635] text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
              {club ? t("clubEditClub") : t("clubCreateNewTitle")}
            </span>
            <span className="font-mono text-xs font-black text-black/60">
              {step} / 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {wizardSteps.slice(0, 3).map((s) => {
              const active = s.id === step;
              const done = s.id < step;
              return (
                <button
                  key={s.id}
                  onClick={() => s.id <= step && setStep(s.id)}
                  className={`flex items-center justify-center gap-2 border-2 border-black py-2.5 px-3 font-black text-xs uppercase transition-all rounded-none ${
                    active
                      ? "bg-black text-[#A3E635] shadow-[2px_2px_0px_#000000]"
                      : done
                      ? "bg-[#A3E635] text-black shadow-[2px_2px_0px_#000000]"
                      : "bg-[#FDF8F0] text-black/40"
                  }`}
                >
                  <span className={`w-5 h-5 flex items-center justify-center border border-black font-black text-[10px] ${
                    done ? "bg-black text-[#A3E635]" : "bg-white text-black"
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ACCORDING TO CURRENT STEP ── */}
      <AnimatePresence mode="wait">

        {/* ═══════════════════════════════════════════════════════════════
            STEP 1: Create Club Form (Name, Days, Number of Teams)
        ═══════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <Motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-10 flex flex-col gap-6"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t("clubCreateNewTitle")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                {t("clubCreateNewTitle")}
              </h2>
              <p className="text-sm font-bold text-black/70 max-w-lg">
                {t("clubCreateHint")}
              </p>
            </div>

            {/* Field 1: Club Name (اسم النادي) */}
            <label className="flex flex-col gap-2">
              <span className="font-black text-sm uppercase flex items-center gap-2">
                🏷️ {t("clubNameLabel")}
              </span>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStep1Submit()}
                placeholder={lang === "ar" ? "مثال: نادي القديس مارمرقس الصيفي" : "e.g. St. Mark Summer Club"}
                className="w-full bg-white border-[3px] border-black px-4 py-3 font-black text-lg placeholder:text-black/40 outline-none focus:shadow-[5px_5px_0px_#000000] transition-shadow"
              />
            </label>

            {/* Field 2: Number of Days (عدد أيام النادي) */}
            <div className="flex flex-col gap-2 pt-3 border-t-2 border-black/10">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm uppercase flex items-center gap-2">
                  📅 {t("clubDaysLabel")}
                </span>
                <span className="bg-[#FEF08A] border-2 border-black px-2.5 py-0.5 text-xs font-black shadow-[1px_1px_0px_#000000]">
                  {days} {t("clubDaysUnit")}
                </span>
              </div>
              <p className="text-xs font-bold text-black/60">{t("clubDaysHint")}</p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDays((d) => Math.max(1, (Number(d) || 1) - 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black font-black text-xl shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-28 text-center bg-white border-[3px] border-black px-3 py-2.5 font-black text-xl outline-none focus:shadow-[4px_4px_0px_#000000]"
                />
                <button
                  type="button"
                  onClick={() => setDays((d) => Math.min(60, (Number(d) || 1) + 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black font-black text-xl shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                >
                  +
                </button>
                <span className="font-black text-sm text-black/70">{t("clubDaysUnit")}</span>
              </div>

              {/* Days Presets */}
              <div className="flex gap-2 flex-wrap mt-1">
                {[3, 5, 7, 10, 14].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 border-2 border-black font-black text-xs uppercase cursor-pointer transition-all ${
                      days === d
                        ? "bg-[#FACC15] shadow-[2px_2px_0px_#000000] scale-105"
                        : "bg-white text-black/70 hover:bg-[#FEF08A]"
                    }`}
                  >
                    {d} {t("clubDaysUnit")}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Number of Teams (عدد الفرق) */}
            <div className="flex flex-col gap-2 pt-3 border-t-2 border-black/10">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm uppercase flex items-center gap-2">
                  🏆 {t("clubTeamsCountLabel")}
                </span>
                <span className="bg-[#38BDF8] border-2 border-black px-2.5 py-0.5 text-xs font-black shadow-[1px_1px_0px_#000000]">
                  {teamsCount} {t("clubTotalTeams")}
                </span>
              </div>
              <p className="text-xs font-bold text-black/60">{t("clubTeamsCountHint")}</p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTeamsCount((c) => Math.max(1, (Number(c) || 1) - 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black font-black text-xl shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={teamsCount}
                  onChange={(e) => setTeamsCount(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                  className="w-28 text-center bg-white border-[3px] border-black px-3 py-2.5 font-black text-xl outline-none focus:shadow-[4px_4px_0px_#000000]"
                />
                <button
                  type="button"
                  onClick={() => setTeamsCount((c) => Math.min(12, (Number(c) || 1) + 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black font-black text-xl shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                >
                  +
                </button>
                <span className="font-black text-sm text-black/70">{t("clubTotalTeams")}</span>
              </div>

              {/* Teams Count Presets */}
              <div className="flex gap-2 flex-wrap mt-1">
                {[2, 3, 4, 5, 6].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTeamsCount(c)}
                    className={`px-3 py-1.5 border-2 border-black font-black text-xs uppercase cursor-pointer transition-all ${
                      teamsCount === c
                        ? "bg-[#38BDF8] shadow-[2px_2px_0px_#000000] scale-105"
                        : "bg-white text-black/70 hover:bg-[#38BDF8]/20"
                    }`}
                  >
                    {c} {t("clubTotalTeams")}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Step 1 */}
            <div className="pt-4 border-t-2 border-black/10 flex justify-end">
              <button
                type="button"
                onClick={handleStep1Submit}
                className="bg-[#A3E635] text-black border-[3px] border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{t("clubStep1Submit")}</span>
                <ChevronIcon className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </Motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 2: Setup Teams (Name and Color Picker for each team)
        ═══════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <Motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#38BDF8] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black uppercase">{t("clubTeamsTitle")}</h2>
                    <p className="text-xs font-bold text-black/60">{t("clubTeamsHint")}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewTeam}
                  className="bg-[#A3E635] text-black border-2 border-black px-3.5 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t("clubAddTeam")}</span>
                </button>
              </div>
            </div>

            {/* List of Teams with Name & Color Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamsList.map((tm, idx) => (
                <div
                  key={tm.id}
                  className="bg-white border-[3px] border-black shadow-[5px_5px_0px_#000000] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs bg-black text-white px-2 py-0.5">
                        0{idx + 1}
                      </span>
                      <span className="font-black text-sm uppercase text-black/70">
                        {t("gameTeamPrefix")} {idx + 1}
                      </span>
                    </div>

                    {teamsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(tm.id)}
                        className="text-black/40 hover:text-[#EF4444] p-1 cursor-pointer transition-colors"
                        title={t("clubDeleteTeam")}
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* Team Name Input */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black uppercase text-black/70">
                      {t("clubTeamNamePlaceholder")}
                    </span>
                    <input
                      type="text"
                      value={tm.name}
                      onChange={(e) => handleUpdateTeamName(tm.id, e.target.value)}
                      placeholder={`${t("gameTeamPrefix")} ${idx + 1}`}
                      className="bg-[#FDF8F0] border-2 border-black px-3 py-2 font-black text-base outline-none focus:bg-white focus:shadow-[3px_3px_0px_#000000] transition-all"
                    />
                  </div>

                  {/* Color Picker Section */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-black/70 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 stroke-[2.5]" />
                        {t("clubPickColor")}
                      </span>
                      <span
                        style={{ backgroundColor: tm.color }}
                        className="w-6 h-6 border-2 border-black shadow-[1px_1px_0px_#000000]"
                      />
                    </div>

                    {/* Presets + Custom Color */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {CLUB_TEAM_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateTeamColor(tm.id, c)}
                          style={{ backgroundColor: c }}
                          className={`w-7 h-7 border-2 border-black cursor-pointer transition-all ${
                            tm.color === c ? "scale-110 shadow-[2px_2px_0px_#000000]" : "opacity-80 hover:opacity-100"
                          }`}
                        >
                          {tm.color === c && <Check className="w-3.5 h-3.5 stroke-[3] mx-auto text-black" />}
                        </button>
                      ))}

                      {/* Native Color Picker for custom color */}
                      <label
                        className="w-7 h-7 border-2 border-black bg-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000000] hover:scale-105 transition-transform"
                        title={t("clubCustomColor")}
                      >
                        <input
                          type="color"
                          value={tm.color}
                          onChange={(e) => handleUpdateTeamColor(tm.id, e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-xs font-black">+</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Row */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-white border-[3px] border-black px-5 py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <BackIcon className="w-4 h-4 stroke-[3]" />
                <span>{t("clubPrev")}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#A3E635] text-black border-[3px] border-black px-6 py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{t("clubStep2Submit")}</span>
                <ChevronIcon className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </Motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 3: Assign Children to Teams (One Team Per Child)
        ═══════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <Motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F472B6] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                  <UserPlus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black uppercase">{t("clubMembersTitle")}</h2>
                  <p className="text-xs font-bold text-black/60">{t("clubAssignHint")}</p>
                </div>
              </div>

              {/* Assignment Stats Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-[#A3E635] border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000000]">
                  🎒 {assignedCount} {t("clubTotalMembers")}
                </div>
                <div className="bg-[#FB923C] border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000000]">
                  ⏳ {Math.max(0, allStudents.length - assignedCount)} {t("clubUnassignedCount")}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center bg-white border-[3px] border-black">
                <div className="bg-[#A3E635] border-e-[3px] border-black p-2.5 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 stroke-[3]" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("clubSearchPlaceholder")}
                  className="w-full bg-transparent px-4 py-2.5 font-black placeholder:text-black/40 outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mx-2 bg-[#F472B6] border-2 border-black p-1 shadow-[2px_2px_0px_#000000] hover:shadow-none transition-all cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>

            {/* Students List */}
            {filteredStudents.length === 0 ? (
              <div className="bg-white border-[3px] border-dashed border-black/40 p-8 text-center font-black text-black/50">
                {t("clubNoStudents")}
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {filteredStudents.map((s) => {
                  const assignedTeam = teamOf(s.qrId);
                  return (
                    <div
                      key={s.qrId}
                      className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000000] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          style={{ backgroundColor: assignedTeam?.color || "#E5E7EB" }}
                          className="w-9 h-9 border-2 border-black shrink-0 flex items-center justify-center font-black text-sm"
                        >
                          {(s.name || "M")[0]?.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black truncate">{s.name}</p>
                          <p className="text-xs font-bold text-black/50">
                            {assignedTeam ? assignedTeam.name : t("clubUnassigned")}
                          </p>
                        </div>
                      </div>

                      {/* Team Assignment Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {teamsList.map((tm) => {
                          const isAssigned = assignedTeam?.id === tm.id;
                          return (
                            <button
                              key={tm.id}
                              type="button"
                              onClick={() => handleAssignChild(s.qrId, tm.id)}
                              style={{ backgroundColor: tm.color }}
                              className={`px-3 py-1.5 border-2 border-black font-black text-xs uppercase transition-all cursor-pointer ${
                                isAssigned
                                  ? "shadow-none translate-x-0.5 translate-y-0.5 ring-2 ring-black"
                                  : "shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 opacity-80 hover:opacity-100"
                              }`}
                            >
                              {isAssigned && <Check className="w-3.5 h-3.5 stroke-[3] inline-block me-1" />}
                              {tm.name}
                            </button>
                          );
                        })}
                        {assignedTeam && (
                          <button
                            type="button"
                            onClick={() => handleUnassignChild(s.qrId)}
                            className="bg-white border-2 border-black px-2 py-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                            title={t("clubUnassigned")}
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Navigation Row */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-white border-[3px] border-black px-5 py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <BackIcon className="w-4 h-4 stroke-[3]" />
                <span>{t("clubPrev")}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveWholeClub}
                className="bg-[#A3E635] text-black border-[3px] border-black px-7 py-3 font-black text-sm uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{t("clubSaveAndFinish")}</span>
              </button>
            </div>
          </Motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 4: State B — Full Club Dashboard (Days, Teams, and Games)
        ═══════════════════════════════════════════════════════════════ */}
        {step === 4 && club && (
          <Motion.div
            key="step4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-8"
          >
            {/* ── Top Header / Overview Card ── */}
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
                  <LayoutDashboard className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t("clubStep4")}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-none break-words">
                  {club.name}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-black/60">
                  {new Date(club.createdAt || Date.now()).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                </p>
              </div>

              {/* Badges / Stats */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-[#FACC15] border-[3px] border-black shadow-[3px_3px_0px_#000000] p-3 text-center min-w-[80px]">
                  <span className="text-2xl font-black block leading-none">{totalDays}</span>
                  <span className="text-[10px] font-black uppercase text-black/70 mt-1 block">{t("clubDaysUnit")}</span>
                </div>

                <div className="bg-[#38BDF8] border-[3px] border-black shadow-[3px_3px_0px_#000000] p-3 text-center min-w-[80px]">
                  <span className="text-2xl font-black block leading-none">{currentTeams.length}</span>
                  <span className="text-[10px] font-black uppercase text-black/70 mt-1 block">{t("clubTotalTeams")}</span>
                </div>

                <div className="bg-[#A3E635] border-[3px] border-black shadow-[3px_3px_0px_#000000] p-3 text-center min-w-[80px]">
                  <span className="text-2xl font-black block leading-none">{assignedCount}</span>
                  <span className="text-[10px] font-black uppercase text-black/70 mt-1 block">{t("clubTotalMembers")}</span>
                </div>

                {/* Admin Secondary Menu Trigger */}
                {currentUser?.role === "admin" && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAdminMenu((v) => !v)}
                      className="bg-black text-[#A3E635] border-2 border-black p-2.5 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                      title={t("clubAdminMenu")}
                    >
                      <Settings2 className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <AnimatePresence>
                      {showAdminMenu && (
                        <>
                          <div className="fixed inset-0 z-[190]" onClick={() => setShowAdminMenu(false)} />
                          <Motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            className={`absolute top-full mt-2 ${
                              lang === "ar" ? "left-0" : "right-0"
                            } z-[200] bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] flex flex-col min-w-[200px]`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setShowAdminMenu(false);
                                setStep(1);
                              }}
                              className="flex items-center gap-2 px-4 py-3 font-black text-sm uppercase hover:bg-[#FEF08A] border-b-2 border-black transition-colors cursor-pointer text-left rtl:text-right"
                            >
                              <Pencil className="w-4 h-4 stroke-[3]" />
                              <span>{t("clubEditClub")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAdminMenu(false);
                                setConfirmReset(true);
                              }}
                              className="flex items-center gap-2 px-4 py-3 font-black text-sm uppercase hover:bg-[#EF4444] hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                              <span>{t("clubStartNew")}</span>
                            </button>
                          </Motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* ── Days Section (Day 1, Day 2 ... Day N) ── */}
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 border-b-2 border-black pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center">
                    <Calendar className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase">{t("summerDaysTitle")}</h3>
                    <p className="text-xs font-bold text-black/60">
                      {totalDays} {t("clubDaysUnit")} — {t("gameScheduleTitle")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTempDays(totalDays);
                    setEditingDaysModal(true);
                  }}
                  className="bg-white border-2 border-black px-3 py-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t("clubEditDays")}</span>
                </button>
              </div>

              {/* Days Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {daysList.map((dayNum) => {
                  const isActive = selectedDay === dayNum;
                  const dayGames = games.filter((g) => Number(g.day) === dayNum);
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDay(dayNum)}
                      className={`flex items-center gap-2 border-[3px] border-black px-4 py-2 font-black text-sm uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? "bg-[#FACC15] text-black shadow-[4px_4px_0px_#000000] -translate-y-0.5"
                          : "bg-[#FDF8F0] text-black/80 shadow-[2px_2px_0px_#000000] hover:bg-white"
                      }`}
                    >
                      <span>
                        {t("gameDayPrefix")} {dayNum}
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 border border-black ${
                        isActive ? "bg-black text-[#FACC15]" : "bg-white text-black"
                      }`}>
                        {dayGames.length}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedDay("all")}
                  className={`border-[3px] border-black px-4 py-2 font-black text-sm uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedDay === "all"
                      ? "bg-black text-[#A3E635] shadow-[4px_4px_0px_#000000] -translate-y-0.5"
                      : "bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-[#FDF8F0]"
                  }`}
                >
                  {t("gameAllDays")}
                </button>
              </div>
            </div>

            {/* ── Teams Section (Each team in its own color with children assigned) ── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#A78BFA] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 stroke-[2.5] text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase">{t("clubTeamsTitle")}</h3>
                    <p className="text-xs font-bold text-black/60">
                      {currentTeams.length} {t("clubTotalTeams")} — {assignedCount} {t("clubTotalMembers")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMembersInDashboard(!showMembersInDashboard)}
                  className="bg-white border-2 border-black px-3 py-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  {showMembersInDashboard ? t("gameHide") : t("gameShow")} {t("gameMembers")}
                </button>
              </div>

              <div className={`grid gap-4 ${
                currentTeams.length === 1
                  ? "grid-cols-1"
                  : currentTeams.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              }`}>
                {currentTeams.map((tm) => {
                  const dayScore = (selectedDay === "all" ? games : games.filter((g) => Number(g.day) === Number(selectedDay)))
                    .reduce((acc, g) => acc + (Number(g.scores[tm.id]) || 0), 0);
                  const totalScore = games.reduce((acc, g) => acc + (Number(g.scores[tm.id]) || 0), 0);
                  const members = tm.members || [];

                  return (
                    <div
                      key={tm.id}
                      className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] flex flex-col overflow-hidden"
                    >
                      {/* Header in Team Color */}
                      <div
                        style={{ backgroundColor: tm.color }}
                        className="border-b-[3px] border-black p-4 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-1">
                          <h4 className="text-xl sm:text-2xl font-black text-black uppercase truncate">
                            {tm.name}
                          </h4>
                          <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 border border-black uppercase mt-1 inline-block">
                            {members.length} {t("clubTeamMembers")}
                          </span>
                        </div>
                        <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_#000000]">
                          ⚽
                        </div>
                      </div>

                      {/* Score Boxes */}
                      <div className="p-3 bg-[#FDF8F0] border-b-[2px] border-black grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_#000000]">
                          <span className="text-xl font-black text-black tabular-nums block leading-none">
                            {dayScore}
                          </span>
                          <span className="text-[10px] font-black uppercase text-black/60 mt-1 block">
                            {selectedDay === "all" ? t("gameAllDays") : `${t("gameDayPrefix")} ${selectedDay}`}
                          </span>
                        </div>
                        <div className="bg-black text-white border-2 border-black p-2 shadow-[2px_2px_0px_#000000]">
                          <span className="text-xl font-black text-[#A3E635] tabular-nums block leading-none">
                            {totalScore}
                          </span>
                          <span className="text-[10px] font-black uppercase text-white/70 mt-1 block">
                            {t("gameOverallScore")}
                          </span>
                        </div>
                      </div>

                      {/* Members List */}
                      {showMembersInDashboard && (
                        <div className="p-3 flex-1 flex flex-col gap-2">
                          <span className="text-xs font-black uppercase text-black/70 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                            {t("gameAssignedChildren")} ({members.length})
                          </span>

                          {members.length === 0 ? (
                            <p className="text-xs font-bold text-black/40 text-center py-4 italic">
                              {t("gameNoChildrenInTeam")}
                            </p>
                          ) : (
                            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                              {members.map((qrId) => {
                                const s = allStudents.find((x) => x.qrId === qrId);
                                const displayName = s?.name || `#${qrId}`;
                                return (
                                  <div
                                    key={qrId}
                                    className="flex items-center justify-between bg-[#FDF8F0] border border-black px-2.5 py-1.5 text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        style={{ backgroundColor: tm.color }}
                                        className="w-5 h-5 border border-black font-black text-[10px] flex items-center justify-center shrink-0"
                                      >
                                        {(displayName || "M")[0]?.toUpperCase()}
                                      </span>
                                      <span className="font-bold truncate">{displayName}</span>
                                    </div>
                                    <span className="font-mono text-[10px] text-black/40">#{qrId}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Games Section (Everything from Summer Games now lives here!) ── */}
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#A3E635] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0 text-xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-tight">{t("clubGamesTitle")}</h3>
                    <p className="text-xs font-bold text-black/60">
                      {selectedDay === "all" ? t("gameAllDays") : `${t("gameDayPrefix")} ${selectedDay}`} — {displayedGames.length} {t("gameRoundsPoints")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalRoundDay(selectedDay === "all" ? 1 : selectedDay);
                      setModalRoundName(
                        lang === "ar"
                          ? `جولة ${displayedGames.length + 1}`
                          : `Round ${displayedGames.length + 1}`
                      );
                      setShowAddRoundModal(true);
                    }}
                    className="bg-[#A3E635] text-black border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{t("gameNewRound")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResultsView(true)}
                    className="bg-[#FACC15] text-black border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 stroke-[2.5]" />
                    <span>{t("gameArenaResults")}</span>
                  </button>
                </div>
              </div>

              {/* Games & Scores Grid */}
              {displayedGames.length === 0 ? (
                <div className="bg-[#FDF8F0] border-[2px] border-dashed border-black/30 p-8 text-center flex flex-col items-center gap-2">
                  <span className="text-2xl">🎲</span>
                  <p className="font-bold text-sm text-black/60">{t("gameNoRoundsYet")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedGames.map((game) => (
                    <div
                      key={game.id}
                      className="bg-[#FDF8F0] border-2 border-black p-4 flex flex-col gap-3 shadow-[3px_3px_0px_#000000]"
                    >
                      <div className="flex items-center justify-between border-b border-black/20 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#FACC15] border border-black text-[10px] font-black px-2 py-0.5">
                            {t("gameDayPrefix")} {game.day || 1}
                          </span>
                          <span className="font-black text-sm text-black truncate">{game.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRound(game.id)}
                          className="text-black/40 hover:text-[#EF4444] p-1 cursor-pointer transition-colors"
                          title={t("gameDeleteRound")}
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                      {/* Inputs per Team */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {currentTeams.map((tm) => (
                          <div key={tm.id} className="flex flex-col gap-1">
                            <span
                              className="text-[10px] font-black uppercase truncate flex items-center gap-1"
                              style={{ color: "#000000" }}
                            >
                              <span
                                style={{ backgroundColor: tm.color }}
                                className="w-2.5 h-2.5 border border-black inline-block shrink-0"
                              />
                              <span className="truncate">{tm.name}</span>
                            </span>
                            <input
                              type="number"
                              value={game.scores[tm.id] ?? ""}
                              onChange={(e) => handleUpdateScore(game.id, tm.id, e.target.value)}
                              placeholder="0"
                              className="h-9 bg-white border-2 border-black text-black font-black text-sm text-center outline-none focus:bg-[#FEF08A] transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leaderboard / Standings */}
              <div className="border-t-2 border-black pt-4 flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                  <Trophy className="w-4 h-4 stroke-[2.5]" />
                  {t("gameCurrentTotal")}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[...currentTeams]
                    .map((tm) => {
                      const score = games.reduce((acc, g) => acc + (Number(g.scores[tm.id]) || 0), 0);
                      return { ...tm, score };
                    })
                    .sort((a, b) => b.score - a.score)
                    .map((tm, idx) => (
                      <div
                        key={tm.id}
                        className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_#000000] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-black text-xs text-black/50">#{idx + 1}</span>
                          <span
                            style={{ backgroundColor: tm.color }}
                            className="w-3.5 h-3.5 border border-black shrink-0"
                          />
                          <span className="font-black text-xs truncate">{tm.name}</span>
                        </div>
                        <span className="font-mono font-black text-base tabular-nums">{tm.score}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Round Modal ── */}
      <AnimatePresence>
        {showAddRoundModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h4 className="text-lg font-black uppercase">{t("gameModalAddNewRound")}</h4>
                <button
                  type="button"
                  onClick={() => setShowAddRoundModal(false)}
                  className="bg-white border-2 border-black p-1 shadow-[2px_2px_0px_#000000] hover:shadow-none transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Day selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase">📅 {t("gameDayPrefix")}</label>
                <div className="flex gap-2 flex-wrap">
                  {daysList.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setModalRoundDay(d)}
                      className={`px-3 py-1.5 border-2 border-black font-black text-xs uppercase cursor-pointer ${
                        modalRoundDay === d ? "bg-[#FACC15] shadow-[2px_2px_0px_#000000]" : "bg-white"
                      }`}
                    >
                      {t("gameDayPrefix")} {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Round Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase">{t("gameModalRoundName")}</label>
                <input
                  type="text"
                  autoFocus
                  value={modalRoundName}
                  onChange={(e) => setModalRoundName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRound()}
                  placeholder={t("gameModalPlaceholderRound")}
                  className="w-full h-11 bg-white border-2 border-black px-3 font-black text-sm outline-none focus:bg-[#FEF08A]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoundModal(false)}
                  className="flex-1 bg-white border-2 border-black py-2.5 font-black uppercase text-xs shadow-[2px_2px_0px_#000000] hover:shadow-none cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleAddRound}
                  className="flex-1 bg-[#A3E635] text-black border-2 border-black py-2.5 font-black uppercase text-xs shadow-[2px_2px_0px_#000000] hover:shadow-none cursor-pointer"
                >
                  {t("gameModalAddRound")}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Days Modal ── */}
      <AnimatePresence>
        {editingDaysModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h4 className="text-lg font-black uppercase">📅 {t("clubEditDays")}</h4>
                <button
                  type="button"
                  onClick={() => setEditingDaysModal(false)}
                  className="bg-white border-2 border-black p-1 shadow-[2px_2px_0px_#000000] hover:shadow-none cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => setTempDays((d) => Math.max(1, (Number(d) || 1) - 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black font-black text-xl shadow-[3px_3px_0px_#000000] hover:shadow-none cursor-pointer flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={tempDays}
                  onChange={(e) => setTempDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center bg-white border-[3px] border-black px-2 py-2 font-black text-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTempDays((d) => Math.min(60, (Number(d) || 1) + 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black font-black text-xl shadow-[3px_3px_0px_#000000] hover:shadow-none cursor-pointer flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDaysModal(false)}
                  className="flex-1 bg-white border-2 border-black py-2 font-black uppercase text-xs shadow-[2px_2px_0px_#000000]"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDaysOnly}
                  className="flex-1 bg-[#A3E635] text-black border-2 border-black py-2 font-black uppercase text-xs shadow-[2px_2px_0px_#000000]"
                >
                  {t("save")}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Start New Club Confirmation Dialog ── */}
      <AnimatePresence>
        {confirmReset && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 text-center flex flex-col items-center gap-5"
            >
              <div className="w-16 h-16 bg-[#EF4444] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-white">
                <AlertTriangle className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black uppercase">{t("clubStartNewConfirm")}</h3>
              <p className="text-sm font-bold text-black/70">{t("clubStartNewDesc")}</p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={handleStartNewClub}
                  className="flex-1 bg-[#EF4444] text-white border-2 border-black py-2.5 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none transition-all cursor-pointer"
                >
                  {t("clubStartNew")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-white border-2 border-black py-2.5 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none transition-all cursor-pointer"
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

// ─── Results Celebration & Podium Reveal View ───────────────────────────────
function ResultsCelebrationView({ teams, games, onBack, lang, t }) {
  const [step, setStep] = useState(0);

  const results = useMemo(() => {
    return teams
      .map((tm) => {
        const score = games.reduce((acc, g) => acc + (Number(g.scores[tm.id]) || 0), 0);
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
              {t("summerBackClub")}
            </button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
