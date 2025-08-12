/* eslint-disable @typescript-eslint/no-explicit-any */
import { IconType } from "react-icons";
import {
  EducationLevelDropdown,
  FormField,
  LanguageDropdown,
  Wrapper,
} from "../../components";
import { FiSend } from "react-icons/fi";
import { RiSkipRightLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useState, useEffect } from "react";
import { educationLevels, languages } from "../../entity";
import { useAuth } from "../../hooks/useAuth";

const Button = ({
  text,
  Icon,
  className,
  onClick,
  disabled = false,
}: {
  text: string;
  Icon: IconType;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      className={`${className} flex items-center gap-2 w-full
     py-3 bg-white text-[14px] justify-center rounded-[0.75rem]
     hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
      {Icon && <Icon size={18} />}
    </button>
  );
};

const PersonalForm = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [values, setValues] = useState({
    username: "",
    eduLevel: educationLevels[0],
    language: languages[0],
  });

  // Check for session and verify first-time login access
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          console.log("No valid session, redirecting to signin");
          navigate("/login");
          return;
        }

        // Verify this user should be on this page
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select("first_time_login")
          .eq("userId", session.user.id)
          .maybeSingle();

        if (userError) {
          console.error("User check error:", userError);
          setError("Error checking profile status");
          return;
        }

        if (!userData) {
          console.log("No user record found, creating one...");
          const { error: createError } = await supabase.from("user").insert([
            {
              userId: session.user.id,
              email: session.user.email,
              first_time_login: true,
            },
          ]);

          if (createError) {
            console.error("Error creating user record:", createError);
            setError("Error setting up your profile. Please try again.");
            return;
          }

          console.log("User record created successfully");
        } else if (!userData.first_time_login) {
          // If user record exists but not first time login, redirect to main
          navigate("/main");
          return;
        }

        setSessionLoaded(true);
      } catch (err) {
        console.error("Error checking session:", err);
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  const handleUpdateUser = async () => {
    if (!sessionLoaded) {
      setError("Please wait while we verify your session");
      return;
    }

    if (!values.username.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("Session expired. Please sign in again.");
        navigate("/login");
        return;
      }

      // Update user record in your user table
      const { data, error } = await supabase
        .from("user")
        .update({
          username: values.username,
          education_level: values.eduLevel,
          language: values.language,
          first_time_login: false,
        })
        .eq("userId", session.user.id);

      if (error) {
        console.error("Profile update error:", error);
        setError(error.message || "Failed to update profile");
        return;
      }

      console.log("Profile updated successfully: ", data);
      setUser({ ...(data as any) });

      // Navigate to main page on success
      navigate("/main");
    } catch (error: any) {
      console.error("Error updating profile: ", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Still mark as not first time even if skipped
        const { error } = await supabase
          .from("user")
          .update({ first_time_login: false })
          .eq("userId", session.user.id);

        if (error) {
          console.error("Error updating first_time_login:", error);
        }
      }

      navigate("/main");
    } catch (error) {
      console.error("Error skipping:", error);
      navigate("/main");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionLoaded) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center w-full min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div
        className="flex flex-col items-center justify-center w-full
        min-h-screen px-1 space-y-5 overflow-y-auto pt-[100px] pb-2
        sm:max-w-max mx-auto"
      >
        <h1 className="text-[20px] text-white font-semibold">
          U<span className="relative -bottom-2">L</span>
        </h1>
        <h2 className="text-center text-[18px] text-[#fafafab2]">
          Help us tailor your experience to your learning habits and goals
        </h2>

        {/* Error Message */}
        {error && (
          <div className="w-full p-3 border border-red-500/20 rounded-[0.75rem] bg-red-500/10">
            <p className="text-red-400 text-[14px] text-center">{error}</p>
          </div>
        )}

        <FormField
          label="Your name"
          subtext="Your preferred name"
          inputProps={{
            autoFocus: true,
            type: "text",
            name: "username",
            id: "username",
            value: values.username,
            onChange: (e) =>
              setValues((prev) => ({ ...prev, username: e.target.value })),
            placeholder: "Enter your name",
            disabled: loading,
          }}
        />

        <FormField
          label="Education Level"
          subtext="Choose your education level"
          type="custom"
        >
          <EducationLevelDropdown
            className="py-3 w-full"
            parentWidth="w-full"
            selectedUniversity={values.eduLevel}
            onChange={(option) =>
              setValues((prev) => ({ ...prev, eduLevel: option }))
            }
          />
        </FormField>

        <FormField
          label="Language"
          subtext="Choose your language"
          type="custom"
        >
          <LanguageDropdown
            position="top"
            className="py-3 w-full"
            parentWidth="w-full"
            selectedLang={values.language}
            onChange={(selectedOption) => {
              setValues((prev) => ({ ...prev, language: selectedOption }));
            }}
          />
        </FormField>

        <div className="w-full flex flex-col gap-2">
          <Button
            text={loading ? "Saving..." : "Finish"}
            Icon={FiSend}
            onClick={handleUpdateUser}
            disabled={loading}
          />
          <Button
            text="Skip"
            Icon={RiSkipRightLine}
            onClick={handleSkip}
            className="!bg-[#262626] text-[#fafafa]"
            disabled={loading}
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default PersonalForm;
