"use client";
import { ReactNode, useState } from "react";
import { IconType } from "react-icons";
import { AiOutlineDiscord } from "react-icons/ai";
import { FaRegThumbsUp } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FiBook, FiDollarSign } from "react-icons/fi";
import { GoHistory } from "react-icons/go";
import { IoIosArrowForward, IoIosMore } from "react-icons/io";
import { IoChevronDown, IoSettingsOutline } from "react-icons/io5";
import { LuCrown, LuLogOut } from "react-icons/lu";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";

const SideBar = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const user = true;

  return (
    <div
      className="absolute w-full h-full md:max-w-[16rem] z-50
      bg-[#000]/80 md:bg-transparent sm:fixed"
      onClick={onClick}
    >
      <aside
        className={`relative h-screen max-w-[16rem]
        bg-[#121212] ${
          isOpen ? "animate-enter" : "animate-out"
        } shadow-lg flex flex-col text-white
        border-x border-[#fafafa1a]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 px-3">
          <h2 className="text-xl">uLearn</h2>
          <MdKeyboardDoubleArrowLeft
            size={20}
            className="hover:cursor-pointer"
            onClick={onClick}
          />
        </div>

        <div className="flex-1 scrollbar-thin overflow-y-auto px-3 pb-2">
          <div
            className="w-full p-2 flex items-center gap-2 border-2
            border-dashed border-[#fafafa1a] bg-[#fafafa0d] rounded-xl"
          >
            <FaPlus className="w-3 h-3" />
            <p className="text-[14px]">Add content</p>
          </div>

          {!user ? (
            <div
              className="flex flex-col mt-[32px] gap-[16px] text-[#fafafab2]
              py-1 text-[14px]"
            >
              <h1 className="text-[#fafafa] text-[16px] font-medium">
                Welcome to uLearn
              </h1>
              <h3>An AI tutor personalized to you.</h3>
              <p>
                Understand your files, YouTube video, or recorded lecture
                through our key concepts, familiar learning tools like
                flashcards, and interactive conversations.
              </p>
              <p>
                We're constantly improving the platform, and if you have any
                feedback, we'd love to hear from you.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-[24px] mt-[24px]">
              <div className="flex items-center gap-[8px]">
                <GoHistory size={16} />
                <p className="text-[14px] text-[#fafafacc]">History</p>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px]">
                <h2 className="text-[#fafafa] font-semibold">Recents</h2>
                <p className="text-[#fafafa99]">
                  Upload files or paste YouTube links to view content here.
                </p>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px]">
                <h2 className="text-[#fafafa] font-semibold">Spaces</h2>
                <div className="flex flex-col gap-[4px]">
                  <div
                    className="w-full p-2 flex items-center gap-2 border-2
                  border-dashed border-[#fafafa1a] hover:bg-[#fafafa0d]
                  hover:cursor-pointer rounded-xl"
                  >
                    <FaPlus className="w-3 h-3" />
                    <p className="text-[14px]">Add space</p>
                  </div>
                  <div
                    className="w-full p-2 flex items-center justify-between
                    hover:bg-[#fafafa0d] hover:cursor-pointer rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <IoIosArrowForward />
                      <p className="text-[14px]">Philip's Space</p>
                    </div>
                    <IoIosMore />
                  </div>
                </div>
              </div>
              <div className="text-[14px] flex flex-col gap-[14px]">
                <h2 className="text-[#fafafa] font-semibold">Help & Tools</h2>
                <IconAndTitle Icon={FaRegThumbsUp} title="Feedback" />
                <IconAndTitle Icon={FiBook} title="Quick Guide" />
                <IconAndTitle Icon={AiOutlineDiscord} title="Discord Server" />
                <IconAndTitle Icon={FiDollarSign} title="Invite & Earn" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 pb-6">
          {!user ? (
            <div className="flex flex-col items-center space-y-3 text-[14px]">
              <h3 className="text-[#fafafa99]">Sign in to continue.</h3>
              <button
                className="py-[.5rem] text-[#171717] rounded-lg
                w-full bg-white"
              >
                Sign in
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div
                className="border border-[#3cb371] text-[#3cb371]
              text-[12px] bg-gradient-to-b from-[#3cb37133] to-[#3cb3710d]
              border-b-0 rounded-lg rounded-b-none w-[90%] flex items-center
              justify-center"
              >
                Free Plan
              </div>
              <Dropdown />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const IconAndTitle = ({
  Icon,
  title,
  child,
}: {
  Icon?: IconType;
  title: string;
  child?: ReactNode;
}) => {
  return (
    <div
      className="flex items-center gap-2 hover:bg-[#fafafa0d] hover:cursor-pointer
    p-2 rounded-lg"
    >
      {child}
      {Icon && <Icon size={16} />}
      <p className="text-[14px]">{title}</p>
    </div>
  );
};

const Dropdown = () => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  return (
    <div className={`w-full relative text-white text-sm`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-1 border
        border-[#fafafa33] py-[12px] px-4 rounded-[0.75rem] hover:bg-[#fafafa0d]
        hover:cursor-pointer`}
      >
        themaingib@gmail.com
        <IoChevronDown
          className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
          border border-[#262626] w-full rounded-[0.75rem] z-50
          overflow-y-auto scrollbar-hide bg-[#000] flex flex-col`}
        >
          <div className="p-1 pb-0">
            <div
              className="p-2 flex items-center gap-3 rounded-lg
            hover:bg-[#fafafa0d] hover:cursor-pointer"
            >
              <div className="w-[32px] h-[32px] rounded-full bg-white"></div>
              <h3 className="text-[14px] text-[#fafafa]">
                Philip Gibson Cudjoe
              </h3>
            </div>
          </div>
          <div className="p-1">
            <IconAndTitle Icon={IoSettingsOutline} title="Settings" />
            <IconAndTitle Icon={LuCrown} title="Pricing" />
            <IconAndTitle Icon={GoHistory} title="History" />
            <IconAndTitle
              child={
                <div
                  onClick={toggleDarkMode}
                  className={`w-8 h-4 flex items-center px-1 rounded-full cursor-pointer transition-colors duration-300 ${
                    darkMode ? "bg-[#fafafa]" : "bg-[#e5e5e5]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 ${darkMode ? "bg-[#000]" : "bg-[#fff]"} rounded-full transition-transform duration-300 ${
                      darkMode ? "translate-x-3.5" : "-translate-x-0.5"
                    }`}
                  />
                </div>
              }
              title="Dark Mode"
            />
          </div>
          <div className="p-1 border-t border-[#262626]">
            <IconAndTitle Icon={LuLogOut} title="Log out" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
