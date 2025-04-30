import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "@/lib/api"; // Import our configured API client
import { useQuery } from "@tanstack/react-query";

// Enhanced Auth type with user data
type Auth = { 
  loading: boolean; 
  ok: boolean;
  user: any | null; // Add user data to the context
};

// Initialize context with loading state
const Ctx = createContext<Auth>({ loading: true, ok: false, user: null });
export const useClinicAuth = () => useContext(Ctx);

// Function to fetch user data with proper credentials
async function fetchMe() {
  try {
    // Use our configured API client to ensure cookies are sent
    const response = await api.get("/api/auth/user");
    return response.data.user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export function ClinicAuthProvider({ children }: { children: React.ReactNode }) {
  // Using React Query to properly fetch and cache user data
  // This is the key part of the fix - we use the isLoading state to prevent
  // premature redirect decisions, and we WAIT for the API call to complete
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: fetchMe,
    staleTime: 30000,         // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    retry: 1,                 // Retry once if the request fails
  });

  // Determine authentication status based on user data
  const ok = !!user && user.role === "clinic_staff";

  // Log diagnostic information
  useEffect(() => {
    if (isLoading) {
      console.log("ClinicAuth: Loading user data...");
    } else if (ok) {
      console.log("ClinicAuth: User authenticated as clinic staff", user?.email);
      
      // Store a session marker to prevent repeated redirects
      sessionStorage.setItem('clinic_auth_timestamp', Date.now().toString());
    } else {
      console.log("ClinicAuth: User not authenticated or not clinic staff");
    }
  }, [isLoading, ok, user]);

  return (
    <Ctx.Provider 
      value={{ 
        loading: isLoading, 
        ok, 
        user 
      }}
    >
      {children}
    </Ctx.Provider>
  );
}