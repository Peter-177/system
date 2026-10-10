import { summerAttendanceDB, summerCouponsDB } from "../data/storage";
import { motion as Motion } from "framer-motion";
import { ChevronLeft, ClipboardList, Ticket, Trophy, ArrowLeft } from "lucide-react";

export function SummerProfile({ person, onBack, onGoCoupons, onGoCheck }) {
  const attendanceCount = summerAttendanceDB.get(person.qrId).length;
  const couponsLog = summerCouponsDB.get(person.qrId);
  const couponsCount = couponsLog.reduce((s, e) => s + e.amount, 0);

  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };
  const avatarBg = getAvatarBg(person.name || person.qrId);

  const stats = [
    {
      id: "attendance",
      label: "حضور الصيف",
      subLabel: "ATTENDANCE",
      value: attendanceCount,
      icon: <ClipboardList className="w-6 h-6 stroke-[2.5]" />,
      bg: "bg-[#A3E635]",
      onClick: null,
    },
    {
      id: "coupons",
      label: "كوبونات الصيف",
      subLabel: "COUPONS",
      value: couponsCount,
      icon: <Ticket className="w-6 h-6 stroke-[2.5]" />,
      bg: "bg-[#38BDF8]",
      onClick: onGoCoupons,
    },
    ...(onGoCheck
      ? [
          {
            id: "check",
            label: "شيك المكافأة",
            subLabel: "REWARD CHECK",
            value: "🏆",
            icon: <Trophy className="w-6 h-6 stroke-[2.5]" />,
            bg: "bg-[#FACC15]",
            onClick: onGoCheck,
          },
        ]
      : []),
  ];

  return (
    <div
      className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6"
      dir="rtl"
    >
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-white text-black border-[3px] border-black px-3 py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>رجوع</span>
        </button>
        <span className="bg-black text-[#A3E635] px-2.5 py-1 font-black text-xs uppercase tracking-widest border-2 border-black">
          SUMMER PROFILE
        </span>
      </div>

      {/* Profile Card */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col items-center gap-4"
      >
        {/* Avatar */}
        <div
          className={`w-24 h-24 sm:w-28 sm:h-28 border-[3px] border-black shadow-[4px_4px_0px_#000000] ${avatarBg} flex items-center justify-center overflow-hidden shrink-0`}
        >
          {person.image ? (
            <img
              src={person.image}
              alt={person.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl sm:text-5xl font-black text-black">
              {(person.name || "م")?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Name & ID */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            {person.name}
          </h2>
          <div className="inline-block bg-black text-white font-mono font-black text-xs px-3 py-1 border-2 border-black">
            #{person.qrId}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t-[3px] border-black border-dashed" />

        {/* Year Tag */}
        {person.year && (
          <div className="inline-flex items-center gap-2 bg-[#FEF08A] text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
            <span>السنة الدراسية: {person.year}</span>
          </div>
        )}
      </Motion.div>

      {/* Stats Cards */}
      <div className="flex flex-col gap-4">
        {stats.map((stat, idx) => {
          const isClickable = !!stat.onClick;
          const Tag = isClickable ? "button" : "div";
          return (
            <Motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <Tag
                onClick={stat.onClick || undefined}
                className={`w-full bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-5 flex items-center justify-between gap-4 text-right transition-all duration-150 ${
                  isClickable
                    ? "hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none cursor-pointer group"
                    : ""
                }`}
              >
                {/* Left: Icon box + Labels */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${stat.bg} border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center text-black shrink-0`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="font-black text-base sm:text-lg text-black leading-none">
                      {stat.label}
                    </p>
                    <p className="text-xs font-black uppercase text-black/50 tracking-wider mt-0.5">
                      {stat.subLabel}
                    </p>
                  </div>
                </div>

                {/* Right: Value */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-2xl sm:text-3xl font-black text-black tabular-nums`}
                  >
                    {stat.value}
                  </span>
                  {isClickable && (
                    <div className="bg-[#FACC15] group-hover:bg-[#A3E635] border-2 border-black p-1.5 shadow-[2px_2px_0px_#000000] transition-colors">
                      <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </Tag>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
}
