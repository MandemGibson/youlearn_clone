import {
  Hero,
  Navbar,
  Brands,
  Guide,
  UseCase,
  Pricing,
  Testimonials,
  CTA,
  Footer,
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
      <Footer />
    </main>
  );
};

export default LandingPage;
