import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import VatReporting from "@/components/VatReporting";
import PlatformHighlights from "@/components/PlatformHighlights"; 
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks /> 
      <VatReporting />
      <PlatformHighlights /> 
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  );
}