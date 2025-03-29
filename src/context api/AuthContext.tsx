import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import supabase from "../utils/supabase";
import { AuthContext, User } from "../entity";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const CheckAuthStatus = async () => {
      setIsLoading(true);
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
