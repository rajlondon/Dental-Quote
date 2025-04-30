import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type Auth = { loading: boolean; ok: boolean };
const Ctx = createContext<Auth>({ loading: true, ok: false });
export const useClinicAuth = () => useContext(Ctx);

export function ClinicAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOK] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("clinicToken");
    if (!token) {
      // No token exists, we're not authenticated
      console.log("No clinic token found in localStorage");
      return setLoading(false);
    }

    // Set token in axios defaults
    console.log("Found clinic token, checking validity...");
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // CRITICAL FIX: Add withCredentials to ensure cookies are sent
    // This is needed for clinic portal authentication to work consistently
    
    // Check if token is valid - we use the existing session authentication
    axios.get("/api/auth/clinic/me", { withCredentials: true })
         .then((response) => {
           console.log("Clinic token valid, user authenticated");
           setOK(true);
         })
         .catch((error) => {
           console.error("Clinic authentication failed:", error);
           localStorage.removeItem("clinicToken");
         })
         .finally(() => {
           setLoading(false);
         });
  }, []);

  return <Ctx.Provider value={{ loading, ok }}>{children}</Ctx.Provider>;
}