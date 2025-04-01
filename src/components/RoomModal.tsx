import { FC } from "react";
import { IoIosClose } from "react-icons/io";

type RoomModalProps = {
  onClose: () => void;
};

const RoomModal: FC<RoomModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 flex items-center 
      justify-center bg-[#000]/80 bg-opacity-50"
    >
      <div
        className="bg-[#0a0a0a] p-6 rounded-2xl shadow-lg
      border border-[#262626] text-[#a3a3a3] flex
      flex-col gap-10 relative"
      >
        <IoIosClose
          onClick={onClose}
          color="#a3a3a3"
          size={24}
          className="absolute right-3 top-3 hover:cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-medium text-[#fafafa]">uLearn</h2>
          <p className="text-[14px]">Create or join a room</p>
        </div>

        <div className="p-5 rounded-lg space-y-5 border border-[#262626]">
          <div>
            <h2 className="text-[#fafafa]">Create a new room</h2>
            <p className="text-[12px]">
              Start a new meeting and invite others to join
            </p>
          </div>
          <form className="flex flex-col gap-4">
            <input
              type="text"
              //   value={roomId}
              //   onChange={(e) => setRoomId(e.target.value)}
              placeholder="Give your room a name"
              required
              className="flex-1 p-2 border text-[14px] rounded-md
              focus:ring-3 border-[#262626]"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#262626] text-[#fafafa]
              text-[14px] rounded-md hover:cursor-pointer"
            >
              Create Room
            </button>
          </form>
        </div>

        <div className="p-5 rounded-lg space-y-5 border border-[#262626]">
          <div>
            <h2 className="text-[#fafafa]">Join a room</h2>
            <p className="text-[12px]">
              Enter a room code to join an existing meeting
            </p>
          </div>
          <form className="flex space-x-2">
            <input
              type="text"
              //   value={roomId}
              //   onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room code"
              required
              className="flex-1 p-2 border text-[14px] rounded-md
              focus:ring-3 border-[#262626]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#262626] text-[#fafafa]
              text-[14px] rounded-md hover:cursor-pointer"
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
