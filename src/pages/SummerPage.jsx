import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Sun,
  ChevronLeft,
  Search,
  ClipboardList,
  Gamepad2,
  ArrowRight,
  Target,
  Trophy,
  Zap,
  XCircle,
  CheckCircle2,
  Users,
  Award,
  Crown,
  Medal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { studentsDB, attendanceDB, gameArenaDB } from "../data/storage";
import { buildAttendanceEntry, registeredToday } from "../utils/helpers";
import { useToast } from "../hooks/useToast";
import { Avatar, Toast } from "../components/UI";
import gsap from "gsap";

import bgImage from "../assets/studium.png";

export function SummerSection({ onGoHome }) {
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [internalView, setInternalView] = useState("menu"); // 'menu' | 'search' | 'attendance' | 'games'
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setEntered(entry.isIntersecting && entry.intersectionRatio >= 0.3); },
      { threshold: [0, 0.3] }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Data Fetching
  const allStudents = useMemo(() => {
    const db = studentsDB.getAll();
    return Object.keys(db).map(id => ({ qrId: id, ...db[id] }));
  }, []);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allStudents.slice(0, 12);
    return allStudents.filter(s => 
      s.name?.toLowerCase().includes(q) || s.qrId.toLowerCase().includes(q)
    );
  }, [searchQuery, allStudents]);

  const arenaData = useMemo(() => gameArenaDB.get() || { teams: [], games: [] }, []);

  const handleToggleAttendance = (student) => {
    const log = attendanceDB.get(student.qrId);
    if (registeredToday(log)) {
      toast.show(`✅ ${student.name} مُسجل بالفعل`);
    } else {
      attendanceDB.add(student.qrId, buildAttendanceEntry());
      toast.show(`⚽ هدف! تم تسجيل حضور ${student.name}`);
    }
  };

  const summerCards = [
    {
      id: "search",
      label: "بحث عن مخدوم",
      subLabel: "SEARCH CENTRE",
      icon: <Search className="w-10 h-10" />,
      color: "from-lime-400/20 to-emerald-500/10",
      accent: "text-lime-400",
      glow: "bg-lime-400/20"
    },
    {
      id: "attendance",
      label: "تسجيل الحضور",
      subLabel: "ATTENDANCE HUB",
      icon: <ClipboardList className="w-10 h-10" />,
      color: "from-sky-400/20 to-emerald-500/10",
      accent: "text-sky-400",
      glow: "bg-sky-400/20"
    },
    {
      id: "games",
      label: "ساحة الألعاب",
      subLabel: "GAME ARENA",
      icon: <Gamepad2 className="w-10 h-10" />,
      color: "from-amber-400/20 to-emerald-500/10",
      accent: "text-amber-400",
      glow: "bg-amber-400/20"
    }
  ];

  return (
    <div ref={sectionRef} className="w-full h-full relative overflow-y-auto overflow-x-hidden bg-[#063d2f] custom-scrollbar">
      <Toast msg={toast.msg} />
      
      {/* Background Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1500ms]"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(12, 92, 70, 0.72), rgba(4, 52, 40, 0.82)), url(${bgImage})`,
          transform: entered ? "scale(1)" : "scale(1.15)"
        }}
      ></div>

      {/* Field Markings Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] border-2 border-white/10 rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center w-full min-h-full py-12"
      >
        <header className="w-full flex justify-between items-center mb-12" dir="rtl">
          <button
            onClick={() => {
              if (internalView !== "menu") {
                setInternalView("menu");
              } else {
                if (onGoHome) onGoHome();
                const portal = document.getElementById("summer-portal");
                if (portal) window.scrollTo({ top: portal.offsetTop, behavior: "smooth" });
              }
            }}
            className="group flex items-center gap-4 px-6 py-3 bg-emerald-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl text-emerald-100 font-extrabold text-xs hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>{internalView === "menu" ? "العودة للرئيسية" : "الرجوع للملعب"}</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="px-5 py-2.5 bg-lime-500/10 text-lime-400 text-[10px] font-black tracking-[0.4em] uppercase rounded-xl border border-lime-500/20 backdrop-blur-md">
              {internalView === "menu" ? "Elite Summer Stadium" : internalView.toUpperCase()}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {internalView === "menu" && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center w-full mb-16 relative">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-none flex items-center justify-center gap-6">
                  النادي <span className="text-lime-400 italic">الصيفي</span>
                </h1>
                <p className="text-emerald-300/40 text-[10px] font-black uppercase tracking-[0.8em] mt-2">Elite Sports Program 2026</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl" dir="rtl">
                {summerCards.map((card, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setInternalView(card.id)}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1, duration: 0.8 }}
                    whileHover={{ y: -12 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative tech-panel !p-10 flex flex-col items-center text-center gap-6 overflow-hidden group border-white/10 transition-all duration-500 bg-gradient-to-br ${card.color}`}
                  >
                    <div className={`w-20 h-20 rounded-3xl bg-slate-950/80 border border-white/5 flex items-center justify-center ${card.accent} group-hover:scale-110 transition-transform duration-700 shadow-2xl relative z-10`}>
                      {card.icon}
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">
                        {card.label}
                      </h3>
                      <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${card.accent} opacity-60`}>
                        {card.subLabel}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-white/20 group-hover:text-white/40 transition-colors">
                       <span className="text-[9px] font-black uppercase tracking-widest">Open Interface</span>
                       <ArrowRight size={12} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {(internalView === "search" || internalView === "attendance") && (
            <motion.div 
              key={internalView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl flex flex-col gap-8"
              dir="rtl"
            >
              <div className="relative w-full group">
                  <div className="absolute inset-0 bg-lime-400/5 blur-3xl group-focus-within:bg-lime-400/10 transition-colors pointer-events-none"></div>
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-lime-400/40" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن اسم الطفل هنا..."
                    className="w-full h-16 bg-emerald-950/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] pr-16 pl-8 text-white font-bold placeholder:text-emerald-100/20 focus:outline-none focus:border-lime-400/40 transition-all shadow-2xl"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStudents.map((s, idx) => {
                    const isPresent = registeredToday(attendanceDB.get(s.qrId));
                    return (
                      <motion.div
                        key={s.qrId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-3xl border backdrop-blur-xl flex items-center justify-between transition-all ${
                          isPresent ? "bg-lime-500/10 border-lime-500/30" : "bg-white/5 border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                            <Avatar name={s.name} image={s.image} size="md" />
                            <div className="flex flex-col">
                                <span className={`font-black tracking-tight text-white`}>{s.name}</span>
                                <span className="text-[10px] uppercase font-bold opacity-40 text-emerald-100">{s.qrId}</span>
                            </div>
                        </div>

                        {internalView === "attendance" && (
                           <button 
                             onClick={() => handleToggleAttendance(s)}
                             className={`p-2 rounded-xl transition-all ${isPresent ? 'bg-lime-500 text-emerald-950 shadow-lg' : 'bg-white/5 text-emerald-100/40 hover:bg-white/10'}`}
                           >
                              {isPresent ? <CheckCircle2 size={18} strokeWidth={3} /> : <Target size={18} />}
                           </button>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {internalView === "games" && (
            <motion.div 
               key="games"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="w-full"
               dir="rtl"
            >
               <SummerRankings teams={arenaData.teams} games={arenaData.games} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex flex-col items-center gap-4 opacity-20">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-lime-500/50 to-transparent"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-emerald-100">Elite Stadium V2</p>
        </div>
      </motion.div>
    </div>
  );
}

const SummerRankings = ({ teams, games }) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const results = useMemo(() => {
    if (!teams?.length) return [];
    return teams.map(t => {
      let score = 0;
      games?.forEach(g => {
        score += Number(g.scores?.[t.id]) || 0;
      });
      return { ...t, score };
    }).sort((a, b) => b.score - a.score);
  }, [teams, games]);

  useEffect(() => {
    if (!results.length) return;
    const ctx = gsap.context(() => {
      gsap.set(cardsRef.current, { opacity: 0, x: 20 });
      gsap.to(cardsRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, [results]);

  if (!results.length) {
    return (
      <div className="bg-emerald-950/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-16 text-center flex flex-col items-center gap-6">
          <Award className="w-12 h-12 text-emerald-100/20" />
          <h3 className="text-sm font-black text-emerald-100/40 uppercase tracking-widest">لا يوجد بيانات ألعاب متاحة</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={containerRef}>
      {results.map((team, index) => {
        const isWinner = index === 0;
        return (
          <div 
            key={team.id}
            ref={el => cardsRef.current[index] = el}
            className={`p-8 rounded-[2.5rem] border overflow-hidden backdrop-blur-3xl ${
              isWinner 
              ? "bg-gradient-to-br from-lime-500/20 to-emerald-900/40 border-lime-400/30" 
              : "bg-emerald-950/40 border-white/5"
            }`}
          >
            <div className="flex flex-col items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 ${
                 index === 0 ? "bg-lime-400 text-emerald-950 border-lime-200" :
                 index === 1 ? "bg-slate-300 text-slate-900 border-slate-100" :
                 index === 2 ? "bg-amber-700 text-amber-50 border-amber-500" :
                 "bg-emerald-900/50 text-emerald-100/50 border-white/5"
              }`}>
                 {index === 0 ? <Crown /> : index === 1 ? <Medal /> : index === 2 ? <Award /> : index + 1}
              </div>

              <div className="text-center">
                 <h4 className="text-xl font-black text-white tracking-tighter mb-1 uppercase">{team.name}</h4>
                 <span className={`text-4xl font-black tabular-nums ${isWinner ? 'text-lime-400' : 'text-emerald-100/80'}`}>
                   {team.score}
                 </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

