import { Wrapper } from "../../components";
import { useState } from "react";
import supabase from "../../utils/supabase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <div
        className="flex flex-col items-center justify-center w-full
      min-h-screen px-1 space-y-5"
      >
        <h1 className="text-[20px] text-white font-semibold">AceMate</h1>
        <form
          onSubmit={handleForgotPassword}
          className="w-full flex flex-col items-center gap-[16px]
        sm:max-w-max"
        >
          <h1 className="text-[#fafafa] text-[20px]">Forgot password?</h1>
          <p className="text-[#a3a3a3] text-[16px]">
            Let's continue your learning journey.
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

          <div className="w-full p-3 border border-[#fafafa1a] rounded-[0.75rem]">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-inherit focus:outline-none text-[#fafafa]
              pl-3 pr-[90px] text-[16px] w-full"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[0.75rem] bg-[#fafafa]
            hover:cursor-pointer hover:bg-[#fafafa]/90 transition
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Password Reset"}
          </button>

          <p className="text-[16px] text-[#fafafa80]">
            Already have an account?{" "}
            <span className="font-semibold underline text-[#fafafa90]">
              <a href="/login">Sign in</a>
            </span>
          </p>
        </form>
      </div>
    </Wrapper>
  );
};

export default ForgotPassword;
