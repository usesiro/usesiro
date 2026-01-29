import { 
  BanknotesIcon, 
  ChartBarIcon, 
  DocumentCheckIcon, 
  ArrowUpTrayIcon 
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Automated Income & Expense Tracking",
    description: "Transactions are recorded automatically as they happen, giving you real-time visibility.",
    icon: BanknotesIcon,
  },
  {
    name: "Smart Categorization",
    description: "Income and expenses are stored into the right categories automatically using AI.",
    icon: ChartBarIcon,
  },
  {
    name: "Tax Readiness Dashboard",
    description: "See what's ready and what still needs attention before filing season arrives.",
    icon: DocumentCheckIcon,
  },
  {
    name: "Manual Uploads",
    description: "Add income or expense for cash transactions instantly via the mobile app.",
    icon: ArrowUpTrayIcon,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-blue-50 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            What Siro Does
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">
            All You Need To Stay Financially <br /> Organized and Tax-Ready.
          </h2>
          <p className="text-gray-500 text-lg">
            Automatically capture your income and expenses, keep clean records throughout 
            the year, and know where you stand before tax season arrives.
          </p>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.name} 
              className="p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition duration-300 bg-white group"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition duration-300">
                <feature.icon className="h-6 w-6 text-dark group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">
                {feature.name}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}