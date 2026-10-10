import { useState, useEffect, useMemo } from "react";
import { couponsDB, classesDB } from "../data/storage";
import { buildCouponEntry, formatTime } from "../utils/helpers";
import { useToast } from "../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  History, 
  Ticket, 
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  CalendarDays,
} from "lucide-react";

export function CouponsPage({ currentUser, person, onBack }) {
  const [log, setLog] = useState(() => couponsDB.get(person?.qrId));
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [shake, setShake] = useState(false);
  const toast = useToast();

  const total = log.reduce((s, e) => s + e.amount, 0);

  // Permission Logic
  const canManage = useMemo(() => {
    if (!currentUser || !person) return false;
    if (currentUser.role === "admin") return true;
    
    // Find if any class this student belongs to is in user's permissions
    const allClasses = classesDB.getAll();
    const studentGrades = [person.year];
    
    return Object.entries(allClasses).some(([classId, cls]) => {
      const isStudentInClass = cls.grades?.some(g => studentGrades.includes(g));
      const hasPermission = currentUser.permissions?.includes(classId);
      return isStudentInClass && hasPermission;
    });
  }, [currentUser, person]);

  useEffect(() => {
    if (!canManage) return;
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleAdd();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAmount, canManage]); 

  const handleAdd = () => {
    if (!canManage) return;
    const val = selectedAmount;
    if (val <= 0) return;
    couponsDB.add(person.qrId, buildCouponEntry(val));
    setLog(couponsDB.get(person.qrId));
    toast.show(`✅ ضفنا ${val} كوبون`);
  };

  const handleRemove = (eid) => {
    if (!canManage) return;
    const entryToRemove = log.find(e => (e.recordId || e.id) === eid);
    if (entryToRemove && entryToRemove.amount > 0 && total - entryToRemove.amount < 0) {
      toast.show("⚠️ لا يمكن الحذف لأنه سيجعل الرصيد سالباً");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    couponsDB.remove(person.qrId, eid);
    setLog(couponsDB.get(person.qrId));
    toast.show("🗑️ تم الحذف بنجاح");
  };

  const handleReset = () => {
    if (!canManage) return;
    if (!window.confirm("هل أنت متأكد من رغبتك في تصفير حساب الكوبونات؟")) return;
    couponsDB.reset(person.qrId);
    setLog([]);
    toast.show("🔄 تم تصفير الرصيد");
  };

  const handleSubtract = () => {
    if (!canManage) return;
    if (total <= 0) {
      toast.show("❌ الرصيد 0 بالفعل");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const val = selectedAmount;
    if (val <= 0) return;
    const amountToSubtract = Math.min(val, total);
    couponsDB.add(person.qrId, buildCouponEntry(-amountToSubtract));
    setLog(couponsDB.get(person.qrId));
    toast.show(`❌ تم خصم ${amountToSubtract} كوبون`);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setInputValue(val);
      const num = parseInt(val) || 0;
      setSelectedAmount(num);
    }
  };

  const handleQuickSelect = (amt) => {
    setInputValue(amt.toString());
    setSelectedAmount(amt);
  };

  if (!person) return null;

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir="rtl"
    >
      {/* Toast Notification */}
      {toast.msg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black text-white border-[3px] border-black px-6 py-3 shadow-[4px_4px_0px_#FACC15] font-black text-sm uppercase">
          {toast.msg}
        </div>
      )}

      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#38BDF8] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#38BDF8] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              COUPONS
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase truncate max-w-[200px] sm:max-w-none">
              كوبونات {person.name}
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className={`flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6 ${shake ? "animate-shake" : ""}`}>
        
        {/* Total Balance Card */}
        <div className="bg-[#38BDF8] border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col items-center text-center gap-2">
          <span className="bg-black text-white px-3 py-1 border-2 border-black font-black text-xs uppercase tracking-widest">
            إجمالي رصيد الكوبونات
          </span>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-7xl sm:text-8xl font-black text-black tabular-nums tracking-tight">
              {total}
            </span>
            <span className="text-xl font-black uppercase text-black">
              كوبون
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000000]">
            <span>{person.name}</span>
            {person.year && <span>• {person.year}</span>}
          </div>
        </div>

        {/* Action Controls Section */}
        {canManage ? (
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="font-black text-sm uppercase text-black flex items-center gap-2">
                <Ticket className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة أو خصم كوبونات</span>
              </span>
              <span className="text-xs font-bold text-gray-600">حدد القيمة</span>
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 5, 10, 20].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickSelect(amt)}
                  className={`flex-1 min-w-[50px] py-2 border-2 border-black font-black text-sm uppercase transition-all cursor-pointer ${
                    selectedAmount === amt
                      ? "bg-[#FACC15] shadow-[3px_3px_0px_#000000]"
                      : "bg-[#FDF8F0] hover:bg-gray-100 shadow-[2px_2px_0px_#000000]"
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                القيمة المحددة:
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full h-14 bg-[#FDF8F0] border-[3px] border-black text-3xl font-black text-center text-black focus:outline-none focus:bg-[#FACC15] transition-colors"
                />
              </div>
            </div>

            {/* Add / Deduct Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleSubtract}
                className="bg-[#F472B6] text-black border-[3px] border-black py-4 px-4 font-black text-base uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Minus size={22} strokeWidth={3} />
                <span>خصم ({selectedAmount})</span>
              </button>

              <button
                type="button"
                onClick={handleAdd}
                className="bg-[#A3E635] text-black border-[3px] border-black py-4 px-4 font-black text-base uppercase shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={22} strokeWidth={3} />
                <span>إضافة ({selectedAmount})</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FB923C] border-[3px] border-black p-6 shadow-[6px_6px_0px_#000000] flex items-center gap-4">
            <Lock className="w-8 h-8 stroke-[2.5] shrink-0" />
            <div>
              <h4 className="font-black text-base uppercase">للمشاهدة فقط</h4>
              <p className="text-xs font-bold mt-1">
                لا تمتلك الصلاحية الكافية لإضافة أو خصم كوبونات هذا الفصل.
              </p>
            </div>
          </div>
        )}

        {/* Transaction History Log */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 stroke-[2.5]" />
              <span className="font-black text-base uppercase text-black">
                سجل العمليات ({log.length})
              </span>
            </div>

            {canManage && log.length > 0 && (
              <button
                onClick={handleReset}
                className="bg-white hover:bg-[#F472B6] text-black border-2 border-black px-2.5 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>تصفير</span>
              </button>
            )}
          </div>

          {log.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {[...log].reverse().map((entry, idx) => {
                const isPositive = entry.amount >= 0;
                return (
                  <div
                    key={entry.recordId || entry.id || idx}
                    className={`border-2 border-black p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#000000] ${
                      isPositive ? "bg-[#A3E635]/20" : "bg-[#F472B6]/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 border-2 border-black flex items-center justify-center font-black ${
                          isPositive ? "bg-[#A3E635]" : "bg-[#F472B6]"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp size={18} strokeWidth={3} />
                        ) : (
                          <TrendingDown size={18} strokeWidth={3} />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-black text-sm text-black">
                          {isPositive
                            ? `إضافة ${entry.amount} كوبون`
                            : `خصم ${Math.abs(entry.amount)} كوبون`}
                        </span>
                        <span className="text-[10px] font-bold text-gray-700">
                          {entry.timestamp?.slice(0, 10)} {formatTime(entry.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-black text-white px-2 py-0.5 border border-black font-mono text-xs font-black">
                        = {log.slice(0, log.length - idx).reduce((s, e) => s + e.amount, 0)}
                      </span>

                      {canManage && (
                        <button
                          onClick={() => handleRemove(entry.recordId || entry.id)}
                          className="w-8 h-8 bg-white border border-black flex items-center justify-center text-black hover:bg-[#F472B6] transition-colors"
                          title="حذف هذه العملية"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center justify-center bg-[#FDF8F0] border-2 border-dashed border-black">
              <Ticket className="w-10 h-10 text-gray-400 mb-2" />
              <span className="font-black text-xs uppercase tracking-wider text-gray-600">
                لا توجد أي حركات كوبونات مسجلة حتى الآن
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
