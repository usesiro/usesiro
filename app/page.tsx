import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

const steps = [
  ["01", "Bring in your records", "Upload a bank statement or add cash and informal transactions manually."],
  ["02", "Review and organize", "Siro helps categorize transactions and identify VAT treatment for your review."],
  ["03", "Export clean reports", "See where you stand and download the records needed for your filing process."],
];

const checks = ["Search and filter transactions quickly", "Review categories and VAT status", "Add missing records when needed"];

export default function Home() {
  return (
    <main className="landing-page bg-[#f7f9ff] text-[#17233f] overflow-hidden">
      <style>{`@keyframes landing-reveal{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes landing-hero-enter{from{opacity:0;transform:translateY(28px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes landing-readiness-enter{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes landing-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}.landing-reveal{opacity:0;animation:landing-reveal .7s cubic-bezier(.2,.7,.2,1) forwards}.landing-delay-1{animation-delay:.08s}.landing-delay-2{animation-delay:.18s}.landing-delay-3{animation-delay:.3s}.landing-delay-4{animation-delay:.42s}.landing-hero-enter{opacity:0;animation:landing-hero-enter .9s .56s cubic-bezier(.16,1,.3,1) forwards}.landing-readiness-enter{opacity:0;animation:landing-readiness-enter .7s 1.08s cubic-bezier(.16,1,.3,1) forwards}.landing-float{animation:landing-float 4s 1.78s ease-in-out infinite}.landing-eyebrow{color:#4a78ed;font-size:10px;font-weight:700;letter-spacing:.18em}@media (prefers-reduced-motion:reduce){.landing-reveal,.landing-hero-enter,.landing-readiness-enter{opacity:1;animation:none}.landing-float{animation:none}}`}</style>
      <nav className="landing-nav fixed left-1/2 top-3 z-50 w-[84%] max-w-[22rem] -translate-x-1/2 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-[0_8px_30px_rgba(23,35,63,0.08)] backdrop-blur-xl md:top-4 md:w-[calc(100%-3rem)] md:max-w-3xl md:px-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" aria-label="Siro home"><Image src="/landing/logo.svg" alt="Siro" width={64} height={30} className="h-auto w-14 sm:w-16" priority /></Link>
          <div className="hidden md:flex items-center gap-7 text-[11px] font-medium text-[#606b83]">
            <Link href="/">Home</Link><Link href="/#features">Product</Link><Link href="/pricing">Pricing</Link><Link href="/contact">Contact Us</Link>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/register" className="rounded-full border border-[#dfe6f4] bg-white/70 px-3 py-2 text-[10px] font-semibold text-[#53617a] transition hover:border-[#2f6ef6] hover:text-[#2f6ef6] sm:px-4 sm:text-[11px]">Get Started <span aria-hidden>→</span></Link>
            <details className="group relative md:hidden">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-[#53617a] transition hover:bg-[#edf3ff] [&::-webkit-details-marker]:hidden" aria-label="Open navigation menu">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              </summary>
              <div className="absolute right-0 top-12 flex w-44 flex-col gap-1 rounded-2xl border border-[#e4e9f5] bg-white/95 p-2 text-left text-xs font-medium text-[#606b83] shadow-lg backdrop-blur-xl">
                <Link href="/" className="rounded-xl px-3 py-2 hover:bg-[#edf3ff]">Home</Link><Link href="/#features" className="rounded-xl px-3 py-2 hover:bg-[#edf3ff]">Product</Link><Link href="/pricing" className="rounded-xl px-3 py-2 hover:bg-[#edf3ff]">Pricing</Link><Link href="/contact" className="rounded-xl px-3 py-2 hover:bg-[#edf3ff]">Contact Us</Link>
              </div>
            </details>
          </div>
        </div>
      </nav>

      <section className="relative px-5 pb-16 pt-32 text-center md:pb-24 md:pt-40">
        <div className="landing-reveal landing-delay-1 mx-auto mb-5 inline-flex rounded-full border border-[#d8e3ff] bg-[#edf3ff] px-3 py-1 text-[10px] font-semibold text-[#4474eb]">#1 Ranked AI Tax Assistant</div>
        <h1 className="landing-reveal landing-delay-2 mx-auto max-w-3xl font-fraunces text-5xl font-bold leading-[.98] tracking-tight text-[#15203a] md:text-7xl">Better <span className="text-[#2f6ef6]">Records.</span><br /><span className="text-[#2f6ef6]">Easier</span> Taxes.</h1>
        <p className="landing-reveal landing-delay-3 mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#77839a] md:text-base">Stop patching your finances with WhatsApp notes and Excel sheets. Every transaction organized, every VAT tagged, compliance handled automatically.</p>
        <div className="landing-reveal landing-delay-4 mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/register" className="rounded-md bg-[#326bf2] px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-[#245be0]">Create your account</Link><Link href="/contact" className="rounded-md border border-[#dce4f4] bg-white px-6 py-3 text-xs font-semibold text-[#326bf2] transition hover:-translate-y-0.5 hover:border-[#326bf2]">Book a Demo</Link></div>
        <div className="landing-hero-stage landing-hero-enter relative mx-auto mt-12 w-[94%] max-w-5xl sm:w-[90%]">
          <div className="landing-hero-visual relative z-10">
            <Image src="/landing/hero-transactions.png" alt="Siro transactions dashboard" width={5120} height={3264} className="h-auto w-full" priority />
            <div className="landing-readiness-enter absolute bottom-[14%] right-[4.1%] z-20 w-[24.2%]"><Image src="/landing/readiness.png" alt="74 percent tax readiness" width={620} height={264} className="landing-float h-auto w-full" /></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:py-28"><div className="mx-auto max-w-6xl"><div className="mb-12 text-center" data-aos="fade-up"><p className="landing-eyebrow">HOW SIRO WORKS</p><h2 className="mt-3 font-fraunces text-3xl font-bold md:text-5xl">From scattered transactions to <span className="text-[#2f6ef6]">clean records.</span></h2><p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#8792a6]">A simple recordkeeping flow that keeps your business prepared throughout the year.</p></div><div className="grid gap-4 md:grid-cols-3">{steps.map(([num,title,desc], i)=><article key={num} data-aos="fade-up" data-aos-delay={i*120} className="rounded-xl border border-[#e7ebf3] bg-white p-6 transition hover:-translate-y-1 hover:border-[#cbd9ff]"><span className="mb-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#3671f7] text-[10px] font-bold text-white">{num}</span><h3 className="font-bold text-sm">{title}</h3><p className="mt-2 text-xs leading-relaxed text-[#8490a6]">{desc}</p></article>)}</div></div></section>

      <section id="features" className="px-5 py-20 md:py-28"><div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2"><div data-aos="fade-right"><p className="landing-eyebrow">TRANSACTIONS</p><h2 className="mt-3 max-w-md font-fraunces text-4xl font-bold leading-tight md:text-5xl">Every transaction,<br /><span className="text-[#2f6ef6]">in one clear view.</span></h2><p className="mt-5 max-w-md text-sm leading-relaxed text-[#8490a6]">Bring together bank activity, cash sales and manual records without rebuilding spreadsheets.</p><ul className="mt-6 space-y-3 text-xs text-[#66738b]">{checks.map(c=><li key={c} className="flex items-center gap-2"><span className="text-[#18ae78]">✓</span>{c}</li>)}</ul></div><div data-aos="fade-left" className="landing-image-card"><Image src="/landing/transaction-card.png" alt="Transaction records" width={1160} height={860} className="w-full" /></div></div></section>

      <section className="bg-white px-5 py-20 md:py-28"><div className="mx-auto max-w-6xl"><div className="text-center" data-aos="fade-up"><p className="landing-eyebrow">REPORTING</p><h2 className="mt-3 font-fraunces text-3xl font-bold md:text-5xl">Know the numbers behind your records</h2><p className="mx-auto mt-4 max-w-md text-sm text-[#8490a6]">See income, expenses and document coverage without piecing together separate files.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[["expense-breakdown.png","Expense breakdown"],["income-expense-chart.png","Income vs expenses"],["financial-overview.png","Financial overview"]].map(([src,label],i)=><div key={src} data-aos="fade-up" data-aos-delay={i*100} className="landing-image-card rounded-2xl"><Image src={`/landing/${src}`} alt={label} width={750} height={521} className="w-full" /></div>)}</div></div></section>

      <section className="px-5 py-20 md:py-28"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2"><div data-aos="fade-right" className="order-2 flex justify-center md:order-1 md:justify-start"><div className="relative w-full max-w-xl px-2 pt-5"><Image src="/landing/transaction-card.png" alt="Organized transaction records" width={1160} height={860} className="h-auto w-full" /><Image src="/landing/readiness.png" alt="74 percent tax readiness" width={620} height={264} className="absolute left-0 top-0 z-10 h-auto w-[42%]" /></div></div><div data-aos="fade-left" className="order-1 md:order-2"><p className="landing-eyebrow">TAX READINESS</p><h2 className="mt-3 font-fraunces text-4xl font-bold leading-tight md:text-5xl">Know what is ready.<br /><span className="text-[#2f6ef6]">Fix what is missing.</span></h2><p className="mt-5 max-w-md text-sm leading-relaxed text-[#8490a6]">Track categories, VAT tags and supporting documents before a filing deadline arrives.</p></div></div></section>

      <section className="bg-white px-5 py-20 text-center md:py-28"><div data-aos="fade-up"><p className="landing-eyebrow">SIMPLE PRICING</p><h2 className="mt-3 font-fraunces text-3xl font-bold md:text-5xl">One plan. Everything you need to begin.</h2><p className="mt-4 text-sm text-[#8490a6]">No hidden fees, no complicated tiers. Get everything you need to stay tax-ready from day one.</p><div className="mx-auto mt-10 max-w-md rounded-2xl border border-[#e7ebf3] p-8 text-left transition hover:-translate-y-1 hover:border-[#bfd0ff]"><span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[10px] font-semibold text-[#4474eb]">Beta Plan</span><p className="mt-6 text-xs font-semibold">Full access for early adopters</p><div className="mt-3 flex items-baseline gap-3"><span className="font-fraunces text-4xl font-bold">₦9,999</span><span className="text-xs text-[#8490a6]">for 30 days of access</span></div><Link href="/register" className="mt-7 inline-block rounded-md bg-[#326bf2] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#245be0]">Get started</Link></div></div></section>
      <Footer />
    </main>
  );
}
