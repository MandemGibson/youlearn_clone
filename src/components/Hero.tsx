import { useRef } from "react";
import interfaceShot from "../assets/interface.jpg";
import { motion, useScroll, useTransform } from "motion/react";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["0.5 1", "1 1"] });

  const scale = useTransform(scrollYProgress, [0, 1], [.75, 1]); 
  const translateY = useTransform(scrollYProgress, [0, 1], [30, 0]); 
  const rotateX = useTransform(scrollYProgress, [0, 1], [30, 0]);

  return (
    <section className="px-[20px] py-[80px]">
      <div className="pt-[90px] space-y-[32px]">
        <h2 className="text-[32px] text-[#121212]">An AI tutor made for you</h2>
        <p className="text-[18px] text-[#6D6D6D]">
          Learn from an AI tutor that understands your pdfs, videos, and
          recorded lectures
        </p>
        <div className="flex items-center justify-evenly">
          <button
            className="border border-[#E7E7E7] text-[#121212] px-[24px] 
          py-[12px] rounded-full text-[18px]"
          >
            See features
          </button>
          <button
            className="bg-[#121212] px-[24px] py-[12px] rounded-full text-[18px]
          text-white"
          >
            Get Started
          </button>
        </div>
        <div className="flex items-center justify-center space-x-[10px]">
          <div className="flex items-center">
            {[
              { id: 1, letter: "A", color: "bg-blue-400" },
              { id: 2, letter: "R", color: "bg-orange-400" },
              { id: 3, letter: "Z", color: "bg-black" },
              { id: 4, letter: "A", color: "bg-green-400" },
            ].map(({ id, color, letter }, index) => (
              <div
                key={id}
                className={`rounded-full w-[26px] h-[26px] ${color}
             text-white text-[12px] items-center justify-center flex
             border-2 border-white ${index === 0 ? "" : "-ml-2.5"}`}
              >
                {letter}
              </div>
            ))}
          </div>

          <p className="text-[12px] text-[#6d6d6d]">
            Loved by over 1 million learners
          </p>
        </div>
      </div>
      <motion.img
        ref={ref}
        src={interfaceShot}
        height={205}
        alt="Main chat UI"
        style={{ scale, translateY, rotateX }}
        className="mt-[100px] rounded-[16px] border-2 border-[#4f4f4f] origin-top"
      />
    </section>
  );
};

export default Hero;
