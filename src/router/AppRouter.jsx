import { useState } from "react";
import { studentsDB } from "../data/storage";
import { HomePage }                 from "../pages/HomePage";
import { SearchPage }               from "../pages/SearchPage";
import { StudentPage }              from "../pages/StudentPage";
import { AddIdPage, AddFormPage }   from "../pages/AddStudentPage";
import { EditPage }                 from "../pages/EditPage";
import { AttendancePage }           from "../pages/AttendancePage";
import { PersonalAttendancePage }   from "../pages/PersonalAttendancePage";
import { HistoryPage }              from "../pages/HistoryPage";
import { VisitsPage }               from "../pages/VisitsPage";
import { VisitsHistoryPage }        from "../pages/VisitsHistoryPage";
import { CouponsPage }              from "../pages/CouponsPage";
import { BirthdayPage }             from "../pages/BirthdayPage";

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

  const homeProps = {
    onGoSearch:     () => setPage("search"),
    onGoAttendance: () => { setActivePerson(null); setPage("attendance"); },
    onGoHistory:    () => setPage("history"),
    onGoVisits:     () => setPage("visits"),
    onGoBirthday:   () => setPage("birthday"),
    onLogout
  };

  switch (page) {
    case "home":
      return <HomePage {...homeProps} />;
    case "search":
      return <SearchPage onBack={()=>setPage("home")} onGoStudent={goStudent} onGoAdd={()=>setPage("add")} />;
    case "birthday":
      return <BirthdayPage onBack={()=>setPage("home")} />;
    case "student":
      return <StudentPage person={activePerson} onBack={()=>setPage("search")} onGoAttendance={()=>setPage("student-attendance")} onGoEdit={()=>setPage("edit")} onGoCoupons={()=>setPage("coupons")} />;
    case "add":
      return <AddIdPage onBack={()=>setPage("home")} onNext={id=>{setPendingId(id);setPage("add-form");}} />;
    case "add-form":
      return <AddFormPage onBack={()=>setPage("add")} pendingId={pendingId} onGoAttendance={p=>{setActivePerson(p);setPage("student-attendance");}} onGoStudent={goStudent} />;
    case "attendance":
      return <AttendancePage person={activePerson} onBack={()=>setPage("home")} onGoHistory={()=>setPage("history")} />;
    case "student-attendance":
      return <PersonalAttendancePage person={activePerson} onBack={()=>setPage("student")} />;
    case "edit":
      return <EditPage person={activePerson} onBack={()=>setPage("student")} onSaved={p=>{setActivePerson(p);setPage("student");}} />;
    case "history":
      return <HistoryPage onBack={()=>setPage("home")} />;
    case "visits":
      return <VisitsPage onBack={()=>setPage("home")} onGoVisitsHistory={()=>setPage("visits-history")} />;
    case "visits-history":
      return <VisitsHistoryPage onBack={()=>setPage("visits")} />;
    case "coupons":
      return <CouponsPage person={activePerson} onBack={()=>setPage("student")} />;
    default:
      return <HomePage {...homeProps} />;
  }
}



