import { 
  ArrowLeft, 
  Palmtree, 
  Sun, 
  Music,
  Tent,
  Volleyball
} from 'lucide-react';

export function SummerSection({ onGoHome }) {

  const activities = [
    { icon: <Palmtree className="w-8 h-8" />, title: "رحلات الساحل", desc: "استمتع بأجمل الشواطئ", color: "text-sky-500", bg: "bg-sky-100" },
    { icon: <Music className="w-8 h-8" />, title: "حفلات تسبيح", desc: "أمسيات روحية ممتعة", color: "text-fuchsia-500", bg: "bg-fuchsia-100" },
    { icon: <Volleyball className="w-8 h-8" />, title: "أيام رياضية", desc: "بطولات ومسابقات", color: "text-orange-500", bg: "bg-orange-100" },
    { icon: <Tent className="w-8 h-8" />, title: "مخيمات", desc: "مغامرات في الطبيعة", color: "text-emerald-500", bg: "bg-emerald-100" },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-300 via-amber-100 to-orange-100 overflow-hidden relative flex flex-col items-center justify-center">
      
      {/* Decorative Scenery Elements */}
      <div className="absolute top-10 left-10 md:top-20 md:left-20 w-64 h-64 bg-yellow-300 rounded-full blur-[80px] opacity-70"></div>
      <div className="absolute top-32 right-10 md:right-32 w-48 h-16 bg-white/60 rounded-full blur-2xl"></div>
      <div className="absolute top-48 left-1/3 w-72 h-20 bg-white/40 rounded-full blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10 flex flex-col items-center w-full">
        
        {/* Back Button explicitly scrolls you back up the timeline */}
        <button
          onClick={onGoHome}
          className="self-start mb-4 flex items-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-md rounded-full text-orange-900 font-bold hover:bg-white/70 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للرئيسية
        </button>

        {/* Hero Section */}
        <div className="text-center w-full">
            <div className="inline-flex items-center justify-center p-6 bg-white/40 backdrop-blur-xl rounded-[2rem] mb-8 shadow-2xl border border-white/50 text-orange-500">
              <Sun className="w-20 h-20 drop-shadow-lg animate-[spin_10s_linear_infinite]" />
            </div>

          <h1 className="text-5xl sm:text-7xl lg:text-[8rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600 mb-6 drop-shadow-md font-arabic leading-none">
            النادي الصيفي
          </h1>
          
          <p className="text-xl sm:text-3xl text-orange-950/80 font-bold max-w-4xl mx-auto leading-relaxed mb-10 drop-shadow-sm font-arabic">
            مغامرة صيفية لا تُنسى في انتظارك! انضم إلينا في أقوى فعاليات الصيف.
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full" dir="rtl">
          {activities.map((act, i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${act.bg} ${act.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {act.icon}
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 font-arabic">{act.title}</h3>
              <p className="text-slate-600 font-bold text-base">{act.desc}</p>
            </div>
          ))}
        </div>

        {/* Register Button (Mock) */}
        <button
          className="mt-12 px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-black text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-orange-300 font-arabic"
        >
          اشترك 
        </button>
        
      </div>
    </div>
  );
}
