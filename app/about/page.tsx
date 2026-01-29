"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";

export default function About() {
  return (
    <main className="bg-white">
      <Navbar />
      
      {/* Reduced bottom padding from pb-20 to pb-8 */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Increased margin-bottom from mb-8 to mb-12 to push text away */}
          <div className="inline-block bg-blue-50 text-primary px-6 py-2 rounded-full text-sm font-bold mb-12">
            About us
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 leading-tight">
            We Bring <span className="text-primary">Order</span> to Business Finances
          </h1>
          
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Siro’s mission is to build the financial infrastructure that enables businesses to 
            maintain accurate and structured bookkeeping at scale. We provide the software platform 
            that organizes income and expense data into clear, reliable financial records.
          </p>

          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            <span className="text-primary font-medium">We are not an accounting firm or a tax filing service.</span> We equip 
            businesses with the tools they need to stay financially organized, informed, and 
            tax-ready through proper record-keeping.
          </p>

          <p className="text-gray-500 text-lg leading-relaxed">
            By focusing on automation, accuracy, and simplicity, we help businesses reduce 
            manual work and financial errors.
          </p>

        </div>
      </section>

      {/* Tighter spacing between these sections */}
      <div className="-mt-12">
        <Features /> 
      </div>
      
      <div className="-mt-12">
        <FAQ />
      </div>

      <Footer />
    </main>
  );
}