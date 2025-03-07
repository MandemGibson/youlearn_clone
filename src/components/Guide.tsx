import GuideCard from "./GuideCard";
import { BiSolidComment } from "react-icons/bi";
import { MdFileUpload } from "react-icons/md";
import summary from "../assets/summary.avif";
import { RiAiGenerate } from "react-icons/ri";
import { TbCaptureFilled } from "react-icons/tb";

const guides = [
  {
    id: 1,
    Icon: BiSolidComment,
    title: "Summary, chat, voice mode, and more.",
    desc: "Understand the key points, ask questions with content references, and talk with an AI tutor.",
    src: summary,
  },
  {
    id: 2,
    Icon: MdFileUpload,
    title: "Upload any content",
    desc: "From PDFs and YouTube videos to slides and even recorded lectures, learn everything your way.",
  },
  {
    id: 3,
    Icon: RiAiGenerate,
    title: "Test your knowledge",
    desc: "Create and customize flashcards: edit, delete, star, view sources, and more.",
  },
  {
    id: 4,
    Icon: TbCaptureFilled,
    title: "Sources Included",
    desc: "Retrieve accurate and contextual information from your content.",
  },
];

const Guide = () => {
  return (
    <section
      className="flex flex-col items-center mx-auto 
      px-[20px] mt-[80px] gap-[32px]"
    >
      <div>
        <h1 className="text-[28px] text-center text-[#121212] font-medium">
          Understand and learn at ease
        </h1>
        <p className="text-center text-[18px] text-[#6d6d6d] pt-[24px] pb-[32px]">
          From key takeaways to specific questions, we've got you covered
        </p>
      </div>
      {guides.map(({ id, ...rest }) => (
        <GuideCard key={id} {...rest} />
      ))}
    </section>
  );
};

export default Guide;
