import { BiArrowBack, BiCopy } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../../hooks/useRoom";
import { Chat } from "../../components";
import { useState, useEffect, useRef } from "react";
import { GoMute, GoUnmute } from "react-icons/go";
import { CiVideoOn, CiVideoOff } from "react-icons/ci";

const Room = () => {
  const { id } = useParams();
  const { rooms } = useRoom();
  const navigate = useNavigate();

  const [file, setFile] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(userStream);

        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getUserMedia();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        // Enable or disable the video track based on `videoOn` state
        videoTrack.enabled = videoOn;

        // Reassign the srcObject to ensure the video plays when enabled
        if (videoRef.current && videoTrack.enabled) {
          videoRef.current.srcObject = stream;
        }
      }
    }
  }, [videoOn, stream]);

  const handleToggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    setVideoOn((prev) => !prev);
  };

  const handleCopyRoomID = () => {
    if (rooms.length) {
      const room = rooms.find((room) => room.roomId === id);
      if (room?.roomId) {
        navigator.clipboard.writeText(room.roomId);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
      }
    }
  };

  const handleCloseRoom = () => {
    setStream(null);
    navigate("/main");
  };

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-[#121212] flex flex-col">
      <div className="flex z-20 relative items-center justify-between p-3">
        <button
          onClick={handleCloseRoom}
          className="flex items-center justify-center p-2 px-5 space-x-3
           rounded-lg border border-[#a3a3a3] text-[#fafafa]
            hover:cursor-pointer hover:bg-[#fafafa0d] bg-[#121212]"
        >
          <BiArrowBack />
          <span>Close Room</span>
        </button>
        <p className="text-[#fafafa] text-center">
          {rooms.find((room) => room.roomId === id)?.name}
        </p>
        <button
          onClick={handleCopyRoomID}
          className="flex items-center justify-center p-2 px-5 space-x-3 
          rounded-lg border border-[#a3a3a3] text-[#fafafa] hover:cursor-pointer
           hover:bg-[#fafafa0d] bg-[#121212]"
        >
          <span>{isCopied ? "Copied!" : "Copy Room ID"}</span>
          <BiCopy />
        </button>
      </div>

      <div className="w-full h-full flex items-center">
        <div className="flex-1 flex flex-col h-full p-5">
          <div className="flex-1 rounded-lg flex items-center justify-center border border-[#fafafa1a] bg-[#fafafa0d]">
            {file ? (
              <iframe
                src={file}
                className="w-full h-full rounded-lg"
                title="Uploaded Content"
              />
            ) : (
              <label className="flex flex-col items-center justify-center p-5 border border-dashed border-[#fafafa3a] rounded-lg cursor-pointer">
                <span className="text-[#fafafa]">Upload or Drag File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      const uploadedFile = e.target.files[0];
                      setFile(URL.createObjectURL(uploadedFile));
                    }
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex-1 h-full">
            <Chat />
          </div>
        </div>

        {/* User Video */}
        <div
          className="absolute top-0 z-0 min-w-[210px] h-50 md:static flex-1 grid grid-cols-1
         md:h-full p-5 gap-5"
        >
          <div
            className="relative rounded-xl border border-[#fafafa1a] bg-[#1e1e1e] flex items-center
           justify-center overflow-hidden group"
          >
            {videoOn ? (
              <video
                ref={videoRef}
                className="w-full h-full bg-black rounded-lg"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div
                className="flex flex-col items-center space-y-3 w-full h-full
              justify-center"
              >
                <div
                  className="w-15 h-15 rounded-full bg-white
                  text-center flex items-center justify-center"
                >
                  MG
                </div>
              </div>
            )}

            {/* Controls (Shown on Hover) */}
            <div className="absolute inset-0 flex items-center justify-center space-x-5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleToggleMute}
                className="bg-[#00000099] p-2 rounded-full"
              >
                {isMuted ? (
                  <GoMute color="white" size={28} />
                ) : (
                  <GoUnmute color="white" size={28} />
                )}
              </button>
              <button
                onClick={handleToggleVideo}
                className="bg-[#00000099] p-2 rounded-full"
              >
                {videoOn ? (
                  <CiVideoOff color="white" size={28} />
                ) : (
                  <CiVideoOn color="white" size={28} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Room;
