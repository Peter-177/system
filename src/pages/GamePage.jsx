import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Minus, Trophy, Users, Settings, X } from "lucide-react";
import { studentsDB, gameArenaDB } from "../data/storage";
import { Page, Navbar } from "../components/UI";
import { motion, AnimatePresence } from "framer-motion";

const GAME_TEAM_COLORS = [
  { name: "blue", glow: "from-[#4A7FA7] to-[#011C40]", accent: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { name: "emerald", glow: "from-emerald-400 to-teal-600", accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "rose", glow: "from-rose-400 to-pink-600", accent: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { name: "amber", glow: "from-amber-400 to-orange-600", accent: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { name: "violet", glow: "from-violet-400 to-purple-600", accent: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { name: "fuchsia", glow: "from-fuchsia-400 to-pink-600", accent: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
];

const DEFAULT_TEAMS = () => [
  { id: "T1", name: "الفريق الأول", members: ["peter"], theme: GAME_TEAM_COLORS[0] },
  { id: "T2", name: "الفريق الثاني", members: ["dany"], theme: GAME_TEAM_COLORS[1] },
];

const DEFAULT_GAMES = (teamIds) => {
  const scores = {};
  teamIds.forEach((id) => {
    scores[id] = "";
  });
  return [{ id: 1, name: "الجولة الأولى", scores }];
};

function mergeTeamTheme(theme, index) {
  if (
    theme &&
    typeof theme === "object" &&
    typeof theme.name === "string" &&
    typeof theme.glow === "string"
  ) {
    return theme;
  }
  return GAME_TEAM_COLORS[index % GAME_TEAM_COLORS.length];
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
    theme: mergeTeamTheme(t.theme, i),
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
  /** null | 'team' | 'game' — مربع في منتصف الشاشة لإدخال الاسم */
  const [nameModal, setNameModal] = useState(null);
  const [modalNameInput, setModalNameInput] = useState("");

  const closeNameModal = () => {
    setNameModal(null);
    setModalNameInput("");
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
    return Object.keys(db).map(id => ({ id, ...db[id] }));
  }, []);

  const searchResults = useMemo(() => {
    const q = newMemberName.trim().toLowerCase();
    if (!q || !addingToTeam) return [];
    return allStudents.filter(s => 
      s.name?.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [newMemberName, addingToTeam, allStudents]);

  const handleAddMember = (teamId, specificName = null) => {
    const nameToAdd = specificName || newMemberName.trim();
    if (!nameToAdd) return;
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: [...t.members, nameToAdd] } : t));
    setNewMemberName("");
    setAddingToTeam(null);
  };

  const handleRemoveMember = (teamId, index) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: t.members.filter((_, i) => i !== index) } : t));
  };

  const openTeamNameModal = () => {
    setModalNameInput("");
    setNameModal("team");
  };

  const confirmAddTeam = () => {
    const name = modalNameInput.trim();
    if (!name) return;
    const newId = `T${Date.now()}`;
    const theme =
      GAME_TEAM_COLORS[teams.length % GAME_TEAM_COLORS.length];
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
      }),
    );
  };

  const handleRemoveGame = (id) => {
    if (games.length <= 1) return;
    setGames(prev => prev.filter(g => g.id !== id));
  };

  const handleUpdateScore = (gameId, teamId, val) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, scores: { ...g.scores, [teamId]: val } } : g));
  };

  return (
    <Page>
      <Navbar
        title="ساحة الألعاب / Game Arena"
        onBack={onBack ?? onGoHome}
      />

      <div className="flex-1 w-full flex flex-col relative z-10" dir="rtl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="w-full max-w-[95rem] mx-auto h-full flex flex-col lg:flex-row p-4 lg:p-10 gap-8 relative pb-32">
          
          {/* Admin Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[360px] tech-card !p-6 flex flex-col shrink-0 h-full relative"
          >
            <h3 className="text-xl font-black text-white flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <Settings className="text-sky-400" size={22} /> إدارة اللعبة
            </h3>

            <button
              type="button"
              onClick={openTeamNameModal}
              className="tech-btn-primary w-full flex items-center justify-center gap-3 font-extrabold mb-8 !rounded-xl"
            >
              <Plus size={18} strokeWidth={3} /> إضافة فريق
            </button>

            {/* Games List */}
            <div className="flex flex-col gap-4 mb-8">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-400 uppercase tracking-widest">إدارة الجولات / النقاط</span>
                  <button
                    type="button"
                    onClick={openGameNameModal}
                    className="tech-badge cursor-pointer hover:bg-sky-500/20 transition-colors"
                  >
                     + جولة جديدة
                  </button>
               </div>
               
               <div className="flex flex-col gap-3 overflow-y-auto max-h-[35vh] custom-scrollbar pr-1">
                  {games.map(game => (
                     <div key={game.id} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 group/game">
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-[11px] font-bold text-slate-300">{game.name}</span>
                           <button onClick={() => handleRemoveGame(game.id)} className="opacity-0 group-hover/game:opacity-100 text-slate-600 hover:text-rose-500 transition-all p-1">
                              <Minus size={12} strokeWidth={3} />
                           </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {teams.map(team => (
                              <div key={team.id} className="flex flex-col gap-1">
                                 <span className={`text-[8px] font-black truncate text-right ${team.theme.accent}`}>{team.name}</span>
                                 <input 
                                    type="text" value={game.scores[team.id] || ""}
                                    onChange={(e) => handleUpdateScore(game.id, team.id, e.target.value)}
                                    placeholder="0"
                                    className="tech-input !h-8 !rounded-lg !text-[10px] !bg-slate-900 !px-1 text-center"
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Teams & Members List */}
            <div className="flex flex-col flex-1 min-h-0 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-black text-slate-300 text-sm flex items-center gap-2">
                     <Users size={16} className="text-sky-500" /> الفرق والأعضاء
                  </span>
                  <button onClick={() => setShowMembers(!showMembers)} className="tech-badge cursor-pointer">
                     {showMembers ? "إخفاء" : "عرض"}
                  </button>
               </div>
               
               <AnimatePresence>
                 {showMembers && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar lg:max-h-[35vh]">
                      {teams.map(team => (
                        <div key={team.id} className={`bg-slate-900/40 border ${team.theme.border} rounded-xl p-4 flex flex-col gap-3 group/team`}>
                          <div className="flex justify-between items-start gap-3">
                            <span className={`font-bold text-sm leading-snug min-w-0 flex-1 text-right ${team.theme.accent}`}>{team.name}</span>
                            <div className="flex shrink-0 items-center gap-1.5">
                               <button type="button" onClick={() => { setAddingToTeam(addingToTeam === team.id ? null : team.id); setNewMemberName(""); }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400 hover:text-sky-400 border border-white/5" title="عضو">
                                 {addingToTeam === team.id ? <Minus size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
                               </button>
                               <button type="button" onClick={() => { if(window.confirm(`حذف ${team.name}؟`)) handleRemoveTeam(team.id) }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20" title="حذف الفريق">
                                 <Minus size={12} strokeWidth={2} />
                               </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {addingToTeam === team.id && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="relative mt-1">
                                <Search size={14} className="absolute right-3 top-3 text-sky-500/50" />
                                <input 
                                  type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddMember(team.id)}
                                  placeholder="ابحث..." className="tech-input !h-9 !text-xs !pr-9 !pl-3 !rounded-lg" autoFocus
                                />
                                {searchResults.length > 0 && (
                                  <div className="absolute top-full left-0 right-0 z-[100] bg-slate-900 border border-sky-500/20 mt-1 rounded-lg overflow-hidden shadow-2xl">
                                    {searchResults.map(s => (
                                      <button key={s.id} onClick={() => handleAddMember(team.id, s.name)} className="w-full text-right p-2.5 hover:bg-sky-500/10 flex items-center justify-between border-b border-white/5 last:border-0 text-xs text-slate-300">
                                        <span>{s.name}</span>
                                        <span className="opacity-40">{s.id}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex flex-col gap-1.5 mt-1">
                            {team.members.map((m, i) => (
                              <div key={i} className="group/memb text-[11px] font-bold text-slate-300 flex items-center justify-between bg-black/20 px-3 py-2 rounded-lg">
                                <span className="flex items-center gap-2">
                                   <div className={`w-1 h-1 rounded-full ${team.theme.bg.replace('/10', '')} bg-current`} /> {m}
                                </span>
                                <button onClick={() => handleRemoveMember(team.id, i)} className="opacity-0 group-hover/memb:opacity-100 text-rose-500 p-0.5">×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>

          {/* Teams Arena - SCORES LIST PER GAME */}
          <div className={`flex-1 grid gap-6 h-fit ${
             teams.length === 1 ? 'grid-cols-1' :
             teams.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
             'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          }`}>
             {teams.map((team, idx) => (
                <TeamCard key={team.id} team={team} games={games} handleRemoveTeam={handleRemoveTeam} delay={idx * 0.1} />
             ))}
          </div>

        </div>
      </div>

      <AnimatePresence>
        {nameModal && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-name-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeNameModal();
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-slate-900/95 p-6 shadow-[0_0_60px_rgba(0,0,0,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <h4
                  id="game-name-modal-title"
                  className="text-lg font-black text-white tracking-tight"
                >
                  {nameModal === "team" ? "فريق جديد" : "جولة جديدة"}
                </h4>
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                {nameModal === "team" ? "اسم الفريق" : "اسم الجولة"}
              </label>
              <input
                type="text"
                value={modalNameInput}
                onChange={(e) => setModalNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (nameModal === "team") confirmAddTeam();
                    else confirmAddGame();
                  }
                }}
                placeholder={
                  nameModal === "team" ? "اكتب اسم الفريق..." : "اكتب اسم الجولة..."
                }
                className="tech-input w-full !rounded-xl !h-12 !text-base mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="flex-1 h-12 rounded-xl border border-white/10 bg-slate-950/80 font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={
                    nameModal === "team" ? confirmAddTeam : confirmAddGame
                  }
                  className="flex-1 h-12 rounded-xl tech-btn-primary font-extrabold"
                >
                  {nameModal === "team" ? "إضافة الفريق" : "إضافة الجولة"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}

const TeamCard = ({ team, games, handleRemoveTeam, delay }) => {
  const { glow, accent, border } = team.theme;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="flex flex-col relative group h-full min-h-[500px]">
      <div className={`tech-panel !p-6 flex-1 flex flex-col relative overflow-hidden h-full border ${border} hover:border-white/10 transition-all duration-500`}>
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${glow}`} />
        
        {/* حذف الفريق — داخل البطاقة (كان -top/-left يُقصّ بسبب overflow-hidden) */}
        <button
           type="button"
           onClick={() => { if(window.confirm(`حذف ${team.name}؟`)) handleRemoveTeam(team.id) }}
           className="absolute top-4 end-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/90 text-slate-500 shadow-lg backdrop-blur-sm transition-all hover:border-rose-500/40 hover:text-rose-500 opacity-0 group-hover:opacity-100"
           title="حذف الفريق"
        >
           <Minus size={18} strokeWidth={3} />
        </button>

        <div className="w-full text-center relative z-10 mb-8 pt-4">
           <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">{team.name}</h2>
           <div className={`w-16 h-1 mx-auto bg-gradient-to-r ${glow} rounded-full opacity-60`} />
        </div>

        {/* List of Game Scores */}
        <div className="flex-1 w-full relative z-10 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 pb-4">
           {games.map((g, i) => (
             <motion.div 
               key={g.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
               className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 flex items-center justify-between group/game hover:bg-slate-900/60 transition-colors"
             >
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{g.name}</span>
                   <div className="flex items-center gap-2">
                       <Trophy size={10} className={`${accent} opacity-50`} />
                       <span className={`text-[10px] font-bold ${accent} opacity-40`}>نتيجة الجولة</span>
                   </div>
                </div>

                <div className="flex items-center gap-5">
                   <div className="w-px h-12 bg-white/5" />
                   <div className="flex flex-col items-end">
                      <div className={`text-4xl md:text-5xl font-black tabular-nums bg-gradient-to-br ${glow} bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                         {g.scores[team.id] || '0'}
                      </div>
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">Points</span>
                   </div>
                </div>
             </motion.div>
           ))}

           {games.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-3 grayscale">
                 <Trophy size={48} />
                 <span className="text-xs font-bold font-black uppercase tracking-widest">No Rounds Started</span>
              </div>
           )}
        </div>

        <div className="mt-4 relative z-10 flex gap-1.5 justify-center opacity-20">
           <div className="w-1.5 h-1.5 rounded-full bg-white" />
           <div className="w-1.5 h-1.5 rounded-full bg-white" />
           <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>
    </motion.div>
  );
}
