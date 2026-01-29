import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <h1 className="text-4xl md:text-6xl font-semibold text-dark tracking-tight mb-6 leading-[1.15]">
          Automate Your Records.<br className="hidden md:block" />
          <span className="block mt-2">Be Tax-Ready Without Stress.</span>
        </h1>

        <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed font-normal">
          Track income and expenses automatically. Know exactly where your 
          business stands without spreadsheets, guesswork, or last-minute panic.
        </p>

        {/* BUTTONS - Removed Shadows */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          {/* Main Button: Removed shadow-blue-500/30 */}
          <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition">
            Get Started
          </button>
          
          <button className="px-8 py-3 bg-white text-primary border border-primary/20 rounded-lg font-medium text-lg hover:bg-blue-50 transition">
            Book a Demo
          </button>
        </div>

        {/* DASHBOARD IMAGE */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border-[8px] border-dark/5 shadow-2xl overflow-hidden bg-gray-50">
             <Image 
               src="/hero-image.png" 
               alt="Siro Dashboard Interface" 
               width={2000} // Increased width for better quality
               height={1125}
               priority 
               quality={100} // Forces max quality
               className="w-full h-auto object-cover"
             />
          </div>
        </div>

      </div>
    </section>
  );
}