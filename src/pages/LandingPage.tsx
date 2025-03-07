import { Hero, Navbar, Brands, Guide } from "../components";

const LandingPage = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Brands />
      <Guide />
    </main>
  );
};

export default LandingPage;
