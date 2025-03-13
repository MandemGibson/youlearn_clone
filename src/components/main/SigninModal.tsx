import { IoIosClose } from "react-icons/io";

const SigninModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 h-full w-full backdrop-blur-md flex items-center
       justify-center z-50 bg-[#000]/80"
    >
      <div
        className="w-full space-y-[6px] bg-[#0a0a0a] p-6 text-center
      border border-[#262626] sm:max-w-max sm:text-left rounded-[12px] relative"
      >
        <IoIosClose
          onClick={onClose}
          color="#a3a3a3"
          size={24}
          className="absolute right-3 top-3 hover:cursor-pointer"
        />
        <h1 className="font-manrope font-medium text-[18px] text-[#a3a3a3]">
          Sign in or create an account
        </h1>
        <p className="text-[14px] text-[#a3a3a3] sm:mb-[18px]">
          You need to sign in to access this content. Please sign in and try
          again.
        </p>
        <div
          className="flex flex-col sm:flex-row-reverse w-full space-y-[12px]
        items-center sm:space-y-0 sm:justify-start sm:gap-[10px] sm:mb-[10px]"
        >
          <button
            className="py-2 px-4 sm:py-3 rounded-[0.75rem] bg-[#fafafa]
          text-sm w-full sm:max-w-max hover:cursor-pointer"
          >
            Sign in
          </button>
          <button
            className="py-2 px-4 sm:py-3 rounded-[0.75rem] bg-[#262626]
          text-sm w-full sm:max-w-max text-[#fafafa] hover:cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SigninModal;
