import { useState } from "react";
import { studentsDB } from "../data/storage";
import { HomePage }                 from "../pages/HomePage";
import { StudentPage }              from "../pages/StudentPage";
import { AddIdPage, AddFormPage }   from "../pages/AddStudentPage";
import { EditPage }                 from "../pages/EditPage";
import { AttendancePage }           from "../pages/AttendancePage";
import { HistoryPage }              from "../pages/HistoryPage";
import { CouponsPage }              from "../pages/CouponsPage";

export function AppRouter({ onLogout }) {
  const [page,         setPage]         = useState("home");
  const [activePerson, setActivePerson] = useState(null);
  const [pendingId,    setPendingId]    = useState("");

  const goStudent = (qrId) => {
    const found = studentsDB.get(qrId);
    if (!found) return;
    setActivePerson({ qrId, ...found });
    setPage("student");
  };

  switch (page) {
    case "home":
      return <HomePage onGoStudent={goStudent} onGoAdd={()=>setPage("add")} onGoHistory={()=>setPage("history")} onLogout={onLogout} />;
    case "student":
      return <StudentPage person={activePerson} onBack={()=>setPage("home")} onGoAttendance={()=>setPage("attendance")} onGoEdit={()=>setPage("edit")} onGoCoupons={()=>setPage("coupons")} />;
    case "add":
      return <AddIdPage onBack={()=>setPage("home")} onNext={id=>{setPendingId(id);setPage("add-form");}} />;
    case "add-form":
      return <AddFormPage onBack={()=>setPage("add")} pendingId={pendingId} onGoAttendance={p=>{setActivePerson(p);setPage("attendance");}} onGoStudent={goStudent} />;
    case "attendance":
      return <AttendancePage person={activePerson} onBack={()=>setPage("student")} />;
    case "edit":
      return <EditPage person={activePerson} onBack={()=>setPage("student")} onSaved={p=>{setActivePerson(p);setPage("student");}} />;
    case "history":
      return <HistoryPage onBack={()=>setPage("home")} />;
    case "coupons":
      return <CouponsPage person={activePerson} onBack={()=>setPage("student")} />;
    default:
      return <HomePage onGoStudent={goStudent} onGoAdd={()=>setPage("add")} onGoHistory={()=>setPage("history")} onLogout={onLogout} />;
  }
}
