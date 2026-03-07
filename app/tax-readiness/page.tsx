"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  WalletIcon, 
  TagIcon, 
  ExclamationCircleIcon,
  ReceiptPercentIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function TaxReadiness() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    source: "All Sources",
    vatStatus: "All Statuses",
  });

  // Fetch Live Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.source !== "All Sources") queryParams.append("source", filters.source);

        const res = await fetch(`/api/v1/transactions?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Apply local filtering for VAT Status since our API doesn't support it directly yet
          let filteredTxns = data.transactions;
          if (filters.vatStatus !== "All Statuses") {
            const statusMap: Record<string, string> = {
              "Tagged": "TAGGED",
              "Missing": "MISSING_VAT",
              "Exempt": "EXEMPT"
            };
            filteredTxns = filteredTxns.filter((t: any) => t.vatStatus === statusMap[filters.vatStatus]);
          }
          setTransactions(filteredTxns);
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  // --- DAY 10: DYNAMIC VAT CALCULATION ENGINE ---
  const VAT_RATE = 0.075; // Standard 7.5% VAT

  // 1. Total Income Recorded
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 2. Expenses Categorized (Has a categoryId)
  const categorizedExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && t.categoryId)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 3. Output VAT (VAT Collected on Income tagged as VAT applicable)
  const outputVat = transactions
    .filter(t => t.type === 'INCOME' && t.vatStatus === 'TAGGED')
    .reduce((sum, t) => sum + (Number(t.amount) * VAT_RATE), 0);

  // 4. Input VAT (VAT Paid on Expenses tagged as VAT applicable)
  const inputVat = transactions
    .filter(t => t.type === 'EXPENSE' && t.vatStatus === 'TAGGED')
    .reduce((sum, t) => sum + (Number(t.amount) * VAT_RATE), 0);

  // 5. Net VAT Payable
  const vatPayable = outputVat - inputVat;

  // --- COMPLIANCE TRACKING ---
  const missingVatCount = transactions.filter(t => t.vatStatus === 'MISSING_VAT').length;
  const uncategorizedCount = transactions.filter(t => !t.categoryId).length;
  const missingDocCount = transactions.filter(t => !t.document).length;
  
  const totalIssues = missingVatCount + uncategorizedCount + missingDocCount;

  // Rough Tax Readiness Score (We will finalize the 40/40/20 formula on Day 12)
  const totalTxns = transactions.length || 1; 
  const score = Math.max(0, Math.round(((totalTxns - totalIssues) / totalTxns) * 100));

  // Handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) return <DashboardLayout><div className="p-10 text-center text-gray-500">Loading Tax Data...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* --- TOP SECTION: 3 COLUMNS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* COLUMN 1 */}
          <div className="grid grid-rows-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-sm font-medium">Income Recorded</span>
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(totalIncome)}</h3>
              <p className="text-xs text-blue-500 font-medium">All income captured</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-6">
                <span className="text-gray-500 text-sm font-medium">VAT Breakdown</span>
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <ReceiptPercentIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-4 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">VAT Payable</span>
                  <span className={`font-bold ${vatPayable > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {vatPayable > 0 ? '-' : ''}{formatCurrency(Math.abs(vatPayable))}
                  </span>
                </div>
                <div className="border-t border-gray-50 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Output VAT</span>
                  <span className="font-bold text-gray-800">{formatCurrency(outputVat)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Input VAT</span>
                  <span className="font-bold text-gray-800">{formatCurrency(inputVat)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="grid grid-rows-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-sm font-medium">Expenses Categorized</span>
                <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                  <TagIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(categorizedExpenses)}</h3>
              <p className="text-xs text-red-500 font-medium">Expenses assigned to valid categories</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-6">
                <span className="text-gray-500 text-sm font-medium">Compliance Checklist</span>
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-2 text-sm">
                   {uncategorizedCount === 0 ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                  <span className="text-gray-700 font-medium">Transactions categorized</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {missingDocCount === 0 ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                  <span className="text-gray-700 font-medium">Transactions documented</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {missingVatCount === 0 ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                  <span className="text-gray-700 font-medium">Transactions VAT tagged</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3 */}
          <div className="grid grid-rows-[2fr_1fr] gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-start">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-sm font-medium">Tax Gaps</span>
                <div className="p-1.5 bg-red-50 text-red-800 rounded-full">
                  <ExclamationCircleIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">{totalIssues} Issues</h3>
              <div className="space-y-5">
                {missingVatCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                    {missingVatCount} Missing VAT tag{missingVatCount > 1 ? 's' : ''}
                  </div>
                )}
                {uncategorizedCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
                    {uncategorizedCount} Uncategorized transaction{uncategorizedCount > 1 ? 's' : ''}
                  </div>
                )}
                {missingDocCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></span>
                    {missingDocCount} Missing document{missingDocCount > 1 ? 's' : ''}
                  </div>
                )}
                {totalIssues === 0 && (
                  <div className="text-sm text-green-600 font-medium">No gaps found! You are tax ready.</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-sm font-medium">Tax Readiness Score</span>
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-3">{score}%</h3>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                <div className={`h-full rounded-full ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: TAX SUMMARY TABLE --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Tax Summary</h2>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary" 
                />
              </div>
              <div className="relative w-full md:w-40">
                <select 
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500"
                >
                  <option value="All Sources">All Sources</option>
                  <option value="MONO">Bank (Mono)</option>
                  <option value="MANUAL">Manual Entry</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative w-full md:w-40">
                <select 
                  name="vatStatus"
                  value={filters.vatStatus}
                  onChange={handleFilterChange}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500"
                >
                  <option value="All Statuses">All VAT Statuses</option>
                  <option value="Tagged">Tagged</option>
                  <option value="Missing">Missing</option>
                  <option value="Exempt">Exempt</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                 <ArrowDownTrayIcon className="w-4 h-4" /> Export
               </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto relative min-h-[300px]">
             {isLoading ? (
               <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                 <div className="text-gray-500 animate-pulse">Calculating...</div>
               </div>
            ) : null}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-600 text-xs font-bold tracking-wide border-b border-gray-100">
                  <th className="py-4 px-4 rounded-tl-lg">Description</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4">VAT Status</th>
                  <th className="py-4 px-4 rounded-tr-lg">Documentation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">No transactions found matching those filters.</td>
                    </tr>
                ) : (
                  transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition duration-150">
                    <td className="py-4 px-4 text-sm font-medium text-gray-700">{t.description}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-700">{formatCurrency(t.amount)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{t.type}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{formatDate(t.date)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{t.source === 'MONO' ? 'Bank (Mono)' : 'Manual Entry'}</td>
                    <td className="py-4 px-4">
                      {t.vatStatus === "MISSING_VAT" ? (
                        <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-md">Missing VAT</span>
                      ) : t.vatStatus === "TAGGED" ? (
                         <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-md">Tagged</span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-md">Exempt</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {t.document ? (
                          <div className="bg-green-500 rounded-full p-0.5"><CheckIcon className="w-3 h-3 text-white" /></div>
                        ) : (
                          <div className="bg-red-500 rounded-full p-0.5"><XMarkIcon className="w-3 h-3 text-white" /></div>
                        )}
                        <span className="text-sm text-gray-700 font-medium">{t.document ? 'Uploaded' : 'Missing'}</span>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}