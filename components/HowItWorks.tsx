"use client";

const steps = [
  {
    num: "1",
    title: "Create your account",
    desc: "Sign up and set up your business profile in under 5 minutes.",
  },
  {
    num: "2",
    title: "Connect your bank",
    desc: "Link your bank account securely. Transactions start syncing immediately.",
  },
  {
    num: "3",
    title: "Review & categorize",
    desc: "Siro auto-tags your VAT and categories. You review and approve.",
  },
  {
    num: "4",
    title: "Export & file",
    desc: "Download your VAT report and file with confidence. Done.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
          <div className="text-primary text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            HOW IT WORKS
          </div>
<h2 className="text-2xl md:text-3xl lg:text-4xl font-fraunces font-bold text-gray-900 mb-6 tracking-tight leading-tight">
  From sign up to <span className="text-primary">tax-ready</span> in minutes.
</h2>
<p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
  No accountant needed. No spreadsheets. Just connect, <br />
  review, and stay compliant.
</p>
        </div>

        {/* 4-STEP TIMELINE */}
        <div className="relative max-w-5xl mx-auto mt-12">
          
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-7 left-[12%] w-[76%] h-[2px] bg-gray-200 z-0"></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={step.num}
                className="flex flex-col items-center text-center group"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                {/* Number Circle (Matches Figma's blue fill with thick gray border) */}
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold border-8 border-gray-100 shadow-sm mb-6 transition-transform duration-300 group-hover:scale-110">
                  {step.num}
                </div>
                
                {/* Text */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed px-2">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}