import { useState } from "react";

export function useToast(duration = 2200) {
  const [msg, setMsg] = useState("");
  const show = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), duration);
  };
  return { msg, show };
}
