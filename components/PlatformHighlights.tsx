"use client";

import { ShieldCheckIcon, ScaleIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function PlatformHighlights() {
  return (
    <section className="py-24 bg-[#FAFAFA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER - Centered exactly like Figma */}
        <div 
          className="text-center max-w-3xl mx-auto mb-20"
          data-aos="fade-up"
        >
          <div className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            WHY BUSINESSES TRUST SIRO
          </div>
<h2 className="text-2xl md:text-3xl lg:text-[32px] font-fraunces font-bold text-gray-900 mb-6 leading-tight tracking-tight block w-full md:whitespace-nowrap">
  Built for every Nigerian business. Seriously.
</h2>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            We didn't just build a generic finance tool and add a Naira sign. Siro is 
            designed around how Nigerian businesses actually operate
          </p>
        </div>

        {/* 3 CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Card 1: Security */}
          <div 
            className="p-10 rounded-[2rem] border border-gray-100 bg-white transition-colors duration-300 hover:border-gray-200"
            data-aos="fade-up"
          >
            {/* The soft blue circle from the design */}
            <div className="w-16 h-16 bg-[#EAF0FF] rounded-full flex items-center justify-center mb-8">
              <ShieldCheckIcon className="w-8 h-8 text-primary opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
              Bank-level security
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              Your financial data is encrypted end-to-end. We use regulated open banking 
              infrastructure and never store your banking credentials.
            </p>
          </div>

          {/* Card 2: Tax Law */}
          <div 
            className="p-10 rounded-[2rem] border border-gray-100 bg-white transition-colors duration-300 hover:border-gray-200"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="w-16 h-16 bg-[#EAF0FF] rounded-full flex items-center justify-center mb-8">
              <ScaleIcon className="w-8 h-8 text-primary opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
              Built for Nigerian tax law
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              Our VAT tagging and compliance logic is built around NRS requirements and the 
              Nigeria Revenue Service Act, 2025, not generic global rules.
            </p>
          </div>

          {/* Card 3: Support */}
          <div 
            className="p-10 rounded-[2rem] border border-gray-100 bg-white transition-colors duration-300 hover:border-gray-200"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="w-16 h-16 bg-[#EAF0FF] rounded-full flex items-center justify-center mb-8">
              <UserGroupIcon className="w-8 h-8 text-primary opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
              Customer Support
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              Got a question? Our support team is always available to help, real answers, 
              no bots.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}