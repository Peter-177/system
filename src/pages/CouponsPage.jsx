import { useState, useRef, useEffect, useMemo } from "react";
import { couponsDB, classesDB } from "../data/storage";
import { buildCouponEntry, formatTime } from "../utils/helpers";
import {
  Page,
  Navbar,
  StudentMiniCard,
  Toast,
  DeleteBtn,
} from "../components/UI";
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
  TrendingDown
} from "lucide-react";

export function CouponsPage({ currentUser, person, onBack }) {
  const [log, setLog] = useState(() => couponsDB.get(person?.qrId));
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [shake, setShake] = useState(false);
  const toast = useToast();

  const total = log.reduce((s, e) => s + e.amount, 0);

  // Permission Logic
  const canManage = useMemo(() => {
    if (!currentUser || !person) return false;
    if (currentUser.role === "admin") return true;
    
    // Find if any class this student belongs to is in user's permissions
    const allClasses = classesDB.getAll();
    const studentGrades = [person.year]; // Assume student has a 'year' field
    
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
    couponsDB.add(person.qrId, buildCouponEntry(val));
    setLog(couponsDB.get(person.qrId));
    toast.show(`✅ ضيفنا ${val} كوبون`);
  };

  const handleRemove = (eid) => {
    if (!canManage) return;
    const entryToRemove = log.find(e => e.id === eid);
    if (entryToRemove && entryToRemove.amount > 0 && total - entryToRemove.amount < 0) {
      toast.show("⚠️ ما ينفعش تمسح ده لأنه هيخلى الرصيد بالسالب!");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    couponsDB.remove(person.qrId, eid);
    setLog(couponsDB.get(person.qrId));
    toast.show("🗑️ اتمسح");
  };

  const handleReset = () => {
    if (!canManage) return;
    couponsDB.reset(person.qrId);
    setLog([]);
    toast.show("🔄 صفرنا الحساب خلاص");
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
    couponsDB.add(person.qrId, buildCouponEntry(-amountToSubtract));
    setLog(couponsDB.get(person.qrId));
    toast.show(`❌ خصمنا ${amountToSubtract} كوبون`);
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
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="🎟️ حساب الكوبونات" />

      <div className={`flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-8 ${shake ? "animate-shake" : ""}`}>
        <StudentMiniCard person={person} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Controls - Left Side on Desktop */}
          <div className="lg:col-span-12 flex flex-col gap-8">
            {/* Total Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative overflow-hidden rounded-[2.5rem] p-1 border-2 transition-all duration-500 ${
                total > 0 
                  ? "border-sky-500/30 bg-slate-900/40 shadow-[0_0_50px_rgba(14,165,233,0.15)]" 
                  : "bg-slate-950 border-white/5"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-50"></div>
              
              <div className="relative z-10 p-8 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className={`w-4 h-4 ${total > 0 ? "text-sky-400" : "text-slate-600"}`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    إجمالي الرصيد الحالي
                  </span>
                </div>

                <div className="flex items-baseline gap-4">
                  <motion.span 
                    key={total}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-7xl font-black tracking-tighter ${
                      total > 0 ? "text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "text-slate-800"
                    }`}
                  >
                    {total}
                  </motion.span>
                  <span className={`text-sm font-bold uppercase tracking-widest ${total > 0 ? "text-sky-400/60" : "text-slate-700"}`}>
                    كوبون
                  </span>
                </div>

                {total > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 rounded-full border border-sky-500/20"
                  >
                    <TrendingUp className="w-3 h-3 text-sky-400" />
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Active Balance</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {canManage ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-6"
              >
                {/* Amount Input Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end px-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-1">
                      حدد القيمة المراد إضافتها أو خصمها
                    </label>
                    <span className="text-[10px] font-bold text-sky-400 uppercase">Input Amount Manually</span>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none transition-colors group-focus-within:text-sky-400 text-slate-500">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-slate-900/50 border-2 border-white/5 rounded-3xl py-8 px-16 text-4xl font-black text-white text-center focus:border-sky-500/40 focus:bg-slate-900 transition-all outline-none shadow-inner"
                    />
                    <div className="absolute inset-y-0 left-6 flex items-center">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-focus-within:text-sky-400/40 transition-colors">Coupons</span>
                    </div>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubtract}
                    className="relative group h-20 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/10 border border-red-500/20 bg-slate-950"
                  >
                    <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                      <Minus className="w-5 h-5 text-red-500 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        خصم {selectedAmount}
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                    className="relative group h-20 rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10 border border-sky-500/20 bg-slate-950"
                  >
                    <div className="absolute inset-0 bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                      <Plus className="w-5 h-5 text-sky-400 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        إضافة {selectedAmount}
                      </span>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 border-2 border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-700">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-black text-sm text-slate-300">للمشاهدة فقط</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[200px] leading-relaxed">
                    عذراً، لا تمتلك الصلاحية لتعديل كوبونات هذا الطفل
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Transaction History - Bottom or Right Side */}
          <div className="lg:col-span-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    سجل آخر العمليات
                  </span>
                </div>
                {canManage && log.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-red-500/10 text-red-500/40 hover:text-red-400 transition-all group"
                  >
                    <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">تصفير السجل</span>
                  </button>
                )}
              </div>

              {log.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {[...log].reverse().map((entry, idx) => {
                      const isPositive = entry.amount >= 0;
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={entry.id}
                          className="group relative bg-slate-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all"
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isPositive ? 'bg-sky-500/10 text-sky-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-black text-slate-200">
                                {isPositive ? `إضافة ${entry.amount}` : `خصم ${Math.abs(entry.amount)}`}
                              </span>
                              <span className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">
                                = {log.slice(0, log.length - idx).reduce((s, e) => s + e.amount, 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    {entry.timestamp.slice(0, 10)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600">{formatTime(entry.timestamp)}</span>
                            </div>
                          </div>

                          {canManage && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <DeleteBtn onClick={() => handleRemove(entry.id)} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center bg-slate-900/40 border border-white/5 rounded-[2.5rem] border-dashed">
                  <Ticket className="w-12 h-12 text-slate-800 mb-4 opacity-50" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">مفيش كوبونات لسه</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Page>
  );
}
