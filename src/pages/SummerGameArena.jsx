import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Minus,
  Trophy,
  Users,
  Settings,
  X,
  Pencil,
  Crown,
  Medal,
} from "lucide-react";
import { studentsDB, summerGameArenaDB } from "../data/storage";
import { motion as Motion, AnimatePresence } from "framer-motion";

// ─── Neo Brutalism Team Color Palette ───────────────────────────────────────
const GAME_TEAM_COLORS = [
  { name: "sky",    bg: "bg-[#38BDF8]",  border: "border-[#38BDF8]",  text: "text-black" },
  { name: "lime",   bg: "bg-[#A3E635]",  border: "border-[#A3E635]",  text: "text-black" },
  { name: "pink",   bg: "bg-[#F472B6]",  border: "border-[#F472B6]",  text: "text-black" },
  { name: "orange", bg: "bg-[#FB923C]",  border: "border-[#FB923C]",  text: "text-black" },
  { name: "yellow", bg: "bg-[#FACC15]",  border: "border-[#FACC15]",  text: "text-black" },
  { name: "white",  bg: "bg-white",      border: "border-white",       text: "text-black" },
];

const DEFAULT_TEAMS = () => [
  { id: "T1", name: "الفريق الأول",  members: [],  theme: GAME_TEAM_COLORS[0] },
  { id: "T2", name: "الفريق الثاني", members: [],  theme: GAME_TEAM_COLORS[1] },
];

const DEFAULT_GAMES = (teamIds) => {
  const scores = {};
  teamIds.forEach((id) => { scores[id] = ""; });
  return [{ id: 1, name: "الجولة الأولى", scores }];
};

function getRandomColor(usedNames = []) {
  const available = GAME_TEAM_COLORS.filter((c) => !usedNames.includes(c.name));
  const pool = available.length > 0 ? available : GAME_TEAM_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function mergeTeamTheme(theme) {
  if (theme && typeof theme === "object" && typeof theme.name === "string" && typeof theme.bg === "string") {
    return theme;
  }
  return GAME_TEAM_COLORS[Math.floor(Math.random() * GAME_TEAM_COLORS.length)];
}

function loadPersistedGameArena() {
  const raw = summerGameArenaDB.get();
  if (!raw || !Array.isArray(raw.teams) || !Array.isArray(raw.games)) return null;
  if (raw.teams.length < 1 || raw.games.length < 1) return null;

  const teams = raw.teams.map((t, i) => ({
    id: String(t.id ?? `T${i}`),
    name: typeof t.name === "string" && t.name.trim() ? t.name : `فريق ${i + 1}`,
    members: Array.isArray(t.members) ? t.members.map(String) : [],
    theme: mergeTeamTheme(t.theme),
  }));

  const teamIds = new Set(teams.map((t) => t.id));

  const games = raw.games.map((g, i) => {
    const scores = { ...(g.scores && typeof g.scores === "object" ? g.scores : {}) };
    for (const k of Object.keys(scores)) { if (!teamIds.has(k)) delete scores[k]; }
    for (const tid of teamIds) { if (!(tid in scores)) scores[tid] = ""; }
    const gid = g.id;
    const id =
      typeof gid === "number" && !Number.isNaN(gid) ? gid
      : typeof gid === "string" && /^\d+$/.test(gid) ? Number(gid)
      : Date.now() + i;
    return {
      id,
      name: typeof g.name === "string" && g.name.trim() ? g.name : `الجولة ${i + 1}`,
      scores,
    };
  });

  return { teams, games, showMembers: Boolean(raw.showMembers) };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SummerGameArena() {
  const [teams, setTeams] = useState(
    () => loadPersistedGameArena()?.teams ?? DEFAULT_TEAMS()
  );
  const [games, setGames] = useState(() => {
    const p = loadPersistedGameArena();
    return p?.games ?? DEFAULT_GAMES((p?.teams ?? DEFAULT_TEAMS()).map((t) => t.id));
  });
  const [showMembers, setShowMembers] = useState(
    () => loadPersistedGameArena()?.showMembers ?? false
  );
  const [addingToTeam, setAddingToTeam]       = useState(null);
  const [newMemberName, setNewMemberName]     = useState("");
  const [nameModal, setNameModal]             = useState(null);
  const [modalNameInput, setModalNameInput]   = useState("");
  const [modalThemeInput, setModalThemeInput] = useState(null);
  const [renameTeamId, setRenameTeamId]       = useState(null);
  const [showResults, setShowResults]         = useState(false);

  const closeNameModal = () => {
    setNameModal(null);
    setModalNameInput("");
    setModalThemeInput(null);
    setRenameTeamId(null);
  };

  useEffect(() => {
    if (!nameModal) return;
    const onKey = (e) => { if (e.key === "Escape") closeNameModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nameModal]);

  useEffect(() => {
    summerGameArenaDB.set({ teams, games, showMembers });
  }, [teams, games, showMembers]);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ id, ...db[id] }));
  }, []);

  const searchResults = useMemo(() => {
    const q = newMemberName.trim().toLowerCase();
    if (!q || !addingToTeam) return [];
    return allStudents.filter((s) =>
      s.name?.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [newMemberName, addingToTeam, allStudents]);

  const handleAddMember = (teamId, specificName = null) => {
    const nameToAdd = specificName || newMemberName.trim();
    if (!nameToAdd) return;
    setTeams((prev) =>
      prev.map((t) => t.id === teamId ? { ...t, members: [...t.members, nameToAdd] } : t)
    );
    setNewMemberName("");
    setAddingToTeam(null);
  };

  const handleRemoveMember = (teamId, index) => {
    setTeams((prev) =>
      prev.map((t) => t.id === teamId ? { ...t, members: t.members.filter((_, i) => i !== index) } : t)
    );
  };

  const openRenameTeamModal = (teamId) => {
    const t = teams.find((x) => x.id === teamId);
    if (!t) return;
    setRenameTeamId(teamId);
    setModalNameInput(t.name);
    setModalThemeInput(t.theme);
    setNameModal("renameTeam");
  };

  const confirmRenameTeam = () => {
    const name = modalNameInput.trim();
    if (!name || !renameTeamId) return;
    setTeams((prev) =>
      prev.map((t) => (t.id === renameTeamId ? { ...t, name, theme: modalThemeInput || t.theme } : t))
    );
    closeNameModal();
  };

  const openTeamNameModal = () => { setModalNameInput(""); setNameModal("team"); };

  const confirmAddTeam = () => {
    const name = modalNameInput.trim();
    if (!name) return;
    const newId = `T${Date.now()}`;
    const usedColors = teams.map((t) => t.theme?.name).filter(Boolean);
    const theme = getRandomColor(usedColors);
    setTeams((prev) => [...prev, { id: newId, name, members: [], theme }]);
    setGames((prev) => prev.map((g) => ({ ...g, scores: { ...g.scores, [newId]: "" } })));
    closeNameModal();
  };

  const openGameNameModal = () => {
    setModalNameInput(`الجولة ${games.length + 1}`);
    setNameModal("game");
  };

  const confirmAddGame = () => {
    const name = modalNameInput.trim();
    if (!name) return;
    const initialScores = {};
    teams.forEach((t) => { initialScores[t.id] = ""; });
    setGames((prev) => [...prev, { id: Date.now(), name, scores: initialScores }]);
    closeNameModal();
  };

  const handleRemoveTeam = (teamId) => {
    if (teams.length <= 1) return;
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setGames((prev) =>
      prev.map((g) => {
        const scores = { ...g.scores };
        delete scores[teamId];
        return { ...g, scores };
      })
    );
  };

  const handleRemoveGame = (id) => {
    if (games.length <= 1) return;
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateScore = (gameId, teamId, val) => {
    setGames((prev) =>
      prev.map((g) => g.id === gameId ? { ...g, scores: { ...g.scores, [teamId]: val } } : g)
    );
  };

  // ── RESULTS VIEW ──────────────────────────────────────────────────────────
  if (showResults) {
    return (
      <ResultsView
        teams={teams}
        games={games}
        onBack={() => setShowResults(false)}
      />
    );
  }

  return (
    <>
      <div className="flex-1 w-full flex flex-col" dir="rtl">
        <div className="w-full max-w-[95rem] mx-auto flex flex-col lg:flex-row p-3 sm:p-6 gap-6 pb-20">

          {/* ── Admin Panel (sidebar) ── */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[360px] bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4 sm:p-6 flex flex-col shrink-0 gap-6"
          >
            {/* Panel Header */}
            <div className="flex items-center gap-2 pb-4 border-b-[3px] border-black">
              <div className="w-9 h-9 bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center">
                <Settings className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-lg text-black uppercase">إدارة اللعبة</h3>
            </div>

            {/* Add Team Button */}
            <button
              type="button"
              onClick={openTeamNameModal}
              className="w-full flex items-center justify-center gap-2 bg-[#A3E635] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all font-black text-sm uppercase py-3 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>إضافة فريق</span>
            </button>

            {/* Games Management */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-black">
                  الجولات والنقاط
                </span>
                <button
                  type="button"
                  onClick={openGameNameModal}
                  className="bg-[#38BDF8] text-black border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-xs uppercase cursor-pointer"
                >
                  + جولة
                </button>
              </div>

              <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-1">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="bg-[#FDF8F0] border-2 border-black p-3 group/game"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-black">{game.name}</span>
                      <button
                        onClick={() => handleRemoveGame(game.id)}
                        className="text-black/40 hover:text-[#EF4444] transition-colors p-1 cursor-pointer"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {teams.map((team) => (
                        <div key={team.id} className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-black/60 uppercase truncate text-right">
                            {team.name}
                          </span>
                          <input
                            type="text"
                            value={game.scores[team.id] || ""}
                            onChange={(e) =>
                              handleUpdateScore(game.id, team.id, e.target.value)
                            }
                            placeholder="0"
                            className="h-9 bg-white border-2 border-black text-black font-black text-sm text-center outline-none focus:bg-[#FACC15] transition-colors px-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teams & Members */}
            <div className="flex flex-col gap-3 border-t-[3px] border-black pt-4">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-black flex items-center gap-2">
                  <Users className="w-4 h-4 stroke-[2.5]" />
                  الفرق والأعضاء
                </span>
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-xs uppercase cursor-pointer"
                >
                  {showMembers ? "إخفاء" : "عرض"}
                </button>
              </div>

              <AnimatePresence>
                {showMembers && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-y-auto flex flex-col gap-3 max-h-[35vh]"
                  >
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className={`border-[3px] border-black p-3 flex flex-col gap-3 ${team.theme.bg}`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-black text-sm text-black leading-snug flex-1 text-right">
                            {team.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openRenameTeamModal(team.id)}
                              className="w-8 h-8 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
                              title="تغيير الاسم"
                            >
                              <Pencil className="w-3.5 h-3.5 stroke-[2.5] text-black" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingToTeam(
                                  addingToTeam === team.id ? null : team.id
                                );
                                setNewMemberName("");
                              }}
                              className="w-8 h-8 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
                            >
                              {addingToTeam === team.id ? (
                                <Minus className="w-3.5 h-3.5 stroke-[3] text-black" />
                              ) : (
                                <Plus className="w-3.5 h-3.5 stroke-[3] text-black" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`حذف ${team.name}؟`))
                                  handleRemoveTeam(team.id);
                              }}
                              className="w-8 h-8 bg-[#EF4444] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3] text-white" />
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {addingToTeam === team.id && (
                            <Motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="relative"
                            >
                              <Search className="absolute right-3 top-2.5 w-4 h-4 text-black/40" />
                              <input
                                type="text"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleAddMember(team.id)
                                }
                                placeholder="ابحث..."
                                className="w-full h-10 bg-white border-2 border-black text-black font-bold text-sm pr-9 pl-3 outline-none"
                                autoFocus
                              />
                              {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-[100] bg-white border-2 border-black shadow-[3px_3px_0px_#000000]">
                                  {searchResults.map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() =>
                                        handleAddMember(team.id, s.name)
                                      }
                                      className="w-full text-right p-2.5 hover:bg-[#FACC15] flex items-center justify-between border-b-2 border-black last:border-0 text-xs font-bold text-black cursor-pointer"
                                    >
                                      <span>{s.name}</span>
                                      <span className="opacity-40 font-mono">
                                        {s.id}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </Motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-1.5">
                          {team.members.map((m, i) => (
                            <div
                              key={i}
                              className="group/memb text-xs font-bold text-black flex items-center justify-between bg-white/70 border border-black px-3 py-2"
                            >
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-black border border-black" />
                                {m}
                              </span>
                              <button
                                onClick={() => handleRemoveMember(team.id, i)}
                                className="opacity-100 sm:opacity-0 sm:group-hover/memb:opacity-100 text-[#EF4444] font-black text-base leading-none cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </Motion.div>

          {/* ── Teams Arena — Score Cards ── */}
          <div
            className={`flex-1 grid gap-4 sm:gap-6 h-fit ${
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
                handleRemoveTeam={handleRemoveTeam}
                onRenameTeam={openRenameTeamModal}
                delay={idx * 0.08}
              />
            ))}
          </div>
        </div>

        {/* Results Button */}
        <div className="w-full flex justify-center py-8 px-4">
          <Motion.button
            onClick={() => setShowResults(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#FACC15] text-black border-[3px] border-black shadow-[6px_6px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] active:shadow-none transition-all flex items-center gap-4 px-10 py-5 font-black text-2xl sm:text-3xl uppercase cursor-pointer"
          >
            <Trophy className="w-8 h-8 stroke-[2.5]" />
            <span>النتيجة</span>
          </Motion.button>
        </div>
      </div>

      {/* ── Name / Game Modal ── */}
      <AnimatePresence>
        {nameModal && (
          <Motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60"
            onClick={(e) => { if (e.target === e.currentTarget) closeNameModal(); }}
          >
            <Motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <h4 className="text-lg font-black text-black uppercase tracking-tight">
                  {nameModal === "renameTeam"
                    ? "تعديل اسم الفريق"
                    : nameModal === "team"
                    ? "فريق جديد"
                    : "جولة جديدة"}
                </h4>
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="bg-white border-2 border-black p-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3] text-black" />
                </button>
              </div>

              {/* Color Picker (rename only) */}
              {nameModal === "renameTeam" && (
                <div className="mb-5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-black/60 mb-2">
                    لون الفريق
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {GAME_TEAM_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setModalThemeInput(c)}
                        className={`w-10 h-10 border-[3px] border-black transition-all cursor-pointer ${c.bg} ${
                          modalThemeInput?.name === c.name
                            ? "shadow-[3px_3px_0px_#000000] scale-110"
                            : "opacity-50 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Name Input */}
              <label className="block text-[10px] font-black uppercase tracking-widest text-black/60 mb-2">
                {nameModal === "renameTeam"
                  ? "الاسم الجديد"
                  : nameModal === "team"
                  ? "اسم الفريق"
                  : "اسم الجولة"}
              </label>
              <input
                type="text"
                value={modalNameInput}
                onChange={(e) => setModalNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (nameModal === "renameTeam") confirmRenameTeam();
                    else if (nameModal === "team") confirmAddTeam();
                    else confirmAddGame();
                  }
                }}
                placeholder={
                  nameModal === "renameTeam"
                    ? "اسم الفريق..."
                    : nameModal === "team"
                    ? "اكتب اسم الفريق..."
                    : "اكتب اسم الجولة..."
                }
                className="w-full h-12 bg-white border-[3px] border-black text-black font-black text-base px-4 outline-none focus:bg-[#FEF08A] transition-colors mb-5"
                autoFocus
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="flex-1 h-12 bg-white border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-sm uppercase text-black cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={
                    nameModal === "renameTeam"
                      ? confirmRenameTeam
                      : nameModal === "team"
                      ? confirmAddTeam
                      : confirmAddGame
                  }
                  className="flex-1 h-12 bg-[#A3E635] border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-sm uppercase text-black cursor-pointer"
                >
                  {nameModal === "renameTeam"
                    ? "حفظ"
                    : nameModal === "team"
                    ? "إضافة الفريق"
                    : "إضافة الجولة"}
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Team Card ────────────────────────────────────────────────────────────────
const TeamCard = ({ team, games, handleRemoveTeam, onRenameTeam, delay }) => {
  const totalScore = games.reduce(
    (sum, g) => sum + (Number(g.scores[team.id]) || 0),
    0
  );

  return (
    <Motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col relative group min-h-[400px] sm:min-h-[480px]"
    >
      <div
        className={`${team.theme.bg} border-[3px] border-black shadow-[6px_6px_0px_#000000] p-4 sm:p-6 flex-1 flex flex-col relative h-full`}
      >
        {/* Top Action Buttons */}
        <div className="flex justify-between mb-4">
          <button
            type="button"
            onClick={() => onRenameTeam?.(team.id)}
            className="h-9 w-9 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            title="تغيير اسم الفريق"
          >
            <Pencil className="w-4 h-4 stroke-[2.5] text-black" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`حذف ${team.name}؟`)) handleRemoveTeam(team.id);
            }}
            className="h-9 w-9 bg-[#EF4444] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            title="حذف الفريق"
          >
            <X className="w-4 h-4 stroke-[3] text-white" />
          </button>
        </div>

        {/* Team Name */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight uppercase break-words">
            {team.name}
          </h2>
          <div className="w-16 h-1 bg-black mx-auto mt-2" />
        </div>

        {/* Total Score Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,0.3)] px-6 py-3 text-center">
            <span className="text-4xl sm:text-5xl font-black tabular-nums block">
              {totalScore}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
              إجمالي النقاط
            </span>
          </div>
        </div>

        {/* Per-round scores */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-2">
          {games.map((g, i) => (
            <Motion.div
              key={g.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border-2 border-black p-3 flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-black text-black uppercase tracking-wider truncate">
                  {g.name}
                </span>
                <span className="text-[10px] font-bold text-black/50 flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5" />
                  نتيجة الجولة
                </span>
              </div>
              <div className="shrink-0">
                <span className="text-3xl sm:text-4xl font-black text-black tabular-nums">
                  {g.scores[team.id] || "0"}
                </span>
              </div>
            </Motion.div>
          ))}

          {games.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-3 py-8">
              <Trophy className="w-10 h-10" />
              <span className="text-xs font-black uppercase tracking-widest">
                لا توجد جولات
              </span>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
};

// ─── Results View ─────────────────────────────────────────────────────────────
const ResultsView = ({ teams, games, onBack }) => {
  const [step, setStep] = useState(0);

  const results = useMemo(() => {
    return teams
      .map((t) => {
        let score = 0;
        games.forEach((g) => { score += Number(g.scores[t.id]) || 0; });
        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [teams, games]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter") setStep((prev) => Math.min(prev + 1, results.length));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [results.length]);

  const isFinalStep = step === results.length;
  const currentTeam = results[results.length - 1 - step];

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center p-4 relative"
      dir="rtl"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white text-black border-[3px] border-black px-4 py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm uppercase transition-all cursor-pointer"
      >
        ← رجوع
      </button>

      <AnimatePresence mode="wait">
        {!isFinalStep ? (
          <Motion.div
            key={`reveal-${step}`}
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 text-center w-full max-w-2xl px-4"
          >
            <div className="space-y-2">
              <span className="bg-black text-white font-black text-xs uppercase tracking-widest px-3 py-1 border-2 border-black inline-block">
                TEAM RESULT
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-black tracking-tight break-words">
                {currentTeam.name}
              </h2>
            </div>

            {/* Score Box */}
            <div
              onClick={() => setStep((prev) => Math.min(prev + 1, results.length))}
              className={`${currentTeam.theme.bg} border-[3px] border-black shadow-[8px_8px_0px_#000000] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all cursor-pointer px-12 py-8 text-center`}
            >
              <Motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-7xl sm:text-9xl md:text-[10rem] font-black tabular-nums text-black block leading-none"
              >
                {currentTeam.score}
              </Motion.span>
              <span className="text-sm font-black uppercase tracking-widest text-black/60">
                Total Points
              </span>
            </div>

            <Motion.button
              onClick={() => setStep((prev) => Math.min(prev + 1, results.length))}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-3 px-6 py-3 font-black text-sm uppercase cursor-pointer"
            >
              <span>اضغط هنا أو</span>
              <div className="bg-black text-white font-mono text-xs px-2 py-1 border border-black">
                Enter
              </div>
              <span>للفريق التالي ⬅️</span>
            </Motion.button>
          </Motion.div>
        ) : (
          <Motion.div
            key="final-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl flex flex-col items-center gap-8 py-8 px-4"
          >
            <div className="text-center">
              <Motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl sm:text-5xl font-black text-black tracking-tight"
              >
                الترتيب النهائي
              </Motion.h1>
              <span className="text-xs text-black/40 uppercase tracking-widest font-black">
                CONSOLIDATED LEADERBOARD
              </span>
            </div>

            <div className="w-full flex flex-col gap-4">
              {results.map((team, index) => {
                const isWinner = index === 0;
                const medalBg = index === 0 ? "bg-[#FACC15]" : index === 1 ? "bg-[#E5E7EB]" : index === 2 ? "bg-[#FB923C]" : "bg-white";
                return (
                  <Motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={team.id}
                    className={`flex items-center justify-between p-4 sm:p-6 border-[3px] border-black shadow-[4px_4px_0px_#000000] gap-4 ${
                      isWinner ? "bg-[#FACC15]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${medalBg} border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center font-black text-lg sm:text-xl text-black shrink-0`}
                      >
                        {index === 0 ? (
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                        ) : index === 1 ? (
                          <Medal className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tight truncate">
                        {team.name}
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black text-black tabular-nums block">
                        {team.score}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-black/40">
                        Points
                      </span>
                    </div>
                  </Motion.div>
                );
              })}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
