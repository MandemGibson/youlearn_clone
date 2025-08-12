/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { AuthForm, Wrapper } from "../../components";
import supabase from "../../utils/supabase";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = useAuth();
  const [errMsg, setErrMsg] = useState("");

  const handleSignUp = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setErrMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setErrMsg(error.message);
        console.error("Error signing up: ", error.message);
        return;
      }

      if (data.user) {
        console.log("User created:", data.user);

        const { error: userInsertError } = await supabase.from("user").insert({
          userId: data.user.id,
          email: data.user.email,
          first_time_login: true,
          username: null,
          avatar_url: null,
        });

        if (userInsertError) {
          console.error("Error creating user record:", userInsertError);
          setErrMsg(
            "Account created but failed to initialize profile. Please try signing in."
          );
        } else {
          console.log("User record created successfully");
        }

        navigate("/login");
      }
    } catch (error: any) {
      console.error("Signup error: ", error);
      setErrMsg("An unexpected error occurred. Please try again.");
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
