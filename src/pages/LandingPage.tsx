import { Hero, Navbar, Brands, Guide, UseCase } from "../components";

const LandingPage = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Brands />
      <Guide />
      <UseCase />
    </main>
  );
};

export default LandingPage;
