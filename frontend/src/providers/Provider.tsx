import { ReactNode } from "react";
import { AuthProvider } from "../context api/AuthContext";
import { ContentProvider } from "../context api/ContentContext";
import { RoomsProvider } from "../context api/RoomsContext";

const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ContentProvider>
        <RoomsProvider>{children}</RoomsProvider>
      </ContentProvider>
    </AuthProvider>
  );
};

export default Provider;
