import { Wrapper } from "../../components";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../../utils/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      } else {
        // Check for auth tokens in URL params (some providers use different param names)
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (accessToken && refreshToken) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              setError(
                "Invalid or expired reset link. Please request a new one."
              );
            } else {
              setIsValidSession(true);
            }
          } catch (err) {
            setError(
              "Invalid or expired reset link. Please request a new one."
            );
            console.error("Error resetting password: ", err);
          }
        } else {
          setError("Invalid or expired reset link. Please request a new one.");
        }
      }
    };

    checkSession();
  }, [searchParams]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password updated successfully! Redirecting to login...");

        // Sign out the user and redirect to login after a delay
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession && !error) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center w-full min-h-screen px-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-white mt-4">Verifying reset link...</p>
        </div>
      </Wrapper>
    );
  }

  if (error && !isValidSession) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center w-full min-h-screen px-1 space-y-5">
          <h1 className="text-[20px] text-white font-semibold">AceMate</h1>
          <div className="w-full flex flex-col items-center gap-[16px] sm:max-w-max">
            <h1 className="text-[#fafafa] text-[20px]">Invalid Reset Link</h1>

            <div className="w-full p-3 border border-red-500/20 rounded-[0.75rem] bg-red-500/10">
              <p className="text-red-400 text-[14px] text-center">{error}</p>
            </div>

            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full py-3 rounded-[0.75rem] bg-[#fafafa] hover:cursor-pointer hover:bg-[#fafafa]/90 transition"
            >
              Request New Reset Link
            </button>

            <p className="text-[16px] text-[#fafafa80]">
              Remember your password?{" "}
              <span className="font-semibold underline text-[#fafafa90]">
                <a href="/login">Sign in</a>
              </span>
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex flex-col items-center justify-center w-full min-h-screen px-1 space-y-5">
        <h1 className="text-[20px] text-white font-semibold">AceMate</h1>
        <form
          onSubmit={handleResetPassword}
          className="w-full flex flex-col items-center gap-[16px] sm:max-w-max"
        >
          <h1 className="text-[#fafafa] text-[20px]">Set New Password</h1>
          <p className="text-[#a3a3a3] text-[16px] text-center">
            Enter your new password below.
          </p>

          {/* Success Message */}
          {message && (
            <div className="w-full p-3 border border-green-500/20 rounded-[0.75rem] bg-green-500/10">
              <p className="text-green-400 text-[14px] text-center">
                {message}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full p-3 border border-red-500/20 rounded-[0.75rem] bg-red-500/10">
              <p className="text-red-400 text-[14px] text-center">{error}</p>
            </div>
          )}

          {/* New Password Input */}
          <div className="w-full p-3 border border-[#fafafa1a] rounded-[0.75rem] relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-inherit focus:outline-none text-[#fafafa] pl-3 pr-12 text-[16px] w-full"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a3a3a3] hover:text-[#fafafa] transition"
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="w-full p-3 border border-[#fafafa1a] rounded-[0.75rem]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-inherit focus:outline-none text-[#fafafa] pl-3 pr-3 text-[16px] w-full"
              required
              disabled={loading}
            />
          </div>

          {/* Password Requirements */}
          <div className="w-full text-[#a3a3a3] text-[12px] space-y-1">
            <p>Password must contain:</p>
            <ul className="ml-4 space-y-1">
              <li className={password.length >= 8 ? "text-green-400" : ""}>
                • At least 8 characters
              </li>
              <li
                className={/(?=.*[a-z])/.test(password) ? "text-green-400" : ""}
              >
                • One lowercase letter
              </li>
              <li
                className={/(?=.*[A-Z])/.test(password) ? "text-green-400" : ""}
              >
                • One uppercase letter
              </li>
              <li className={/(?=.*\d)/.test(password) ? "text-green-400" : ""}>
                • One number
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[0.75rem] bg-[#fafafa] hover:cursor-pointer hover:bg-[#fafafa]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <p className="text-[16px] text-[#fafafa80]">
            Remember your password?{" "}
            <span className="font-semibold underline text-[#fafafa90]">
              <a href="/login">Sign in</a>
            </span>
          </p>
        </form>
      </div>
    </Wrapper>
  );
};

export default ResetPassword;
