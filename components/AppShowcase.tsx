import Image from "next/image";

export default function AppShowcase() {
  return (
    // Added 'overflow-hidden' to clip the image at the bottom like the design
    <section id="about" className="bg-primary overflow-hidden pt-20 pb-0 md:pt-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col md:flex-row items-center justify-between h-full">
          
          {/* LEFT: TEXT */}
          <div className="md:w-1/2 text-white mb-10 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Know Your Numbers as They Happen
            </h2>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed max-w-lg">
              Automatically track business income and expenses in one place.
            </p>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="md:w-1/2 flex justify-end relative h-full">
            {/* NOTE: Ideally, use the 'mobile-app.png' (Phone only) here.
               If you use 'hero-image.png' (Tablet+Phone), it will still work 
               but might show the tablet too.
            */}
            <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg translate-y-10 md:translate-y-0">
               <Image 
                 src="/mobile-app.png" 
                 alt="Siro Mobile Dashboard" 
                 width={800} 
                 height={1000}
                 className="w-full h-auto drop-shadow-2xl"
               />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}