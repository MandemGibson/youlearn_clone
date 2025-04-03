import {
  Hero,
  Navbar,
  Guide,
  UseCase,
  Pricing,
  Testimonials,
  CTA,
  Footer,
} from "../../components";

const LandingPage = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
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
