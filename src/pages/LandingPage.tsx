import { Hero, Navbar, Brands, Guide, UseCase, Pricing } from "../components";

const LandingPage = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Brands />
      <Guide />
      <UseCase />
      <Pricing />
    </main>
  );
};

export default LandingPage;
