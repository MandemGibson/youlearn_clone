import { useState } from "react";
import { BiCamera } from "react-icons/bi";
import { CgSpinner } from "react-icons/cg";
import { FaPaperclip } from "react-icons/fa6";
import { IoArrowForward, IoChatbubbleOutline } from "react-icons/io5";
import { IconAndTitle } from "../SideBar";
import { useContent } from "../../../hooks/useContent";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { apiUrl } from "../../../entity";
import ReactMarkdown from "react-markdown";

const Chat = () => {
  const { user } = useAuth();
  const { filename } = useContent();
  const [queries, setQueries] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [learnPlus, setLearnPlus] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleLearnPlus = () => {
    setLearnPlus((prev) => !prev);
  };

  const namespace = user?.id + filename;

  const fetchQuery = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/v1/inference/?model_name=llama-3.3-70b-versatile`,
        {
          query: input,
          namespace: namespace,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data.detail);

      setQueries((prev) => [...prev, input]);
      setResponses((prev) => [...prev, response.data.detail]);

      setInput("");
    } catch (error) {
      console.error("Error fetching query: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="flex flex-col items-center
    justify-between h-full"
    >
      {/* Chat Messages Container */}
      <div className="flex-1 p-2 w-full overflow-y-auto">
        {queries.length > 0 ? (
          <div className="w-full flex-grow-0 overflow-hidden">
            <div className="flex flex-col space-y-4">
              {queries.map((query, index) => (
                <div key={index} className="flex flex-col">
                  <div
                    className="self-end bg-[#fafafa1a] text-white
                   p-2 rounded-lg max-w-xs"
                  >
                    {query}
                  </div>

                  <div
                    className="self-start text-white
                   p-2 rounded-lg max-w-xs mt-2 prose"
                  >
                    <ReactMarkdown>{responses[index] || "..."}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center
            h-full justify-center text-[#525252] space-y-2"
          >
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
        <div
          className="flex flex-col p-2 border border-[#fafafa1a] w-full 
         rounded-2xl text-[#fafafa80]"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="p-2 text-[15px] placeholder:text-[#fafafa90]
            resize-none h-[50px] max-h-[300px] text-[#fafafa] 
            focus:outline-none scrollbar-hide"
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
              <button
                className={`p-1.5 rounded-lg hover:bg-[#fafafa80]/20 hover:cursor-pointer`}
              >
                <BiCamera size={18} color="#fafafa90" />
              </button>
              <button
                className={`p-1.5 rounded-lg hover:bg-[#fafafa80]/20 hover:cursor-pointer`}
              >
                <FaPaperclip
                  size={18}
                  color="#fafafa90"
                  className="-rotate-45"
                />
              </button>
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
