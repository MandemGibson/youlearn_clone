import { useState } from "react";
import { AuthForm, Wrapper } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import { User } from "../../entity";

const SignInPage = () => {
  const navigate = useNavigate();

  const { isLoading, setIsLoading, setUser } = useAuth();

  const [errMsg, setErrMsg] = useState("");

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setErrMsg(error.message);
        console.error("Error signing in: ", error.message);
        return;
      }
      setUser(data.user as User);
      navigate("/main");
      
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <AuthForm
        title="Welcome back"
        subtitle="Let's continue your learning journey."
        googleText="Continue with Google"
        buttonText={isLoading ? "Signing In" : "Sign In"}
        footerText="Don't have an account?"
        footerLinkText="Sign up"
        footerLinkHref="/signup"
        errorMessage={errMsg}
        onSubmit={handleLogin}
      />
    </Wrapper>
  );
};

export default SignInPage;
