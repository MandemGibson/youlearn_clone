import { IconType } from "react-icons";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type GuideCardProps = {
  Icon: IconType;
  title: string;
  desc: string;
  src?: string;
};

const GuideCard = ({ Icon, title, desc, src }: GuideCardProps) => {
  const imageRef = useRef<HTMLImageElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["0.5 1", "1 1"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [.75, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const translateX = useTransform(scrollYProgress, [0, 1], [70, 0]);

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
        <motion.div
          ref={imageRef}
          style={{ scale, translateY, translateX }}
          className="relative -bottom-3 rounded-[16px] overflow-clip"
        >
          <img src={src} alt={title} className="w-full h-full object-cover" />
        </motion.div>
      )}
    </div>
  );
};

export default GuideCard;
