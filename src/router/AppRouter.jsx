import { useState, useEffect, useCallback } from "react";
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
import { ClassesPage, CreateClassPage } from "../pages/ClassesPage";
import { ClassDetailPage }          from "../pages/ClassDetailPage";
import { AdminPage }                from "../pages/AdminPage";

export function AppRouter({ currentUser, onRefreshAuth, onLogout }) {
  const [page,         setPageState]         = useState("home");
  const [activePerson, setActivePersonState] = useState(null);
  const [pendingId,    setPendingId]    = useState("");
  const [activeClass,  setActiveClass]  = useState(null);

  const setPage = useCallback((newPage, customPerson = activePerson) => {
    // Custom setter to manipulate History API
    window.history.pushState({ page: newPage, person: customPerson }, "");
    setPageState(newPage);
  }, [activePerson]);

  const setActivePerson = useCallback((newPerson) => {
    setActivePersonState(newPerson);
    // Sync current history state with the new person
    window.history.replaceState({ page, person: newPerson }, "");
  }, [page]);

  useEffect(() => {
    // Make sure we have an initial state
    window.history.replaceState({ page: "home", person: null }, "");

    const onPopState = (e) => {
      if (e.state) {
        setPageState(e.state.page);
        setActivePersonState(e.state.person);
        if (e.state.activeClass) setActiveClass(e.state.activeClass);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goStudent = (qrId) => {
    const found = studentsDB.get(qrId);
    if (!found) return;
    const person = { qrId, ...found };
    setActivePersonState(person);
    // Explicitly push sync because we are updating both at once
    window.history.pushState({ page: "student", person: person }, "");
    setPageState("student");
  };

  const homeProps = {
    onGoSearch:     () => setPage("search"),
    onGoAttendance: () => { setActivePerson(null); setPage("attendance"); },
    onGoHistory:    () => setPage("history"),
    onGoVisits:     () => setPage("visits"),
    onGoBirthday:   () => setPage("birthday"),
    onGoClasses:    () => setPage("classes"),
    onGoAdmin:      () => setPage("admin"),
    currentUser,
    onLogout
  };

  switch (page) {
    case "home":
      return <HomePage {...homeProps} />;
    case "search":
      return <SearchPage currentUser={currentUser} onBack={()=>window.history.back()} onGoStudent={goStudent} onGoAdd={()=>setPage("add")} />;
    case "birthday":
      return <BirthdayPage onBack={()=>window.history.back()} />;
    case "classes":
      return <ClassesPage currentUser={currentUser} onRefreshAuth={onRefreshAuth} onBack={()=>window.history.back()} onGoCreate={()=>setPage("create-class")} onGoClass={(id)=>{
        setActiveClass(id);
        window.history.pushState({ page: "class-detail", person: activePerson, activeClass: id }, "");
        setPageState("class-detail");
      }} />;
    case "create-class":
      return <CreateClassPage onBack={()=>window.history.back()} onSaved={()=>setPage("classes")} />;
    case "class-detail":
      return <ClassDetailPage classId={activeClass} currentUser={currentUser} onBack={()=>window.history.back()} onGoStudent={goStudent} onGoAttendance={(p)=>{setActivePerson(p);setPage("student-attendance");}} onGoCoupons={(p)=>{setActivePerson(p);setPage("coupons");}} />;
    case "admin":
      return (
        <AdminPage 
          currentUser={currentUser} 
          onBack={() => window.history.back()} 
          onGoClasses={() => setPage("classes")} 
          onGoAddStudent={() => setPage("add")}
          onGoCreateClass={() => setPage("create-class")}
        />
      );
    case "student":
      return <StudentPage person={activePerson} onBack={()=>window.history.back()} onGoAttendance={()=>setPage("student-attendance")} onGoEdit={()=>setPage("edit")} onGoCoupons={()=>setPage("coupons")} />;
    case "add":
      return <AddIdPage onBack={()=>window.history.back()} onNext={id=>{setPendingId(id);setPage("add-form");}} />;
    case "add-form":
      return <AddFormPage onBack={()=>window.history.back()} pendingId={pendingId} onGoAttendance={p=>{setActivePerson(p);setPage("student-attendance");}} onGoStudent={goStudent} />;
    case "attendance":
      return <AttendancePage person={activePerson} onBack={()=>window.history.back()} onGoHistory={()=>setPage("history")} />;
    case "student-attendance":
      return <PersonalAttendancePage person={activePerson} onBack={()=>window.history.back()} />;
    case "edit":
      return <EditPage person={activePerson} onBack={()=>window.history.back()} onSaved={p=>{setActivePerson(p);setPage("student");}} />;
    case "history":
      return <HistoryPage onBack={()=>window.history.back()} />;
    case "visits":
      return <VisitsPage onBack={()=>window.history.back()} onGoVisitsHistory={()=>setPage("visits-history")} />;
    case "visits-history":
      return <VisitsHistoryPage onBack={()=>window.history.back()} />;
    case "coupons":
      return <CouponsPage person={activePerson} onBack={()=>window.history.back()} />;
    default:
      return <HomePage {...homeProps} />;
  }
}



