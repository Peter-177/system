import { useState, useMemo, useEffect } from "react";
import { summerCouponsDB, classesDB } from "../data/storage";
import { buildCouponEntry, formatTime } from "../utils/helpers";
import { DeleteBtn, Toast } from "../components/UI";
import { useToast } from "../hooks/useToast";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  RotateCcw,
  History,
  Ticket,
  Lock,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
} from "lucide-react";

export function SummerCoupons({ currentUser, person, onBack }) {
  const [log, setLog] = useState(() => summerCouponsDB.get(person?.qrId));
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [shake, setShake] = useState(false);
  const toast = useToast();

  const total = log.reduce((s, e) => s + e.amount, 0);

  const canManage = useMemo(() => {
    if (!currentUser || !person) return false;
    if (currentUser.role === "admin") return true;
    const allClasses = classesDB.getAll();
    const studentGrades = [person.year];
    return Object.entries(allClasses).some(([classId, cls]) => {
      const isStudentInClass = cls.grades?.some((g) => studentGrades.includes(g));
      const hasPermission = currentUser.permissions?.includes(classId);
      return isStudentInClass && hasPermission;
    });
  }, [currentUser, person]);

  useEffect(() => {
    if (!canManage) return;
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleAdd();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAmount, canManage]);

  const handleAdd = () => {
    if (!canManage) return;
    const val = selectedAmount;
    summerCouponsDB.add(person.qrId, buildCouponEntry(val));
    setLog(summerCouponsDB.get(person.qrId));
    toast.show(`✅ ضيفنا ${val} كوبون للصيف`);
  };

  const handleRemove = (eid) => {
    if (!canManage) return;
    const entryToRemove = log.find((e) => (e.recordId || e.id) === eid);
    if (entryToRemove && entryToRemove.amount > 0 && total - entryToRemove.amount < 0) {
      toast.show("⚠️ ما ينفعش تمسح ده لأنه هيخلى الرصيد بالسالب!");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    summerCouponsDB.remove(person.qrId, eid);
    setLog(summerCouponsDB.get(person.qrId));
    toast.show("🗑️ اتمسح");
  };

  const handleReset = () => {
    if (!canManage) return;
    summerCouponsDB.reset(person.qrId);
    setLog([]);
    toast.show("🔄 صفرنا حساب الصيف خلاص");
  };

  const handleSubtract = () => {
    if (!canManage) return;
    if (total <= 0) {
      toast.show("❌ الرصيد خلصان أصلاً!");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const val = selectedAmount;
    const amountToSubtract = Math.min(val, total);
    summerCouponsDB.add(person.qrId, buildCouponEntry(-amountToSubtract));
    setLog(summerCouponsDB.get(person.qrId));
    toast.show(`❌ خصمنا ${amountToSubtract} كوبون من الصيف`);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setInputValue(val);
      const num = parseInt(val) || 0;
      setSelectedAmount(num);
    }
  };

  if (!person) return null;

  return (
    <div
      className={`w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 ${shake ? "animate-shake" : ""}`}
      dir="rtl"
    >
      <Toast msg={toast.msg} />

      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-white text-black border-[3px] border-black px-3 py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>رجوع</span>
        </button>
        <span className="bg-black text-[#38BDF8] px-2.5 py-1 font-black text-xs uppercase tracking-widest border-2 border-black">
          SUMMER COUPONS
        </span>
      </div>

      {/* Student Info Strip */}
      <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 flex items-center gap-3">
        <div className="bg-[#38BDF8] border-2 border-black shadow-[2px_2px_0px_#000000] w-10 h-10 flex items-center justify-center font-black text-black text-lg shrink-0">
          {(person.name || "م")?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-black text-base text-black">{person.name}</p>
          <p className="font-mono text-xs font-bold text-black/50">#{person.qrId}</p>
        </div>
      </div>

      {/* Total Balance */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col items-center gap-2 ${
          total > 0 ? "bg-[#38BDF8]" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 stroke-[2.5] text-black" />
          <span className="text-xs font-black uppercase tracking-widest text-black/70">
            إجمالي رصيد الصيف
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <Motion.span
            key={total}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl sm:text-7xl font-black text-black tabular-nums tracking-tighter"
          >
            {total}
          </Motion.span>
          <span className="text-sm font-black uppercase text-black/60 tracking-widest">
            كوبون
          </span>
        </div>
      </Motion.div>

      {/* Controls */}
      {canManage ? (
        <Motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Amount Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-black/60">
              حدد القيمة
            </label>
            <div className="relative flex items-center bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] focus-within:shadow-[6px_6px_0px_#000000] transition-all">
              <div className="bg-[#FACC15] border-l-[3px] border-black p-3 flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full bg-transparent px-4 py-3 text-black font-black text-2xl sm:text-3xl text-center placeholder:text-black/30 outline-none"
              />
              <span className="px-4 text-xs font-black text-black/40 uppercase shrink-0">
                كوبون
              </span>
            </div>
          </div>

          {/* Add / Subtract Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSubtract}
              className="h-16 sm:h-20 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
            >
              <Minus className="w-5 h-5 stroke-[3] text-[#EF4444]" />
              <span className="text-xs font-black uppercase text-black">
                خصم {selectedAmount}
              </span>
            </button>

            <button
              onClick={handleAdd}
              className="h-16 sm:h-20 bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
            >
              <Plus className="w-5 h-5 stroke-[3] text-black" />
              <span className="text-xs font-black uppercase text-black">
                إضافة {selectedAmount}
              </span>
            </button>
          </div>
        </Motion.div>
      ) : (
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] p-6 flex flex-col items-center gap-3 text-center"
        >
          <div className="w-14 h-14 bg-[#FACC15] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center text-black">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <p className="font-black text-sm text-black uppercase">للمشاهدة فقط</p>
            <p className="text-xs font-bold text-black/60 mt-1">
              عذراً، لا تمتلك الصلاحية لتعديل كوبونات هذا الطفل
            </p>
          </div>
        </Motion.div>
      )}

      {/* History Log */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        {/* Log Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 stroke-[2.5] text-black" />
            <span className="text-xs font-black uppercase tracking-widest text-black">
              سجل العمليات
            </span>
          </div>
          {canManage && log.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-xs uppercase text-[#EF4444] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 stroke-[3]" />
              <span>تصفير السجل</span>
            </button>
          )}
        </div>

        {log.length > 0 ? (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {[...log].reverse().map((entry, idx) => {
                const isPositive = entry.amount >= 0;
                return (
                  <Motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={entry.recordId || entry.id}
                    className={`group border-[3px] border-black shadow-[3px_3px_0px_#000000] p-4 flex items-center gap-4 ${
                      isPositive ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center shrink-0 ${
                        isPositive ? "bg-[#A3E635]" : "bg-[#EF4444]"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-5 h-5 stroke-[2.5] text-black" />
                      ) : (
                        <TrendingDown className="w-5 h-5 stroke-[2.5] text-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-black">
                        {isPositive
                          ? `إضافة ${entry.amount}`
                          : `خصم ${Math.abs(entry.amount)}`}
                      </p>
                      <p className="text-xs font-bold text-black/50 font-mono">
                        {entry.timestamp?.slice(0, 10)} — {formatTime(entry.timestamp)}
                      </p>
                    </div>

                    {/* Running total badge */}
                    <span className="bg-black text-white font-mono font-black text-xs px-2 py-1 shrink-0 border border-black">
                      = {log.slice(0, log.length - idx).reduce((s, e) => s + e.amount, 0)}
                    </span>

                    {/* Delete */}
                    {canManage && (
                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        <DeleteBtn
                          onClick={() => handleRemove(entry.recordId || entry.id)}
                        />
                      </div>
                    )}
                  </Motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center bg-white border-[3px] border-black border-dashed gap-3">
            <Ticket className="w-10 h-10 stroke-[1.5] text-black/20" />
            <span className="text-xs font-black uppercase tracking-widest text-black/40">
              مفيش كوبونات لسه
            </span>
          </div>
        )}
      </Motion.div>
    </div>
  );
}
