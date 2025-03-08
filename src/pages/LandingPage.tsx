import { Hero, Navbar, Brands, Guide, UseCase, Pricing, Testimonials } from "../components";

const LandingPage = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Brands />
      <Guide />
      <UseCase />
      <Pricing />
      <Testimonials/>
    </main>
  );
};

export default LandingPage;
