import { useState } from "react";
import { summerAttendanceDB, summerCouponsDB } from "../data/storage";
import { Avatar } from "../components/UI";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export function SummerProfile({ person, onBack, onGoCoupons, onGoCheck }) {
  const attendanceCount = summerAttendanceDB.get(person.qrId).length;
  const couponsLog = summerCouponsDB.get(person.qrId);
  const couponsCount = couponsLog.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-8 animate-slideUp" dir="rtl">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-white">الملف الصيفي</h2>
      </div>

      <div className="bg-emerald-950/40 backdrop-blur-3xl rounded-2xl sm:rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-transparent opacity-50 pointer-events-none mix-blend-overlay"></div>

        <div className="p-5 sm:p-12 gap-6 sm:gap-8 flex flex-col relative z-10">
          <div className="flex flex-col items-center gap-3 sm:gap-4 pb-6 sm:pb-8 border-b border-white/10 relative">
            <Avatar
              name={person.name}
              accent={person.accent}
              image={person.image}
              size="xl"
            />
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mt-2 sm:mt-4 text-white tracking-tighter drop-shadow-md text-center break-words px-2 leading-tight">
              {person.name}
            </h2>
            <p className="text-emerald-300/60 font-black uppercase tracking-widest text-xs sm:text-sm">
              {person.qrId}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-2xl sm:text-3xl">📋</span>
                <span className="text-base sm:text-lg font-black text-white">حضور الصيف</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-lime-400">{attendanceCount}</span>
            </div>

            <button
              onClick={onGoCoupons}
              className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 flex items-center justify-between border border-white/5 transition-all group cursor-pointer min-h-[56px]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-2xl sm:text-3xl">🎟️</span>
                <span className="text-base sm:text-lg font-black text-white">كوبونات الصيف</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-black text-sky-400">{couponsCount}</span>
                <ChevronLeft className="text-white/40 group-hover:text-white transition-colors rotate-180" />
              </div>
            </button>

            {onGoCheck && (
              <button
                onClick={onGoCheck}
                className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 flex items-center justify-between border border-white/5 transition-all group cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-2xl sm:text-3xl">🏆</span>
                  <span className="text-base sm:text-lg font-black text-white">شيك المكافأة</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
                    عرض وطباعة
                  </span>
                  <ChevronLeft className="text-white/40 group-hover:text-white transition-colors rotate-180" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
