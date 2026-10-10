import { useState } from "react";
import { studentsDB, attendanceDB, visitsDB } from "../data/storage";
import { Avatar } from "../components/UI";
import { ArrowRight, Pencil, Trash2, CheckCircle2, Award, Ticket, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

/** Converts YYYY-MM-DD to d/m/y, or passes dd/mm/yyyy through */
const fmtDate = (v) => {
  if (!v) return v;
  if (v.includes("/")) return v;
  const parts = v.split("-");
  if (parts.length !== 3) return v;
  return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
};

const FIELDS = [
  { icon: "🆔", label: "كود الطفل", key: "qrId" },
  { icon: "🏠", label: "العنوان", key: "address" },
  { icon: "🎂", label: "تاريخ الميلاد", key: "birthdate", fmt: fmtDate },
  { icon: "📚", label: "الفصل / المرحلة", key: "year" },
  { icon: "📱", label: "رقم التليفون", key: "phone" },
];

export function StudentPage({
  person,
  onBack,
  onGoAttendance,
  onGoEdit,
  onGoCoupons,
  onGoCheck,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const handleDelete = () => {
    studentsDB.remove(person.qrId);
    attendanceDB.removeAll(person.qrId);
    visitsDB.removeAll(person.qrId);
    onBack();
  };

  const attendanceCount = attendanceDB.get(person?.qrId)?.length || 0;

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir="rtl"
    >
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              PROFILE
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase truncate max-w-[200px] sm:max-w-none">
              {person.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoAttendance}
              className="bg-white text-black border-2 border-black px-2.5 sm:px-3 py-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none font-black text-xs uppercase flex items-center gap-1 transition-all cursor-pointer"
              title="سجل الحضور"
            >
              <CalendarDays className="w-4 h-4 stroke-[2.5]" />
              <span>{attendanceCount}</span>
            </button>

            <button
              onClick={onGoCoupons}
              className="bg-[#38BDF8] text-black border-2 border-black px-2.5 sm:px-3 py-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none font-black text-xs uppercase flex items-center gap-1 transition-all cursor-pointer"
              title="الكوبونات"
            >
              <Ticket className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">كوبونات</span>
            </button>

            {onGoCheck && (
              <button
                onClick={onGoCheck}
                className="bg-[#A3E635] text-black border-2 border-black px-2.5 sm:px-3 py-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none font-black text-xs uppercase flex items-center gap-1 transition-all cursor-pointer"
                title="شيك المكافأة"
              >
                <Award className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">شيك</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 sm:p-10 flex flex-col gap-8 relative">
          
          {/* Top Row: Edit Button & Avatar */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b-[3px] border-black relative">
            <button
              onClick={onGoEdit}
              className="absolute top-0 right-0 bg-[#FACC15] text-black border-2 border-black px-3 py-1.5 font-black text-xs uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>تعديل</span>
            </button>

            <div className="relative mt-2">
              <div className="border-[3px] border-black p-1 bg-[#FDF8F0] shadow-[4px_4px_0px_#000000]">
                <Avatar
                  name={person.name}
                  accent={person.accent}
                  image={person.image}
                  size="xl"
                />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
                {person.name}
              </h2>
              {person.year && (
                <span className="inline-block mt-2 bg-[#38BDF8] border-2 border-black px-3 py-0.5 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
                  {person.year}
                </span>
              )}
            </div>
          </div>

          {/* Details Toggle Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-[#FDF8F0] hover:bg-[#FACC15] border-[3px] border-black py-3 px-4 font-black text-sm uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}</span>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>

          {/* Details List */}
          {showDetails && (
            <div className="flex flex-col gap-3">
              {FIELDS.map(({ icon, label, key, fmt }) =>
                person[key] ? (
                  <div
                    key={key}
                    className="bg-[#FDF8F0] border-2 border-black p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-[3px_3px_0px_#000000]"
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span>{label}</span>
                    </span>
                    <span className="font-black text-base sm:text-lg text-black">
                      {fmt ? fmt(person[key]) : person[key]}
                    </span>
                  </div>
                ) : null
              )}

              {person.customFields?.map((field) => (
                <div
                  key={field.id}
                  className="bg-[#FDF8F0] border-2 border-black p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-[3px_3px_0px_#000000]"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span>{field.label}</span>
                  </span>
                  <span className="font-black text-base sm:text-lg text-black">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t-[3px] border-black">
            <button
              onClick={onGoAttendance}
              className="bg-[#A3E635] text-black border-2 border-black py-3 px-4 font-black text-xs sm:text-sm uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 stroke-[2.5]" />
              <span>سجل الحضور ({attendanceCount})</span>
            </button>

            <button
              onClick={onGoCoupons}
              className="bg-[#38BDF8] text-black border-2 border-black py-3 px-4 font-black text-xs sm:text-sm uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 stroke-[2.5]" />
              <span>إدارة الكوبونات</span>
            </button>
          </div>

          {/* Delete Action Section */}
          <div className="pt-4 border-t-[3px] border-black">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full bg-white hover:bg-[#F472B6] text-black border-2 border-black py-3 px-4 font-black text-sm uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>حذف بيانات الطفل</span>
              </button>
            ) : (
              <div className="bg-[#F472B6] border-[3px] border-black p-5 shadow-[6px_6px_0px_#000000] flex flex-col gap-4">
                <p className="font-black text-base sm:text-lg text-black text-center">
                  هل أنت متأكد من رغبتك في حذف بيانات ({person.name}) نهائياً؟
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-black text-white border-2 border-black py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
                  >
                    نعم، احذف
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 bg-white text-black border-2 border-black py-2.5 font-black text-sm uppercase shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
