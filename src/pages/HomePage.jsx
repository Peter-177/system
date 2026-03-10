import { Page } from "../components/UI";

export function HomePage({ onGoSearch, onGoAttendance, onGoHistory, onGoVisits, onGoBirthday, onLogout }) {
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] pb-12">
        {/* Content */}
        <div className="w-full flex flex-col gap-6 max-w-sm mx-auto px-5 animate-slideUp">
          <button
            onClick={onGoSearch}
            className="btn btn-primary btn-lg w-full text-xl shadow-md h-20"
          >
            🔍 Search / بحث
          </button>

          <button
            onClick={onGoAttendance}
            className="btn btn-success btn-lg w-full text-xl shadow-md h-20 text-white"
          >
            ✅ Attendance / الحضور
          </button>

          <button
            onClick={onGoVisits}
            className="btn btn-info btn-lg w-full text-xl shadow-md h-20 text-white"
          >
            🏠 Visites / الزيارات
          </button>

          <button
            onClick={onGoBirthday}
            className="btn btn-warning btn-lg w-full text-xl shadow-md h-20"
          >
            🎂 Birthday / أعياد الميلاد
          </button>
        </div>
      </div>
    </Page>
  );
}

