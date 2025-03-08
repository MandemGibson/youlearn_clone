const CTA = () => {
  return (
    <section className="py-[56px] px-[20px] md:px-[40px]">
      <div
        className="flex flex-col items-center justify-center p-[24px]
        md:p-[80px] border border-[#e7e7e7] bg-[#f6f6f6] rounded-[32px]"
      >
        <h1
          className="text-[24px] md:text-[40px] text-center text-[#121212]
          font-medium"
        >
          Learn smarter, faster, easier.
        </h1>
        <p
          className="text-center text-[16px] text-[#6d6d6d] pt-[24px]
        font-medium mb-[24px]"
        >
          Upload your content, and start your learning journey.
        </p>
        <button
          className="bg-[#121212] px-[24px] py-[12px] rounded-full text-[18px]
          text-white hover:cursor-pointer transition ease-in delay-75 hover:bg-[#121212]/80"
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default CTA;
