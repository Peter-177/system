import { useMemo, useState } from "react";
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
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { studentsDB, summerClubDB } from "../data/storage";
import { CLUB_TEAM_COLORS } from "../data/config";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/UI";
import { useT } from "../hooks/useT";
import { useAppContext } from "../context/AppContext";

const CLUB_ID = "main";

const normalizeArabic = (text) => (text ? String(text).replace(/[أإآا]/g, "ا") : "");

export function SummerClub() {
  const t = useT();
  const { lang } = useAppContext();
  const toast = useToast();

  const [club, setClub] = useState(() => summerClubDB.get(CLUB_ID));
  const [step, setStep] = useState(() => (summerClubDB.get(CLUB_ID) ? 4 : 1));
  const [name, setName] = useState(() => summerClubDB.get(CLUB_ID)?.name || "");
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState(CLUB_TEAM_COLORS[0]);
  const [search, setSearch] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const ChevronIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  const persist = (next) => {
    setClub(next);
    summerClubDB.set(CLUB_ID, next);
  };

  const teams = useMemo(() => club?.teams ?? [], [club]);

  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db)
      .map((id) => ({ qrId: id, ...db[id] }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", lang === "ar" ? "ar" : "en"));
  }, [lang]);

  const teamOf = (qrId) => teams.find((tm) => tm.members.includes(qrId));

  const assignedCount = useMemo(
    () => new Set(teams.flatMap((tm) => tm.members)).size,
    [teams]
  );

  const filteredStudents = useMemo(() => {
    const q = normalizeArabic(search.toLowerCase().trim());
    if (!q) return allStudents;
    return allStudents.filter(
      (s) => normalizeArabic(s.name?.toLowerCase()).includes(q) || String(s.qrId).includes(q)
    );
  }, [allStudents, search]);

  const steps = [
    { id: 1, label: t("clubStep1"), icon: <Sparkles className="w-4 h-4 stroke-[3]" /> },
    { id: 2, label: t("clubStep2"), icon: <Users className="w-4 h-4 stroke-[3]" /> },
    { id: 3, label: t("clubStep3"), icon: <UserPlus className="w-4 h-4 stroke-[3]" /> },
    { id: 4, label: t("clubStep4"), icon: <LayoutDashboard className="w-4 h-4 stroke-[3]" /> },
  ];

  // ── Handlers ──
  const handleCreateClub = () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.show(t("clubEmptyName"));
    persist({ name: trimmed, createdAt: club?.createdAt || Date.now(), teams: teams });
    toast.show(t("clubCreated"));
    setStep(2);
  };

  const handleAddTeam = () => {
    const trimmed = teamName.trim() || `${t("gameTeamPrefix")} ${teams.length + 1}`;
    persist({
      ...club,
      teams: [
        ...teams,
        { id: `t_${Date.now()}`, name: trimmed, color: teamColor, members: [] },
      ],
    });
    setTeamName("");
    const idx = (CLUB_TEAM_COLORS.indexOf(teamColor) + 1) % CLUB_TEAM_COLORS.length;
    setTeamColor(CLUB_TEAM_COLORS[idx]);
  };

  const handleDeleteTeam = (teamId) => {
    persist({ ...club, teams: teams.filter((tm) => tm.id !== teamId) });
  };

  const handleAssign = (qrId, teamId) => {
    persist({
      ...club,
      teams: teams.map((tm) => {
        const without = tm.members.filter((m) => m !== qrId);
        return tm.id === teamId ? { ...tm, members: [...without, qrId] } : { ...tm, members: without };
      }),
    });
  };

  const handleUnassign = (qrId) => {
    persist({
      ...club,
      teams: teams.map((tm) => ({ ...tm, members: tm.members.filter((m) => m !== qrId) })),
    });
  };

  const handleReset = () => {
    summerClubDB.remove(CLUB_ID);
    setClub(null);
    setName("");
    setConfirmReset(false);
    setStep(1);
  };

  const canGoNext = step !== 2 || teams.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <Toast msg={toast.msg} />

      {/* ── Stepper ── */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {steps.map((s) => {
          const active = s.id === step;
          const done = s.id < step;
          const reachable = s.id <= step || (club && s.id <= 4);
          return (
            <button
              key={s.id}
              onClick={() => reachable && setStep(s.id)}
              disabled={!reachable}
              className={`flex flex-col items-center gap-1.5 border-[3px] border-black px-1 py-2 sm:py-3 shadow-[3px_3px_0px_#000000] transition-all rounded-none ${
                active
                  ? "bg-black text-[#A3E635]"
                  : done
                  ? "bg-[#A3E635] text-black"
                  : "bg-white text-black/50"
              } ${reachable ? "cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000000]" : "cursor-not-allowed opacity-60"}`}
            >
              <span
                className={`w-7 h-7 flex items-center justify-center border-2 border-black font-black text-xs shrink-0 ${
                  done ? "bg-black text-[#A3E635]" : "bg-white text-black"
                }`}
              >
                {done ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
              </span>
              <span className="font-black text-[10px] sm:text-xs uppercase tracking-wide text-center leading-tight">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Create club ── */}
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
                <span>{t("clubStep1")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                {t("clubStep1")}
              </h2>
              <p className="text-sm font-bold text-black/70 max-w-lg">{t("clubCreateHint")}</p>
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-black text-sm uppercase">{t("clubNameLabel")}</span>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateClub()}
                placeholder={t("clubNamePlaceholder")}
                className="w-full bg-white border-[3px] border-black px-4 py-3 font-black text-lg placeholder:text-black/40 outline-none focus:shadow-[5px_5px_0px_#000000] transition-shadow"
              />
            </label>

            <button
              onClick={handleCreateClub}
              className="self-start bg-[#A3E635] text-black border-[3px] border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{t("clubCreate")}</span>
              <ChevronIcon className="w-5 h-5 stroke-[3]" />
            </button>
          </Motion.div>
        )}

        {/* ── STEP 2: Create teams ── */}
        {step === 2 && (
          <Motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#38BDF8] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black uppercase">{t("clubTeamsTitle")}</h2>
                  <p className="text-xs font-bold text-black/60">{t("clubTeamsHint")}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap">
                  {CLUB_TEAM_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTeamColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-9 h-9 border-2 border-black transition-all cursor-pointer rounded-none ${
                        teamColor === c
                          ? "shadow-[3px_3px_0px_#000000] scale-105"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      aria-label={c}
                    >
                      {teamColor === c && (
                        <Check className="w-5 h-5 stroke-[3] mx-auto text-black" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
                    placeholder={t("clubTeamNamePlaceholder")}
                    className="flex-1 bg-white border-[3px] border-black px-4 py-2.5 font-black placeholder:text-black/40 outline-none"
                  />
                  <button
                    onClick={handleAddTeam}
                    className="bg-[#A3E635] text-black border-[3px] border-black px-4 py-2.5 font-black uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                    <span className="hidden sm:inline">{t("clubAddTeam")}</span>
                  </button>
                </div>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="bg-white border-[3px] border-dashed border-black/40 p-8 text-center font-black text-black/50">
                {t("clubNoTeams")}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((tm) => (
                  <div
                    key={tm.id}
                    className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        style={{ backgroundColor: tm.color }}
                        className="w-10 h-10 border-2 border-black shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-black text-lg truncate">{tm.name}</p>
                        <p className="text-xs font-bold text-black/60">
                          {tm.members.length} {t("clubTeamMembers")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTeam(tm.id)}
                      className="bg-[#EF4444] text-white border-2 border-black p-2 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer shrink-0"
                      title={t("clubDeleteTeam")}
                    >
                      <Trash2 className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <NavRow
              onPrev={() => setStep(1)}
              onNext={() => canGoNext && setStep(3)}
              nextDisabled={!canGoNext}
              t={t}
              nextLabel={t("clubNext")}
              prevLabel={t("clubPrev")}
              BackIcon={BackIcon}
              ChevronIcon={ChevronIcon}
            />
          </Motion.div>
        )}

        {/* ── STEP 3: Assign students ── */}
        {step === 3 && (
          <Motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-5"
          >
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F472B6] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                  <UserPlus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black uppercase">{t("clubMembersTitle")}</h2>
                  <p className="text-xs font-bold text-black/60">{t("clubMembersHint")}</p>
                </div>
              </div>

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

            {filteredStudents.length === 0 ? (
              <div className="bg-white border-[3px] border-dashed border-black/40 p-8 text-center font-black text-black/50">
                {t("clubNoStudents")}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredStudents.map((s) => {
                  const current = teamOf(s.qrId);
                  return (
                    <div
                      key={s.qrId}
                      className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000000] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          style={{ backgroundColor: current?.color || "#E5E7EB" }}
                          className="w-9 h-9 border-2 border-black shrink-0 flex items-center justify-center font-black text-sm"
                        >
                          {(s.name || "M")[0]?.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black truncate">{s.name}</p>
                          <p className="text-xs font-bold text-black/50">
                            {current ? current.name : t("clubUnassigned")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {teams.map((tm) => {
                          const selected = current?.id === tm.id;
                          return (
                            <button
                              key={tm.id}
                              onClick={() => handleAssign(s.qrId, tm.id)}
                              style={{ backgroundColor: tm.color }}
                              className={`px-2.5 py-1.5 border-2 border-black font-black text-xs uppercase transition-all cursor-pointer ${
                                selected
                                  ? "shadow-none translate-x-0.5 translate-y-0.5"
                                  : "shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                              }`}
                            >
                              {selected && <Check className="w-3 h-3 stroke-[3] inline-block me-1" />}
                              {tm.name}
                            </button>
                          );
                        })}
                        {current && (
                          <button
                            onClick={() => handleUnassign(s.qrId)}
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

            <NavRow
              onPrev={() => setStep(2)}
              onNext={() => setStep(4)}
              t={t}
              nextLabel={t("clubNext")}
              prevLabel={t("clubPrev")}
              BackIcon={BackIcon}
              ChevronIcon={ChevronIcon}
            />
          </Motion.div>
        )}

        {/* ── STEP 4: Dashboard ── */}
        {step === 4 && club && (
          <Motion.div
            key="step4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] self-start">
                <LayoutDashboard className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t("clubStep4")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{club.name}</h2>

              <div className="grid grid-cols-3 gap-3">
                <StatCard value={teams.length} label={t("clubTotalTeams")} bg="bg-[#38BDF8]" />
                <StatCard value={assignedCount} label={t("clubTotalMembers")} bg="bg-[#A3E635]" />
                <StatCard
                  value={Math.max(0, allStudents.length - assignedCount)}
                  label={t("clubUnassignedCount")}
                  bg="bg-[#FB923C]"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="bg-white border-[3px] border-black px-4 py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4 stroke-[3]" />
                  {t("clubEditTeams")}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-white border-[3px] border-black px-4 py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 stroke-[3]" />
                  {t("clubEditMembers")}
                </button>
                <button
                  onClick={() => setConfirmReset(true)}
                  className="bg-[#EF4444] text-white border-[3px] border-black px-4 py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 stroke-[3]" />
                  {t("clubReset")}
                </button>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="bg-white border-[3px] border-dashed border-black/40 p-8 text-center font-black text-black/50">
                {t("clubNoTeams")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {teams.map((tm) => (
                  <div
                    key={tm.id}
                    className="bg-white border-[3px] border-black shadow-[5px_5px_0px_#000000] flex flex-col"
                  >
                    <div
                      style={{ backgroundColor: tm.color }}
                      className="border-b-[3px] border-black px-4 py-3 flex items-center justify-between"
                    >
                      <span className="font-black text-lg text-black truncate">{tm.name}</span>
                      <span className="bg-black text-white border-2 border-black px-2 py-0.5 font-black text-xs">
                        {tm.members.length}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-1.5">
                      {tm.members.length === 0 ? (
                        <p className="text-sm font-bold text-black/40 text-center py-3">
                          {t("clubEmptyTeam")}
                        </p>
                      ) : (
                        tm.members.map((qrId) => {
                          const s = allStudents.find((x) => x.qrId === qrId);
                          return (
                            <div
                              key={qrId}
                              className="flex items-center gap-2 bg-[#FDF8F0] border-2 border-black px-2.5 py-1.5"
                            >
                              <span className="w-6 h-6 bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                {(s?.name || "M")[0]?.toUpperCase()}
                              </span>
                              <span className="font-bold text-sm truncate">
                                {s?.name || `#${qrId}`}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Reset Confirmation ── */}
      <AnimatePresence>
        {confirmReset && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 text-center flex flex-col items-center gap-5"
            >
              <div className="w-16 h-16 bg-[#EF4444] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-white">
                <AlertTriangle className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black uppercase">{t("clubResetConfirm")}</h3>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-[#EF4444] text-white border-2 border-black py-2.5 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  {t("clubReset")}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-white border-2 border-black py-2.5 font-black uppercase text-sm shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
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

function StatCard({ value, label, bg }) {
  return (
    <div className={`${bg} border-[3px] border-black shadow-[4px_4px_0px_#000000] p-3 sm:p-4 flex flex-col items-center justify-center text-center`}>
      <span className="text-2xl sm:text-3xl font-black text-black leading-none">{value}</span>
      <span className="text-[10px] sm:text-xs font-black uppercase text-black/70 tracking-wide mt-1">
        {label}
      </span>
    </div>
  );
}

function NavRow({ onPrev, onNext, nextDisabled, nextLabel, prevLabel, BackIcon, ChevronIcon }) {
  const PrevIcon = BackIcon;
  const NextIcon = ChevronIcon;
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={onPrev}
        className="bg-white border-[3px] border-black px-4 py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
      >
        <PrevIcon className="w-5 h-5 stroke-[3]" />
        {prevLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`border-[3px] border-black px-5 py-2.5 font-black text-sm uppercase transition-all flex items-center gap-2 ${
          nextDisabled
            ? "bg-black/10 text-black/40 cursor-not-allowed"
            : "bg-[#A3E635] shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
        }`}
      >
        {nextLabel}
        <NextIcon className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  );
}
