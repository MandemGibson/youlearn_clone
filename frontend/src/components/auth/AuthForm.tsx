import { ChangeEvent, FC, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

type AuthFormProps = {
  title: string;
  subtitle: string;
  googleText: string;
  buttonText: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  errorMessage?: string;
  onSubmit?: (values: { email: string; password: string }) => void;
};

const AuthForm: FC<AuthFormProps> = ({
  title,
  subtitle,
  googleText,
  buttonText,
  footerText,
  footerLinkText,
  footerLinkHref,
  errorMessage,
  onSubmit,
}) => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChangeValues = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    switch (name) {
      case "email":
        setErrors((prev) => ({
          ...prev,
          email: !value
            ? "Email is required"
            : !isValidEmail(value)
            ? "Invalid email"
            : "",
        }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password:
            value.length < 8 ? "Password must be at least 8 characters" : "",
        }));
        break;
    }
  };

  const isValidForm =
    Object.values(errors).every((err) => err === "") &&
    Object.values(values).every((val) => val !== "");

  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit && isValidForm) {
      onSubmit(values);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-1 space-y-5">
      <h1 className="text-[20px] text-white font-semibold">
        W<span className="relative -bottom-2">L</span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-[16px] sm:max-w-max"
      >
        <h1 className="text-[#fafafa] text-[20px]">{title}</h1>
        <p className="text-[#a3a3a3] text-[16px]">{subtitle}</p>

        <button
          type="button"
          className="flex w-full items-center py-3 bg-[#1717174C]
          justify-center border border-[#fafafa1a] rounded-[0.75rem]
          space-x-[12px] text-[16px] px-[90px] hover:cursor-pointer
          hover:bg-[#fafafa0d]"
        >
          <FcGoogle />
          <span className="text-[#fafafa] font-semibold">{googleText}</span>
        </button>

        <div className="flex items-center w-full gap-[8px]">
          <div className="flex-1 border-t border-[#fafafa33]" />
          <span className="text-[12px] text-[#fafafa66]">or continue with</span>
          <div className="flex-1 border-t border-[#fafafa33]" />
        </div>

        <div className="w-full p-3 border border-[#fafafa1a] rounded-[0.75rem]">
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChangeValues}
            autoFocus
            placeholder="Enter your email"
            className="bg-inherit focus:outline-none text-[#fafafa]
              pl-3 text-[16px] w-full h-full"
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-sm w-full text-center">
            {errors.email}
          </p>
        )}

        <div
          className="flex items-center justify-between w-full p-3
           border border-[#fafafa1a] text-[#fafafa] rounded-[0.75rem]"
        >
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChangeValues}
            placeholder="Enter your password"
            className="bg-inherit focus:outline-none text-[#fafafa] pl-3 w-full"
          />
          {showPassword ? (
            <IoEyeOffOutline
              onClick={handlePasswordVisibility}
              size={20}
              className="hover:cursor-pointer"
            />
          ) : (
            <IoEyeOutline
              onClick={handlePasswordVisibility}
              size={20}
              className="hover:cursor-pointer"
            />
          )}
        </div>
        {errors.password && (
          <p className="text-red-400 text-sm w-full text-center">
            {errors.password}
          </p>
        )}
        {errorMessage && (
          <p className="text-red-400 text-sm w-full text-center">
            {errorMessage}
          </p>
        )}

        <p className="w-full text-right text-[12px] text-[#fafafa80] hover:text-[#fafafa] hover:underline transition">
          <a href="reset-password">Forgot password?</a>
        </p>

        <button
          disabled={!isValidForm}
          className={`w-full py-3 rounded-[0.75rem] ${
            isValidForm
              ? "bg-[#fafafa] hover:bg-[#fafafa]/90 transition hover:cursor-pointer"
              : "bg-[#a3a3a3]"
          } `}
        >
          {buttonText}
        </button>

        <p className="text-[16px] text-[#fafafa80]">
          {footerText}{" "}
          <a
            href={footerLinkHref}
            className="font-semibold underline text-[#fafafa90]"
          >
            {footerLinkText}
          </a>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
