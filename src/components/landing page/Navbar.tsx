import { useState } from "react";
import { IoMenu } from "react-icons/io5";

const navItems = [
  { id: 1, name: "Features", link: "#features" },
  { id: 2, name: "Pricing", link: "#pricing" },
  { id: 3, name: "Careers", link: "#careers" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  return (
    <nav
      className="w-full py-[16px] px-[20px] md:px-[40px] backdrop-blur-[10px] border-b
     border-[#F6F6F6] bg-white/50 fixed top-0 left-0 z-50"
    >
      {/*Mobile menu*/}
      <div
        className={`flex ${
          isOpen ? "flex-col" : ""
        } justify-between items-center
       md:hidden`}
      >
        {isOpen && (
          <IoMenu
            className={`text-2xl ${isOpen ? "mb-[40px]" : ""}`}
            onClick={toggleMenu}
          />
        )}
        <div className="text-xl font-bold">AceMate</div>
        {/* <img src="" alt="Logo" /> */}
        {!isOpen && <IoMenu className="text-2xl" onClick={toggleMenu} />}

        {isOpen && (
          <>
            <div
              className={`flex flex-col gap-[40px] ${
                isOpen ? "mt-[26px] mb-[40px]" : ""
              }`}
            >
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  className="text-[#6D6D6D] text-[14px]"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <button
              className="w-full bg-black text-white py-[8px] rounded-full
            mb-[40px] hover:cursor-pointer"
            >
              <a href="main">Get Started</a>
            </button>
          </>
        )}
      </div>
      {/*Desktop menu*/}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex items-center gap-[26px]">
          <div className="text-xl font-bold">AceMate</div>
          {/* <img src="" alt="Logo" /> */}
          <ul className="flex gap-[16px]">
            {navItems.map(({ id, link, name }) => (
              <li key={id} className="px-[12px] py-[8px]">
                <a
                  href={link}
                  className="text-[#6D6D6D] text-[14px] transition ease-in delay-75
                   hover:text-[#121212]"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="bg-black text-white px-[12px] py-[8px] 
        rounded-full hover:cursor-pointer text-[14px] transition ease-in delay-75 hover:bg-[#121212]/80"
        >
          <a href="main">Get Started</a>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
