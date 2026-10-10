import { useState, useEffect, useCallback } from "react";
import { studentsDB } from "../data/storage";
import { StudentsDashboardPage } from "../pages/StudentsDashboardPage";
import { HomePage }                 from "../pages/HomePage";
import { SearchPage }               from "../pages/SearchPage";
import { StudentPage }              from "../pages/StudentPage";
import { AddFormPage }              from "../pages/AddStudentPage";
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
import { CheckPage }                from "../pages/CheckPage";
import { SummerPage }               from "../pages/SummerPage";

function getInitialRouting() {
  try {
    const path = window.location.pathname;
    if (path.startsWith("/check")) {
      const parts = path.split("/").filter(Boolean);
      const childId = parts[1] || null;
      let person = null;
      if (childId) {
        const found = studentsDB.get(childId);
        person = found ? { qrId: childId, ...found } : { qrId: childId };
      }
      return { page: "check", person };
    }
  } catch (e) {
    console.error("Failed to parse initial route:", e);
  }
  return { page: "home", person: null };
}

export function AppRouter({ currentUser, onRefreshAuth, onLogout, onUpdateSecret }) {
  const initialRoute = getInitialRouting();
  const [page,         setPageState]         = useState(initialRoute.page);
  const [activePerson, setActivePersonState] = useState(initialRoute.person);
  const [pendingId,    setPendingId]    = useState("");
  const [activeClass,  setActiveClass]  = useState(null);

  const setPage = useCallback((newPage, customPerson = activePerson, replace = false, isSummer = false) => {
    if (!replace && newPage === page && JSON.stringify(customPerson) === JSON.stringify(activePerson)) return;

    let targetUrl = "";
    if (newPage === "check") {
      targetUrl = customPerson?.qrId ? `/check/${customPerson.qrId}` : "/check";
    } else if (newPage === "home") {
      targetUrl = "/";
    }

    const state = { page: newPage, person: customPerson, isSummer };
    if (replace) {
      window.history.replaceState(state, "", targetUrl || undefined);
    } else {
      window.history.pushState(state, "", targetUrl || undefined);
    }
    setPageState(newPage);
    if (customPerson !== undefined) {
      setActivePersonState(customPerson);
    }
  }, [activePerson, page]);

  const setActivePerson = useCallback((newPerson) => {
    setActivePersonState(newPerson);
    window.history.replaceState({ page, person: newPerson }, "");
  }, [page]);

  useEffect(() => {
    const init = getInitialRouting();
    const initUrl = init.page === "check" ? (init.person?.qrId ? `/check/${init.person.qrId}` : "/check") : "/";
    window.history.replaceState({ page: init.page, person: init.person }, "", initUrl);

    const onPopState = (e) => {
      if (e.state) {
        setPageState(e.state.page);
        setActivePersonState(e.state.person);
        if (e.state.activeClass) setActiveClass(e.state.activeClass);
      } else {
        const fallback = getInitialRouting();
        setPageState(fallback.page);
        setActivePersonState(fallback.person);
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
    onGoSummer:     () => setPage("summer"),
    onGoVisits:     () => setPage("visits"),
    onGoBirthday:   () => setPage("birthday"),
    onGoClasses:    () => setPage("classes"),
    onGoAdmin:      () => setPage("admin"),
    onGoGame:       () => setPage("game"),
    onGoCheck:      (childId) => {
      let p = null;
      if (childId) {
        const found = studentsDB.get(childId);
        p = found ? { qrId: childId, ...found } : { qrId: childId };
      }
      setPage("check", p);
    },
    onLogout
  };

  switch (page) {
    case "home":
      return <HomePage {...homeProps} />;
    case "summer":
      return (
        <SummerPage
          currentUser={currentUser}
          onBack={() => setPage("home")}
          onGoCheck={(childId) => {
            let p = null;
            if (childId) {
              const found = studentsDB.get(childId);
              p = found ? { qrId: childId, ...found } : { qrId: childId };
            }
            setPage("check", p);
          }}
        />
      );
    case "search":
      return (
        <SearchPage
          currentUser={currentUser}
          onBack={() => window.history.back()}
          onGoStudent={goStudent}
          onGoAdd={() => {
            setPendingId("");
            setPage("add");
          }}
          onGoDashboard={() => setPage("dashboard")}
        />
      );
    case "dashboard":
      return (
        <StudentsDashboardPage
          currentUser={currentUser}
          onBack={() => window.history.back()}
          onGoStudent={goStudent}
        />
      );
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
          onGoAddStudent={() => { setPendingId(""); setPage("add"); }}
          onGoCreateClass={() => setPage("create-class")}
          onUpdateSecret={onUpdateSecret}
        />
      );
    case "student":
      return <StudentPage currentUser={currentUser} person={activePerson} onBack={()=>window.history.back()} onGoAttendance={()=>setPage("student-attendance")} onGoEdit={()=>setPage("edit", activePerson, true)} onGoCoupons={()=>setPage("coupons")} onGoCheck={()=>setPage("check", activePerson)} />;
    case "add":
    case "add-form":
      return (
        <AddFormPage
          onBack={() => window.history.back()}
          pendingId={pendingId}
          onGoAttendance={(p) => {
            setActivePerson(p);
            setPage("student-attendance", p, true);
          }}
          onGoStudent={(id) => goStudent(id, true)}
        />
      );
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
    case "check":
      return (
        <CheckPage
          currentUser={currentUser}
          initialChildId={activePerson?.qrId}
          onBack={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              setPage("home");
            }
          }}
          onSelectChildId={(id) => {
            if (id) {
              const found = studentsDB.get(id);
              setActivePersonState(found ? { qrId: id, ...found } : { qrId: id });
            } else {
              setActivePersonState(null);
            }
          }}
        />
      );

    default:
      return <HomePage {...homeProps} />;
  }
}

