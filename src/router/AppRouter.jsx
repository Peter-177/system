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
import { GamePage }                 from "../pages/GamePage";


export function AppRouter({ currentUser, onRefreshAuth, onLogout, onUpdateSecret }) {
  const [page,         setPageState]         = useState("home");
  const [activePerson, setActivePersonState] = useState(null);
  const [pendingId,    setPendingId]    = useState("");
  const [activeClass,  setActiveClass]  = useState(null);

  const setPage = useCallback((newPage, customPerson = activePerson, replace = false, isSummer = false) => {
    if (!replace && newPage === page && JSON.stringify(customPerson) === JSON.stringify(activePerson)) return;

    const state = { page: newPage, person: customPerson, isSummer };
    if (replace) {
      window.history.replaceState(state, "");
    } else {
      window.history.pushState(state, "");
    }
    setPageState(newPage);
  }, [activePerson, page]);

  const setActivePerson = useCallback((newPerson) => {
    setActivePersonState(newPerson);
    window.history.replaceState({ page, person: newPerson }, "");
  }, [page]);

  useEffect(() => {
    window.history.replaceState({ page: "home", person: null }, "");

    const onPopState = (e) => {
      if (e.state) {
        setPageState(e.state.page);
        setActivePersonState(e.state.person);
        if (e.state.activeClass) setActiveClass(e.state.activeClass);
        
        // Auto-scroll to summer if returning to home from a summer-originated page
        if (e.state.page === "home" && e.state.isSummer) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              const portal = document.getElementById("summer-portal");
              if (portal) portal.scrollIntoView({ behavior: "smooth" });
            }, 100);
          });
        }
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goStudent = (qrId, replace = false) => {
    const found = studentsDB.get(qrId);
    if (!found) return;
    const person = { qrId, ...found };

    if (!replace && page === "student" && activePerson?.qrId === qrId) return;

    setActivePersonState(person);
    if (replace) {
      window.history.replaceState({ page: "student", person: person }, "");
    } else {
      window.history.pushState({ page: "student", person: person }, "");
    }
    setPageState("student");
  };

  const homeProps = {
    currentUser,
    onGoSearch:     () => setPage("search"),
    onGoAttendance: () => { setActivePerson(null); setPage("attendance"); },
    onGoHistory:    () => setPage("history"),
    onGoSummer:     () => {
      if (page !== "home") {
        setPage("home");
        requestAnimationFrame(() => {
          setTimeout(() => {
            const portal = document.getElementById("summer-portal");
            if (portal) portal.scrollIntoView({ behavior: "smooth" });
          }, 300);
        });
      } else {
        const portal = document.getElementById("summer-portal");
        if (portal) portal.scrollIntoView({ behavior: "smooth" });
      }
    },
    onGoVisits:     () => setPage("visits"),
    onGoBirthday:   () => setPage("birthday"),
    onGoClasses:    () => setPage("classes"),
    onGoAdmin:      () => setPage("admin"),
    onGoGame:       () => setPage("game"),
    onLogout
  };

  const summerProps = {
    ...homeProps,
    onGoSearch:     () => setPage("search", activePerson, false, true),
    onGoAttendance: () => { setActivePerson(null); setPage("attendance", null, false, true); },
    onGoGame:       () => setPage("game", activePerson, false, true),
  };

  switch (page) {
    case "home":
      return (
        <HomePage 
          {...homeProps} 
          onGoSearch_Summer={summerProps.onGoSearch} 
          onGoAttendance_Summer={summerProps.onGoAttendance} 
          onGoGame_Summer={summerProps.onGoGame} 
        />
      );
    case "search":
      return <SearchPage currentUser={currentUser} onBack={()=>window.history.back()} onGoStudent={goStudent} onGoAdd={()=>setPage("add")} />;
    case "birthday":
      return <BirthdayPage onBack={()=>window.history.back()} />;
    case "classes":
      return <ClassesPage currentUser={currentUser} onRefreshAuth={onRefreshAuth} onBack={()=>window.history.back()} onGoCreate={()=>setPage("create-class", activePerson, true)} onGoClass={(id)=>{
        setActiveClass(id);
        setPage("class-detail", activePerson);
      }} />;
    case "create-class":
      return <CreateClassPage onBack={()=>window.history.back()} onSaved={()=>setPage("classes", activePerson, true)} />;
    case "class-detail":
      return <ClassDetailPage classId={activeClass} currentUser={currentUser} onBack={()=>window.history.back()} onGoStudent={goStudent} onGoCoupons={(p)=>{setActivePerson(p);setPage("coupons");}} />;
    case "admin":
      return (
        <AdminPage 
          currentUser={currentUser} 
          onBack={() => window.history.back()} 
          onGoClasses={() => setPage("classes")} 
          onGoAddStudent={() => setPage("add")}
          onGoCreateClass={() => setPage("create-class")}
          onUpdateSecret={onUpdateSecret}
        />
      );
    case "student":
      return <StudentPage currentUser={currentUser} person={activePerson} onBack={()=>window.history.back()} onGoAttendance={()=>setPage("student-attendance")} onGoEdit={()=>setPage("edit", activePerson, true)} onGoCoupons={()=>setPage("coupons")} />;
    case "add":
      return <AddIdPage onBack={()=>window.history.back()} onNext={id=>{setPendingId(id);setPage("add-form");}} />;
    case "add-form":
      return <AddFormPage onBack={()=>window.history.back()} pendingId={pendingId} onGoAttendance={p=>{setActivePerson(p);setPage("student-attendance", p, true);}} onGoStudent={id => goStudent(id, true)} />;
    case "attendance":
      return <AttendancePage currentUser={currentUser} person={activePerson} onBack={()=>window.history.back()} onGoHistory={()=>setPage("history")} />;
    case "student-attendance":
      return <PersonalAttendancePage person={activePerson} onBack={()=>window.history.back()} />;
    case "edit":
      return <EditPage person={activePerson} onBack={()=>window.history.back()} onSaved={p=>{setActivePerson(p);setPage("student", p, true);}} />;
    case "history":
      return <HistoryPage onBack={()=>window.history.back()} />;
    case "visits":
      return <VisitsPage onBack={()=>window.history.back()} onGoVisitsHistory={()=>setPage("visits-history")} />;
    case "visits-history":
      return <VisitsHistoryPage onBack={()=>window.history.back()} />;
    case "coupons":
      return <CouponsPage currentUser={currentUser} person={activePerson} onBack={()=>window.history.back()} />;
    case "game":
      return <GamePage {...homeProps} onBack={() => window.history.back()} />;

    default:
      return <HomePage {...homeProps} />;
  }
}
