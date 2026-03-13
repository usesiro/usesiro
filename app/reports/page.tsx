"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { calculateTaxReadinessScore } from "@/utils/taxScoring"; // <-- IMPORT ADDED
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  WalletIcon, CreditCardIcon, ScaleIcon, ArrowUpRightIcon, ArrowDownTrayIcon,
  XMarkIcon, DocumentTextIcon, TableCellsIcon 
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function Reports() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW EXPORT MODAL STATE ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportParams, setExportParams] = useState({
    startDate: "",
    endDate: "",
    format: "PDF" 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/v1/transactions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const { totalIncome, totalExpense, netBalance, barData, donutData, score } = useMemo(() => {
    let inc = 0, exp = 0;
    const monthlyMap: Record<string, any> = {};
    const categoryMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthlyMap[m] = { name: m, income: 0, expense: 0 });

    transactions.forEach(t => {
      const amt = Number(t.amount);
      const m = months[new Date(t.date).getMonth()];

      if (t.type === 'INCOME') {
        inc += amt;
        if (monthlyMap[m]) monthlyMap[m].income += amt / 1000;
      } else {
        exp += amt;
        if (monthlyMap[m]) monthlyMap[m].expense += amt / 1000;
        const cat = t.categoryName || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      }
    });

    const processedDonut = Object.entries(categoryMap).map(([name, value], i) => ({
      name, value: Math.round((value / (exp || 1)) * 100), color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i % 4]
    })).slice(0, 4);

    return {
      totalIncome: inc, totalExpense: exp, netBalance: inc - exp,
      barData: Object.values(monthlyMap),
      donutData: processedDonut.length ? processedDonut : [{name: 'Empty', value: 100, color: '#F3F4F6'}],
      score: calculateTaxReadinessScore(transactions) // <-- NEW SCORE LOGIC APPLIED
    };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

  // --- Handlers ---
  const handleExportParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setExportParams({ ...exportParams, [e.target.name]: e.target.value });
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

    const expIncome = dataToExport.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
    const expExpense = dataToExport.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
    const expNet = expIncome - expExpense;

    const reportTitle = `Siro_Financial_Report_${new Date().toISOString().split('T')[0]}`;

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
      doc.text("Siro Financial Overview", 14, 22);
      
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
      doc.text("Total Income:", 20, 55);
      doc.text("Total Expense:", 85, 55);
      doc.text("Net Balance:", 145, 55);

      doc.setFontSize(12);
      doc.setTextColor(0); 
      doc.text(`NGN ${expIncome.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 20, 62);
      doc.text(`NGN ${expExpense.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 85, 62);
      doc.setTextColor(47, 110, 246); 
      doc.text(`NGN ${expNet.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 145, 62);

      const tableColumn = ["Date", "Description", "Type", "Amount (NGN)", "Category"];
      const tableRows = dataToExport.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        t.description,
        t.type,
        Number(t.amount).toLocaleString('en-NG', {minimumFractionDigits: 2}),
        t.category?.name || 'Uncategorized'
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold text-dark">Reports</h1>
          
          {/* WIRED UP EXPORT BUTTON */}
          <button 
            onClick={() => setIsExportModalOpen(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Income" amount={formatCurrency(totalIncome)} icon={<WalletIcon className="w-5 h-5"/>} color="blue" />
          <StatCard title="Total Expense" amount={formatCurrency(totalExpense)} icon={<CreditCardIcon className="w-5 h-5"/>} color="red" />
          <StatCard title="Net Balance" amount={formatCurrency(netBalance)} icon={<ScaleIcon className="w-5 h-5"/>} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-[450px]">
            <h2 className="text-gray-800 font-bold mb-8">Income vs Expense (k)</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-[450px]">
            <h2 className="text-gray-400 font-bold mb-4 uppercase tracking-widest text-sm">Tax Readiness Score</h2>
            <span className="text-[120px] leading-none font-black text-primary drop-shadow-sm">
              {score}<span className="text-6xl text-blue-300 ml-1">%</span>
            </span>
            <p className="text-sm text-gray-500 font-medium mt-6 bg-white/60 px-5 py-2 rounded-full border border-gray-100 backdrop-blur-sm shadow-sm">
              Current Compliance Level
            </p>
          </div>
        </div>

        {/* --- EXPORT RANGE & FORMAT MODAL --- */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsExportModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-md p-8 animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-700">Export Financial Report</h3>
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
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, amount, icon, color }: any) {
  const isRed = color === 'red';
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-500 text-sm font-bold uppercase">{title}</span>
        <div className={`p-2 rounded-xl ${isRed ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-black text-dark">{amount}</h3>
      <p className={`text-xs mt-2 ${isRed ? 'text-red-500' : 'text-blue-500'} font-bold flex items-center gap-1`}>
        <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
      </p>
    </div>
  );
}