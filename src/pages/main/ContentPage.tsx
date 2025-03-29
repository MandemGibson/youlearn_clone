import { useEffect, useState } from "react";
import { useContent } from "../../hooks/useContent";
import { useNavigate } from "react-router-dom";
import { Wrapper } from "../../components";
import { RxDragHandleDots2 } from "react-icons/rx";
import { BsChevronBarLeft } from "react-icons/bs";
import { IoChatbubbleOutline } from "react-icons/io5";
import { PiBookOpenLight, PiCopySimple, PiNoteDuotone } from "react-icons/pi";
import { LuBookCheck } from "react-icons/lu";
import { TiDocumentText } from "react-icons/ti";

const tabOptions = [
  { id: 1, title: "Chat", Icon: IoChatbubbleOutline },
  { id: 2, title: "Flashcards", Icon: PiCopySimple },
  { id: 3, title: "Quizzes", Icon: LuBookCheck },
  { id: 4, title: "Summary", Icon: TiDocumentText },
  { id: 5, title: "Chapters", Icon: PiBookOpenLight },
  { id: 6, title: "Notes", Icon: PiNoteDuotone },
];

const ContentPage = () => {
  const { content } = useContent();
  const navigate = useNavigate();
  const iframeWidth = 50;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [tab, setTab] = useState(1);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (content === null) navigate("/main");
  }, [content, navigate]);

  if (!content) return <p>Loading...</p>;

  return (
    <Wrapper>
      <div className="h-full flex-1 flex flex-col">
        <div className="w-full h-[60px]"></div>

        <div
          className="flex-1 md:p-[20px] w-full flex flex-col md:flex-row
        md:space-x-[20px] pt-0 shrink-0"
        >
          {/* iFrame Container */}
          <div
            className="md:h-full h-[50%] md:rounded-lg"
            style={{
              width: windowWidth ? `${iframeWidth}%` : "100%",
            }}
          >
            <iframe
              src={content}
              width="100%"
              draggable
              height="100%"
              className="md:rounded-lg w-full h-full"
            />
          </div>

          {/* Resizable Divider */}
          <div
            className="hidden md:flex h-full relative border-l cursor-ew-resize
          items-center justify-center border-[#fafafa1a]"
          >
            <div className="absolute ">
              <RxDragHandleDots2
                color="white"
                className="py-0.5 rounded border border-[#fafafa33] bg-[#262626]"
              />
            </div>
          </div>

          {/* AI Conversation Panel */}
          <div className="h-full flex flex-col flex-1 bg-transparent rounded-lg">
            <div className="flex items-center space-x-2">
              <button
                className="w-9 h-10 bg-[#fafafa1a] rounded-lg flex items-center
              justify-center"
              >
                <BsChevronBarLeft color="#a3a3a3" size={18} />
              </button>
              <div
                className="h-10 w-0 rounded-lg flex items-center flex-1 bg-[#fafafa1a]
                space-x-2 p-1 overflow-auto scrollbar-hide"
              >
                {tabOptions.map(({ id, title, Icon }) => (
                  <div
                    key={id}
                    className={`flex-shrink-0 flex items-center justify-center
                    space-x-2 px-2 h-full rounded-md ${
                      tab === id ? "bg-black text-white" : ""
                    } text-[#a3a3a3] hover:cursor-pointer`}
                    onClick={() => setTab(id)}
                  >
                    <Icon size={16} />
                    <span className="text-[14px]">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default ContentPage;
