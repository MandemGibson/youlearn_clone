import { ReactNode, useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { AuthContext, User } from "../entity";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getUser();

        console.log("Initial user check:", data.user);
        if (data.user) {
          setUser(data.user as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error getting user: ", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Check initial auth status
    checkAuthStatus();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user as User);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }

      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
