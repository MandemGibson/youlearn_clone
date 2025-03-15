import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";

export type DropdownOption = {
  code: string;
  name: string;
};

interface DropdownProps {
  options: DropdownOption[];
  selected: DropdownOption;
  onSelect: (option: DropdownOption) => void;
  className?: string;
  parentWidth?: string;
  position?: "top" | "bottom" 
}

const Dropdown = ({
  options,
  selected,
  onSelect,
  className,
  parentWidth,
  position="bottom"
}: DropdownProps) => {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  };
  const [open, setOpen] = useState(false);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <div className={`${parentWidth} relative text-white text-sm`}>
      <button
        onClick={() => setOpen(!open)}
        className={`${className} flex items-center justify-between gap-1 border
         border-[#262626] py-2 px-4 rounded-[0.75rem]`}
      >
        {selected.code ? selected.code : selected.name}
        <IoChevronDown
          className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute ${positionClasses[position]} left-0 mt-1 bg-[#000] 
        border border-[#262626] w-max rounded-[0.75rem] shadow-lg
         z-50 max-h-[300px] overflow-y-auto scrollbar-hide`}
        >
          {options.map((option) => (
            <button
              key={option.name}
              onClick={() => handleSelect(option)}
              className={`flex w-full justify-start px-4 py-2
                 text-left hover:bg-[#1e1e1e] ${
                   selected.name === option.name
                     ? "text-white font-medium"
                     : "text-[#a3a3a3]"
                 } items-center space-x-1`}
            >
              <FaCheck
                size={12}
                className={`${
                  selected.name === option.name ? "visible" : "invisible"
                }`}
              />
              <p>
                {option.code} {option.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
