import { FC } from "react";
import { IoMdMore } from "react-icons/io";

type TopicCardProps = {
  title: string;
  thumbnail: string;
};

const TopicCard: FC<TopicCardProps> = ({ title, thumbnail }) => {
  return (
    <div
      className="w-[calc(72%-13px)] max-w-[250px] p-[6px] border border-[#fafafa1a]
      bg-[#17171766] rounded-xl hover:shadow-xs hover:shadow-green-500
      sm:min-h-[250px] md:min-w-[300px] flex flex-col"
    >
      <div className="w-full relative flex-1 bg-[#fafafa66] rounded-lg my-auto">
        <button className="absolute p-1 rounded-full top-2 right-2 bg-[#fafafa]">
          <IoMdMore size={16} color="black" />
        </button>
        <img src={thumbnail} alt="" />
      </div>
      <h2
        className="my-[10px] px-[8px] w-full text-ellipsis
      whitespace-nowrap overflow-hidden text-[#fafafa]
      text-[14px] font-medium"
      >
        {title}
      </h2>
    </div>
  );
};

export default TopicCard;
