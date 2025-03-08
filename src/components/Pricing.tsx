import { motion } from "motion/react";
import PriceCard from "./PriceCard";

const prices = [
  {
    id: 1,
    type: "Free",
    price: 0,
    quote: "Start your learning journey here.",
    benefits: [
      <>
        2 AI chats / day <em>(includes accurate chats with Learn+)</em>
      </>,
      <>3 files or YouTube links / day</>,
      <>Upload PDFs, each up to 120 pages / 20 MB in size</>,
      <>1 recorded lecture / day</>,
    ],
    buttonText: "Get Started",
  },
  {
    id: 2,
    type: (
      <>
        Pro <span className="text-[12px]">(annual)</span>
      </>
    ),
    price: 12,
    quote: "Learn at the highest level",
    benefits: [
      <>
        <strong>Unlimited</strong> AI chats / day{" "}
        <em>(includes 100 / month with Learn+)</em>
      </>,
      <>
        <strong>Unlimited</strong> PDFs or YouTube links
      </>,
      <>
        Upload PDFs, each up to <strong>2000 pages / 50 MB</strong> in size
      </>,
      <>
        <strong>40</strong> recorded lectures / month
      </>,
      <>
        <strong>Access</strong> to advanced <strong>voice mode</strong> beta
      </>,
    ],
    buttonText: "Choose Pro",
  },
];

const Pricing = () => {
  return (
    <section
      className="flex flex-col items-center mx-auto 
      px-[30px] md:px-[120px] my-[160px]"
    >
      <motion.h1
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="text-[28px] md:text-[40px] text-center text-[#121212]
        font-medium"
      >
        Save hours, learn better, and share more.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="text-center text-[18px] text-[#6d6d6d] pt-[24px] mb-[32px]"
      >
        Enjoy unlimited contents, messages, spaces, and PDF file uploads
      </motion.p>
      <div className="flex flex-col md:flex-row items-center mt-[56px] gap-[24px]">
        {prices.map(({ id, ...rest }) => (
          <PriceCard key={id} {...rest} />
        ))}
      </div>
    </section>
  );
};

export default Pricing;
