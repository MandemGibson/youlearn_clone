/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useState } from "react";
import { SigninModal, TopicCard, Wrapper } from "../../components";
import { FaPaperclip } from "react-icons/fa6";
import { PiWaveform } from "react-icons/pi";
import { IoArrowForward } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { useAuth } from "../../hooks/useAuth";
import { useContent } from "../../hooks/useContent";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";
import { apiUrl } from "../../entity";

const UploadPage = () => {
  const { user } = useAuth();
  const { setContent, setFilename } = useContent();

  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    const fetchYTVideos = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/youtube-videos"
        );

        const data = response.data;
        console.log(data);

        if (response.status === 200) {
          const videoData = response.data.items.map((video: any) => ({
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.high.url,
          }));
          setTopics(videoData);
        } else {
          toast.error("Failed to fetch videos");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchYTVideos();
  }, []);

  useEffect(() => {
    if (file !== null) {
      setContent(file);
      navigate("/content");
    }
  }, [file, user, navigate, setContent]);

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    try {
      const selectedFile = event.target.files ? event.target.files[0] : null;

      if (!selectedFile || selectedFile.type !== "application/pdf") {
        alert("Please upload a valid PDF file.");
        return;
      }

      if (!user) {
        setOpenModal(true);
        return;
      }

      setFilename(selectedFile.name);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const namespace = user?.id + selectedFile.name;

      const response = await axios.post(
        `${apiUrl}/v1/process/doc?namespace=${encodeURIComponent(namespace)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!(response.status == 200)) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.data;
      console.log("File uploaded successfully:", result);

      setFile(URL.createObjectURL(selectedFile));
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
                <label
                  htmlFor="file"
                  className="p-2 hover:bg-[#fafafa80]/20 rounded-lg transition
                hover:cursor-pointer"
                >
                  {isLoading ? (
                    <CgSpinner className="animate-spin" />
                  ) : (
                    <FaPaperclip size={20} />
                  )}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUploadFile}
                  id="file"
                  className="sr-only"
                />
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
