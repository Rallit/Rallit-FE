import { createContext } from "react";
import type { useAuth } from "@/hooks/useAuth";

export const AuthContext = createContext<ReturnType<typeof useAuth> | null>(
  null,
);
