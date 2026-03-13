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

export function CouponsPage({ currentUser, person, onBack }) {
  const [log, setLog] = useState(() => couponsDB.get(person?.qrId));
  const [selectedAmount, setSelectedAmount] = useState(50);
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

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const itemHeight = 40; // matches h-10
    const index = Math.round(scrollTop / itemHeight);
    const amount = (index + 1) * 50;
    if (amount >= 50 && amount <= 500 && amount !== selectedAmount) {
      setSelectedAmount(amount);
    }
  };

  if (!person) return null;

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="🎟️ حساب الكوبونات" />

      <div className={`flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col gap-6 animate-slideUp overflow-x-hidden ${shake ? "animate-shake" : ""}`}>
        <StudentMiniCard person={person} />

        {/* Total */}
        <div
          className={`card border-2 transition-all ${total > 0 ? "border-warning/40 bg-warning/5" : "bg-base-200 border-base-300"}`}
        >
          <div className="card-body items-center py-6 gap-1">
            <div className="text-xs text-base-content/30 tracking-widest uppercase">
              مجموع الكوبونات
            </div>
            <div
              className={`text-6xl font-black transition-colors ${total > 0 ? "text-warning" : "text-base-content/10"}`}
            >
              {total}
            </div>
            <div className="text-xs text-base-content/30 font-bold">کوبون</div>
          </div>
        </div>

        {canManage ? (
          <>
            {/* Amount Selector */}
            <div className="flex flex-col gap-3 items-center">
              <label className="text-[10px] font-black text-base-content/30 uppercase tracking-[0.2em] px-1 text-center">
                اسحب أو دوس Enter للإضافة
              </label>
              <div className="relative h-[120px] w-48 flex flex-col items-center bg-base-200/30 rounded-3xl overflow-hidden border border-base-300/50">
                {/* Selection Overlay */}
                <div className="absolute inset-x-2 top-[40px] h-10 bg-warning rounded-xl shadow-lg shadow-warning/20 pointer-events-none z-0"></div>
                
                <style>{`
                  .no-scrollbar::-webkit-scrollbar { display: none; }
                  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden !important; }
                `}</style>

                <div 
                  onScroll={handleScroll}
                  className="w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory no-scrollbar flex flex-col z-10"
                >
                  {/* Padding for scrolling - exactly one item height */}
                  <div className="h-10 shrink-0" />
                  
                  {Array.from({ length: 10 }, (_, i) => (i + 1) * 50).map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setSelectedAmount(amt)}
                      className={`flex-none h-10 flex items-center justify-center snap-center w-full transition-all duration-300 select-none ${
                        selectedAmount === amt
                          ? "text-black font-black"
                          : "text-base-content/30 hover:text-base-content/60 font-bold"
                      }`}
                    >
                      <span className={`transition-transform duration-300 ${selectedAmount === amt ? 'scale-125' : 'scale-100'}`}>
                        {amt}
                      </span>
                    </button>
                  ))}

                  {/* Padding for scrolling - exactly one item height */}
                  <div className="h-10 shrink-0" />
                </div>
                
                {/* Gradient Mask */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-base-100/90 via-transparent to-base-100/90 z-20"></div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSubtract}
                className="btn btn-error btn-lg gap-2 shadow-lg shadow-error/10 h-16 group rounded-2xl"
              >
                 <span className="text-2xl font-bold group-active:scale-90 transition-transform">-</span>
                 <span className="font-bold">خصم {selectedAmount}</span>
              </button>
              <button
                onClick={handleAdd}
                className="btn btn-warning btn-lg gap-2 shadow-lg shadow-warning/10 h-16 group rounded-2xl text-warning-content"
              >
                 <span className="text-2xl font-bold group-active:scale-90 transition-transform">+</span>
                 <span className="font-bold">إضافة {selectedAmount}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-center gap-3 text-warning shadow-sm">
            <span className="text-2xl">🔒</span>
            <div className="flex flex-col">
              <span className="font-black text-sm">للمشاهدة فقط</span>
              <span className="text-[10px] font-bold opacity-70 uppercase tracking-tight">ما ينفعش تعدل كوبونات أطفال مش في فصولك</span>
            </div>
          </div>
        )}

        {/* Log */}
        {total !== 0 || log.length > 0 ? (
          <div className="card bg-base-200 border border-base-300 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-base-300">
              <span className="text-xs text-base-content/40 font-medium">
                📋 السجل ({log.length} عمليات حصلت)
              </span>
              {canManage && (
                <button
                  onClick={handleReset}
                  className="btn btn-ghost btn-xs text-error/50 hover:text-error hover:bg-error/10"
                >
                  صفر الحساب
                </button>
              )}
            </div>
            <div className="divide-y divide-base-300">
              {log.map((entry, i) => {
                const running = log
                  .slice(0, i + 1)
                  .reduce((s, e) => s + e.amount, 0);
                const isPositive = entry.amount >= 0;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i === log.length - 1 ? (isPositive ? "bg-warning/5" : "bg-error/5") : ""}`}
                  >
                    <div className={`badge ${isPositive ? 'badge-warning' : 'badge-error'} badge-outline shrink-0 font-mono text-sm w-14 justify-center`}>
                      {isPositive ? '+' : ''}{entry.amount}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {isPositive ? `ضيفنا ${entry.amount}` : `خصمنا ${Math.abs(entry.amount)}`}
                      </div>
                      <div className="text-xs font-mono text-base-content/30">
                        {entry.timestamp.slice(0, 10)} —{" "}
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-base-content/30 shrink-0">
                      = {running}
                    </div>
                    {canManage && (
                      <DeleteBtn onClick={() => handleRemove(entry.id)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        ) : (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body items-center text-base-content/20 py-8 text-sm">
              مفيش كوبونات لسه
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
