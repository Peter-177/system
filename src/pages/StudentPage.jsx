import { useState } from "react";
import { studentsDB, attendanceDB, visitsDB } from "../data/storage";
import { Page, Avatar, Navbar } from "../components/UI";
import { motion } from "framer-motion";

/** Converts YYYY-MM-DD to d/m/y, or passes dd/mm/yyyy through */
const fmtDate = (v) => {
  if (!v) return v;
  // Already in dd/mm/yyyy format
  if (v.includes("/")) return v;
  // Convert from YYYY-MM-DD
  const parts = v.split("-");
  if (parts.length !== 3) return v;
  return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
};

const FIELDS = [
  { icon: "🆔", label: "الكود", key: "qrId" },
  { icon: "🏠", label: "العنوان", key: "address" },
  { icon: "🎂", label: "عيد ميلاده", key: "birthdate", fmt: fmtDate },
  { icon: "📚", label: "في سنة كام؟", key: "year" },
  { icon: "📱", label: "التليفون", key: "phone" },
];

export function StudentPage({
  person,
  onBack,
  onGoAttendance,
  onGoEdit,
  onGoCoupons,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = () => {
    studentsDB.remove(person.qrId);
    attendanceDB.removeAll(person.qrId);
    visitsDB.removeAll(person.qrId);
    onBack();
  };
  return (
    <Page>
      <Navbar
        title={person.name}
        onBack={onBack}
        right={
          <div className="flex gap-3">
            <button
              onClick={onGoAttendance}
              className="px-4 py-2 bg-[#1A3D63] text-[#F6FAFD] text-xs font-black rounded-[2rem] shadow-xl hover:bg-[#4A7FA7] transition-all hover:scale-105"
            >
              📋 {attendanceDB.get(person.qrId).length}
            </button>
            <button
              onClick={onGoCoupons}
              className="px-4 py-2 bg-[#1A3D63] text-[#F6FAFD] text-xs font-black rounded-[2rem] shadow-xl hover:bg-[#4A7FA7] transition-all hover:scale-105"
            >
              🎟️ Coupons
            </button>
          </div>
        }
      />

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl px-5 py-8 animate-slideUp">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none mix-blend-overlay"></div>

            <div className="p-8 sm:p-12 gap-8 flex flex-col relative z-10">
              {/* Top row */}
              <div className="flex flex-col items-center gap-4 pb-8 border-b border-white/10 relative">
                <button
                  onClick={onGoEdit}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-[#F6FAFD] rounded-2xl font-black text-xs uppercase tracking-widest transition-all absolute top-0 right-0 cursor-pointer shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)] hover:-translate-y-1"
                >
                  Edit ✏️
                </button>
                <div className="relative group perspective-1000">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
                  <div className="relative transform-style-3d group-hover:rotate-y-12 transition-transform duration-700">
                    <Avatar
                      name={person.name}
                      accent={person.accent}
                      image={person.image}
                      size="xl"
                    />
                  </div>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black mt-4 text-[#F6FAFD] tracking-tighter drop-shadow-md text-center">
                  {person.name}
                </h2>
              </div>

              {/* Middle Section (Toggle Details) */}
              <div className="flex justify-center -mt-2 perspective-1000">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#F6FAFD] h-16 rounded-[2rem] text-lg flex items-center justify-center gap-4 group transition-all duration-300 font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
                >
                  <span>{showDetails ? "Hide Details" : "Show Details"}</span>
                  <span
                    className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showDetails ? "rotate-180" : ""}`}
                  >
                    ⬇️
                  </span>
                </button>
              </div>

              {/* Info fields */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showDetails ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="bg-black/20 backdrop-blur-md shadow-inner rounded-[2.5rem] p-6 sm:p-8 space-y-2 border border-black/10 mt-2">
                  {FIELDS.map(({ icon, label, key, fmt }) =>
                    person[key] ? (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 rounded-xl transition-colors duration-300 group"
                      >
                        <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#B3CFE5]/60 mb-1 sm:mb-0 flex items-center gap-2">
                          <span className="text-sm opacity-80 group-hover:scale-110 transition-transform">
                            {icon}
                          </span>{" "}
                          {label}
                        </span>
                        <span className="font-black text-[#F6FAFD] text-lg lg:text-xl drop-shadow-sm">
                          {fmt ? fmt(person[key]) : person[key]}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>

              {/* Bottom Row - Delete */}
              <div className="pt-8 border-t border-white/10">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-error/30 text-error/90 font-black hover:bg-error/10 hover:border-error/50 transition-all text-sm cursor-pointer shadow-sm hover:shadow-error/20"
                  >
                    🗑️ حذف بيانات الطفل
                  </button>
                ) : (
                  <div className="flex flex-col gap-4 p-6 bg-error/10 backdrop-blur-md rounded-3xl border border-error/30 animate-fadeIn shadow-[0_10px_30px_-10px_rgba(255,0,0,0.2)]">
                    <p className="text-lg text-[#F6FAFD] text-center font-black drop-shadow-md">
                      هل أنت متأكد من حذف{" "}
                      <span className="text-error-content">{person.name}</span>؟
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-4 bg-error text-white rounded-2xl font-black hover:bg-error/90 active:scale-95 transition-all shadow-lg shadow-error/30 cursor-pointer"
                      >
                        نعم، حذف نهائياً
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-4 bg-white/10 text-[#F6FAFD] border border-white/20 rounded-2xl font-black hover:bg-white/20 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
