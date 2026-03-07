"use client";

import Navbar from "@/components/Navbar";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans selection:bg-primary selection:text-white">
      <Navbar />

      {/* --- 1. HERO SECTION --- */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-8"
          data-aos="fade-up"
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary text-xs font-semibold tracking-wide">Our Story</span>
        </div>

        <h1 
  className="text-5xl md:text-6xl lg:text-7xl font-fraunces font-bold text-gray-900 tracking-tight mb-8 leading-[1.1]"
  data-aos="fade-up"
  data-aos-delay="100"
>
  We're making tax <br />
  <span className="text-primary">less terrifying</span> <br />
  for Nigerian businesses.
</h1>

        <p 
          className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed font-medium mb-16"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Siro exists because Nigerian businesses deserve financial infrastructure that 
          works for them, not against them. We build the tools that turn tax compliance 
          from a dreaded chore into quiet confidence.
        </p>

        {/* Stats Row */}
        <div 
          className="grid grid-cols-3 gap-4 max-w-3xl mx-auto border-t border-gray-200 pt-10"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">2026</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-widest">Founded</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">Businesses</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-widest">Who we serve</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">NG</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-widest">Built for Nigeria</div>
          </div>
        </div>
      </section>

      {/* --- 2. WHY SIRO EXISTS --- */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Left Text */}
            <div className="lg:w-1/2" data-aos="fade-right">
              <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">
                WHY SIRO EXISTS
              </div>
              <h2 className="text-4xl md:text-5xl font-fraunces font-bold text-gray-900 mb-8 leading-[1.2] tracking-tight">
  The problem no one <br className="hidden md:block" />
  was solving properly.
</h2>
              
              <div className="space-y-6 text-gray-500 text-base md:text-lg leading-relaxed font-medium">
                <p>
                  Every year, thousands of Nigerian business owners scramble at tax season. 
                  Not because they're dishonest, <span className="text-primary font-bold">but because no one ever gave them the tools to stay ready.</span>
                </p>
                <p>
                  Existing solutions told businesses to "pay your tax online." But you can't pay 
                  what you haven't tracked. You can't file what you haven't documented. The market 
                  was skipping steps.
                </p>
                <p>
                  Siro starts where the problem actually starts, at the transaction level. Proper 
                  categorization, VAT tagging, reconciliation, and documentation. So when tax season 
                  comes, there's nothing left to scramble for.
                </p>
              </div>
            </div>

            {/* Right Quote Card */}
            <div className="lg:w-1/2 w-full" data-aos="fade-left">
              <div className="bg-primary rounded-[2rem] p-10 md:p-14 text-white relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.05] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-[0.05] rounded-full -translate-x-1/3 translate-y-1/3"></div>
                
                <h3 className="text-2xl md:text-3xl font-serif font-medium leading-[1.4] mb-12 relative z-10 italic">
                  "Tax compliance isn't a payment problem. It's a readiness problem. We're solving it from the ground up."
                </h3>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm"></div>
                  <div>
                    <div className="font-bold text-sm">Muhammed Mustapha</div>
                    <div className="text-white/70 text-xs">CEO & Co-Founder, Siro</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- 3. THE REALITY ON THE GROUND (Dark Section) --- */}
      <section className="py-24 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
              THE REALITY ON THE GROUND
            </div>
            <h2 className="text-4xl md:text-5xl font-fraunces font-bold text-white mb-6 leading-[1.2] tracking-tight">
  Every Nigerian business faces a <br className="hidden md:block"/>
  <span className="text-[#82A0FF]">compliance gap</span> that costs them
</h2>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              The Nigerian Tax Act 2025 made compliance non-negotiable. But most 
              businesses still have no system. They're exposed, and they don't know it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "No Documentation System",
                desc: "Most businesses keep receipts in bags, WhatsApp chats, and notebooks. Nothing is organized when it needs to be."
              },
              {
                title: "VAT is misunderstood",
                desc: "Business owners don't know which transactions attract VAT, how to tag them, or what a correct VAT report looks like."
              },
              {
                title: "Compliance is reactive",
                desc: "Everything happens at filing time. Months of transactions get reconstructed in days. Mistakes get made. Penalties follow."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-[#1F2937] border border-gray-800 rounded-3xl p-8"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="w-12 h-12 bg-[#374151] rounded-full mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- 4. OUR MISSION --- */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Split text */}
          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start mb-20">
            <div className="md:w-1/2" data-aos="fade-right">
              <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">
                OUR MISSION
              </div>
              <h2 className="text-4xl md:text-5xl font-fraunces font-bold text-gray-900 leading-[1.2] tracking-tight">
  Build the financial <br />
  infrastructure every <br />
  Nigerian business <br />
  deserves.
</h2>
            </div>
            
            <div className="md:w-1/2 space-y-6 text-gray-500 text-lg leading-relaxed font-medium" data-aos="fade-left">
              <p>
                Siro is not a bookkeeping platform. We are not an accounting firm. <span className="text-primary font-bold">We are the financial infrastructure</span>, the layer that sits between a business's daily transactions and its legal obligations.
              </p>
              <p>
                We believe that <span className="text-primary font-bold">tax readiness should be automatic</span>, not seasonal. That every business, from a fashion brand in Lagos to a hotel in Abuja should be able to face any NRS audit with confidence.
              </p>
              <p>
                That's what we're building. One transaction at a time.
              </p>
            </div>
          </div>

          {/* Bottom 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Users first, always",
                desc: "Every feature we build starts with one question: does this make life easier for a Nigerian business owner trying to stay compliant?"
              },
              {
                num: "02",
                title: "Trust through accuracy",
                desc: "We handle financial data. If our VAT tagging is wrong, a business gets penalized. Accuracy is not a feature, it's the foundation."
              },
              {
                num: "03",
                title: "Speed with purpose",
                desc: "We move fast because the market needs us to. But we never move so fast that we compromise the integrity of what we're building."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-3xl p-8"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Stylized Number Outline (Figma matched) */}
                <div 
                  className="text-5xl font-black mb-6 text-transparent" 
                  style={{ WebkitTextStroke: '1.5px #3B82F6' }}
                >
                  {item.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- IMPORTED CTA & FOOTER --- */}
      <CallToAction />
      <Footer />
      
    </div>
  );
}