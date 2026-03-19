"use client";

import Link from "next/link";

export default function CallToAction() {
  return (
    <section 
      id="get-started" 
      className="relative py-20 md:py-28 bg-primary overflow-hidden"
    >
      {/* --- BACKGROUND PATTERNS --- */}
      <div className="absolute -top-24 -right-24 w-80 h-80 md:w-[600px] md:h-[600px] rounded-full bg-white opacity-[0.08] blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 md:w-[400px] md:h-[400px] rounded-full bg-white opacity-[0.06] blur-[40px] pointer-events-none" />

      {/* --- CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        
        <h2 
          className="text-4xl md:text-5xl lg:text-6xl font-fraunces font-bold text-white tracking-tight mb-6 leading-[1.1]"
          data-aos="fade-up"
        >
          Ready to get your<br /> business tax-ready?
        </h2>

        <p 
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-white/90 leading-relaxed font-medium"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Join the businesses already building better financial habits with Siro. 
          Start free, stay compliant.
        </p>

        <div 
          className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <Link href="/waitlist">
            <button className="w-full sm:w-auto px-10 py-4 bg-white text-primary rounded-xl font-bold text-sm hover:bg-gray-50 transition active:scale-95 shadow-xl shadow-black/10">
              Join the waitlist
            </button>
          </Link>
          
          <Link href="/demo">
            <button className="w-full sm:w-auto px-10 py-4 bg-transparent text-white border-2 border-white rounded-xl font-bold text-sm hover:bg-white hover:text-primary transition active:scale-95">
              Book a Demo
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}