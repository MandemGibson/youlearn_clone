import { IoMenu } from "react-icons/io5";
import LanguageDropdown from "./LanguageDropdown";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const MainNav = ({ onClick }: { onClick: () => void }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isAuthPage = pathname
    .split("/")
    .some(
      (path) =>
        path === "login" ||
        path === "signup" ||
        path === "forgot-password" ||
        path === "reset-password"
    );

  return (
    <nav
      className="w-full p-[10px] md:px-[20px] fixed
     border-[#F6F6F6] bg-[#121212] top-0 left-0 z-10"
    >
      <div className="flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-5">
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
        {!user ? (
          <div className="flex space-x-2">
            {!isAuthPage && <LanguageDropdown />}
            <button
              className="py-2 px-4 rounded-[0.75rem] bg-[#fafafa]
              text-sm hover:cursor-pointer"
            >
              <a href="login">Sign in</a>
            </button>
          </div>
        ) : (
          <button
            className="py-2 px-4 rounded-[0.75rem] border-2 border-[#3cb371]
            text-sm text-[#3cb371] shadow-lg shadow-[#3cb371]/20
             hover:cursor-pointer hover:bg-[#3cb371]/20 transition"
          >
            <a href="login">Upgrade</a>
          </button>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
