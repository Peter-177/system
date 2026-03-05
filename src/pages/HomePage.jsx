import { useState, useRef, useEffect } from "react";
import { studentsDB } from "../data/storage";
import { Page } from "../components/UI";

export function HomePage({ onGoStudent, onGoAdd, onGoHistory, onLogout }) {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  const search = () => {
    const t = id.trim();
    if (!t) return;
    if (studentsDB.exists(t)) {
      setError("");
      onGoStudent(t);
    } else setError(`مافيش طالب بالـ ID "${t}"`);
  };

  return (
    <Page>
      {/* Navbar */}
      <div className="navbar bg-base-200 border-b border-base-300 px-4 min-h-14">
        <div className="navbar-start"></div>
        <div className="navbar-end">
          <button
            onClick={onLogout}
            className="btn btn-ghost btn-sm text-base-content/30 hover:text-error hover:bg-error/10"
          >
            Log out
          </button>
        </div>
      </div>
      <div className="min-h-170 flex items-center justify-center">
        {/* Content */}
        <div className=" flex-1 flex flex-col gap-4 max-w-md mx-auto w-full px-5 pt-14 pb-8 animate-slideUp">
          {/* Search */}
          <div className="join w-full">
            <input
              ref={ref}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Enter id"
              className={`input input-bordered join-item flex-1 font-mono text-left direction-ltr ${error ? "input-error" : ""}`}
              dir="ltr"
            />
            <button
              onClick={search}
              className="btn btn-primary join-item px-6 text-lg"
            >
              →
            </button>
          </div>

          {error && (
            <div className="alert alert-error text-sm animate-fadeIn gap-2">
              <span className="text-base">🔍</span>
              <div>
                <div className="font-semibold">{error}</div>
                <div className="text-xs opacity-70">
                  تأكد من الـ ID وحاول تاني
                </div>
              </div>
            </div>
          )}

          <div className="divider my-0" />

          <button
            onClick={onGoAdd}
            className="btn btn-outline text-xl border-success/30 text-success hover:bg-success/10 hover:border-success/50 w-full"
          >
            Add new 
          </button>

          <button
            onClick={onGoHistory}
            className="btn btn-outline border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 w-full"
          >
            📅 تاريخ الحضور
          </button>
        </div>
      </div>
    </Page>
  );
}
