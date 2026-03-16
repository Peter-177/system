import React, { useRef, useEffect } from "react";
import { Page, ModernNavbar } from "../components/UI";
import { motion } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SummerSection } from "./SummerPage"; // Now treated as a section
import { 
  Search, 
  ClipboardList, 
  Home, 
  Gift, 
  BookOpen, 
  Settings
} from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Shiny Card Component
const GlowingCard = ({ card }) => {
  return (
    <motion.button
      onClick={card.onClick}
      variants={{
        hidden: { opacity: 0, scale: 0.8, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
      }}
      whileHover={{ y: -5, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}
      whileTap={{ scale: 0.95 }}
      className={`relative group flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] border bg-base-100/70 backdrop-blur-xl shadow-lg border-white/5 dark:border-white/10 overflow-hidden w-full h-full min-h-[180px] sm:min-h-[220px] lg:min-h-[260px]`}
    >
      {/* Animated Gradient Border Layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}></div>
      
      {/* Subtle Glow Effect behind icon */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br ${card.gradient} blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`}></div>

      {/* Icon Container */}
      <div className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${card.bgBase} ${card.color} shadow-inner bg-base-100/50`}>
        {React.cloneElement(card.icon, { className: "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" })}
      </div>

      <span className="relative z-10 font-bold text-lg sm:text-xl lg:text-2xl text-base-content group-hover:text-primary transition-colors tracking-wide">
        {card.label}
      </span>
      <span className="relative z-10 text-xs sm:text-sm text-base-content/60 mt-2 uppercase tracking-[0.2em] font-bold">
        {card.subLabel}
      </span>
    </motion.button>
  );
};

// Particles component for the background
const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 fixed">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] mix-blend-screen animate-pulse duration-1000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/10 blur-[100px] mix-blend-screen animate-pulse duration-1000 delay-500"></div>
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-accent/10 blur-[90px] mix-blend-screen animate-pulse duration-1000 delay-1000"></div>
    </div>
  );
};

export function HomePage({ currentUser, onGoSearch, onGoSummer, onGoAttendance, onGoVisits, onGoBirthday, onGoClasses, onGoAdmin, onLogout }) {
  // GSAP Refs
  const portalSectionRef = useRef(null);
  const portalFrameRef = useRef(null);
  const portalTextRef = useRef(null);
  const portalBgRef = useRef(null);
  const summerContentRef = useRef(null);

  useEffect(() => {
    let ctx;
    // Wait for the DOM and all CSS to settle before measuring
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        console.log("GSAP ScrollTrigger Context Initialized");
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: portalSectionRef.current,
            start: "top top", // Pin when the section reaches the top of the screen
            end: "+=3500", // Scroll distance for the animation
            scrub: 1,      // Smooth scrubbing with slight delay for fluidity
            pin: true,     // Pin the section in place
          }
        });

        // 1. Fade out the "Discover Summer" text early as we start to zoom
        tl.to(portalTextRef.current, {
          opacity: 0,
          y: -50,
          duration: 0.1, // Happens in first 10% of scroll
        }, 0);

        // 2. Fade in the bright summer sky background
        tl.to(portalBgRef.current, {
          opacity: 1,
          duration: 0.4, // Fades in smoothly
        }, 0);

        // 3. The Massive Zoom - scales the frame so large the inner hole covers the screen
        tl.to(portalFrameRef.current, {
          scale: 120, // Huge scale factor
          ease: "power2.inOut", // Starts slow, accelerates fast into the screen
          duration: 1, // Takes the whole timeline
        }, 0);
        
        // 4. Fade IN and Scale UP the SummerSection content 
        // We start revealing it halfway through the zoom so it appears gradually
        tl.fromTo(summerContentRef.current, 
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
          0.4 // Start at 40% of the timeline
        );

        // 5. Fade out the frame border at the very end to prevent blurry artifacts at scale 120
        tl.to(portalFrameRef.current, {
          opacity: 0,
          duration: 0.1
        }, 0.9);

        // Tell GSAP to recalculate positions now that this element is fully rendered
        ScrollTrigger.refresh();

      }, portalSectionRef);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert(); // Cleanup on unmount
    };
  }, [onGoSummer]);

  const greeting = "مدارس أحد المحبة";

  const cards = [
    {
      label: "بحث",
      subLabel: "Search",
      icon: <Search className="w-8 h-8" strokeWidth={2.5} stroke="currentColor" />,
      onClick: onGoSearch,
      color: "text-primary",
      bgBase: "bg-primary/10",
      gradient: "from-primary to-blue-500",
      show: true
    },
    {
      label: "الحضور",
      subLabel: "Attendance",
      icon: <ClipboardList className="w-8 h-8" strokeWidth={2.5} stroke="currentColor" />,
      onClick: onGoAttendance,
      color: "text-success",
      bgBase: "bg-success/10",
      gradient: "from-success to-emerald-500",
      show: currentUser?.role === "admin"
    },
    {
      label: "الزيارات",
      subLabel: "Visits",
      icon: <Home className="w-8 h-8" strokeWidth={2.5} stroke="currentColor" />,
      onClick: onGoVisits,
      color: "text-info",
      bgBase: "bg-info/10",
      gradient: "from-info to-cyan-500",
      show: true
    },
    {
      label: "أعياد الميلاد",
      subLabel: "Birthdays",
      icon: <Gift className="w-8 h-8" strokeWidth={2.5} stroke="currentColor" />,
      onClick: onGoBirthday,
      color: "text-warning",
      bgBase: "bg-warning/10",
      gradient: "from-warning to-amber-400",
      show: true
    },
    {
      label: "الفصول",
      subLabel: "Classes",
      icon: <BookOpen className="w-8 h-8" strokeWidth={2.5} stroke="currentColor" />,
      onClick: onGoClasses,
      color: "text-secondary",
      bgBase: "bg-secondary/10",
      gradient: "from-secondary to-fuchsia-500",
      show: currentUser?.role !== "admin"
    },
    {
      label: "الإدادات",
      subLabel: "Admin",
      icon: <Settings className="w-8 h-8" strokeWidth={2.5} stroke="currentColor" />,
      onClick: onGoAdmin,
      color: "text-neutral",
      bgBase: "bg-neutral/10",
      gradient: "from-neutral to-gray-500",
      show: currentUser?.role === "admin"
    }
  ].filter(c => c.show);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  return (
    <Page noScrollLock={true}>
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      
      <Particles />
      <div className="relative z-10 w-full">
        <ModernNavbar 
          currentUser={currentUser} 
          onLogout={onLogout}
          onGoHome={() => {}}
          onGoClasses={onGoClasses}
          onGoSearch={onGoSearch}
          activePage="home"
        />

        {/* Main Content Area */}
        <div className="px-6 sm:px-12 lg:px-20 pt-24 pb-20 w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full text-center mb-12 lg:mb-20 mt-4"
            dir="rtl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary via-secondary to-accent mb-4 lg:mb-6 drop-shadow-sm pb-1">
              {greeting}
            </h1>
            
            {currentUser?.name && (
              <p className="text-lg sm:text-xl lg:text-3xl text-base-content/60 font-medium font-arabic flex items-center justify-center gap-3">
                <span>يا</span>
                <span className="font-bold text-base-content">{currentUser.name}</span>
                <span>✨</span>
              </p>
            )}
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 lg:gap-10 w-full" 
            dir="rtl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {cards.map((card, idx) => (
              <GlowingCard key={idx} card={card} index={idx} />
            ))}
          </motion.div>
        </div>

        <div 
          ref={portalSectionRef} 
          className="w-full h-screen overflow-hidden flex items-center justify-center bg-base-100 relative"
        >
          {/* Fading Summer Background */}
          <div 
            ref={portalBgRef}
            className="absolute inset-0 z-0 bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 opacity-0"
          ></div>

          {/* The Portal Frame */}
          <div
            ref={portalFrameRef}
            className="absolute z-30 w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] md:max-w-[500px] md:max-h-[500px] rounded-[2rem] border-[16px] border-base-200/90 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,0.5),inset_0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none"
            style={{ willChange: "transform" }}
          >
            {/* Inner glass highlight for the frame */}
            <div className="absolute inset-0 border border-white/20 rounded-2xl pointer-events-none"></div>
            
            {/* "Enter" text floating outside the frame */}
            <div 
              ref={portalTextRef}
              className="absolute -top-24 whitespace-nowrap text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-wider font-arabic drop-shadow-xl"
            >
              اكتشف الصيف
            </div>

            {/* Glowing orb in the center of the portal */}
            <div className="absolute w-32 h-32 bg-orange-400/30 rounded-full blur-3xl"></div>
          </div>

          {/* The new Summer Section rendered concurrently, controlled by GSAP */}
          <div 
            ref={summerContentRef}
            className="absolute inset-0 z-20 w-full h-full pointer-events-none opacity-0"
          >
             {/* Only enable pointer events when the animation is mostly finished so buttons hook up */}
             <div className="w-full h-full flex pointer-events-auto">
               <SummerSection onGoHome={() => {
                 // To go home, we just animate the scroll back to the top of the portal section
                 window.scrollTo({ top: portalSectionRef.current.offsetTop, behavior: "smooth" });
               }} />
             </div>
          </div>
        </div>

      </div>
    </Page>
  );
}