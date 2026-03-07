"use client";

import Link from "next/link";

export default function CallToAction() {
  return (
    <section 
      id="get-started" 
      className="relative py-24 md:py-32 bg-primary overflow-hidden"
    >
      {/* --- BACKGROUND PATTERNS (Subtle Circles) --- */}
      {/* Large diffuse circle - top right */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white opacity-[0.03] blur-[100px] pointer-events-none" />
      {/* Smaller sharper circle - bottom left */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white opacity-[0.05] pointer-events-none" />

      {/* --- CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Main Headline */}
        <h2 
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-[1.1]"
          data-aos="fade-up"
        >
          Ready to get your<br /> business tax-ready?
        </h2>

        {/* Sub-headline */}
        <p 
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-white/90 leading-relaxed font-medium"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Join the businesses already building better financial habits with Siro. 
          Start free, stay compliant.
        </p>

        {/* Button Group */}
        <div 
          className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {/* Solid White Button */}
          <Link href="/register">
            <button className="px-10 py-4 bg-white text-primary rounded-xl font-black text-sm hover:bg-gray-50 transition active:scale-95 shadow-xl shadow-black/10">
              Get Started
            </button>
          </Link>
          
          {/* Ghost Button with Border */}
          <Link href="/demo">
            <button className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-xl font-black text-sm hover:bg-white hover:text-primary transition active:scale-95">
              Book a Demo
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}