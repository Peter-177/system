import { Page } from "../components/UI";

export function HomePage({ currentUser, onGoSearch, onGoAttendance, onGoHistory, onGoVisits, onGoBirthday, onGoClasses, onGoAdmin, onLogout }) {

  const cards = [
    {
      label: "بحث",
      subLabel: "Search",
      icon: "🔍",
      onClick: onGoSearch,
      color: "text-primary",
      bgBase: "bg-primary/10",
      border: "border-primary/20",
      show: true
    },
    {
      label: "الحضور",
      subLabel: "Attendance",
      icon: "📋",
      onClick: onGoAttendance,
      color: "text-success",
      bgBase: "bg-success/10",
      border: "border-success/20",
      show: true
    },
    {
      label: "الزيارات",
      subLabel: "Visits",
      icon: "🏠",
      onClick: onGoVisits,
      color: "text-info",
      bgBase: "bg-info/10",
      border: "border-info/20",
      show: true
    },
    {
      label: "أعياد الميلاد",
      subLabel: "Birthdays",
      icon: "🎂",
      onClick: onGoBirthday,
      color: "text-warning",
      bgBase: "bg-warning/10",
      border: "border-warning/20",
      show: true
    },
    {
      label: "الفصول",
      subLabel: "Classes",
      icon: "📚",
      onClick: onGoClasses,
      color: "text-secondary",
      bgBase: "bg-secondary/10",
      border: "border-secondary/20",
      show: currentUser?.role !== "admin"
    },
    {
      label: "الإعدادات",
      subLabel: "Admin",
      icon: "⚙️",
      onClick: onGoAdmin,
      color: "text-neutral",
      bgBase: "bg-neutral/10",
      border: "border-neutral/20",
      show: currentUser?.role === "admin"
    }
  ].filter(c => c.show);

  return (
    <Page>
      {/* Header Area */}
      <div className="pt-10 pb-8 px-6 bg-gradient-to-b from-base-200/80 to-base-100 border-b border-base-200/50 rounded-b-[2.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative overflow-hidden backdrop-blur-sm">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex justify-between items-start relative z-10 w-full max-w-md mx-auto">
          <div dir="ltr" className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-base-content uppercase">
              {currentUser?.role === "admin" ? "Admin" : "User"}
            </h1>
           
          </div>
          <button
            onClick={onLogout}
            className="btn btn-sm btn-ghost hover:bg-error/10 hover:text-error text-base-content/60 gap-1.5 transition-colors"
          >
            <span className="text-xs font-bold tracking-wider uppercase">Log out</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 pt-8 pb-12 animate-slideUp w-full max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-5 px-1 text-base-content/80 text-right" dir="rtl">
          القائمة الرئيسية
        </h2>
        
        <div className="grid grid-cols-2 gap-4" dir="rtl">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={card.onClick}
              className={`flex flex-col items-center justify-center p-6 rounded-[1.5rem] border bg-base-100 shadow-sm hover:shadow-lg transition-all duration-300 active:scale-95 group ${card.border} hover:border-base-300 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 ${card.bgBase} ${card.color}`}>
                {card.icon}
              </div>
              <span className="font-bold text-base text-base-content group-hover:text-primary transition-colors">
                {card.label}
              </span>
              <span className="text-[10px] text-base-content/40 mt-1 uppercase tracking-widest font-semibold">
                {card.subLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Page>
  );
}
