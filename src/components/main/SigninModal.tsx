const SigninModal = () => {
  return (
    <div
      className="absolute h-full w-full backdrop-blur-md flex items-center
       justify-center z-50 bg-[#000]/80"
    >
      <div className="w-full space-y-[6px] bg-[#0a0a0a] p-6 text-center">
        <h1 className="font-manrope font-medium text-[18px] text-white">
          Sign in or create an account
        </h1>
        <p className="text-[14px] text-[#a3a3a3]">
          You need to sign in to access this content. Please sign in and try
          again.
        </p>
        <div className="flex flex-col w-full">
          <button
            className="py-2 px-4 rounded-[0.75rem] bg-[#fafafa]
          text-sm w-full"
          >
            Sign in
          </button>
          <button
            className="py-2 px-4 rounded-[0.75rem] bg-[#fafafa]
          text-sm w-full"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SigninModal;
