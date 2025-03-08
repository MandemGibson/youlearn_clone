import { motion } from "motion/react";

type UseCaseContainerProps = {
  thumbnail: string;
  title: string;
  description: string;
};

const UseCaseContainer = ({
  thumbnail,
  title,
  description,
}: UseCaseContainerProps) => {
  return (
    <div className="flex flex-col w-full">
      <motion.img
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        src={thumbnail}
        alt={title}
        className="w-full h-[300px] rounded-[24px] hover:cursor-pointer
         object-cover mb-[24px] border border-[#e7e7e7]"
      />
      <h2 className="text-[#121212] text-[22px] mb-[12px] font-medium">
        {title}
      </h2>
      <p className="text-[#6d6d6d] text-[16px]">{description}</p>
    </div>
  );
};

export default UseCaseContainer;
