import { FcGoogle } from "react-icons/fc";
import { Wrapper } from "../../components";
import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordVisibility = () => setShowPassword(!showPassword);
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
          <h1 className="text-[#fafafa] text-[20px]">Create an account</h1>
          <p className="text-[#a3a3a3] text-[16px]">
            Let's get your learning journey started.
          </p>
          <button
            className="flex w-full items-center py-3 bg-[#1717174C]
          justify-center border border-[#fafafa1a] rounded-[0.75rem]
          space-x-[12px] text-[16px] px-[90px] hover:cursor-pointer
          hover:bg-[#fafafa0d]"
          >
            <FcGoogle />
            <span className="text-[#fafafa] font-semibold">
              Sign up with Google
            </span>
          </button>
          <div className="flex items-center w-full gap-[8px]">
            <div className="flex-1 border-t border-[#fafafa33]" />
            <span className="text-[12px] text-[#fafafa66]">
              or continue with
            </span>
            <div className="flex-1 border-t border-[#fafafa33]" />
          </div>
          <div className="w-full p-3 border border-[#fafafa1a] rounded-[0.75rem]">
            <input
              type="text"
              placeholder="Enter your email"
              className="bg-inherit focus:outline-none text-[#fafafa]
              pl-3 text-[16px]"
            />
          </div>
          <div
            className="flex items-center justify-between w-full p-3
           border border-[#fafafa1a] text-[#fafafa] rounded-[0.75rem]"
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="bg-inherit focus:outline-none text-[#fafafa]
              pl-3"
            />
            {showPassword ? (
              <IoEyeOffOutline onClick={handlePasswordVisibility} size={20} />
            ) : (
              <IoEyeOutline onClick={handlePasswordVisibility} size={20} />
            )}
          </div>
          <button className="w-full py-3 rounded-[0.75rem] bg-[#a3a3a3]
          mt-3">
            Sign Up
          </button>
          <p className="text-[16px] text-[#fafafa80]">
            Already have an account?{" "}
            <span className="font-semibold underline text-[#fafafa90]">
              <a href="login">Sign in</a>
            </span>
          </p>
        </form>
      </div>
    </Wrapper>
  );
};

export default SignUpPage;
