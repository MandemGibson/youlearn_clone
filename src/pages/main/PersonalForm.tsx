import {
  EducationLevelDropdown,
  FormField,
  LanguageDropdown,
  Wrapper,
} from "../../components";

const PersonalForm = () => {
  return (
    <Wrapper>
      <div
        className="flex flex-col items-center justify-center w-full
      min-h-screen px-1 space-y-5 overflow-y-auto"
      >
        <h1 className="text-[20px] text-white font-semibold">
          U<span className="relative -bottom-2">L</span>
        </h1>
        <h2 className="text-center">
          Help us tailor your experience to your learning habits and goals
        </h2>
        <FormField
          label="Your name"
          subtext="Your preferred name"
          inputProps={{
            type: "text",
            name: "username",
            id: "username",
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
          />
        </FormField>

        <FormField
          label="Language"
          subtext="Choose your language"
          type="custom"
        >
          <LanguageDropdown className="py-3 w-full" parentWidth="w-full" />
        </FormField>
      </div>
    </Wrapper>
  );
};

export default PersonalForm;
