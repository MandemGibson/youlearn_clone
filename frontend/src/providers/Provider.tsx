import { ReactNode } from "react";
import { AuthProvider } from "../context api/AuthContext";
import { ContentProvider } from "../context api/ContentContext";
import { RoomsProvider } from "../context api/RoomsContext";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../redux/store";

const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <ContentProvider>
          <RoomsProvider>{children}</RoomsProvider>
        </ContentProvider>
      </AuthProvider>
    </ReduxProvider>
  );
};

export default Provider;
