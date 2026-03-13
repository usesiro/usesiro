"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  DocumentMagnifyingGlassIcon, DocumentDuplicateIcon, ExclamationTriangleIcon,
  XMarkIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, CalendarIcon,
  ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, PlusIcon, DocumentIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 10;

export default function Reconciliation() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  // Form/Modal States
  const [editVatStatus, setEditVatStatus] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  // NEW: File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Table & Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", source: "All Sources", status: "All Statuses" });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        fetch(`/api/v1/transactions`, { headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` } }),
        fetch(`/api/v1/categories`, { headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` } })
      ]);
      
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingItems = transactions.filter(t => t.vatStatus === 'MISSING_VAT' || !t.categoryId || (!t.document && t.source === 'MANUAL'));

  const filteredItems = pendingItems.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSource = filters.source === "All Sources" || t.source === filters.source;
    let matchesStatus = true;
    if (filters.status === "Uncategorized") matchesStatus = !t.categoryId;
    if (filters.status === "Missing VAT") matchesStatus = t.vatStatus === "MISSING_VAT";
    if (filters.status === "Missing Document") matchesStatus = !t.document && t.source === 'MANUAL';
    return matchesSearch && matchesSource && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFixClick = (item: any) => {
    setSelectedTransaction(item);
    setEditVatStatus(item.vatStatus || "MISSING_VAT");
    setEditCategory(item.categoryId || "");
    setSelectedFile(null); // Clear any old file selection
    setIsDetailsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveAndReconcile = async () => {
    if (!selectedTransaction) return;
    setIsSaving(true);
    let hasUpdates = false;

    try {
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` 
      };

      // 1. Save VAT Tag
      if (editVatStatus && editVatStatus !== "MISSING_VAT" && editVatStatus !== selectedTransaction.vatStatus) {
        await fetch(`/api/v1/transactions/vat`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ transactionId: selectedTransaction.id, vatStatus: editVatStatus })
        });
        hasUpdates = true;
      }

      // 2. Save Category 
      if (editCategory && editCategory !== selectedTransaction.categoryId) {
        await fetch(`/api/v1/transactions/bulk`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ transactionIds: [selectedTransaction.id], categoryId: editCategory })
        });
        hasUpdates = true;
      }

      // 3. Upload File to Vercel Blob
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("transactionId", selectedTransaction.id);

        const uploadRes = await fetch('/api/v1/documents', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }, 
          // Note: When sending FormData, do NOT set 'Content-Type'. The browser sets it automatically with the correct boundary.
          body: formData
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload document.");
        }
        hasUpdates = true;
      }

      if (hasUpdates) {
        alert("Transaction resolved successfully!");
        await fetchData(); // Refresh the list
        setIsDetailsModalOpen(false);
      } else {
        alert("No changes were made.");
        setIsDetailsModalOpen(false);
      }

    } catch (err) {
      console.error("Update failed", err);
      alert("Error saving updates. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amt);
  
  const getPrimaryIssue = (t: any) => {
    if (!t.categoryId) return "Uncategorized";
    if (t.vatStatus === 'MISSING_VAT') return "VAT Missing Flags";
    // ONLY flag as missing document if it is a manual transaction
    if (!t.document && t.source === 'MANUAL') return "Missing Document";
    return "Review Required";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Unmatched Transactions" count={transactions.filter(t => !t.categoryId).length} subtitle="To Review" trend="Needs Categorization" icon={<DocumentMagnifyingGlassIcon className="w-5 h-5 text-blue-500"/>} />
          <StatCard title="Missing VAT Tags" count={transactions.filter(t => t.vatStatus === 'MISSING_VAT').length} subtitle="Alerts" trend="High Compliance Risk" icon={<DocumentDuplicateIcon className="w-5 h-5 text-gray-500"/>} />
          <StatCard title="Pending Documentation" count={transactions.filter(t => !t.document && t.source === 'MANUAL').length} subtitle="Pending" trend="Required for Audit" icon={<ExclamationTriangleIcon className="w-5 h-5 text-red-500"/>} isRed />
        </div>

        {/* --- MAIN TABLE SECTION --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-700">Pending Review</h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <div className="relative w-full md:w-64">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search..." value={filters.search} onChange={(e) => { setFilters({...filters, search: e.target.value}); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
                </div>
                <select value={filters.source} onChange={(e) => { setFilters({...filters, source: e.target.value}); setCurrentPage(1); }} className="w-full md:w-40 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-gray-500">
                  <option value="All Sources">Source</option><option value="MONO">Bank (Mono)</option><option value="MANUAL">Manual</option>
                </select>
                <select value={filters.status} onChange={(e) => { setFilters({...filters, status: e.target.value}); setCurrentPage(1); }} className="w-full md:w-40 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-gray-500">
                  <option value="All Statuses">Status</option><option value="Uncategorized">Uncategorized</option><option value="Missing VAT">Missing VAT</option><option value="Missing Document">Missing Document</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto relative min-h-[300px]">
              {isLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 text-gray-500 font-medium">Loading items...</div>}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold border-b border-gray-100">
                    <th className="py-4 px-4 rounded-tl-lg">Description</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Source</th>
                    <th className="py-4 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedItems.length === 0 && !isLoading ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">No pending items found.</td></tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-4 text-sm font-medium text-gray-700">{item.description}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-700">{formatCurrency(item.amount)}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{new Date(item.date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{item.source === 'MONO' ? 'Bank' : 'Manual'}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-600">{getPrimaryIssue(item)}</span>
                            <button onClick={() => handleFixClick(item)} className="px-4 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition">Fix</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end items-center mt-6 gap-2 border-t border-gray-50 pt-6">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-50"><ChevronLeftIcon className="w-4 h-4" /></button>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-bold">{currentPage}</div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-50"><ChevronRightIcon className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* --- TRANSACTION DETAILS MODAL --- */}
        {isDetailsModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 animate-fade-in-up">
              
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Resolve Transaction</h3>
                <button onClick={() => setIsDetailsModalOpen(false)}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-700"/></button>
              </div>
              
              <div className="p-8 space-y-6">
                
                <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-gray-800">{selectedTransaction?.source === 'MONO' ? 'Bank Sync' : 'Manual Entry'}</span>
                      <span className="text-gray-500 text-sm ml-2">- {new Date(selectedTransaction?.date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                      <p className="text-sm font-medium text-gray-600 mt-1">{selectedTransaction?.description}</p>
                    </div>
                    <span className="text-lg font-black text-gray-900">{formatCurrency(selectedTransaction?.amount || 0)}</span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-4">
                    <span className="font-bold">{selectedTransaction?.type === 'INCOME' ? 'Income' : 'Expense'}</span>
                    <span>&raquo;</span>
                    <select 
                      value={editCategory} 
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="bg-white p-1.5 rounded border border-gray-200 font-medium text-gray-700 outline-none cursor-pointer focus:border-primary"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800">VAT Classification</label>
                  <select 
                    value={editVatStatus} 
                    onChange={(e) => setEditVatStatus(e.target.value)}
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="MISSING_VAT">MISSING - Needs Classification</option>
                    <option value="TAGGED">7.5% VAT Applicable</option>
                    <option value="EXEMPT">Exempt / Zero Rated</option>
                  </select>
                </div>

                {/* RECEIPTS UPLOAD SECTION */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white">
                    <span className="font-bold text-gray-800 text-sm">Receipts & Documents</span>
                    <input type="file" id="receipt-upload" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                    <label htmlFor="receipt-upload" className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-700 transition shadow-sm">
                      <PlusIcon className="w-4 h-4" /> {selectedFile ? "Change File" : "Attach File"}
                    </label>
                  </div>
                  
                  <div className="p-4 space-y-3 bg-gray-50/30">
                    {selectedFile ? (
                      <div className="flex justify-between items-center p-3 bg-white border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-50 text-primary rounded flex items-center justify-center"><DocumentIcon className="w-5 h-5"/></div>
                           <span className="text-sm font-bold text-gray-700">{selectedFile.name}</span>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-600 transition"><TrashIcon className="w-5 h-5"/></button>
                      </div>
                    ) : selectedTransaction?.document ? (
                      <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-green-50 text-green-500 rounded flex items-center justify-center"><DocumentIcon className="w-5 h-5"/></div>
                           <span className="text-sm font-medium text-gray-700">Document Uploaded</span>
                        </div>
                        <a href={selectedTransaction.document.url} target="_blank" className="text-xs font-bold text-primary hover:underline">View</a>
                      </div>
                    ) : (
                       <p className="text-xs text-gray-400 italic px-2">No documents attached yet.</p>
                    )}
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-gray-50 flex gap-4 bg-gray-50/50 rounded-b-2xl">
                <button onClick={() => setIsDetailsModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleSaveAndReconcile} disabled={isSaving} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save & Reconcile"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, count, subtitle, trend, icon, isRed }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <h3 className="text-3xl font-black text-gray-900 mt-2 flex items-baseline gap-2">
            {count} <span className="text-lg font-bold text-gray-500">{subtitle}</span>
          </h3>
        </div>
        <div className={`p-2 rounded-full border ${isRed ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>{icon}</div>
      </div>
      <p className={`text-xs font-bold mt-6 ${isRed ? 'text-red-500' : 'text-primary'}`}>{trend}</p>
    </div>
  );
}