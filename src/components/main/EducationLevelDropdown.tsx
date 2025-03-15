import { useState } from "react";
import Dropdown, { DropdownOption } from "./Dropdown";

const educationLevels: DropdownOption[] = [
  { code: "", name: "Secondary or high school" },
  { code: "", name: "Undergraduate university" },
  { code: "", name: "Graduate university" },
  { code: "", name: "Post doctorate" },
];

const UniversityDropdown = ({
  className,
  parentWidth,
  position,
}: {
  className?: string;
  parentWidth: string;
  position?: "top" | "bottom";
}) => {
  const [selectedUniversity, setSelectedUniversity] = useState<DropdownOption>(
    educationLevels[0]
  );

  return (
    <Dropdown
      className={className}
      parentWidth={parentWidth}
      position={position}
      options={educationLevels}
      selected={selectedUniversity}
      onSelect={setSelectedUniversity}
    />
  );
};

export default UniversityDropdown;
