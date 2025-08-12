/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AuthForm, Wrapper } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading, setUser } = useAuth();
  const [errMsg, setErrMsg] = useState("");

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setErrMsg("");

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

      if (data.user) {
        // Check if this is their first time logging in by querying your user table
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select(
            "first_time_login, username, education_level, language, avatar_url, email, userId"
          )
          .eq("userId", data.user.id)
          .maybeSingle();

        if (userError) {
          console.error("User data fetch error:", userError);
          setErrMsg("Error fetching user data. Please try again.");
          return;
        }

        // If no user record exists, create one and treat as first time
        if (!userData) {
          console.log(
            "No user record found, creating one and treating as first time login"
          );

          const { error: createError } = await supabase.from("user").insert([
            {
              userId: data.user.id,
              email: data.user.email,
              first_time_login: true,
            },
          ]);

          if (createError) {
            console.error("Error creating user record:", createError);
            setErrMsg("Error setting up your profile. Please try again.");
            return;
          }

          navigate("/personal-form");
          return;
        }

        console.log("User data:", userData);

        // Route based on first_time_login status
        if (userData.first_time_login) {
          console.log("First time login - redirecting to personal form");
          navigate("/personal-form");
        } else {
          setUser({ id: userData.userId, ...userData });
          console.log("Returning user - redirecting to main");
          navigate("/main");
        }
      }
    } catch (error) {
      console.error("Error: ", error);
      setErrMsg("An unexpected error occurred. Please try again.");
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
