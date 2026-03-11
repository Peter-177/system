import { useState, useRef, useEffect } from "react";
import { couponsDB } from "../data/storage";
import { buildCouponEntry, formatTime } from "../utils/helpers";
import {
  Page,
  Navbar,
  StudentMiniCard,
  Toast,
  DeleteBtn,
} from "../components/UI";
import { useToast } from "../hooks/useToast";

export function CouponsPage({ person, onBack }) {
  const [log, setLog] = useState(() => couponsDB.get(person?.qrId));
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const total = log.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    const val = parseInt(input.trim(), 10);
    if (!input.trim() || isNaN(val) || val <= 0) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    couponsDB.add(person.qrId, buildCouponEntry(val));
    setLog(couponsDB.get(person.qrId));
    setInput("");
    toast.show(`✅ ضيفنا ${val} كوبون`);
    inputRef.current?.focus();
  };

  const handleRemove = (eid) => {
    couponsDB.remove(person.qrId, eid);
    setLog(couponsDB.get(person.qrId));
    toast.show("🗑️ اتمسح");
  };

  const handleReset = () => {
    couponsDB.reset(person.qrId);
    setLog([]);
    toast.show("🔄 صفرنا الحساب خلاص");
  };

  const handleSubtract = () => {
    const val = parseInt(input.trim(), 10);
    if (!input.trim() || isNaN(val) || val <= 0) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    couponsDB.add(person.qrId, buildCouponEntry(-val));
    setLog(couponsDB.get(person.qrId));
    setInput("");
    toast.show(`❌ خصمنا ${val} كوبون`);
    inputRef.current?.focus();
  };

  if (!person) return null;

  return (
    <Page>
      <Toast msg={toast.msg} />
      <Navbar onBack={onBack} title="🎟️ حساب الكوبونات" />

      <div className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col gap-4 animate-slideUp">
        <StudentMiniCard person={person} />

        {/* Total */}
        <div
          className={`card border-2 transition-all ${total > 0 ? "border-warning/40 bg-warning/5" : (total < 0 ? "border-error/40 bg-error/5" : "bg-base-200 border-base-300")}`}
        >
          <div className="card-body items-center py-6 gap-1">
            <div className="text-xs text-base-content/30 tracking-widest uppercase">
              مجموع الكوبونات
            </div>
            <div
              className={`text-6xl font-black transition-colors ${total > 0 ? "text-warning" : (total < 0 ? "text-error" : "text-base-content/10")}`}
            >
              {total}
            </div>
            <div className="text-xs text-base-content/30">كوبون</div>
          </div>
        </div>

        {/* Input */}
        <div className={`join w-full ${shake ? "animate-shake" : ""}`}>
          <button
            onClick={handleSubtract}
            className="btn btn-error join-item px-6 text-xl font-bold"
          >
            -
          </button>
          <input
            ref={inputRef}
            type="number"
            min="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="العدد"
            className="input input-bordered join-item flex-1 text-center text-lg font-mono"
          />
          <button
            onClick={handleAdd}
            className="btn btn-warning join-item px-6 text-xl font-bold"
          >
            +
          </button>
        </div>

        {/* Log */}
        {total !== 0 || log.length > 0 ? (
          <div className="card bg-base-200 border border-base-300 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-base-300">
              <span className="text-xs text-base-content/40 font-medium">
                📋 السجل ({log.length} عمليات حصلت)
              </span>
              <button
                onClick={handleReset}
                className="btn btn-ghost btn-xs text-error/50 hover:text-error hover:bg-error/10"
              >
                صفر الحساب
              </button>
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
                    <DeleteBtn onClick={() => handleRemove(entry.id)} />
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
