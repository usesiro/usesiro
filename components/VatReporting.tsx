"use client";

import Link from "next/link";

export default function VatReporting() {
  return (
    <section className="py-32 bg-[#0B1221] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Eyebrow Text */}
        <div 
          className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] mb-6"
          data-aos="fade-up"
        >
          VAT REPORTING
        </div>

        {/* Main Headline (Using font-serif to match the Figma's elegant text) */}
        <h2 
  className="text-4xl md:text-5xl lg:text-6xl font-fraunces font-bold text-white mb-6 leading-[1.2] tracking-tight"
  data-aos="fade-up"
  data-aos-delay="100"
>
  Your VAT report,<br />
  <span className="text-[#82A0FF]">always ready</span> to export.
</h2>

        {/* Sub-headline */}
        <p 
          className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mb-10 font-medium"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          No more end-of-quarter scrambling. Siro builds your VAT report in real time as transactions come in. When filing day arrives, you're already done.
        </p>

        {/* CTA Button */}
        <div 
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <Link href="/register">
            <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors">
              Try it for free
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}