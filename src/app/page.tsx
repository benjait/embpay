import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import TrustedBy from "@/components/landing/trusted-by";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import Comparison from "@/components/landing/comparison";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";
import Footer from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Comparison />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
