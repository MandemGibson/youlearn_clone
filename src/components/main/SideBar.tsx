import { FaPlus } from "react-icons/fa6";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";

const SideBar = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className="absolute w-full h-full md:max-w-[16rem] z-50
      bg-[#000]/80 md:bg-transparent md:relative"
      onClick={onClick}
    >
      <aside
        className={`relative min-h-screen max-w-[16rem]
      bg-[#121212] ${
        isOpen ? "animate-enter" : "animate-out"
      } shadow-lg flex flex-col text-white
      p-4 px-1 gap-[1rem] border-x border-[#fafafa1a]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3">
          <h2 className="text-xl">uLearn</h2>
          <MdKeyboardDoubleArrowLeft
            size={20}
            className="hover:cursor-pointer"
            onClick={onClick}
          />
        </div>
        <div className="overflow-y-auto flex-1 px-2">
          <div
            className="w-full p-2 flex items-center gap-2 border-2
            border-dashed border-[#fafafa1a] bg-[#fafafa0d] rounded-xl"
          >
            <FaPlus className="w-3 h-3" />
            <p className="text-[14px]">Add content</p>
          </div>

          <div
            className="flex flex-col mt-[32px] gap-[16px] text-[#fafafab2]
          py-1 text-[14px]"
          >
            <h1 className="text-[#fafafa] text-[16px] font-medium">
              Welcome to uLearn
            </h1>
            <h3>An AI tutor personalized to you.</h3>
            <p>
              Understand your files, YouTube video, or recorded lecture through
              our key concepts, familiar learning tools like flashcards, and
              interactive conversations.
            </p>
            <p>
              We're constantly improving the platform, and if you have any
              feedback, we'd love to hear from you.
            </p>
          </div>
        </div>

        <div
          className="w-full left-0 flex flex-col items-center
         justify-end mb-[16px] space-y-3 text-[14px] px-4"
        >
          <h3 className="text-[#fafafa99]">Sign in to continue.</h3>
          <button
            className="py-[.5rem] text-[#171717] rounded-lg
           w-full bg-white"
          >
            Sign in
          </button>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
