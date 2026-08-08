"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  WalletIcon, CreditCardIcon, ScaleIcon, ArrowDownTrayIcon,
  XMarkIcon, DocumentTextIcon, TableCellsIcon,
  BoltIcon, DocumentDuplicateIcon
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { useNotification } from "@/context/NotificationContext";

export default function Reports() {
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- EXPORT MODAL STATE ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportParams, setExportParams] = useState({
    startDate: "",
    endDate: "",
    format: "PDF" 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/v1/transactions`);
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const { totalIncome, totalExpense, netBalance, barData, donutData, salesData, automationRate, docRate, recentActivity } = useMemo(() => {
    let inc = 0, exp = 0;
    let automated = 0, documented = 0;
    const monthlyMap: Record<string, any> = {};
    const categoryMap: Record<string, number> = {};
    const salesMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(m => {
      monthlyMap[m] = { name: m, income: 0, expense: 0 };
      salesMap[m] = 0;
    });

    transactions.forEach(t => {
      const amt = Number(t.amount);
      const m = months[new Date(t.date).getMonth()];
      const catName = t.category?.name || t.categoryName || 'Uncategorized';

      // Automation & Document tracking
      if (t.source === 'MONO') automated++;
      if (t.document) documented++;

      if (t.type === 'INCOME') {
        inc += amt;
        if (monthlyMap[m]) monthlyMap[m].income += amt / 1000; // stored in thousands for chart
        
        // Strict check for "Sales" category for the Histogram
        if (catName.toLowerCase().includes('sale')) {
          if (salesMap[m] !== undefined) salesMap[m] += amt;
        }
      } else {
        exp += amt;
        if (monthlyMap[m]) monthlyMap[m].expense += amt / 1000; // stored in thousands for chart
        categoryMap[catName] = (categoryMap[catName] || 0) + amt;
      }
    });

    const total = transactions.length || 1;

    // Sort and grab the top 5 highest expenses for the Pie Chart
    const processedDonut = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1]) 
      .map(([name, value], i) => ({
        name, 
        value,
        color: ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'][i % 5]
      })).slice(0, 5);

    // Format sales data for the histogram
    const processedSales = months.map(m => ({ name: m, sales: salesMap[m] }));
    
    // Recent activity feed extraction
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8); // Showing slightly more in Reports page

    return {
      totalIncome: inc, 
      totalExpense: exp, 
      netBalance: inc - exp,
      barData: Object.values(monthlyMap),
      donutData: processedDonut.length > 0 ? processedDonut : [{name: 'No Expenses Yet', value: 1, color: '#F3F4F6'}],
      salesData: processedSales,
      automationRate: Math.round((automated / total) * 100),
      docRate: Math.round((documented / total) * 100),
      recentActivity: recent
    };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

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
      showNotification("No transactions found in this date range.", "warning");
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
        t.category?.name || t.categoryName || 'Uncategorized'
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

    void fetch("/api/v1/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete_step", step: "REPORT_GENERATED" }),
    }).catch(() => undefined);
    setIsExportModalOpen(false); 
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div id="tour-report-export" className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center print:hidden">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <button 
            onClick={() => setIsExportModalOpen(true)} 
            className="flex w-fit items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export Report
          </button>
        </div>

        {/* FINANCIAL STATS ROW */}
        <div id="tour-report-overview" className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard title="Total Income" amount={formatCurrency(totalIncome)} icon={<WalletIcon className="w-5 h-5"/>} color="blue" />
          <StatCard title="Total Expense" amount={formatCurrency(totalExpense)} icon={<CreditCardIcon className="w-5 h-5"/>} color="red" />
          <div className="col-span-2 lg:col-span-1">
            <StatCard title="Net Balance" amount={formatCurrency(netBalance)} icon={<ScaleIcon className="w-5 h-5"/>} color="blue" />
          </div>
        </div>

        {/* PLATFORM METRICS ROW (Moved from Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <ProgressCard title="Bank Automation" percentage={automationRate} icon={<BoltIcon className="w-5 h-5 text-yellow-500"/>} />
          <ProgressCard title="Document Coverage" percentage={docRate} icon={<DocumentDuplicateIcon className="w-5 h-5 text-emerald-500"/>} />
        </div>

        {/* CHARTS ROW: Bar Chart & Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* INCOME VS EXPENSE */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-2xl border border-gray-200 h-[400px] sm:h-[450px] min-w-0">
            <h2 className="text-gray-800 font-bold mb-8">Income vs Expense (k)</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: 'none'}} />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* EXPENSE PIE CHART */}
          <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200 flex flex-col h-[400px] sm:h-[450px] min-w-0">
            <h2 className="text-gray-800 font-bold mb-4">Expense Breakdown</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: 'none'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="mt-4 space-y-2">
              {donutData.map((entry, i) => (
                 <div key={i} className="flex justify-between items-center text-xs font-medium">
                   <div className="flex items-center gap-2 overflow-hidden">
                     <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                     <span className="text-gray-600 truncate" title={entry.name}>{entry.name}</span>
                   </div>
                   <span className="text-gray-900 font-bold">{formatCurrency(entry.value)}</span>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Sales Histogram & Recent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SALES HISTOGRAM */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-2xl border border-gray-200 h-[400px] sm:h-[450px] min-w-0">
            <div className="mb-8">
              <h2 className="text-gray-800 font-bold">Sales Histogram</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Monthly revenue derived strictly from categorized sales.</p>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={salesData}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `₦${val >= 1000 ? val/1000 + 'k' : val}`} width={80} />
                <Tooltip cursor={{fill: '#F9FAFB'}} formatter={(value) => formatCurrency(value as number)} contentStyle={{borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: 'none'}} />
                <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* RECENT ACTIVITY FEED (Moved from Dashboard) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 h-[450px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
              <a href="/transactions" className="text-xs font-bold text-primary hover:underline">View All</a>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center mt-10">No recent transactions.</p>
              ) : (
                recentActivity.map((t: any) => (
                  <div key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors min-w-0">
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{t.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(t.date).toLocaleDateString('en-GB')} • {t.source === 'MONO' ? 'Bank Sync' : 'Manual'}
                      </p>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-green-600' : 'text-gray-800'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>

        {/* --- EXPORT MODAL --- */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsExportModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-8 animate-fade-in-up border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-700">Export Financial Report</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate"
                      value={exportParams.startDate}
                      onChange={handleExportParamChange}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-primary outline-none text-gray-600"
                    />
                  </div>
                  <div>
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

// --- SUB COMPONENTS (CLEAN & FLAT UI) ---

function StatCard({ title, amount, icon, color }: any) {
  const isRed = color === 'red';
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 h-32 md:h-36 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl ${isRed ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-none truncate">{amount}</h3>
      </div>
    </div>
  );
}

function ProgressCard({ title, percentage, icon }: any) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 h-32 md:h-36 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</span>
        {icon}
      </div>
      <div>
        <span className="text-xl md:text-2xl font-black text-gray-900 leading-none">{percentage}%</span>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              percentage > 80 ? 'bg-emerald-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
