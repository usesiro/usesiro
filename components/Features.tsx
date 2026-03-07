import { 
  ArrowPathIcon, 
  TagIcon, 
  Squares2X2Icon, 
  CheckBadgeIcon, 
  DocumentTextIcon, 
  PencilSquareIcon 
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Automatic Transaction Sync",
    description: "Connect your bank account securely and your transactions pull in automatically. No manual entry, no spreadsheets.",
    icon: ArrowPathIcon,
  },
  {
    name: "VAT Tagging",
    description: "Every transaction gets the right VAT treatment. Know exactly what you've collected and what you owe.",
    icon: TagIcon,
  },
  {
    name: "Smart Categorization",
    description: "Income and expenses sorted into the right categories automatically. Review and correct with one click.",
    icon: Squares2X2Icon,
  },
  {
    name: "Reconciliation",
    description: "Match transactions against your records and flag discrepancies before they become problems.",
    icon: CheckBadgeIcon,
  },
  {
    name: "VAT Report Export",
    description: "Generate a clean, tax-ready VAT report in seconds. Download and file without the last-minute panic.",
    icon: DocumentTextIcon,
  },
  {
    name: "Manual Transactions",
    description: "Add cash or informal transactions manually. Keep your full financial picture accurate and complete.",
    icon: PencilSquareIcon,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER - Split Layout (Left: Title, Right: Paragraph) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="max-w-lg" data-aos="fade-right">
            <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">
              WHAT SIRO DOES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-[1.3]">
              Everything you need <br className="hidden md:block" />
              to stay tax-ready.
            </h2>
          </div>
          
          <div className="max-w-md" data-aos="fade-left">
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Automatically capture your income and expenses, keep clean records throughout the year, and know exactly where you stand before tax season arrives.
            </p>
          </div>
        </div>

        {/* CARDS GRID - 6 Cards, 3 Columns, Zero Shadows, Clean Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.name} 
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="p-8 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}