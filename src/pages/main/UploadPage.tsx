import { useState } from "react";
import { SigninModal, TopicCard, Wrapper } from "../../components";
import { FaPaperclip } from "react-icons/fa6";
import { PiWaveform } from "react-icons/pi";
import { IoArrowForward } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
// import axios from "axios";

const topics = [
  {
    id: 1,
    title: "I Tried TikTok's Lynx - Is It Better Than React Native?",
    thumbnail: "",
  },
  {
    id: 2,
    title: "Mastering Tailwind CSS in 10 Minutes",
    thumbnail: "",
  },
  {
    id: 3,
    title: "Top 5 React Native UI Libraries You Should Know",
    thumbnail: "",
  },
  {
    id: 4,
    title: "Building a Chat App with Expo & Firebase",
    thumbnail: "",
  },
  {
    id: 5,
    title: "What’s New in React 19? A Quick Rundown",
    thumbnail: "",
  },
  {
    id: 6,
    title: "How I Built a Fullstack App with Next.js & Prisma",
    thumbnail: "",
  },
  {
    id: 7,
    title: "Understanding Async/Await in JavaScript",
    thumbnail: "",
  },
  {
    id: 8,
    title: "10 Productivity Tools for Developers in 2025",
    thumbnail: "",
  },
  {
    id: 9,
    title: "How to Use AI to Speed Up Your Coding Workflow",
    thumbnail: "",
  },
  {
    id: 10,
    title: "Is Expo Still Worth Using in 2025?",
    thumbnail: "",
  },
];

const UploadPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const user = null;

  return (
    <Wrapper>
      <div
        className="w-full min-h-screen flex flex-col px-6 
         items-center justify-center overflow-y-auto gap-[40px]
         sm:px-[62px] md:px-[168px] relative p-[100px]
         transition-all duration-300 ease-in"
      >
        <div className="flex flex-col items-center w-full gap-6">
          <h1 className="text-[#fafafa] text-[20px] sm:text-[32px]">
            What do you want to learn today?
          </h1>
          <div
            className="flex flex-col p-2 border-2 border-[#fafafa1a]
            bg-[#17171766] w-full md:w-[70%] rounded-xl text-[#fafafa80]"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Upload file, paste YouTube video, or record a lecture"
              className="p-2 text-[15px] placeholder:text-[#fafafa90] text-[#fafafa] 
               focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex space-x-[8px]">
                <button
                  className="p-2 hover:bg-[#fafafa80]/20 rounded-lg transition
                  hover:cursor-pointer"
                >
                  <FaPaperclip size={20} />
                </button>
                <button
                  className="p-2 hover:bg-[#fafafa80]/20 rounded-lg transition
                  hover:cursor-pointer"
                >
                  <PiWaveform size={20} />
                </button>
              </div>
              <button
                className={`p-2 ${
                  inputValue == ""
                    ? "bg-[#fafafa80]"
                    : "bg-[#fafafa] hover:cursor-pointer"
                } rounded-lg`}
              >
                <IoArrowForward size={20} color="black" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-3">
          <h2 className="text-[#fafafa] text-[16px]">My spaces</h2>
          <button
            className="w-full sm:max-w-max p-[14px] flex items-center gap-2
               border-2 text-white border-dashed border-[#fafafa1a]
             bg-[#17171766] rounded-xl sm:pr-[10rem] md:pr-[20rem] hover:cursor-pointer
             hover:bg-[#fafafa0d]"
            onClick={() => (user === null ? setOpenModal(true) : undefined)}
          >
            <FaPlus className="w-4 h-4" />
            <p className="text-[16px]">Add space</p>
          </button>
        </div>

        <div className="flex flex-col w-full space-y-3">
          <h2 className="text-[#fafafa] text-[16px]">Explore topics</h2>
          <div
            className="flex pb-2 gap-6 w-full overflow-x-auto scrollbar-hide"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)",
              maskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)",
            }}
          >
            {topics.map(({ id, ...rest }) => (
              <TopicCard key={id} {...rest} />
            ))}
          </div>
        </div>
      </div>
      {openModal && <SigninModal onClose={() => setOpenModal(false)} />}
    </Wrapper>
  );
};

export default UploadPage;
