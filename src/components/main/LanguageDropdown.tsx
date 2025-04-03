import { DropdownOption, languages } from "../../entity";
import Dropdown from "./Dropdown";

const LanguageDropdown = ({
  className,
  parentWidth,
  position,
  selectedLang = languages[0],
  onChange,
}: {
  className?: string;
  parentWidth?: string;
  position?: "top" | "bottom";
  selectedLang?: DropdownOption;
  onChange: (option: DropdownOption) => void;
}) => {
  return (
    <Dropdown
      className={className}
      parentWidth={parentWidth}
      position={position}
      options={languages}
      selected={selectedLang}
      onSelect={onChange}
    />
  );
};

export default LanguageDropdown;
