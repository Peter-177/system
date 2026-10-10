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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { studentsDB, gameArenaDB } from "../data/storage";
import { motion as Motion, AnimatePresence } from "framer-motion";

// ─── Neo Brutalism Team Color Palette ───────────────────────────────────────
const GAME_TEAM_COLORS = [
  { name: "sky", bg: "bg-[#38BDF8]", border: "border-[#38BDF8]", text: "text-black", hex: "#38BDF8" },
  { name: "lime", bg: "bg-[#A3E635]", border: "border-[#A3E635]", text: "text-black", hex: "#A3E635" },
  { name: "pink", bg: "bg-[#F472B6]", border: "border-[#F472B6]", text: "text-black", hex: "#F472B6" },
  { name: "orange", bg: "bg-[#FB923C]", border: "border-[#FB923C]", text: "text-black", hex: "#FB923C" },
  { name: "yellow", bg: "bg-[#FACC15]", border: "border-[#FACC15]", text: "text-black", hex: "#FACC15" },
  { name: "white", bg: "bg-white", border: "border-white", text: "text-black", hex: "#FFFFFF" },
];

const DEFAULT_TEAMS = () => [
  { id: "T1", name: "الفريق الأول", members: [], theme: GAME_TEAM_COLORS[0] },
  { id: "T2", name: "الفريق الثاني", members: [], theme: GAME_TEAM_COLORS[1] },
];

const DEFAULT_GAMES = (teamIds) => {
  const scores = {};
  teamIds.forEach((id) => {
    scores[id] = "";
  });
  return [{ id: 1, name: "الجولة الأولى", scores }];
};

function getRandomColor(usedNames = []) {
  const available = GAME_TEAM_COLORS.filter((c) => !usedNames.includes(c.name));
  const pool = available.length > 0 ? available : GAME_TEAM_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function mergeTeamTheme(theme) {
  if (
    theme &&
    typeof theme === "object" &&
    typeof theme.name === "string" &&
    typeof theme.bg === "string"
  ) {
    return theme;
  }
  return GAME_TEAM_COLORS[Math.floor(Math.random() * GAME_TEAM_COLORS.length)];
}

/** تحميل من localStorage مع مزامنة نقاط الجولات مع معرفات الفرق */
function loadPersistedGameArena() {
  const raw = gameArenaDB.get();
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
    const scores = {
      ...(g.scores && typeof g.scores === "object" ? g.scores : {}),
    };
    for (const k of Object.keys(scores)) {
      if (!teamIds.has(k)) delete scores[k];
    }
    for (const tid of teamIds) {
      if (!(tid in scores)) scores[tid] = "";
    }
    const gid = g.id;
    const id =
      typeof gid === "number" && !Number.isNaN(gid)
        ? gid
        : typeof gid === "string" && /^\d+$/.test(gid)
          ? Number(gid)
          : Date.now() + i;
    return {
      id,
      name:
        typeof g.name === "string" && g.name.trim()
          ? g.name
          : `الجولة ${i + 1}`,
      scores,
    };
  });

  return {
    teams,
    games,
    showMembers: Boolean(raw.showMembers),
  };
}

export function GamePage({ onBack, onGoHome }) {
  const [teams, setTeams] = useState(
    () => loadPersistedGameArena()?.teams ?? DEFAULT_TEAMS(),
  );
  const [games, setGames] = useState(() => {
    const p = loadPersistedGameArena();
    return (
      p?.games ??
      DEFAULT_GAMES((p?.teams ?? DEFAULT_TEAMS()).map((t) => t.id))
    );
  });
  const [showMembers, setShowMembers] = useState(
    () => loadPersistedGameArena()?.showMembers ?? false,
  );
  const [addingToTeam, setAddingToTeam] = useState(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [nameModal, setNameModal] = useState(null);
  const [modalNameInput, setModalNameInput] = useState("");
  const [renameTeamId, setRenameTeamId] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const closeNameModal = () => {
    setNameModal(null);
    setModalNameInput("");
    setRenameTeamId(null);
  };

  useEffect(() => {
    if (!nameModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeNameModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nameModal]);

  useEffect(() => {
    gameArenaDB.set({ teams, games, showMembers });
  }, [teams, games, showMembers]);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map((id) => ({ id, ...db[id] }));
  }, []);

  const searchResults = useMemo(() => {
    const q = newMemberName.trim().toLowerCase();
    if (!q || !addingToTeam) return [];
    return allStudents
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [newMemberName, addingToTeam, allStudents]);

  const handleAddMember = (teamId, specificName = null) => {
    const nameToAdd = specificName || newMemberName.trim();
    if (!nameToAdd) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, members: [...t.members, nameToAdd] } : t,
      ),
    );
    setNewMemberName("");
    setAddingToTeam(null);
  };

  const handleRemoveMember = (teamId, index) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, members: t.members.filter((_, i) => i !== index) }
          : t,
      ),
    );
  };

  const openRenameTeamModal = (teamId) => {
    const t = teams.find((x) => x.id === teamId);
    if (!t) return;
    setRenameTeamId(teamId);
    setModalNameInput(t.name);
    setNameModal("renameTeam");
  };

  const confirmRenameTeam = () => {
    const name = modalNameInput.trim();
    if (!name || !renameTeamId) return;
    setTeams((prev) =>
      prev.map((t) => (t.id === renameTeamId ? { ...t, name } : t)),
    );
    closeNameModal();
  };

  const openTeamNameModal = () => {
    setModalNameInput("");
    setNameModal("team");
  };

  const confirmAddTeam = () => {
    const name = modalNameInput.trim();
    if (!name) return;
    const newId = `T${Date.now()}`;
    const usedColors = teams.map((t) => t.theme?.name).filter(Boolean);
    const theme = getRandomColor(usedColors);
    setTeams((prev) => [...prev, { id: newId, name, members: [], theme }]);
    setGames((prev) =>
      prev.map((g) => ({ ...g, scores: { ...g.scores, [newId]: "" } })),
    );
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
    teams.forEach((t) => {
      initialScores[t.id] = "";
    });
    setGames((prev) => [
      ...prev,
      { id: Date.now(), name, scores: initialScores },
    ]);
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
      }),
    );
  };

  const handleRemoveGame = (id) => {
    if (games.length <= 1) return;
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateScore = (gameId, teamId, val) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId ? { ...g, scores: { ...g.scores, [teamId]: val } } : g,
      ),
    );
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir="rtl"
    >
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={showResults ? () => setShowResults(false) : (onBack ?? onGoHome)}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              GAME ARENA
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              {showResults ? "النتيجة النهائية" : "ساحة الألعاب والمسابقات"}
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {showResults ? (
        <ResultsView teams={teams} games={games} />
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">
          <div className="w-full flex flex-col lg:flex-row gap-8">
            {/* Admin Panel */}
            <div className="w-full lg:w-[380px] bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col shrink-0 h-fit">
              <div className="flex items-center justify-between pb-4 mb-6 border-b-[3px] border-black">
                <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase">
                  <Settings className="text-black w-6 h-6 stroke-[2.5]" />
                  <span>إدارة المسابقة</span>
                </h3>
                <span className="bg-[#38BDF8] border-2 border-black font-black text-xs px-2 py-0.5 uppercase shadow-[2px_2px_0px_#000000]">
                  SETTINGS
                </span>
              </div>

              <button
                type="button"
                onClick={openTeamNameModal}
                className="w-full bg-[#A3E635] text-black border-[3px] border-black py-3 px-4 font-black text-base uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 mb-6 cursor-pointer"
              >
                <Plus size={20} strokeWidth={3} />
                <span>إضافة فريق جديد</span>
              </button>

              {/* Games & Rounds List */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-black uppercase tracking-wider bg-[#FACC15] px-2 py-1 border-2 border-black">
                    الجولات والنقاط ({games.length})
                  </span>
                  <button
                    type="button"
                    onClick={openGameNameModal}
                    className="bg-white hover:bg-black hover:text-white text-black border-2 border-black font-black text-xs px-2.5 py-1 uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                  >
                    + جولة جديدة
                  </button>
                </div>

                <div className="flex flex-col gap-3 max-h-[35vh] overflow-y-auto pr-1">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="bg-[#FDF8F0] border-2 border-black p-3.5 shadow-[3px_3px_0px_#000000] flex flex-col gap-3 group"
                    >
                      <div className="flex justify-between items-center border-b-2 border-black pb-1.5">
                        <span className="font-black text-sm text-black">
                          {game.name}
                        </span>
                        {games.length > 1 && (
                          <button
                            onClick={() => handleRemoveGame(game.id)}
                            className="text-black hover:bg-[#F472B6] p-1 border border-black transition-colors"
                            title="حذف الجولة"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {teams.map((team) => (
                          <div key={team.id} className="flex flex-col gap-1">
                            <span className="text-[11px] font-black truncate text-right">
                              {team.name}
                            </span>
                            <input
                              type="number"
                              value={game.scores[team.id] || ""}
                              onChange={(e) =>
                                handleUpdateScore(
                                  game.id,
                                  team.id,
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="w-full h-8 bg-white border-2 border-black text-center font-black text-sm px-1 focus:outline-none focus:bg-[#FACC15] transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teams & Members List */}
              <div className="flex flex-col pt-4 border-t-[3px] border-black">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-black text-black text-sm flex items-center gap-2">
                    <Users size={18} className="stroke-[2.5]" />
                    <span>الفرق والأعضاء ({teams.length})</span>
                  </span>
                  <button
                    onClick={() => setShowMembers(!showMembers)}
                    className="bg-[#FB923C] border-2 border-black font-black text-xs px-2 py-0.5 uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
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
                      className="flex flex-col gap-3 max-h-[35vh] overflow-y-auto pr-1"
                    >
                      {teams.map((team) => (
                        <div
                          key={team.id}
                          className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_#000000] flex flex-col gap-2.5"
                        >
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-3.5 h-3.5 border-2 border-black shrink-0"
                                style={{ backgroundColor: team.theme.hex || "#38BDF8" }}
                              />
                              <span className="font-black text-sm text-black truncate">
                                {team.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openRenameTeamModal(team.id)}
                                className="w-7 h-7 bg-white border border-black flex items-center justify-center hover:bg-[#FACC15] transition-colors"
                                title="تعديل الاسم"
                              >
                                <Pencil size={13} strokeWidth={2.5} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingToTeam(
                                    addingToTeam === team.id ? null : team.id,
                                  );
                                  setNewMemberName("");
                                }}
                                className="w-7 h-7 bg-white border border-black flex items-center justify-center hover:bg-[#38BDF8] transition-colors"
                                title="إضافة عضو"
                              >
                                {addingToTeam === team.id ? (
                                  <Minus size={13} strokeWidth={3} />
                                ) : (
                                  <Plus size={13} strokeWidth={3} />
                                )}
                              </button>
                              {teams.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`حذف فريق ${team.name}؟`))
                                      handleRemoveTeam(team.id);
                                  }}
                                  className="w-7 h-7 bg-white border border-black text-black hover:bg-[#F472B6] transition-colors flex items-center justify-center"
                                  title="حذف الفريق"
                                >
                                  <Minus size={13} strokeWidth={3} />
                                </button>
                              )}
                            </div>
                          </div>

                          {addingToTeam === team.id && (
                            <div className="relative mt-1">
                              <input
                                type="text"
                                value={newMemberName}
                                onChange={(e) =>
                                  setNewMemberName(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  handleAddMember(team.id)
                                }
                                placeholder="اكتب اسم العضو..."
                                className="w-full h-8 bg-white border-2 border-black px-2 text-xs font-bold focus:outline-none focus:bg-[#FACC15]"
                                autoFocus
                              />
                              {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-30 bg-white border-2 border-black mt-1 shadow-[4px_4px_0px_#000000]">
                                  {searchResults.map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() =>
                                        handleAddMember(team.id, s.name)
                                      }
                                      className="w-full text-right p-2 hover:bg-[#FACC15] flex items-center justify-between border-b border-black last:border-0 text-xs font-bold"
                                    >
                                      <span>{s.name}</span>
                                      <span className="text-[10px] text-gray-600 font-mono">
                                        {s.id}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5">
                            {team.members.map((m, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-[#FDF8F0] border border-black px-2 py-0.5 text-xs font-bold"
                              >
                                <span>{m}</span>
                                <button
                                  onClick={() =>
                                    handleRemoveMember(team.id, i)
                                  }
                                  className="text-black hover:text-[#F472B6] font-black"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Teams Arena Grid */}
            <div
              className={`flex-1 grid gap-6 h-fit ${
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
                  delay={idx * 0.05}
                />
              ))}
            </div>
          </div>

          {/* Action Button: Show Results */}
          <div className="w-full flex justify-center pt-4 pb-12">
            <button
              onClick={() => setShowResults(true)}
              className="bg-[#FACC15] text-black border-[3px] border-black px-12 py-5 shadow-[6px_6px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] active:shadow-none transition-all flex items-center gap-4 cursor-pointer group"
            >
              <Trophy size={36} className="stroke-[2.5]" />
              <span className="text-3xl font-black uppercase tracking-tight">
                إعلان النتيجة النهائية
              </span>
            </button>
          </div>
        </main>
      )}

      {/* Name Input Modal */}
      <AnimatePresence>
        {nameModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeNameModal();
            }}
          >
            <div
              className="w-full max-w-md bg-white border-[3px] border-black p-6 shadow-[8px_8px_0px_#000000]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4 border-b-2 border-black pb-3">
                <h4 className="text-xl font-black text-black uppercase">
                  {nameModal === "renameTeam"
                    ? "تعديل اسم الفريق"
                    : nameModal === "team"
                      ? "إضافة فريق جديد"
                      : "إضافة جولة جديدة"}
                </h4>
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="border-2 border-black p-1 hover:bg-[#F472B6] transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
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
                    ? "اكتب اسم الفريق..."
                    : nameModal === "team"
                      ? "اكتب اسم الفريق..."
                      : "اكتب اسم الجولة..."
                }
                className="w-full h-12 bg-[#FDF8F0] border-2 border-black font-bold text-base px-3 mb-6 focus:outline-none focus:bg-[#FACC15]"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="flex-1 h-12 border-2 border-black bg-white font-black text-black hover:bg-gray-100 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none transition-all"
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
                  className="flex-1 h-12 border-2 border-black bg-[#A3E635] font-black text-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none transition-all"
                >
                  {nameModal === "renameTeam"
                    ? "حفظ الاسم"
                    : nameModal === "team"
                      ? "إضافة الفريق"
                      : "إضافة الجولة"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ResultsView = ({ teams, games }) => {
  const [step, setStep] = useState(0);

  const results = useMemo(() => {
    return teams
      .map((t) => {
        let score = 0;
        games.forEach((g) => {
          score += Number(g.scores[t.id]) || 0;
        });
        return { ...t, score };
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
    <main
      className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center"
      dir="rtl"
    >
      <AnimatePresence mode="wait">
        {!isFinalStep ? (
          <Motion.div
            key={`reveal-${step}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-8 text-center max-w-xl w-full"
          >
            <div className="bg-[#38BDF8] border-[3px] border-black px-4 py-1.5 shadow-[4px_4px_0px_#000000]">
              <span className="font-black text-black uppercase tracking-widest text-sm">
                TEAM RESULT / نتيجة الفريق
              </span>
            </div>

            <h2 className="text-5xl sm:text-7xl font-black text-black uppercase tracking-tight">
              {currentTeam.name}
            </h2>

            <div
              className="w-full bg-white border-[4px] border-black p-10 shadow-[10px_10px_0px_#000000] flex flex-col items-center gap-2"
              style={{ backgroundColor: currentTeam.theme.hex || "#FACC15" }}
            >
              <span className="text-8xl sm:text-[10rem] font-black text-black tabular-nums leading-none">
                {currentTeam.score}
              </span>
              <span className="text-base font-black uppercase tracking-widest bg-black text-white px-3 py-1 border-2 border-black">
                TOTAL POINTS / إجمالي النقاط
              </span>
            </div>

            <button
              onClick={() => setStep((prev) => Math.min(prev + 1, results.length))}
              className="bg-white hover:bg-black hover:text-white text-black border-2 border-black px-6 py-3 font-black text-sm uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>اضغط</span>
              <span className="bg-[#FACC15] text-black px-2 py-0.5 border border-black font-mono">
                ENTER
              </span>
              <span>أو انقر هنا للانتقال للفريق التالي</span>
            </button>
          </Motion.div>
        ) : (
          <Motion.div
            key="final-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl flex flex-col items-center gap-8 py-6"
          >
            <div className="text-center">
              <span className="bg-[#FACC15] border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_#000000] inline-block mb-2">
                FINAL LEADERBOARD
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-black uppercase tracking-tight">
                الترتيب النهائي للفرق
              </h2>
            </div>

            <div className="w-full flex flex-col gap-4">
              {results.map((team, index) => {
                const isWinner = index === 0;
                const podiumColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]"];
                const cardBg = isWinner
                  ? "bg-[#FACC15]"
                  : podiumColors[index] || "bg-white";

                return (
                  <div
                    key={team.id}
                    className={`border-[3px] border-black p-5 sm:p-6 shadow-[6px_6px_0px_#000000] flex items-center justify-between gap-4 ${cardBg}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black text-white border-2 border-black flex items-center justify-center font-black text-2xl shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-black">
                            {team.name}
                          </span>
                          {isWinner && (
                            <span className="bg-black text-[#FACC15] px-2 py-0.5 border border-black font-black text-xs uppercase">
                              👑 البطل
                            </span>
                          )}
                        </div>
                        {team.members.length > 0 && (
                          <span className="text-xs font-bold text-gray-800">
                            {team.members.join(" • ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-4xl sm:text-5xl font-black text-black tabular-nums">
                        {team.score}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black">
                        POINTS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

const TeamCard = ({ team, games, handleRemoveTeam, onRenameTeam, delay }) => {
  return (
    <div
      className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col justify-between h-full min-h-[480px]"
    >
      <div>
        {/* Header */}
        <div
          className="border-[2px] border-black p-4 mb-6 shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-2"
          style={{ backgroundColor: team.theme.hex || "#38BDF8" }}
        >
          <button
            type="button"
            onClick={() => onRenameTeam?.(team.id)}
            className="w-9 h-9 bg-white border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
            title="تعديل الاسم"
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>

          <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight text-center truncate">
            {team.name}
          </h2>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`حذف فريق ${team.name}؟`))
                handleRemoveTeam(team.id);
            }}
            className="w-9 h-9 bg-white border-2 border-black flex items-center justify-center hover:bg-[#F472B6] transition-colors"
            title="حذف الفريق"
          >
            <Minus size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Scores List */}
        <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
          {games.map((g) => (
            <div
              key={g.id}
              className="bg-[#FDF8F0] border-2 border-black p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex flex-col">
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  {g.name}
                </span>
                <span className="text-[10px] font-bold text-gray-600">
                  SCORE
                </span>
              </div>

              <div className="text-3xl font-black text-black tabular-nums">
                {g.scores[team.id] || "0"}
              </div>
            </div>
          ))}

          {games.length === 0 && (
            <div className="text-center py-10 font-bold text-gray-500">
              لم تبدأ أي جولات بعد
            </div>
          )}
        </div>
      </div>

      {/* Total calculated footer */}
      <div className="mt-6 pt-4 border-t-[3px] border-black flex items-center justify-between bg-black text-white p-3 border-2 border-black">
        <span className="font-black text-sm uppercase">المجموع الحالي</span>
        <span className="text-2xl font-black text-[#FACC15] tabular-nums">
          {games.reduce(
            (acc, curr) => acc + (Number(curr.scores[team.id]) || 0),
            0,
          )}
        </span>
      </div>
    </div>
  );
};
