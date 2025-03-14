import { FC, useEffect, useState } from "react";
import MainNav from "./MainNav";
import SideBar from "./SideBar";

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [mountSideBar, setMountSideBar] = useState(false);

  useEffect(() => {
    if (showSideBar) setMountSideBar(true);
  }, [showSideBar]);

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
