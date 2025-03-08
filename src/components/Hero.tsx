import { useRef } from "react";
import interfaceShot from "../assets/interface.jpg";
import interfaceVidShot from "../assets/interfaceVid.mp4";
import { motion, useScroll, useTransform } from "motion/react";

const Hero = () => {
  const imageRef = useRef(null);
  const videoRef = useRef(null);

  const { scrollYProgress: imageScrollYProgress } = useScroll({
    target: imageRef,
    offset: ["0.5 1", "1 1"],
  });

  const { scrollYProgress: vidScrollYProgress } = useScroll({
    target: videoRef,
    offset: ["0.5 1", "1 1"],
  });

  const scale = useTransform(imageScrollYProgress, [0, 1], [0.75, 1]);
  const translateY = useTransform(imageScrollYProgress, [0, 1], [30, 0]);
  const rotateX = useTransform(imageScrollYProgress, [0, 1], [30, 0]);

  const vidScale = useTransform(vidScrollYProgress, [0, 1], [0.75, 1]);
  const vidTranslateY = useTransform(vidScrollYProgress, [0, 1], [30, 0]);
  const vidRotateX = useTransform(vidScrollYProgress, [0, 1], [30, 0]);

  return (
    <section className="flex flex-col items-center px-[20px] py-[80px]">
      <div className="flex flex-col items-center pt-[90px] space-y-[32px]">
        <h2 className="text-[32px] md:text-[52px] md:font-medium text-[#121212]">
          An AI tutor made for you
        </h2>
        <p className="text-[18px] text-[#6D6D6D]">
          Learn from an AI tutor that understands your pdfs, videos, and
          recorded lectures
        </p>
        <div className="flex items-center space-x-2 md:space-x-4 justify-evenly">
          <button
            className="border border-[#E7E7E7] text-[#121212] px-[24px] 
          py-[12px] rounded-full text-[18px] hover:cursor-pointer
          transition ease-in delay-75 hover:bg-[#f6f6f6]"
          >
            See features
          </button>
          <button
            className="bg-[#121212] px-[24px] py-[12px] rounded-full text-[18px]
          text-white hover:cursor-pointer transition ease-in delay-75 hover:bg-[#121212]/80"
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

          <p className="text-[12px] md:text-[14px] text-[#6d6d6d]">
            Loved by over 1 million learners
          </p>
        </div>
      </div>
      <motion.img
        ref={imageRef}
        src={interfaceShot}
        height={205}
        alt="Main chat UI"
        style={{ scale, translateY, rotateX }}
        className="md:hidden mt-[100px] rounded-[16px] border-2 border-[#4f4f4f] origin-top"
      />
      <motion.video
        ref={videoRef}
        src={interfaceVidShot}
        width={"80%"}
        height={205}
        style={{
          scale: vidScale,
          translateY: vidTranslateY,
          rotateX: vidRotateX,
        }}
        className="hidden md:block mt-[100px] rounded-[16px] border-2 border-[#4f4f4f] origin-top"
        autoPlay
        loop
        muted
      />
    </section>
  );
};

export default Hero;
