import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { useAuth } from "../hooks/useAuth";
import { useRoom } from "../hooks/useRoom";
import { toast } from "react-toastify";

type RoomModalProps = {
  onClose: () => void;
};

const RoomModal: React.FC<RoomModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms } = useRoom();
  const [isLoading, setIsLoading] = useState({
    creating: false,
    joining: false,
  });
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase(); // 5-character ID
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = generateRoomId();

    setIsLoading((prev) => ({ ...prev, creating: true }));
    try {
      const { data, error } = await supabase
        .from("room")
        .insert([{ roomId: id, name: roomName, userId: user?.id }]);

      if (error) {
        console.error("Error creating room:", error);
        return;
      }
      console.log(data);

      navigate(`/room/${id}`);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  const handleJoinRoom = () => {
    setIsLoading((prev) => ({ ...prev, joining: true }));
    try {
      const roomExist = rooms.some((room) => room.roomId === roomId);
      if (roomExist) navigate(`/room/${roomId}`);
      else
        toast.warn("Room does not exist. Create a new room or enter a new ID");
    } catch (error) {
      console.error("Error joining room: ", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, joining: false }));
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 flex items-center justify-center bg-[#000]/80"
    >
      <div className="bg-[#0a0a0a] p-6 rounded-2xl shadow-lg border border-[#262626] text-[#a3a3a3] flex flex-col gap-10 relative">
        <IoIosClose
          onClick={onClose}
          size={24}
          className="absolute right-3 top-3 cursor-pointer"
        />

        <div className="text-center">
          <h2 className="text-xl font-medium text-[#fafafa]">uLearn</h2>
          <p className="text-[14px]">Create or join a room</p>
        </div>

        {/* Create Room */}
        <div className="p-5 rounded-lg space-y-5 border border-[#262626]">
          <h2 className="text-[#fafafa]">Create a new room</h2>
          <p className="text-[12px]">Start a new meeting and invite others</p>
          <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room Name"
              required
              className="p-2 border text-[14px] rounded-md border-[#262626]"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#262626] text-[#fafafa] rounded-md
              hover:cursor-pointer"
            >
              {isLoading.creating ? "Creating..." : "Create Room"}
            </button>
          </form>
        </div>

        {/* Join Room */}
        <div className="p-5 rounded-lg space-y-5 border border-[#262626]">
          <h2 className="text-[#fafafa]">Join a room</h2>
          <p className="text-[12px]">Enter a room code to join a meeting</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinRoom();
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room code"
              required
              className="p-2 border text-[14px] rounded-md border-[#262626]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#262626] text-[#fafafa] rounded-md
              hover:cursor-pointer"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
