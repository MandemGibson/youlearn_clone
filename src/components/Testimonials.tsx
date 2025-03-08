import TestimonialCard from "./TestimonialCard";

const Testimonials = () => {
    return (
      <section
        className="flex mx-auto my-[56px] max-w-[1200px] overflow-x-scroll gap-[10px] 
        scrollbar-hide relative px-8 animate-scroll overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
        }}
      >
        {[...Array(7)].map((_, index) => (
          <TestimonialCard
            key={index}
            message="This platform has completely changed my learning experience!"
            name="Jane Doe"
            portfolio="Software Engineer"
            profilePic="https://randomuser.me/api/portraits/women/44.jpg"
          />
        ))}
      </section>
    );
  };
  
  export default Testimonials;
  