import { useState, useEffect, useRef } from "react";
import { BiCamera } from "react-icons/bi";
import { CgSpinner } from "react-icons/cg";
import { FaPaperclip } from "react-icons/fa6";
import { IoArrowForward, IoChatbubbleOutline, IoStop } from "react-icons/io5";
import { IconAndTitle } from "../SideBar";
import { useContent } from "../../../hooks/useContent";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import ReactMarkdown from "react-markdown";

const Chat = () => {
  const { user } = useAuth();
  const { filename } = useContent();
  const [queries, setQueries] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [learnPlus, setLearnPlus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState<number | null>(
    null
  );
  const [displayedResponse, setDisplayedResponse] = useState<string>("");
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const toggleLearnPlus = () => {
    setLearnPlus((prev) => !prev);
  };

  const namespace = `${user?.id}:${filename}`;

  // Typewriter effect
  useEffect(() => {
    if (currentTypingIndex !== null && responses[currentTypingIndex]) {
      const fullText = responses[currentTypingIndex];
      let currentIndex = 0;
      setDisplayedResponse("");

      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedResponse(fullText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setCurrentTypingIndex(null);
        }
      }, 30); // Adjust speed as needed

      return () => clearInterval(typeInterval);
    }
  }, [currentTypingIndex, responses]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [queries, displayedResponse]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fetchQuery();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "50px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        300
      )}px`;
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
    }
  };

  const fetchQuery = async () => {
    if (!input.trim() || loading) return;

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/v1/search`,
        {
          query: input,
          namespace: namespace,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      console.log(response.data);

      setQueries((prev) => [...prev, input]);
      setResponses((prev) => [...prev, response.data.aiResponse]);
      setCurrentTypingIndex(responses.length); // Start typewriter for new response
      setInput("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "50px";
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request was cancelled");
      } else {
        console.error("Error fetching query: ", error);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const PulsingCircle = () => (
    <div className="flex items-center space-x-2 p-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-[#fafafa80] rounded-full animate-pulse"></div>
        <div
          className="w-2 h-2 bg-[#fafafa80] rounded-full animate-pulse"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-2 h-2 bg-[#fafafa80] rounded-full animate-pulse"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  );

  return (
    <section className="flex flex-col items-center justify-between h-full">
      {/* Chat Messages Container */}
      <div ref={chatContainerRef} className="flex-1 p-2 w-full overflow-y-auto">
        {queries.length > 0 ? (
          <div className="w-full flex-grow-0 overflow-hidden">
            <div className="flex flex-col space-y-4">
              {queries.map((query, index) => (
                <div key={index} className="flex flex-col">
                  <div className="self-end bg-[#fafafa1a] text-white p-2 rounded-lg max-w-xs">
                    {query}
                  </div>

                  <div className="self-start text-white p-2 rounded-lg max-w-xs mt-2 prose">
                    {index === currentTypingIndex ? (
                      <ReactMarkdown>{displayedResponse}</ReactMarkdown>
                    ) : (
                      <ReactMarkdown>{responses[index] || "..."}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {loading && currentTypingIndex === null && <PulsingCircle />}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center h-full justify-center text-[#525252] space-y-2">
            <IoChatbubbleOutline size={46} />
            <h2 className="text-[18px]">Chat with the AI Tutor</h2>
            <p className="text-[14px]">
              Ask anything or use the suggestions below
            </p>
          </div>
        )}
      </div>

      {/* Fixed Input Box */}
      <div className="p-5 md:p-0 w-full flex items-center justify-center">
        <div className="flex flex-col p-2 border border-[#fafafa1a] w-full rounded-2xl text-[#fafafa80]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="p-2 text-[15px] placeholder:text-[#fafafa90] resize-none h-[50px] max-h-[300px] text-[#fafafa] focus:outline-none scrollbar-hide"
          />
          <div className="flex items-center justify-between">
            <div className="flex space-x-[8px]">
              <IconAndTitle
                className="hover:bg-transparent"
                child={
                  <div
                    onClick={toggleLearnPlus}
                    className={`w-8 h-4 flex items-center px-1 rounded-full cursor-pointer transition-colors duration-300 ${
                      learnPlus ? "bg-[#fafafa]" : "bg-[#262626]"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 ${
                        learnPlus ? "bg-[#000]" : "bg-[#121212]"
                      } rounded-full transition-transform duration-300 ${
                        learnPlus ? "translate-x-3.5" : "-translate-x-0.5"
                      }`}
                    />
                  </div>
                }
                title="Learn+"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1.5 rounded-lg hover:bg-[#fafafa80]/20 hover:cursor-pointer">
                <BiCamera size={18} color="#fafafa90" />
              </button>

              {loading ? (
                <button
                  onClick={stopGeneration}
                  className="p-1.5 rounded-lg hover:bg-[#fafafa80]/20 hover:cursor-pointer"
                >
                  <IoStop size={18} color="#fafafa90" />
                </button>
              ) : (
                <button className="p-1.5 rounded-lg hover:bg-[#fafafa80]/20 hover:cursor-pointer">
                  <FaPaperclip
                    size={18}
                    color="#fafafa90"
                    className="-rotate-45"
                  />
                </button>
              )}

              <button
                className={`p-1.5 ${
                  input === "" || loading
                    ? "bg-[#fafafa80] cursor-not-allowed"
                    : "bg-[#fafafa] hover:cursor-pointer"
                } rounded-lg -rotate-90`}
                onClick={fetchQuery}
                disabled={input === "" || loading}
              >
                {loading ? (
                  <CgSpinner size={18} className="animate-spin" />
                ) : (
                  <IoArrowForward size={18} color="black" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chat;
