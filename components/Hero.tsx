"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="pt-32 pb-24 md:pt-40 md:pb-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* --- BETA BADGE --- */}
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6"
          data-aos="fade-up"
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary text-xs font-semibold tracking-wide">Now in Beta</span>
        </div>

        {/* --- MAIN HEADLINE --- */}
       <div data-aos="fade-up" data-aos-duration="800">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-fraunces font-bold text-gray-900 mb-6 leading-[1.2]">
    Your business,<br />
    <span className="text-primary">always</span> tax-ready.
  </h1>

          <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-gray-500 leading-relaxed">
  Stop patching your finances with WhatsApp notes and Excel sheets. <br className="hidden md:block" />
  Every transaction organized, every VAT tagged, compliance handled automatically.
</p>
        </div>

        {/* --- BUTTONS (No Shadows, Clean Borders) --- */}
        <div 
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
          data-aos="fade-up" 
          data-aos-delay="200"
        >
          <Link href="/register">
            <button className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </Link>
          
          <Link href="/demo">
            <button className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
              Book a Demo
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}