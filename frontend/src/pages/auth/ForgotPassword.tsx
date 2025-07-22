import { Wrapper } from "../../components";
// import { useState } from "react";

const ForgotPassword = () => {
  return (
    <Wrapper>
      <div
        className="flex flex-col items-center justify-center w-full
      min-h-screen px-1 space-y-5"
      >
        <h1 className="text-[20px] text-white font-semibold">
          U<span className="relative -bottom-2">L</span>
        </h1>
        <form
          className="w-full flex flex-col items-center gap-[16px]
        sm:max-w-max"
        >
          <h1 className="text-[#fafafa] text-[20px]">Forgot password?</h1>
          <p className="text-[#a3a3a3] text-[16px]">
            Let's continue your learning journey.
          </p>

          <div className="w-full p-3 border border-[#fafafa1a] rounded-[0.75rem]">
            <input
              type="text"
              placeholder="Enter your email"
              className="bg-inherit focus:outline-none text-[#fafafa]
              pl-3 pr-[90px] text-[16px]"
            />
          </div>

          <button className="w-full py-3 rounded-[0.75rem] bg-[#fafafa]
          hover:cursor-pointer hover:bg-[#fafafa]/90 transition">
            Send Password Reset
          </button>
          <p className="text-[16px] text-[#fafafa80]">
            Already have an account?{" "}
            <span className="font-semibold underline text-[#fafafa90]">
              <a href="signup">Sign in</a>
            </span>
          </p>
        </form>
      </div>
    </Wrapper>
  );
};

export default ForgotPassword;
