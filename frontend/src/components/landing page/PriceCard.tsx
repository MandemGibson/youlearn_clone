import { ReactElement } from "react";
import { FaCheck } from "react-icons/fa6";

type PriceCardProps = {
  type: string | ReactElement;
  price: number;
  quote: string;
  benefits: ReactElement[] | string[];
  buttonText: string;
};

const PriceCard = ({
  type,
  price,
  quote,
  benefits,
  buttonText,
}: PriceCardProps) => {
  return (
    <div
      className={`flex flex-col w-full max-w-[320px] p-[30px] rounded-[32px]
      border border-[#e7e7e7] gap-[24px] ${
        type === "Free" ? "text-[#6d6d6d]" : "text-white bg-black"
      }`}
    >
      <div className="flex flex-col gap-[10px]">
        <p className="text-[16px]">{type}</p>
        <h2
          className={`text-[56px] ${
            type === "Free" ? "text-[#121212]" : ""
          } font-medium`}
        >
          ${price} <span className="text-[16px]">/ month</span>
        </h2>
        <p className="text-[16px]">{quote}</p>
        <hr
          className={`${type === "Free" ? "text-[#e7e7e7]" : "text-[#6d6d6d]"}`}
        />
        <div className="flex flex-col gap-[10px]">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-[10px]">
              <span>
                <FaCheck size={16} color={type == "Free" ? "#6d6d6d" : ""} />
              </span>
              <p className="text-[14px] ">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        className={`w-full ${
          type === "Free"
            ? "bg-[#121212] text-white transition ease-in delay-75 hover:bg-[#121212]/80"
            : "bg-white text-[#121212]"
        } rounded-full py-[12px] px-[24px] hover:cursor-pointer`}
      >
        <a href={type === "Free" ? "main" : "pricing"}>{buttonText}</a>
      </button>
    </div>
  );
};

export default PriceCard;
