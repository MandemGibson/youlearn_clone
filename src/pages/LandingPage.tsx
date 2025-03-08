import {
  Hero,
  Navbar,
  Brands,
  Guide,
  UseCase,
  Pricing,
  Testimonials,
  CTA,
} from "../components";

const LandingPage = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Brands />
      <Guide />
      <UseCase />
      <Pricing />
      <Testimonials />
      <CTA />
    </main>
  );
};

export default LandingPage;
