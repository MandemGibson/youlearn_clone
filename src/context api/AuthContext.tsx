import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import supabase from "../utils/supabase";

export type User = {
  id: string;
  email: string;
  password?: string;
};

type AuthContextProps = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const CheckAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getUser();

        console.log(data.user);
        if (data.user) {
          setUser(data.user as User);
        } else setUser(null);
      } catch (error) {
        console.error("Error getting me: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    CheckAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
