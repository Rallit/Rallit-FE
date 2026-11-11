import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuthContext는 AuthProvider 안에서 사용해야 합니다.");
  }

  return context;
}
