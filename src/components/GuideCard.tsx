import { IconType } from "react-icons";

type GuideCardProps = {
  Icon: IconType;
  title: string;
  desc: string;
  src?: string;
};

const GuideCard = ({ Icon, title, desc, src }: GuideCardProps) => {
  return (
    <div
      className="p-[32px] w-full min-w-[350px] h-min  bg-[#f6f6f6]
      rounded-[24px] space-y-[10px] border border-[#e7e7e7]"
    >
      <div>
        {Icon && <Icon className="text-xl mb-[24px]" />}
        <div className="flex flex-col space-y-2">
          <h3 className="text-[18px] font-semibold">{title}</h3>
          <p className="text-[16px] text-[#6d6d6d]">{desc}</p>
        </div>
      </div>
      {src && (
        <div className="relative -bottom-3 rounded-[16px] overflow-clip">
          <img src={src} alt={title} className="w-full h-full object-cover"/>
        </div>
      )}
    </div>
  );
};

export default GuideCard;
