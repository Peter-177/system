import { createContext, useContext, useState } from "react";

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [pendingList, setPendingList] = useState([]);

  return (
    <AttendanceContext.Provider value={{ pendingList, setPendingList }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  return useContext(AttendanceContext);
}
