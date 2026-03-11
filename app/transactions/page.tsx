"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useVatCalculator } from "@/hooks/useVatCalculator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ArrowUpRightIcon, WalletIcon, CreditCardIcon, ScaleIcon,
  MagnifyingGlassIcon, ArrowDownTrayIcon, PlusIcon,
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon, CheckCircleIcon,
  ReceiptRefundIcon, DocumentChartBarIcon, DocumentTextIcon, TableCellsIcon
} from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 15; // Set pagination limit

export default function Transactions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // VAT ENGINE (Calculates based on ALL filtered transactions, not just the page)
  const { totalOutputVat, totalInputVat, netVatPayable } = useVatCalculator(transactions);

  // Bulk Categorization State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    type: "All Types",
    source: "All Sources",
    startDate: "",
    endDate: ""
  });

  // Export Modal State
  const [exportParams, setExportParams] = useState({
    startDate: "",
    endDate: "",
    format: "PDF" 
  });

  // Form State
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "INCOME",
    date: new Date().toISOString().split('T')[0] 
  });

  // Fetch functions
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.type !== "All Types") queryParams.append("type", filters.type);
      if (filters.source !== "All Sources") queryParams.append("source", filters.source);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const res = await fetch(`/api/v1/transactions?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setStats(data.stats);
        setCurrentPage(1); // Reset to page 1 whenever filters change
        setSelectedIds([]); // Clear selection on new fetch
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Pagination Math ---
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // --- Handlers ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExportParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setExportParams({ ...exportParams, [e.target.name]: e.target.value });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Only select items on the current page
      const pageIds = paginatedTransactions.map(t => t.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      // Deselect items on the current page
      const pageIds = paginatedTransactions.map(t => t.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkCategorize = async () => {
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }

    setIsBulkUpdating(true);
    try {
      const res = await fetch("/api/v1/transactions/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("siro_access_token")}`
        },
        body: JSON.stringify({
          transactionIds: selectedIds,
          categoryId: selectedCategory
        }),
      });

      if (res.ok) {
        await fetchData(); 
        setSelectedCategory(""); 
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update transactions");
      }
    } catch (error) {
      alert("Network error during bulk update");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleVatStatusChange = async (transactionId: string, newVatStatus: string) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(t => 
        t.id === transactionId ? { ...t, vatStatus: newVatStatus } : t
      )
    );

    try {
      const res = await fetch("/api/v1/transactions/vat", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("siro_access_token")}`
        },
        body: JSON.stringify({ transactionId, vatStatus: newVatStatus }),
      });

      if (!res.ok) {
         const errData = await res.json();
         alert(errData.error || "Failed to update VAT status");
         await fetchData(); 
      }
    } catch (error) {
      alert("Network error while updating VAT status");
      await fetchData(); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("siro_access_token")}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
        await fetchData(); 
        setTimeout(() => {
          setIsAddModalOpen(false);
          setIsSuccess(false);
          setFormData({ amount: "", description: "", type: "INCOME", date: new Date().toISOString().split('T')[0] });
        }, 1500);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add transaction");
      }
    } catch (error) {
      alert("Network error while adding transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ADVANCED EXPORT GENERATOR ---
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

    const expOutputVat = dataToExport.reduce((acc, t) => t.vatStatus === 'TAGGED' && t.type === 'INCOME' ? acc + (t.vatAmount ? Number(t.vatAmount) : Number(t.amount) * 0.075) : acc, 0);
    const expInputVat = dataToExport.reduce((acc, t) => t.vatStatus === 'TAGGED' && t.type === 'EXPENSE' ? acc + (t.vatAmount ? Number(t.vatAmount) : Number(t.amount) * 0.075) : acc, 0);
    const expNetVat = expOutputVat - expInputVat;

    const reportTitle = `Siro_Tax_Report_${new Date().toISOString().split('T')[0]}`;

    if (exportParams.format === 'CSV') {
      const headers = ["Date", "Description", "Type", "Amount (NGN)", "Source", "Category", "VAT Status"];
      const csvRows = dataToExport.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        `"${t.description.replace(/"/g, '""')}"`, 
        t.type,
        Number(t.amount).toFixed(2), 
        t.source === 'MONO' ? 'Bank (Mono)' : 'Manual',
        t.category?.name || 'Uncategorized',
        t.vatStatus || 'MISSING_VAT'
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
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      const dateRangeStr = (exportParams.startDate || exportParams.endDate) 
        ? `Date Range: ${exportParams.startDate || 'Start'} to ${exportParams.endDate || 'Present'}`
        : `Date Range: All Time`;
      doc.text(dateRangeStr, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 35);

      doc.setFillColor(243, 244, 246); 
      doc.rect(14, 45, 182, 25, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text("Output VAT (Collected):", 20, 55);
      doc.text("Input VAT (Paid):", 85, 55);
      doc.text("Net VAT Payable:", 145, 55);

      doc.setFontSize(12);
      doc.setTextColor(0); 
      doc.text(`NGN ${expOutputVat.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 20, 62);
      doc.text(`NGN ${expInputVat.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 85, 62);
      doc.setTextColor(47, 110, 246); 
      doc.text(`NGN ${expNetVat.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 145, 62);

      const tableColumn = ["Date", "Description", "Type", "Amount (NGN)", "Category", "VAT Status"];
      const tableRows = dataToExport.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        t.description,
        t.type,
        Number(t.amount).toLocaleString('en-NG', {minimumFractionDigits: 2}),
        t.category?.name || 'Uncategorized',
        t.vatStatus || 'MISSING_VAT'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [47, 110, 246] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });

      doc.save(`${reportTitle}.pdf`);
    }

    setIsExportModalOpen(false); 
  };

  // Formatters
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getVatStatusStyles = (status: string) => {
    switch(status) {
      case 'TAGGED': return 'bg-green-50 text-green-700 border-green-200';
      case 'MISSING_VAT': return 'bg-red-50 text-red-700 border-red-200';
      case 'EXEMPT': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-white text-gray-500 border-gray-200';
    }
  };

  // Helper check for "Select All" based on the current page
  const isAllCurrentPageSelected = paginatedTransactions.length > 0 && paginatedTransactions.every(t => selectedIds.includes(t.id));

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        
        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Total Income</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><WalletIcon className="w-5 h-5" /></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-1">{formatCurrency(stats.totalIncome)}</h3>
             <p className="text-xs text-gray-400 font-medium mt-2">All integrated & manual income</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Total Expense</span>
              <div className="p-1.5 bg-red-50 text-red-500 rounded-lg"><CreditCardIcon className="w-5 h-5" /></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-1">{formatCurrency(stats.totalExpense)}</h3>
             <p className="text-xs text-gray-400 font-medium mt-2">All integrated & manual expenses</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Net Balance</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><ScaleIcon className="w-5 h-5" /></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-1">{formatCurrency(stats.netBalance)}</h3>
            <p className="text-xs text-gray-400 font-medium mt-2">Operating capital</p>
          </div>
        </div>

        {/* LIVE VAT SUMMARY ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
            <div className="flex justify-between items-start mb-1">
              <span className="text-indigo-600 font-medium text-sm">Output VAT (Collected)</span>
              <ArrowUpRightIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900">{formatCurrency(totalOutputVat)}</h3>
          </div>

          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
            <div className="flex justify-between items-start mb-1">
              <span className="text-orange-600 font-medium text-sm">Input VAT (Paid)</span>
              <ReceiptRefundIcon className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-orange-900">{formatCurrency(totalInputVat)}</h3>
          </div>

          <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20">
            <div className="flex justify-between items-start mb-1">
              <span className="text-primary font-bold text-sm">Net VAT Payable</span>
              <DocumentChartBarIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-black text-primary">{formatCurrency(netVatPayable)}</h3>
          </div>
        </div>

        {/* MAIN TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700">Transaction List</h2>
          </div>

          {/* FILTERS TOOLBAR */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between mb-8">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search descriptions..." 
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary" 
                />
              </div>
              
              <div className="relative w-full md:w-40">
                <select 
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500"
                >
                  <option value="All Types">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <ArrowDownTrayIcon className="w-4 h-4" /> Export Report
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"><PlusIcon className="w-4 h-4" /> Add Transaction</button>
            </div>
          </div>

          {/* BULK ACTION BAR */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
              <div className="text-sm font-bold text-blue-800">
                {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:border-primary bg-white text-gray-700"
                >
                  <option value="">Select new category...</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button 
                  onClick={handleBulkCategorize}
                  disabled={isBulkUpdating || !selectedCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isBulkUpdating ? "Applying..." : "Apply Category"}
                </button>
              </div>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto relative min-h-[300px]">
            {isLoading ? (
               <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                 <div className="text-gray-500 animate-pulse">Filtering...</div>
               </div>
            ) : null}
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-semibold tracking-wide border-b border-gray-100">
                  <th className="py-4 px-4 rounded-tl-lg w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      checked={isAllCurrentPageSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 rounded-tr-lg">VAT Status</th> 
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedTransactions.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">No transactions found matching those filters.</td>
                    </tr>
                ) : (
                    paginatedTransactions.map((t) => (
                    <tr key={t.id} className={`transition duration-150 ${selectedIds.includes(t.id) ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                        <td className="py-4 px-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={selectedIds.includes(t.id)}
                            onChange={() => handleSelectOne(t.id)}
                          />
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-700">{t.description}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-600">
                          {t.type === 'INCOME' ? <span className="text-green-600">+{formatCurrency(t.amount)}</span> : <span className="text-red-500">-{formatCurrency(t.amount)}</span>}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">{formatDate(t.date)}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{t.source === 'MONO' ? 'Bank (Mono)' : 'Manual Entry'}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                            {t.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select 
                            value={t.vatStatus || 'MISSING_VAT'}
                            onChange={(e) => handleVatStatusChange(t.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-bold rounded border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none text-center w-28 ${getVatStatusStyles(t.vatStatus || 'MISSING_VAT')}`}
                          >
                            <option value="MISSING_VAT">Missing</option>
                            <option value="TAGGED">Tagged</option>
                            <option value="EXEMPT">Exempt</option>
                          </select>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- NEW PAGINATION CONTROLS --- */}
          {transactions.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 border-t border-gray-50 pt-6">
              <div className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-800 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-gray-800 font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}</span> of <span className="text-gray-800 font-bold">{transactions.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <div className="px-4 h-9 flex items-center justify-center rounded-lg text-sm font-bold bg-blue-50 text-primary border border-blue-100">
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- EXPORT RANGE & FORMAT MODAL --- */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsExportModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-md p-8 animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-700">Export Tax Report</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate"
                      value={exportParams.startDate}
                      onChange={handleExportParamChange}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-primary outline-none text-gray-600"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                    <input 
                      type="date" 
                      name="endDate"
                      value={exportParams.endDate}
                      onChange={handleExportParamChange}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-primary outline-none text-gray-600"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-2">Select Format</label>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => setExportParams({...exportParams, format: 'PDF'})}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${exportParams.format === 'PDF' ? 'border-primary bg-blue-50/50 text-primary' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        <DocumentTextIcon className="w-8 h-8" />
                        <span className="text-sm font-bold">PDF Report</span>
                      </button>
                      <button 
                        onClick={() => setExportParams({...exportParams, format: 'CSV'})}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${exportParams.format === 'CSV' ? 'border-primary bg-blue-50/50 text-primary' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        <TableCellsIcon className="w-8 h-8" />
                        <span className="text-sm font-bold">Excel (CSV)</span>
                      </button>
                   </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={handleGenerateExport}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" /> Download {exportParams.format}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ADD TRANSACTION MODAL --- */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 animate-fade-in-up">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 animate-bounce"><CheckCircleIcon className="w-10 h-10" /></div>
                  <div><h3 className="text-xl font-bold text-gray-700">Transaction Added!</h3><p className="text-gray-500 mt-1">Your record has been saved successfully.</p></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-700">Add Manual Transaction</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><XMarkIcon className="w-6 h-6" /></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
                          <input type="number" name="amount" required min="0" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                        </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                         <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none bg-white">
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                         </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                      <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                      <input type="text" name="description" required value={formData.description} onChange={handleInputChange} placeholder="e.g. Cash sale for project" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                    </div>
                    <div className="pt-4">
                      <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                        {isSubmitting ? "Saving..." : "Save Transaction"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}