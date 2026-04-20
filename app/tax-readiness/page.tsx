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
  TableCellsIcon,
  ArrowUpRightIcon,
  ReceiptRefundIcon,
  DocumentChartBarIcon
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

      <div className="space-y-6">

        {/* --- ROW 1: CORE STATS & COMPLIANCE --- */}
        {/* --- ROW 1: CORE STATS & COMPLIANCE --- */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Expenses Card */}
          <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 md:h-44 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-gray-400 text-[10px] md:text-sm font-black uppercase tracking-wider">Expenses</span>
              <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                <TagIcon className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-black text-gray-900 leading-none truncate">{formatCurrency(categorizedExpenses)}</h3>
              <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-tight">Categorized</p>
            </div>
          </div>

          {/* Compliance Checklist Card */}
          <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-32 md:h-44 hover:shadow-md transition-all group overflow-hidden">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <span className="text-gray-400 text-[10px] md:text-sm font-black uppercase tracking-wider">Checklist</span>
              <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 md:space-y-3 pr-1">
              <div className="flex items-center gap-2 text-[10px] md:text-xs">
                {uncategorizedCount === 0
                  ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                  : <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />}
                <span className="text-gray-600 font-bold truncate">Categories</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs">
                {missingDocCount === 0
                  ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                  : <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />}
                <span className="text-gray-600 font-bold truncate">Documents</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs">
                {missingVatCount === 0
                  ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                  : <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />}
                <span className="text-gray-600 font-bold truncate">VAT Tags</span>
              </div>
            </div>
          </div>

          {/* Tax Readiness Score Card */}
          <div className="col-span-2 lg:col-span-1 bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 md:h-44 hover:shadow-md transition-all group">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <span className="text-gray-400 text-[10px] md:text-sm font-black uppercase tracking-wider">Score</span>
              <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircleIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-black text-gray-900 mb-2 md:mb-3">{score}%</h3>
              <div className="w-full h-2 md:h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ROW 2: VAT SUMMARY (From Transactions Page) --- */}
        {/* --- ROW 2: VAT SUMMARY --- */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-indigo-50/50 p-4 md:p-6 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:shadow-md group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-indigo-600 font-black text-[10px] md:text-sm uppercase tracking-wider">Output VAT</span>
              <ArrowUpRightIcon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg md:text-2xl font-black text-indigo-900 leading-none truncate">{formatCurrency(outputVat)}</h3>
            <p className="text-[10px] text-indigo-400 font-bold uppercase mt-2 tracking-widest">Collected</p>
          </div>

          <div className="bg-orange-50/50 p-4 md:p-6 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-orange-600 font-black text-[10px] md:text-sm uppercase tracking-wider">Input VAT</span>
              <ReceiptRefundIcon className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg md:text-2xl font-black text-orange-900 leading-none truncate">{formatCurrency(inputVat)}</h3>
            <p className="text-[10px] text-orange-400 font-bold uppercase mt-2 tracking-widest">Paid</p>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-primary/10 p-4 md:p-6 rounded-2xl border border-primary/20 shadow-sm transition-all hover:shadow-md group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-primary font-black text-[10px] md:text-sm uppercase tracking-wider">Net Payable</span>
              <DocumentChartBarIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg md:text-2xl font-black text-primary leading-none truncate">{formatCurrency(vatPayable)}</h3>
            <p className="text-[10px] text-primary/60 font-bold uppercase mt-2 tracking-widest">Liability</p>
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
          <div className="relative min-h-[300px]">
            {/* MOBILE LIST VIEW */}
            <div className="md:hidden space-y-4">
              {transactions.length === 0 ? (
                <p className="text-center py-8 text-gray-500 font-medium uppercase text-[10px] tracking-widest">No matching records</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-black text-gray-900 leading-tight">{t.description}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {formatDate(t.date)} • {t.source === 'MONO' ? 'POS' : 'Manual'}
                        </p>
                      </div>
                      <div className={`text-sm font-black whitespace-nowrap ${t.type === 'INCOME' ? 'text-green-600' : 'text-gray-900'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm ${
                          t.vatStatus === "TAGGED" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {t.vatStatus === "TAGGED" ? "VAT Tagged" : "Missing VAT"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight text-gray-400">
                        {t.document ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <XMarkIcon className="w-3.5 h-3.5 text-red-500" />}
                        <span>Document</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto rounded-xl">
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
                    <td className="py-5 px-6 text-sm font-bold">
                      {t.type === 'INCOME' ? (
                        <span className="text-green-600">+{formatCurrency(t.amount)}</span>
                      ) : (
                        <span className="text-red-500">-{formatCurrency(t.amount)}</span>
                      )}
                    </td>
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