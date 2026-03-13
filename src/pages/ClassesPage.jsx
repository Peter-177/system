import { useState, useMemo } from "react";
import { classesDB } from "../data/storage";
import { Page, Navbar, Empty } from "../components/UI";

export function ClassesPage({ currentUser, onRefreshAuth, onBack, onGoCreate, onGoClass }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const classes = classesDB.getAll();
  const classList = Object.entries(classes).map(([id, cls]) => ({ id, ...cls }));

  // Filter allowed classes:
  // Admin sees all. Normal user sees all, but can only ENTER permitted ones.
  const isAdmin = currentUser?.role === "admin";
  const userPerms = currentUser?.permissions || [];

  return (
    <Page>
      <Navbar title="الفصول" onBack={onBack} />

      <div className="flex-1 px-5 py-6 space-y-5 animate-slideUp max-w-lg mx-auto w-full pb-20">
        <div className="flex items-center justify-between" dir="rtl">
          <h2 className="text-xl font-extrabold text-base-content tracking-tight">إدارة الفصول</h2>
          {!isAdmin && (
            <button 
              onClick={async () => {
                setIsRefreshing(true);
                if (onRefreshAuth) await onRefreshAuth();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="btn btn-sm btn-ghost gap-2 text-primary hover:bg-primary/10 rounded-full font-bold transition-all px-4"
            >
              {isRefreshing ? <span className="loading loading-spinner loading-xs"></span> : "🔄 Refresh"}
            </button>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={onGoCreate}
            className="btn btn-outline border-dashed border-2 border-primary/40 text-primary w-full text-base font-bold rounded-[1.25rem] h-14 hover:bg-primary hover:border-primary hover:text-primary-content transition-all mb-2"
          >
            <span className="text-xl mr-2">+</span> فصل جديد
          </button>
        )}

        {classList.length === 0 ? (
          <Empty message="مافيش فصول لغاية دلوقتي" icon="📚" />
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-2" dir="rtl">
            {classList.map((cls, idx) => {
              const hasAccess = isAdmin || userPerms.includes(cls.id);
              return (
                <button
                  key={cls.id}
                  onClick={() => hasAccess && onGoClass(cls.id)}
                  className={`group relative text-right flex flex-col p-5 rounded-[1.5rem] border shadow-sm transition-all duration-300 overflow-hidden ${
                    hasAccess
                      ? "bg-base-100 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 border-base-200"
                      : "bg-base-200/50 grayscale opacity-75 cursor-not-allowed border-base-300"
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Decorative Gradient Background */}
                  {hasAccess && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  )}

                  <div className="flex justify-between items-start relative z-10 w-full mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${hasAccess ? 'bg-primary/10 text-primary' : 'bg-base-300 text-base-content/50'}`}>
                        📚
                      </div>
                      <div>
                        <h3 className="font-bold text-[17px] text-base-content mb-0.5">{cls.name}</h3>
                        <div className="text-xs text-base-content/40 font-mono">{cls.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${hasAccess ? 'bg-base-200 group-hover:bg-primary group-hover:text-primary-content text-base-content/40' : 'bg-base-300 text-base-content/50'}`}>
                      {!hasAccess ? (
                        <span className="text-sm">🔒</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 relative z-10">
                    {cls.grades?.map((g) => (
                      <span key={g} className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${hasAccess ? 'bg-base-200 text-base-content/70 border border-base-300' : 'bg-base-300 text-base-content/40'}`}>
                        {g}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}

export function CreateClassPage({ onBack, onSaved }) {
  const [name, setName] = useState("");
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const GRADES = [
    "حضانه",
    "أولى ابتدائي",
    "تانية ابتدائي",
    "تالتة ابتدائي",
    "رابعة ابتدائي",
    "خامسة ابتدائي",
    "ستة ابتدائي",
  ];

  const handleToggle = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter((g) => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      setError("اكتب اسم الفصل لو سمحت");
      return;
    }
    if (selectedGrades.length === 0) {
      setError("اختار سنة واحدة على الأقل");
      return;
    }

    setLoading(true);
    const id = Date.now().toString();
    const newClass = {
      name: name.trim(),
      grades: selectedGrades,
      createdAt: new Date().toISOString(),
    };

    classesDB.set(id, newClass);
    setLoading(false);
    onSaved();
  };

  return (
    <Page>
      <Navbar title="فصل جديد" onBack={onBack} />
      <div className="p-5 animate-slideUp" dir="rtl">
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-4">
            <h2 className="card-title text-xl mb-2 text-primary">📝 بيانات الفصل</h2>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">اسم الفصل</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="مثال: أولى وتانية ابتدائي"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="form-control w-full mt-2">
              <label className="label">
                <span className="label-text font-bold">السنين اللي في الفصل ده</span>
              </label>
              <div className="bg-base-100 p-3 rounded-box border border-base-300 space-y-2">
                {GRADES.map((grade) => (
                  <label key={grade} className="label cursor-pointer justify-start gap-3 p-1">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={selectedGrades.includes(grade)}
                      onChange={() => {
                        handleToggle(grade);
                        setError("");
                      }}
                    />
                    <span className="label-text">{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="alert alert-error text-sm py-2 mt-2">
                <span>{error}</span>
              </div>
            )}

            <button
              className="btn btn-primary w-full mt-4 text-lg"
              onClick={submit}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : "سجل الفصل"}
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}
