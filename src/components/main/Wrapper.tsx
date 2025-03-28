import { FC, useEffect, useState } from "react";
import MainNav from "./MainNav";
import SideBar from "./SideBar";

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [mountSideBar, setMountSideBar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) {
      setShowSideBar(true);
    } else {
      setShowSideBar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  useEffect(() => {
    if (showSideBar) {
      setMountSideBar(true);
    }
    if (showSideBar && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showSideBar, isMobile]);

  const handleShowSideBar = () => {
    if (showSideBar) {
      setShowSideBar(false);

      setTimeout(() => setMountSideBar(false), 300);
    } else {
      setShowSideBar(true);
    }
  };

  return (
    <main className="min-h-screen flex relative bg-[#121212]">
      <MainNav onClick={handleShowSideBar} />
      <div className="w-full flex">
        {mountSideBar && (
          <div className={`${showSideBar ? "md:w-[16rem]" : "w-0 md:w-[0]"}`}>
            <SideBar isOpen={showSideBar} onClick={handleShowSideBar} />
          </div>
        )}
        {children}
      </div>
    </main>
  );
};

export default Wrapper;
