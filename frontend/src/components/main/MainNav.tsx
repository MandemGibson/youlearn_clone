import { IoMenu } from "react-icons/io5";
import LanguageDropdown from "./LanguageDropdown";
import { Link, useLocation } from "react-router-dom";
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
            className="ml-[10px] hover:cursor-pointer"
            onClick={onClick}
          />
          <Link to={"/main"} className="text-xl text-white font-serif">
            AceMate
          </Link>
        </div>
        <IoMenu
          size={24}
          color="white"
          className="ml-[10px] md:hidden hover:cursor-pointer"
          onClick={onClick}
        />
        {!user ? (
          <div className="flex space-x-2">
            {!isAuthPage && (
              <LanguageDropdown
                onChange={() => console.log("Language changed")}
              />
            )}
            <Link
              to="/login"
              className="py-2 px-4 rounded-[0.75rem] bg-[#fafafa]
              text-sm hover:cursor-pointer"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <Link
            to="/price"
            className="py-2 px-4 rounded-[0.75rem] border-2 border-[#3cb371]
            text-sm text-[#3cb371] shadow-lg shadow-[#3cb371]/20
             hover:cursor-pointer hover:bg-[#3cb371]/20 transition"
          >
            Upgrade
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
