import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    // OUTER CONTAINER
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8">
      
      {/* THE FLOATING CARD */}
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl overflow-hidden flex min-h-[600px] lg:min-h-[700px] border border-gray-100">
        
        {/* LEFT SIDE: BLUE PANEL (Now 50% width) */}
        {/* Changed w-5/12 to w-1/2 */}
        <div className="hidden md:flex w-1/2 bg-primary p-12 flex-col justify-between relative text-white">
          
          <div></div>

          {/* CENTER LOGO */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image 
              src="/logo1.svg" 
              alt="Siro Tech Logo White" 
              width={200} 
              height={80}
              className="w-48 h-auto opacity-90"
            />
          </div>
          
          {/* Bottom Content Card */}
          <div className="relative z-10 mt-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2">
                Automate your business records. Stay tax-ready.
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                Track income and expenses automatically, generate clean reports, 
                and prepare for tax filing without spreadsheets.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: FORM AREA (Now 50% width) */}
        {/* Changed w-7/12 to w-1/2 */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24">
          <div className="w-full max-w-sm mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}