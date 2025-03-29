import { useNavigate } from "react-router-dom";
import { AuthForm, Wrapper } from "../../components";
import supabase from "../../utils/supabase";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../entity";

const SignUpPage = () => {
  const navigate = useNavigate();

  const { isLoading, setIsLoading, setUser } = useAuth();

  const [errMsg, setErrMsg] = useState("");

  const handleSignUp = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setErrMsg(error.message);
        console.error("Error signing in: ", error.message);
        return;
      }
      console.log(data.user as User);
      
      setUser(data.user as User);
      navigate("/personal-form");
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Wrapper>
      <AuthForm
        title="Create your account"
        subtitle="Let's get you started on your journey."
        googleText="Sign up with Google"
        buttonText={isLoading ? "Signing Up" : "Sign Up"}
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerLinkHref="/login"
        errorMessage={errMsg}
        onSubmit={handleSignUp}
      />
    </Wrapper>
  );
};

export default SignUpPage;
