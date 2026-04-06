import React, { useRef, useEffect } from "react";
import { Page, ModernNavbar } from "../components/UI";
import { motion } from "framer-motion";
import {
  Search,
  ClipboardList,
  Home,
  Gift,
  BookOpen,
  Settings,
  ArrowRight,
  Gamepad2,
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SummerSection } from "./SummerPage";

gsap.registerPlugin(ScrollTrigger);

const TechHeroCard = ({ card, index }) => {
  return (
    <motion.button
      onClick={card.onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -10, transition: { duration: 0.4 } }}
      whileTap={{ scale: 0.97 }}
      className="tech-card group flex flex-col items-start text-right gap-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors"></div>

      <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-sky-400 group-hover:text-sky-300 group-hover:scale-110 group-hover:border-sky-500/30 transition-all duration-500 shadow-2xl">
        {React.cloneElement(card.icon, {
          className: "w-8 h-8",
          strokeWidth: 1.5,
        })}
      </div>

      <div className="space-y-2 relative z-10">
        <h3 className="text-2xl font-black text-sky-50 tracking-tighter group-hover:text-sky-400 transition-colors">
          {card.label}
        </h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-sky-500/60 transition-colors">
          {card.subLabel}
        </p>
      </div>

      {/* Hover Line */}
      <div className="absolute bottom-0 right-0 w-0 h-1 bg-sky-500 group-hover:w-full transition-all duration-700"></div>
    </motion.button>
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
  onGoSearch_Summer,
  onGoAttendance_Summer,
  onGoGame_Summer,
}) {

  const cards = [
    {
      label: "بحث ",
      subLabel: "Search",
      icon: <Search />,
      onClick: onGoSearch,
      show: true,
    },
    {
      label: "تسجيل الحضور",
      subLabel: "Attendance",
      icon: <ClipboardList />,
      onClick: onGoAttendance,
      show: currentUser?.role === "admin",
    },
    {
      label: " زيارات",
      subLabel: "Visits",
      icon: <Home />,
      onClick: onGoVisits,
      show: true,
    },
    {
      label: "أعياد الميلاد",
      subLabel: "Celebrations",
      icon: <Gift />,
      onClick: onGoBirthday,
      show: true,
    },
    {
      label: "الفصول",
      subLabel: "Classes & Stages",
      icon: <BookOpen />,
      onClick: onGoClasses,
      show: currentUser?.role !== "admin",
    },
    {
      label: "لوحة التحكم",
      subLabel: "Admin Dashboard",
      icon: <Settings />,
      onClick: onGoAdmin,
      show: currentUser?.role === "admin",
    },

    {
      label: "صفحة الألعاب",
      subLabel: "Game Arena",
      icon: <Gamepad2 />,
      onClick: onGoGame,
      show: true,
    },
  ].filter((c) => c.show);


  // Memoize the scroll handler to prevent PortalDive component re-renders/GSAP resets
  const handleGoHome = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Page noScrollLock={true} noFlex={true} noMinHeight={true}>
      <div className="relative z-10 w-full">
        <ModernNavbar
          currentUser={currentUser}
          onLogout={onLogout}
          onGoHome={handleGoHome}
          onGoClasses={onGoClasses}
          onGoSearch={onGoSearch}
          onGoAdmin={onGoAdmin}
          onGoSummer={onGoSummer}
          activePage="home"
        />

        <main className="px-8 sm:px-16 lg:px-24 pt-48 pb-40 max-w-7xl mx-auto w-full flex flex-col justify-center min-h-[80vh]">
          <header
            className="mb-32 flex flex-col items-start relative"
            dir="rtl"
          >
            {/* Background Accent */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full"></div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 relative z-10"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-sky-50 tracking-[-0.05em] leading-tight text-balance">
                مدارس أحد <br />
                <span className="gradient-blue italic text-7xl sm:text-8xl lg:text-[10rem]">المحبة</span>
              </h1>

              <div className="pt-10 flex flex-col items-start gap-4">
                
                {/* Removed Session Info */}
              </div>
            </motion.div>
          </header>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            dir="rtl"
          >
            {cards.map((card, idx) => (
              <TechHeroCard key={idx} card={card} index={idx} />
            ))}
          </div>

          <div className="mt-40 flex flex-col items-center gap-12">
            <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-[10px] opacity-40">
              كل حاجة جاهزة!
            </p>
          </div>
        </main>

        {/* Portal Animation Section */}
        <PortalDive 
          onGoHome={handleGoHome} 
          onGoSearch={onGoSearch_Summer}
          onGoAttendance={onGoAttendance_Summer}
          onGoGame={onGoGame_Summer}
        />
      </div>
    </Page>
  );
}

function PortalDive({ onGoHome, onGoSearch, onGoAttendance, onGoGame }) {
  const portalSectionRef = useRef(null);
  const portalContentRef = useRef(null);
  const portalTextRef = useRef(null);

  useEffect(() => {
    let ctx;
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: portalSectionRef.current,
            start: "top top",
            end: "+=2200",
            scrub: 1.5,
            pin: true,
            invalidateOnRefresh: true,
            pinSpacing: true,
          },
        });

        tl.addLabel("start", 0)
          .addLabel("mid", 0.4)
          .addLabel("interactive", 0.9);

        // 1. Text fades out and floats up
        tl.to(
          portalTextRef.current,
          {
            opacity: 0,
            y: -150,
            duration: 0.1,
          },
          "start",
        );

        // 2. The "Window" expands & Background scales down
        tl.fromTo(
          portalContentRef.current,
          {
            clipPath: "inset(35% 35% 35% 35% round 5rem)",
            opacity: 0.5,
          },
          {
            clipPath: "inset(0% 0% 0% 0% round 0rem)",
            opacity: 1,
            duration: 1,
            ease: "power2.inOut",
          },
          "start",
        );

        tl.fromTo(
          ".summer-bg-layer",
          { scale: 1.25 },
          { scale: 1, duration: 1, ease: "power2.inOut" },
          "start",
        );

        // 3. New Unified Summer Content Reveal (Sync with scroll)
        tl.fromTo(
          ".summer-stadium-content",
          { opacity: 0, y: 120 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
          },
          "mid",
        );

        // 4. Hide Global Dashboard UI (Navbar & Sidebar)
        tl.to(
          [".modern-navbar-container", ".sidebar-container"],
          {
            autoAlpha: 0,
            y: -150,
            x: 100,
            duration: 0.3,
            stagger: 0.05,
          },
          "start",
        );

        tl.set(portalContentRef.current, { pointerEvents: "auto" }, "interactive");

        ScrollTrigger.refresh();
      }, /* no scope */);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, [onGoHome]);

  return (
    <section
      id="summer-portal"
      ref={portalSectionRef}
      className="w-full h-screen relative flex items-center justify-center overflow-hidden bg-[#022c22]"
    >
      {/* 1. The Masked Page Content (Revealed gradually) */}
      <div
        ref={portalContentRef}
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden bg-[#022c22]"
        style={{
          clipPath: "inset(35% 35% 35% 35% round 5rem)",
          willChange: "clip-path, opacity",
        }}
      >
        <SummerSection 
          onGoHome={onGoHome} 
          onGoSearch={onGoSearch}
          onGoAttendance={onGoAttendance}
          onGoGame={onGoGame}
        />
      </div>

      {/* 2. Hero Text (Floating outside/above the window) */}
      <div
        ref={portalTextRef}
        className="absolute z-20 text-center px-6 pointer-events-none flex flex-col items-center"
      >
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
          <span className="text-sky-300 italic">النادي الصيفي</span>
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="w-px h-12 bg-gradient-to-b from-sky-400 to-transparent"></div>
        </div>
      </div>

      {/* 3. Subtle Ambient Vignette (Removed) */}
    </section>
  );
}
