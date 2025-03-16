import { useState } from "react";
import Dropdown, { DropdownOption } from "./Dropdown";

const languages: DropdownOption[] = [
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

const LanguageDropdown = ({
  className,
  parentWidth,
  position
}: {
  className?: string;
  parentWidth?: string;
  position?: "top" | "bottom";
}) => {
  const [selectedLang, setSelectedLang] = useState<DropdownOption>(
    languages[0]
  );

  return (
    <Dropdown
      className={className}
      parentWidth={parentWidth}
      position={position}
      options={languages}
      selected={selectedLang}
      onSelect={setSelectedLang}
    />
  );
};

export default LanguageDropdown;
