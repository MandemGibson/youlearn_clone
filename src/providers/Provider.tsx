import { ReactNode } from "react";
import { AuthProvider } from "../context api/AuthContext";
import { ContentProvider } from "../context api/ContentContext";

const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ContentProvider>{children}</ContentProvider>
    </AuthProvider>
  );
};

export default Provider;
