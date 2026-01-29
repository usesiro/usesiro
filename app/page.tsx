import Hero from "@/components/Hero";
import Features from "@/components/Features";
import PlatformHighlights from "@/components/PlatformHighlights";
import AppShowcase from "@/components/AppShowcase";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      
      <Hero />
      
      <div id="features">
        <Features />
      </div>

      <PlatformHighlights />
      <AppShowcase />
      <FAQ />
      
      <Footer />
    </main>
  );
}