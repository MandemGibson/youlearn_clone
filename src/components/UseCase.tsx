import { FaArrowTurnDown } from "react-icons/fa6";
import { motion } from "motion/react";
import UseCaseContainer from "./UseCaseContainer";
import mind from "../assets/mind.avif";
import attention from "../assets/attention.avif";
import brain from "../assets/brain.avif";

const useCases = [
  {
    id: 1,
    thumbnail: mind,
    title: "Inside the mind of a procrastinator",
    description: "Tim Urban tackles procrastination humorously.",
  },
  {
    id: 2,
    thumbnail: attention,
    title: "Attention Is All You Need",
    description: "Transformer outperforms other processors.",
  },
  {
    id: 3,
    thumbnail: brain,
    title: "Introduction to the Human Brain",
    description: "MIT 9.13 The Human Brain, Spring 2019",
  },
];

const UseCase = () => {
  return (
    <section
      className="flex flex-col items-center mx-auto 
      px-[20px] md:px-[120px] my-[160px]"
    >
      <motion.h1
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="text-[28px] md:text-[56px] text-center text-[#121212]
        font-medium"
      >
        Built for any use case
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="text-center text-[18px] text-[#6d6d6d] pt-[24px] pb-[32px]"
      >
        Click on a content below, and start your learning journey{" "}
        <span>
          <FaArrowTurnDown className="inline text-[14px]" />
        </span>
      </motion.p>
      <div className="mt-[32px] w-full space-y-[64px]">
        {useCases.map((useCase) => (
          <UseCaseContainer {...useCase} />
        ))}
      </div>
    </section>
  );
};

export default UseCase;
