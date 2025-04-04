import { IconType } from "react-icons";
import {
  EducationLevelDropdown,
  FormField,
  LanguageDropdown,
  Wrapper,
} from "../../components";
import { FiSend } from "react-icons/fi";
import { RiSkipRightLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useState } from "react";
import { educationLevels, languages } from "../../entity";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../context api/AuthContext";

const Button = ({
  text,
  Icon,
  className,
  onClick,
}: {
  text: string;
  Icon: IconType;
  className?: string;
  onClick: () => void;
}) => {
  return (
    <button
      className={`${className} flex items-center gap-2 w-full
     py-3 bg-white text-[14px] justify-center rounded-[0.75rem]
     hover:cursor-pointer`}
      onClick={onClick}
    >
      {text}
      {Icon && <Icon size={18} />}
    </button>
  );
};

const PersonalForm = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    eduLevel: educationLevels[0],
    language: languages[0],
  });

  const handleUpdateUser = async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          username: values.username,
          education_level: values.eduLevel,
          language: values.language,
        },
      });

      if (error) {
        console.error(error);
        return;
      }

      setUser(data.user as User);
    } catch (error) {
      console.error("Error updating user: ", error);
    }
  };
  return (
    <Wrapper>
      <div
        className="flex flex-col items-center justify-center w-full
        min-h-screen px-1 space-y-5 overflow-y-auto pt-[100px] pb-2
        sm:max-w-max mx-auto"
      >
        <h1 className="text-[20px] text-white font-semibold">
          U<span className="relative -bottom-2">L</span>
        </h1>
        <h2 className="text-center text-[18px] text-[#fafafab2]">
          Help us tailor your experience to your learning habits and goals
        </h2>
        <FormField
          label="Your name"
          subtext="Your preferred name"
          inputProps={{
            autoFocus: true,
            type: "text",
            name: "username",
            id: "username",
            value: values.username,
            onChange: (e) =>
              setValues((prev) => ({ ...prev, username: e.target.value })),
            placeholder: "Enter your name",
          }}
        />

        <FormField
          label="Education Level"
          subtext="Choose your education level"
          type="custom"
        >
          <EducationLevelDropdown
            className="py-3 w-full"
            parentWidth="w-full"
            selectedUniversity={values.eduLevel}
            onChange={(option) =>
              setValues((prev) => ({ ...prev, eduLevel: option }))
            }
          />
        </FormField>

        <FormField
          label="Language"
          subtext="Choose your language"
          type="custom"
        >
          <LanguageDropdown
            position="top"
            className="py-3 w-full"
            parentWidth="w-full"
            selectedLang={values.language}
            onChange={(selectedOption) => {
              setValues((prev) => ({ ...prev, language: selectedOption }));
            }}
          />
        </FormField>
        <div className="w-full flex flex-col gap-2">
          <Button text="Finish" Icon={FiSend} onClick={handleUpdateUser} />
          <Button
            text="Skip"
            Icon={RiSkipRightLine}
            onClick={() => navigate("/main")}
            className="!bg-[#262626] text-[#fafafa]"
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default PersonalForm;
