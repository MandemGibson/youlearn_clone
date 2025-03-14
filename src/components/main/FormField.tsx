interface FormFieldProps {
  label: string;
  subtext?: string;
  children?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  type?: "input" | "custom";
  className?: string;
}

const FormField = ({
  label,
  subtext,
  children,
  inputProps,
  type = "input",
  className,
}: FormFieldProps) => {
  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <label htmlFor={inputProps?.id || inputProps?.name}>{label}</label>
      {type === "input" ? (
        <div className="w-full p-3 border border-[#fafafa1a] rounded-[0.75rem]">
          <input
            {...inputProps}
            className="bg-inherit focus:outline-none text-[#fafafa] pl-3 text-[16px] w-full"
          />
        </div>
      ) : (
        children
      )}
      {subtext && <p className="text-sm text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
};

export default FormField;
