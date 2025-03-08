const Brands = () => {
  return (
    <section className="flex flex-col overflow-hidden items-center justify-center py-[30px]">
      <h1 className="text-[18px] text-[#6d6d6d]">
        Trusted by top students all over the world
      </h1>
      <div
        className="flex items-center justify-center p-[40px] gap-[100px]
      min-w-screen overflow-hidden"
      >
        {[...Array(7)].map((_, index) => (
          //   <img
          //     key={index}
          //     src={/images/brand-${index + 1}.png}
          //     alt={Brand ${index + 1}}
          //     className="h-[40px] mx-[20px]"
          //   />
          <div
            key={index}
            className="animate-scrollleft left-full w-[45px] h-[45px] bg-black"
          />
        ))}
      </div>
    </section>
  );
};

export default Brands;
