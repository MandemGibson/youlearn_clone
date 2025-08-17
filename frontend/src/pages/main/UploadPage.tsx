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
import supabase from "../../utils/supabase";

const UploadPage = () => {
  const { user } = useAuth();
  const { setContent, setFilename, setYoutubeVideoId } = useContent();

  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    const fetchYTVideos = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/v1/educational-channels"
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
      } finally {
        setIsFetching(false);
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

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    return null;
  };

  const checkExistingUpload = async (namespace: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("upload")
        .select("*")
        .eq("namespace", namespace)
        .eq("userId", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error checking existing upload:", error);
      throw error;
    }
  };

  // Function to save upload to Supabase
  const saveUploadToSupabase = async (uploadData: {
    type: string;
    filename: string;
    namespace: string;
    source_url?: string;
    file_size?: number;
    file_url?: string;
  }) => {
    try {
      // Get the current user's auth ID
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("User not authenticated");
      }

      // Check if upload already exists
      const existingUpload = await checkExistingUpload(
        uploadData.namespace,
        authUser.id
      );

      if (existingUpload) {
        console.log("Upload already exists:", existingUpload);
        // Update the existing record if needed (e.g., status, updated_at)
        const { data: updatedData, error: updateError } = await supabase
          .from("upload")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("uploadId", existingUpload.uploadId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return updatedData;
      }

      // Create new upload record if it doesn't exist
      const { data, error } = await supabase
        .from("upload")
        .insert([
          {
            type: uploadData.type,
            filename: uploadData.filename,
            namespace: uploadData.namespace,
            source_url: uploadData.source_url || null,
            file_size: uploadData.file_size || null,
            file_url: uploadData.file_url || null,
            userId: authUser.id,
            status: "completed",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error saving upload to Supabase:", error);
        throw error;
      }

      console.log("New upload saved to Supabase:", data);
      return data;
    } catch (error) {
      console.error("Error in saveUploadToSupabase:", error);
      throw error;
    }
  };

  // Function to update upload status
  const updateUploadStatus = async (
    uploadId: string,
    status: "processing" | "completed" | "failed"
  ) => {
    try {
      const { error } = await supabase
        .from("upload")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("uploadId", uploadId);

      if (error) {
        console.error("Error updating upload status:", error);
      }
    } catch (error) {
      console.error("Error in updateUploadStatus:", error);
    }
  };

  const handleSubmitInput = async () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a YouTube URL or video ID");
      return;
    }

    if (!user) {
      setOpenModal(true);
      return;
    }

    const videoId = extractYouTubeVideoId(inputValue);

    if (!videoId) {
      toast.error("Please enter a valid YouTube URL or video ID");
      return;
    }

    setIsLoading(true);

    // First, create a pending upload record
    let uploadRecord: any = null;

    try {
      const namespace = `${user.id}:${videoId}`;

      // Save upload as processing first
      uploadRecord = await saveUploadToSupabase({
        type: "youtube",
        filename: `YouTube Video: ${videoId}`,
        namespace: namespace,
        source_url: videoId,
      });

      const response = await axios.post(
        `http://localhost:5000/v1/process/link`,
        {
          source_url: videoId,
          namespace: namespace,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      // Update status to completed
      if (uploadRecord) {
        await updateUploadStatus(uploadRecord.uploadId, "completed");
      }

      setYoutubeVideoId(videoId);
      setFilename(`${videoId}`);
      setContent(null);
      // dispatch(setGeneratedForNamespace(namespace));
      navigate("/content");
    } catch (error: any) {
      console.error("Error processing YouTube video:", error);

      // Update status to failed if we have an upload record
      if (uploadRecord) {
        await updateUploadStatus(uploadRecord.uploadId, "failed");
      }

      toast.error("Could not process YouTube video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);

    let uploadRecord: any = null;

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

      const namespace = `${user?.id}:${selectedFile.name}`;

      // Save upload as processing first
      uploadRecord = await saveUploadToSupabase({
        type: "pdf",
        filename: selectedFile.name,
        namespace: namespace,
        file_size: selectedFile.size,
      });

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        `http://localhost:5000/v1/process/doc?namespace=${namespace}`,
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

      // Update status to completed
      if (uploadRecord) {
        await updateUploadStatus(uploadRecord.uploadId, "completed");
      }

      // Clear YouTube video ID when uploading a file
      setYoutubeVideoId(null);
      setFile(URL.createObjectURL(selectedFile));
    } catch (error: any) {
      console.error("Error uploading file:", error);

      // Update status to failed if we have an upload record
      if (uploadRecord) {
        await updateUploadStatus(uploadRecord.uploadId, "failed");
      }

      toast.error("Could not upload file. Please try again.");
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
         transition-all duration-300 ease-in max-w-[1200px] mx-auto"
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
               focus:outline-none bg-transparent"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmitInput();
                }
              }}
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
                onClick={handleSubmitInput}
                disabled={isLoading || !inputValue.trim()}
                className={`p-2 ${
                  inputValue.trim() === "" || isLoading
                    ? "bg-[#fafafa80] cursor-not-allowed"
                    : "bg-[#fafafa] hover:cursor-pointer hover:bg-[#fafafa]/90"
                } rounded-lg transition`}
              >
                {isLoading ? (
                  <CgSpinner className="animate-spin" size={20} color="black" />
                ) : (
                  <IoArrowForward size={20} color="black" />
                )}
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
            {isFetching &&
              [...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="w-[calc(72%-13px)] max-w-[250px] p-[6px] border border-[#fafafa1a]
                    bg-[#17171766] rounded-xl sm:min-h-[250px] min-h-[200px] md:min-w-[300px] animate-pulse"
                ></div>
              ))}
            {!isFetching &&
              topics.map(({ id, ...rest }) => <TopicCard key={id} {...rest} />)}
          </div>
        </div>
      </div>
      {openModal && <SigninModal onClose={() => setOpenModal(false)} />}
    </Wrapper>
  );
};

export default UploadPage;
