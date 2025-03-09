import { IoMenu } from "react-icons/io5";

const MainNav = ({ onClick }: { onClick: () => void }) => {
  return (
    <nav
      className="w-full p-[10px] md:px-[20px] fixed
     border-[#F6F6F6] bg-[#121212] top-0 left-0 z-10"
    >
      {/*Mobile menu*/}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <IoMenu
            size={24}
            color="white"
            className="ml-[10px]"
            onClick={onClick}
          />
          <h2 className="text-xl text-white">uLearn</h2>
        </div>
        <IoMenu
          size={24}
          color="white"
          className="ml-[10px] md:hidden"
          onClick={onClick}
        />
        <div className="flex space-x-2">
          <select
            className="py-[8px] px-[12px] rounded-[0.75rem] border
          border-[#262626] text-white text-sm"
          >
            <option value="US GB">US GB</option>
          </select>
          <button
            className="py-2 px-4 rounded-[0.75rem] bg-[#fafafa]
          text-sm"
          >
            Sign in
          </button>
        </div>
      </div>
      {/*Desktop menu*/}
    </nav>
  );
};

export default MainNav;
