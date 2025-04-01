import { useEffect, useState, useRef, JSX } from "react";
import { useContent } from "../../hooks/useContent";
import { useNavigate } from "react-router-dom";
import {
  Chapters,
  Chat,
  Flashcards,
  Notes,
  Quizzes,
  Summary,
  Wrapper,
} from "../../components";
import { RxDragHandleDots2 } from "react-icons/rx";
import { BsChevronBarLeft, BsChevronBarRight } from "react-icons/bs";
import { IoChatbubbleOutline } from "react-icons/io5";
import { PiBookOpenLight, PiCopySimple, PiNoteDuotone } from "react-icons/pi";
import { LuBookCheck } from "react-icons/lu";
import { TiDocumentText } from "react-icons/ti";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

interface TabOption {
  id: number;
  title: string;
  Icon: React.ComponentType<{ size?: number }>;
}

const tabOptions: TabOption[] = [
  { id: 1, title: "Chat", Icon: IoChatbubbleOutline },
  { id: 2, title: "Flashcards", Icon: PiCopySimple },
  { id: 3, title: "Quizzes", Icon: LuBookCheck },
  { id: 4, title: "Summary", Icon: TiDocumentText },
  { id: 5, title: "Chapters", Icon: PiBookOpenLight },
  { id: 6, title: "Notes", Icon: PiNoteDuotone },
];

const MIN_IFRAME_WIDTH = 30; // Minimum width percentage
const MAX_IFRAME_WIDTH = 70; // Maximum width percentage

const ContentPage: React.FC = () => {
  const { content } = useContent();
  const navigate = useNavigate();
  const resizeRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const [iframeWidth, setIframeWidth] = useState<number>(50);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [tab, setTab] = useState<number>(1);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);
  const [hideFile, setHideFile] = useState(false);

  const renderComponent = (): JSX.Element => {
    switch (tab) {
      case 1:
        return <Chat />;
      case 2:
        return <Flashcards />;
      case 3:
        return <Quizzes />;
      case 4:
        return <Summary />;
      case 5:
        return <Chapters />;
      case 6:
        return <Notes />;
      default:
        return <div>Invalid tab</div>;
    }
  };

  useEffect(() => {
    const handleResize = (): void => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (content === null) navigate("/main");
  }, [content, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (!isResizing || !resizeRef.current) return;

      const container = resizeRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;

      // Calculate the change in position from the start
      const dx = e.clientX - startX;

      // Calculate new width based on initial width and change
      const newWidth = startWidth + (dx / containerWidth) * 100;

      // Apply constraints
      const constrainedWidth = Math.max(
        MIN_IFRAME_WIDTH,
        Math.min(MAX_IFRAME_WIDTH, newWidth)
      );

      setIframeWidth(constrainedWidth);
    };

    const handleMouseUp = (): void => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, startX, startWidth]);

  const startResizing = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();

    // Store initial position and width when dragging starts
    setStartX(e.clientX);
    setStartWidth(iframeWidth);
    setIsResizing(true);

    // Center the cursor on the drag handle
    if (dragHandleRef.current) {
      const handleRect = dragHandleRef.current.getBoundingClientRect();
      const handleCenterX = handleRect.left + handleRect.width / 2;

      // Temporarily hide the handle to prevent cursor jump
      dragHandleRef.current.style.opacity = "0";

      // Move cursor to center of handle
      try {
        document.dispatchEvent(
          new MouseEvent("mousemove", {
            clientX: handleCenterX,
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      } catch (err) {
        console.log("Programmatic mouse movement not supported: ", err);
      }

      // Restore handle visibility
      setTimeout(() => {
        if (dragHandleRef.current) {
          dragHandleRef.current.style.opacity = "1";
        }
      }, 0);
    }
  };

  const toggleFileContainerDisplay = () => {
    setHideFile(!hideFile);
    if (iframeContainerRef.current)
      iframeContainerRef.current.style.display = hideFile ? "none" : "block";
  };

  if (!content) return <p>Loading...</p>;

  return (
    <Wrapper>
      <div className="h-full max-h-screen flex-1 flex flex-col overflow-hidden">
        <div className="w-full h-[60px]"></div>

        <div
          className="flex-1 md:p-[20px] w-full flex flex-col md:flex-row
        md:space-x-[20px] pt-0 overflow-hidden"
          ref={resizeRef}
        >
          {/* iFrame Container */}
          <div
            ref={iframeContainerRef}
            className={`md:h-full flex-shrink-0 h-[55%] md:rounded-lg`}
            style={{
              width: windowWidth > 768 ? `${iframeWidth}%` : "100%",
            }}
          >
            <iframe
              src={content}
              width="100%"
              height="100%"
              className="md:rounded-lg w-full h-full"
              title="Content"
            />
          </div>

          {/* Resizable Divider */}
          {hideFile && (
            <div
              className="hidden md:flex h-full relative border-l cursor-ew-resize
          items-center justify-center border-[#fafafa1a]"
              onMouseDown={startResizing}
            >
              <div className="absolute" ref={dragHandleRef}>
                <RxDragHandleDots2
                  color="white"
                  className="py-0.5 rounded border border-[#fafafa33] bg-[#262626]"
                />
              </div>
            </div>
          )}

          {/* AI Conversation Panel */}
          <div
            className="flex flex-col flex-1 md:max-h-full
          overflow-hidden transition"
            style={{
              width: windowWidth > 768 ? `${100 - iframeWidth}%` : "100%",
            }}
          >
            <div className="flex items-center space-x-2 m-1 md:m-0">
              <button
                className="hidden w-9 h-10 bg-[#fafafa1a] rounded-lg md:flex items-center
              justify-center"
                onClick={toggleFileContainerDisplay}
              >
                {hideFile ? (
                  <BsChevronBarLeft color="#a3a3a3" size={18} />
                ) : (
                  <BsChevronBarRight color="#a3a3a3" size={18} />
                )}
              </button>
              <div
                className={`h-10 ${
                  hideFile ? "justify-between" : ""
                } rounded-lg flex items-center flex-1 bg-[#fafafa1a]
                space-x-2 p-1 overflow-auto scrollbar-hide`}
              >
                {tabOptions.map(({ id, title, Icon }) => (
                  <div
                    key={id}
                    className={`flex-shrink-0 flex items-center justify-center
                    space-x-2 px-2 h-full rounded-md ${
                      tab === id ? "bg-[#121212] text-[#fafafa]" : ""
                    } text-[#a3a3a3] hover:cursor-pointer`}
                    onClick={() => setTab(id)}
                  >
                    <Icon size={16} />
                    <span className="text-[14px]">{title}</span>
                  </div>
                ))}
              </div>
              <button
                className="w-9 h-10 bg-[#fafafa1a] rounded-lg md:hidden items-center
                justify-center flex"
                onClick={toggleFileContainerDisplay}
              >
                {hideFile ? (
                  <FaChevronUp color="#a3a3a3" size={16} />
                ) : (
                  <FaChevronDown color="#a3a3a3" size={16} />
                )}
              </button>
            </div>
            <div className="flex-1 h-full overflow-hidden">
              {renderComponent()}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default ContentPage;
