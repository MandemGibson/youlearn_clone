import { ReactNode } from "react";
import { AuthProvider } from "../context api/AuthContext";

const Provider = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Provider;
