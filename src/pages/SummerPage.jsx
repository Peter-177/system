import React, { useRef, useState, useEffect } from "react";
import {
  Sun,
  ChevronLeft,
} from "lucide-react";

import bgImage from "../assets/studium.png";

export function SummerSection({ onGoHome }) {
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setEntered(entry.intersectionRatio >= 0.35); },
      { threshold: [0, 0.35] }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);


  return (
    <div ref={sectionRef} className="w-full h-full relative overflow-y-auto overflow-x-hidden bg-[#063d2f]">
      {/* Fixed Background Layer — تدرج أخف قليلاً ليظهر عشب الصورة أكثر، مع بقاء طبقة بسيطة أغمق من الصورة الخام */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(12, 92, 70, 0.72), rgba(4, 52, 40, 0.82)), url(${bgImage})`
        }}
      ></div>

      {/* Field Markings (Decorative) - always visible */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] border-2 border-white/10 rounded-full"></div>
      </div>

      {/* CONTENT — only visible after user enters the section */}
      <motion.div
        animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col items-center w-full min-h-full py-12"
      >

        <div
          className="w-full flex justify-between items-center mb-8"
          dir="rtl"
        >
          <button
            onClick={() => {
              if (onGoHome) onGoHome();
              const portal = document.getElementById("summer-portal");
              if (portal)
                window.scrollTo({ top: portal.offsetTop, behavior: "smooth" });
            }}
            className="group flex items-center gap-4 px-6 py-3 bg-emerald-900/60 backdrop-blur-md border border-white/10 rounded-2xl text-emerald-100 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <ChevronLeft className="w-5 h-5 ml-1 relative z-10" />
            <span className="relative z-10">العودة للرئيسية</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="px-4 py-2 bg-lime-500/10 text-lime-400 text-[10px] font-black tracking-[0.4em] uppercase rounded-full border border-lime-500/20">
              PITCH NODE 2026
            </div>
          </div>
        </div>

        <div id="summer-hero" className="text-center w-full mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative inline-flex items-center justify-center p-8 bg-emerald-900/30 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 mb-8 group"
          >
            <div className="absolute inset-0 bg-lime-500/5 rounded-[2.5rem] blur-3xl group-hover:bg-lime-500/10 transition-colors"></div>
            <Sun
              className="w-20 h-24 text-lime-400 relative z-10 animate-spin-slow drop-shadow-[0_0_40px_rgba(132,204,22,0.4)]"
              strokeWidth={1}
            />
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[0.85] text-balance">
            النادي <span className="text-lime-400 italic">الصيفي</span>
            <span className="text-emerald-400/60 block mt-4 text-xl md:text-2xl uppercase tracking-[0.5em] font-black">
              Elite Summer Camps
            </span>
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <span className="text-6xl md:text-8xl font-black bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-400 bg-clip-text text-transparent animate-pulse tracking-tighter">
              COMING SOON
            </span>
          </motion.div>
        </div>




        <div className="mt-8 flex flex-col items-center gap-6">
           <div className="h-px w-48 bg-lime-500/20"></div>
           <p className="text-emerald-100/30 font-black uppercase tracking-[0.6em] text-[10px]">
             Ready for the season 2026
           </p>
        </div>


      </motion.div>
    </div>
  );
}

