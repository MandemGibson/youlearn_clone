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
}: {
  className?: string;
  parentWidth: string;
}) => {
  const [selectedUniversity, setSelectedUniversity] = useState<DropdownOption>(
    educationLevels[0]
  );

  return (
    <Dropdown
      className={className}
      parentWidth={parentWidth}
      options={educationLevels}
      selected={selectedUniversity}
      onSelect={setSelectedUniversity}
    />
  );
};

export default UniversityDropdown;
