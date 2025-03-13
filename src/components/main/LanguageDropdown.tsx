import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";

const languages = [
  { code: "US GB", name: "English" },
  { code: "IN", name: "Hindi" },
  { code: "ZA", name: "Afrikaans" },
  { code: "AE", name: "Arabic" },
  { code: "BG", name: "Bulgarian" },
  { code: "CN", name: "Chinese" },
  { code: "DK", name: "Danish" },
  { code: "NL", name: "Dutch" },
  { code: "FI", name: "Finnish" },
];

const LanguageDropdown = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);

  const handleSelect = (lang: (typeof languages)[0]) => {
    setSelected(lang);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else document.body.style.overflow = "auto";
  }, [open]);

  return (
    <div className="relative text-white text-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-1 border
        border-[#262626] py-2 px-4 rounded-[0.75rem]"
      >
        {selected.code}
        <IoChevronDown
          className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-[#000] border
        border-[#262626] w-max rounded-[0.75rem] shadow-lg z-50 max-h-[300px] overflow-y-auto
        scrollbar-hide"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className={`flex w-full justify-start px-4 py-2 text-left hover:bg-[#1e1e1e] ${
                selected.code === lang.code
                  ? "text-white font-medium"
                  : "text-[#a3a3a3]"
              } items-center space-x-1`}
            >
              <FaCheck
                size={12}
                className={`${
                  selected.code == lang.code ? "visible" : "invisible"
                }`}
              />
              <p>
                {lang.code} {lang.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
