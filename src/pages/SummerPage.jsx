import React, { useState } from "react";
import {
  Palmtree,
  Sun,
  Music,
  Tent,
  Volleyball,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { Toast } from "../components/UI";
import bgImage from "../assets/studium.png";

export function SummerSection({ onGoHome }) {
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const activities = [
    {
      icon: <Palmtree />,
      title: "رحلات الشواطئ",
      desc: "استمتع بأجمل السواحل المصرية",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: <Music />,
      title: "أمسيات تسبيح",
      desc: "لحظات روحية في قلب الصيف",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: <Volleyball />,
      title: "يوم رياضي",
      desc: "مسابقات وبطولات حماسية",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
  ];

  const handleRegister = () => {
    showToast("جاري تحويلك لاستكمال بيانات الاشتراك... ✨");
  };

  return (
    <div className="w-full h-full relative overflow-y-auto overflow-x-hidden bg-[#022c22]">
      {/* Fixed Background Layer (Pitch + Gradient) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.94), rgba(2, 44, 34, 0.98)), url(${bgImage})`
        }}
      ></div>

      <Toast msg={toast} />

      {/* Field Markings (Decorative) */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] border-2 border-white/10 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col items-center w-full min-h-full py-12">
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
          <p className="text-lg md:text-xl text-emerald-100/60 font-bold max-w-2xl mx-auto leading-relaxed">
            استعد لأروع الفعاليات الرياضية والروحية المليئة بالنشاط. انضم الآن لفريق مدارس الأحد لتجربة تنافسية وفريدة من نوعها.
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
          dir="rtl"
        >
          {activities.map((act, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.8 }}
              onClick={() => showToast(`تم اختيار: ${act.title} 🏆`)}
              className="relative p-8 bg-emerald-950/60 border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center group hover:bg-emerald-900/80 transition-all duration-500 hover:border-lime-500/30 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-900 flex items-center justify-center mb-6 border border-white/5 group-hover:bg-lime-500 group-hover:text-emerald-950 group-hover:rotate-12 transition-all duration-500 shadow-2xl relative">
                {React.cloneElement(act.icon, {
                  className: "w-8 h-8 relative z-10",
                  strokeWidth: 2,
                })}
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-lime-400 transition-colors">
                {act.title}
              </h3>
              <p className="text-emerald-100/40 font-bold text-[9px] uppercase tracking-widest leading-relaxed">
                {act.desc}
              </p>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 text-center"
        >
          <button
            onClick={handleRegister}
            className="group relative px-12 py-5 bg-lime-500 text-emerald-950 font-black text-xl rounded-2xl flex items-center gap-6 shadow-[0_20px_60px_-15px_rgba(132,204,22,0.4)] hover:shadow-[0_30px_80px_-15px_rgba(132,204,22,0.6)] hover:scale-105 active:scale-95 transition-all duration-500"
          >
            <span className="relative z-10">اشترك الآن</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-lime-400 flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000 relative z-10 shadow-2xl">
              <Sun size={20} strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
          </button>
          
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="h-px w-48 bg-lime-500/20"></div>
            <p className="text-emerald-100/30 font-black uppercase tracking-[0.6em] text-[10px]">
              Ready for the season 2026
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
