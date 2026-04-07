"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { calculateTaxReadinessScore } from "@/utils/taxScoring";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  DocumentTextIcon, 
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import TableSkeleton from "@/components/TableSkeleton";

export default function TaxReadiness() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportParams, setExportParams] = useState({
    startDate: "",
    endDate: "",
    format: "PDF" 
  });

  const [filters, setFilters] = useState({
    search: "",
    source: "All Sources",
    vatStatus: "All Statuses",
  });

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

  const VAT_RATE = 0.075; 

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categorizedExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && t.categoryId)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outputVat = transactions
    .filter(t => t.type === 'INCOME' && t.vatStatus === 'TAGGED')
    .reduce((sum, t) => sum + (Number(t.amount) * VAT_RATE), 0);

  const inputVat = transactions
    .filter(t => t.type === 'EXPENSE' && t.vatStatus === 'TAGGED')
    .reduce((sum, t) => sum + (Number(t.amount) * VAT_RATE), 0);

  const vatPayable = outputVat - inputVat;
  const missingVatCount = transactions.filter(t => t.vatStatus === 'MISSING_VAT').length;
  const uncategorizedCount = transactions.filter(t => !t.categoryId).length;
  const missingDocCount = transactions.filter(t => !t.document).length;
  const totalIssues = missingVatCount + uncategorizedCount + missingDocCount;
  const score = calculateTaxReadinessScore(transactions);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExportParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setExportParams({ ...exportParams, [e.target.name]: e.target.value });
  };

  const handleGenerateExport = () => {
    const dataToExport = transactions.filter(t => {
      const tDate = new Date(t.date).getTime();
      const sDate = exportParams.startDate ? new Date(exportParams.startDate).getTime() : null;
      const eDate = exportParams.endDate ? new Date(exportParams.endDate).getTime() : null;
      if (sDate && tDate < sDate) return false;
      if (eDate && tDate > eDate) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (dataToExport.length === 0) {
      alert("No transactions found in this date range.");
      return;
    }

    const reportTitle = `Siro_Tax_Report_${new Date().toISOString().split('T')[0]}`;

    if (exportParams.format === 'CSV') {
      const headers = ["Date", "Description", "Type", "Amount (NGN)", "Source", "VAT Status", "Documentation"];
      const csvRows = dataToExport.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        `"${t.description.replace(/"/g, '""')}"`,
        t.type,
        Number(t.amount).toFixed(2),
        t.source === 'MONO' ? 'Bank (Mono)' : 'Manual',
        t.vatStatus || 'MISSING_VAT',
        t.document ? 'Uploaded' : 'Missing'
      ].join(','));
      const csvString = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportTitle}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(47, 110, 246);
      doc.text("Siro Tax Readiness Report", 14, 22);
      const tableColumn = ["Date", "Description", "Type", "Amount (NGN)", "VAT Status", "Doc"];
      const tableRows = dataToExport.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        t.description,
        t.type,
        Number(t.amount).toLocaleString('en-NG'),
        t.vatStatus || 'MISSING_VAT',
        t.document ? 'Yes' : 'No'
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40 });
      doc.save(`${reportTitle}.pdf`);
    }
    setIsExportModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-10">

        {/* --- TOP SECTION: 12-col grid --- */}
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT: 8/12 cols — always 2-column 2x2 grid */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-6">

            {/* Income Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" style={{ minHeight: '150px' }}>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm font-medium">Income Recorded</span>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <WalletIcon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(totalIncome)}</h3>
                <p className="text-xs text-blue-500 font-medium">All income captured</p>
              </div>
            </div>

            {/* Expense Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" style={{ minHeight: '150px' }}>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm font-medium">Expenses Categorized</span>
                <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                  <TagIcon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(categorizedExpenses)}</h3>
                <p className="text-xs text-red-500 font-medium">Expenses assigned to valid categories</p>
              </div>
            </div>

            {/* VAT Breakdown Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" style={{ minHeight: '200px' }}>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm font-medium">VAT Breakdown</span>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <ReceiptPercentIcon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">VAT Payable</span>
                  <span className={`font-bold text-lg ${vatPayable > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    - {formatCurrency(Math.abs(vatPayable))}
                  </span>
                </div>
                <div className="border-t border-gray-50 pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Output VAT</span>
                    <span className="font-semibold text-gray-700">- {formatCurrency(outputVat)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Input VAT</span>
                    <span className="font-semibold text-gray-700">- {formatCurrency(inputVat)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Checklist Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" style={{ minHeight: '200px' }}>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm font-medium">Compliance Checklist</span>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <ClipboardDocumentCheckIcon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  {uncategorizedCount === 0
                    ? <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                    : <XCircleIcon className="w-5 h-5 text-red-500 shrink-0" />}
                  <span className="text-gray-700 font-medium">Income properly categorized</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {missingDocCount === 0
                    ? <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                    : <XCircleIcon className="w-5 h-5 text-red-500 shrink-0" />}
                  <span className="text-gray-700 font-medium">Transactions properly documented</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {missingVatCount === 0
                    ? <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                    : <XCircleIcon className="w-5 h-5 text-red-500 shrink-0" />}
                  <span className="text-gray-700 font-medium">Transactions properly VAT tagged</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: 4/12 cols — Tax Gaps + Score stacked */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

            {/* Tax Gaps Card — flex-1 so it stretches to match left height */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Tax Gaps</span>
                <div className="p-2 bg-gray-50 text-gray-400 rounded-full">
                  <ExclamationCircleIcon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-800 mb-8">{totalIssues} Issues</h3>
              <div className="space-y-5">
                {missingVatCount > 0 && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    {missingVatCount} Missing VAT tag
                  </div>
                )}
                {uncategorizedCount > 0 && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    {uncategorizedCount} Expense not categorized
                  </div>
                )}
                {missingDocCount > 0 && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    {missingDocCount} Missing documentation
                  </div>
                )}
                {totalIssues === 0 && (
                  <div className="text-green-600 font-bold">No gaps found!</div>
                )}
              </div>
            </div>

            {/* Tax Readiness Score Card — fixed at bottom */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" style={{ minHeight: '130px' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Tax Readiness Score</span>
                <TagIcon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-800 mb-3">{score}%</h3>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all duration-1000"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SUMMARY TABLE SECTION --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-black text-gray-800 mb-8">Tax Summary</h2>

          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between mb-10">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative w-full md:w-80">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search transactions..." 
                  className="w-full pl-12 pr-4 py-3.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:border-primary bg-gray-50/30" 
                />
              </div>
              <div className="relative w-full md:w-44">
                <select name="source" value={filters.source} onChange={handleFilterChange} className="w-full pl-5 pr-10 py-3.5 text-sm border border-gray-100 rounded-xl appearance-none bg-white text-gray-500 focus:outline-none">
                  <option value="All Sources">Source</option>
                  <option value="MONO">Bank</option>
                  <option value="MANUAL">Manual</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative w-full md:w-44">
                <select name="vatStatus" value={filters.vatStatus} onChange={handleFilterChange} className="w-full pl-5 pr-10 py-3.5 text-sm border border-gray-100 rounded-xl appearance-none bg-white text-gray-500 focus:outline-none">
                  <option value="All Statuses">VAT Status</option>
                  <option value="Tagged">Tagged</option>
                  <option value="Missing">Missing</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <button onClick={() => setIsExportModalOpen(true)} className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              <ArrowDownTrayIcon className="w-5 h-5" /> Export
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
                  <th className="py-5 px-6">Description</th>
                  <th className="py-5 px-6">Amount</th>
                  <th className="py-5 px-6">Date</th>
                  <th className="py-5 px-6">Source</th>
                  <th className="py-5 px-6">VAT Status</th>
                  <th className="py-5 px-6">Documentation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition duration-150">
                    <td className="py-5 px-6 text-sm font-medium text-gray-700">{t.description}</td>
                    <td className="py-5 px-6 text-sm font-bold text-gray-800">{formatCurrency(t.amount)}</td>
                    <td className="py-5 px-6 text-sm text-gray-500">{formatDate(t.date)}</td>
                    <td className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {t.source === 'MONO' ? 'POS' : 'Manual'}
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        t.vatStatus === "TAGGED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}>
                        {t.vatStatus === "TAGGED" ? "VAT Tagged" : "Missing VAT"}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-sm font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        {t.document
                          ? <CheckIcon className="w-4 h-4 text-green-500" />
                          : <XMarkIcon className="w-4 h-4 text-red-500" />}
                        Document
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- EXPORT MODAL --- */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-10 animate-fade-in-up">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-800">Export Report</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-7 h-7" />
                </button>
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Start Date</label>
                    <input type="date" name="startDate" value={exportParams.startDate} onChange={handleExportParamChange} className="w-full border border-gray-100 p-3.5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">End Date</label>
                    <input type="date" name="endDate" value={exportParams.endDate} onChange={handleExportParamChange} className="w-full border border-gray-100 p-3.5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <button onClick={handleGenerateExport} className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-600 transition tracking-widest uppercase text-xs">
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}