"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowUpRightIcon, WalletIcon, CreditCardIcon, ScaleIcon,
  MagnifyingGlassIcon, ArrowDownTrayIcon, PlusIcon,
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon, CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function Transactions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "INCOME",
    date: new Date().toISOString().split('T')[0] // Default to today's date
  });

  // Fetch function (moved outside useEffect so we can call it after saving a new transaction)
  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/transactions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        // Refresh the table with the new data
        await fetchData(); 
        
        // Reset form and close modal
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

  // Formatters
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) return <DashboardLayout><div className="p-10 text-center text-gray-500">Loading Transactions...</div></DashboardLayout>;

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

        {/* MAIN TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Transaction List</h2>

          {/* FILTERS TOOLBAR */}
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>All Types</option>
                  <option>Income</option>
                  <option>Expense</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"><ArrowDownTrayIcon className="w-4 h-4" /> Export</button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"><PlusIcon className="w-4 h-4" /> Add Transaction</button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-semibold tracking-wide border-b border-gray-100">
                  <th className="py-4 px-4 rounded-tl-lg">Description</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4 rounded-tr-lg">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">No transactions found. Link a bank or add one manually.</td>
                    </tr>
                ) : (
                    transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition duration-150">
                        <td className="py-4 px-4 text-sm font-medium text-gray-700">{t.description}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-600">
                          {t.type === 'INCOME' ? <span className="text-green-600">+{formatCurrency(t.amount)}</span> : <span className="text-red-500">-{formatCurrency(t.amount)}</span>}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                           {t.type === 'INCOME' ? <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-bold">INCOME</span> : <span className="bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-bold">EXPENSE</span>}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">{formatDate(t.date)}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{t.source === 'MONO' ? 'Bank (Mono)' : 'Manual Entry'}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{t.category?.name || 'Uncategorized'}</td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-end items-center mt-8 gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition"><ChevronLeftIcon className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-blue-50 text-primary border border-blue-100">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition"><ChevronRightIcon className="w-4 h-4" /></button>
          </div>
        </div>

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
                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
                          <input 
                            type="number" 
                            name="amount"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="0.00" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      
                      {/* Type */}
                      <div>
                         <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                         <select 
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none bg-white"
                         >
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                         </select>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                      <input 
                        type="date" 
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                      <input 
                        type="text" 
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="e.g. Cash sale for project" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                      >
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