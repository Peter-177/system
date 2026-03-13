import { Page, ModernNavbar } from "../components/UI";

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
      show: currentUser?.role === "admin"
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
      <ModernNavbar 
        currentUser={currentUser} 
        onLogout={onLogout}
        onGoHome={() => {}}
        onGoClasses={onGoClasses}
        onGoSearch={onGoSearch}
        activePage="home"
      />

      <div className="flex-1 px-5 pt-28 pb-12 animate-slideUp w-full max-w-md mx-auto">
        
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
