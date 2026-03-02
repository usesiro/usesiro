import { ShieldCheckIcon, UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function PlatformHighlights() {
  return (
    // Added overflow-hidden so the left/right sliding animations don't cause horizontal scrollbars
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW: HEADLINE & STATS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          
          {/* Left: Headline & Button (Slides in from left) */}
          <div className="max-w-2xl" data-aos="fade-right">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4 leading-tight">
              Your Number One Platform for <br />
              Automated Business Records.
            </h2>
            <p className="text-gray-500 mb-6 max-w-lg">
              We simplify income and expense tracking so tax compliance is 
              clear, predictable, and manageable.
            </p>
            <button className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition flex items-center gap-2">
              Get Started 
              {/* Arrow Icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>

          {/* Right: 100+ Users Stat (Slides in from right) */}
          <div 
            className="text-left md:text-right" 
            data-aos="fade-left" 
            data-aos-delay="200"
          >
            <div className="text-4xl font-bold text-dark mb-1">100+</div>
            <p className="text-gray-500 text-sm">
              Users have been <br /> enjoying "Siro"
            </p>
          </div>
        </div>

        {/* BOTTOM ROW: 3 CARDS (Fade up in a staggered wave) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Security */}
          <div 
            className="p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Security You Can Trust</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your financial data is protected with strong encryption and strict access controls.
            </p>
          </div>

          {/* Card 2: Support */}
          <div 
            className="p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Customer Support</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Dedicated support team to assist you with any questions or issues.
            </p>
          </div>

          {/* Card 3: Reporting */}
          <div 
            className="p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Comprehensive Reporting Tool</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get the insights you need with detailed reports designed to guide better business decisions.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}