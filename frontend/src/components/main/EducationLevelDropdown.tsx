import { DropdownOption, educationLevels } from "../../entity";
import Dropdown from "./Dropdown";

const UniversityDropdown = ({
  className,
  parentWidth,
  position,
  selectedUniversity = educationLevels[0],
  onChange,
}: {
  className?: string;
  parentWidth: string;
  selectedUniversity: DropdownOption;
  position?: "top" | "bottom";
  onChange: (option: DropdownOption) => void;
}) => {
  return (
    <Dropdown
      className={className}
      parentWidth={parentWidth}
      position={position}
      options={educationLevels}
      selected={selectedUniversity}
      onSelect={onChange}
    />
  );
};

export default UniversityDropdown;
