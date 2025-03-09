import { useState, useEffect } from "react";
import { MainNav, SideBar } from "../../components";

const UploadPage = () => {
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
          <SideBar isOpen={showSideBar} onClick={handleShowSideBar} />
        )}
        {/* Your content here */}
        <div className="w-full h-full flex flex-col
         items-center justify-center overflow-y-auto">
          <h1 className="text-white">Upload Page</h1>
        </div>
      </div>
    </main>
  );
};

export default UploadPage;
