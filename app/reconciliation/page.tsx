"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  DocumentMagnifyingGlassIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Reconciliation() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [editVatStatus, setEditVatStatus] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFixClick = (item: any) => {
    setSelectedTransaction(item);
    setEditVatStatus(item.vatStatus || "MISSING_VAT");
    setIsDetailsModalOpen(true);
  };

  const handleSaveAndReconcile = async () => {
    if (!selectedTransaction) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/transactions/${selectedTransaction.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` 
        },
        body: JSON.stringify({ vatStatus: editVatStatus })
      });

      if (res.ok) {
        // [Inference] Removing item locally prevents unnecessary re-fetch and feels faster
        setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
        setIsDetailsModalOpen(false);
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const pendingItems = transactions.filter(t => t.vatStatus === 'MISSING_VAT' || !t.categoryId);
  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amt);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Uncategorized" count={transactions.filter(t => !t.categoryId).length} color="blue" icon={<DocumentMagnifyingGlassIcon className="w-5 h-5"/>} />
          <StatCard title="Missing VAT Tags" count={transactions.filter(t => t.vatStatus === 'MISSING_VAT').length} color="gray" icon={<DocumentDuplicateIcon className="w-5 h-5"/>} />
          <StatCard title="Missing Documents" count={transactions.filter(t => !t.document).length} color="red" icon={<ExclamationTriangleIcon className="w-5 h-5"/>} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Pending Action ({pendingItems.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 border-b">
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Issue</th>
                  <th className="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-4 px-4 text-sm font-medium">{item.description}</td>
                    <td className="py-4 px-4 text-sm font-medium text-red-500">-{formatCurrency(item.amount)}</td>
                    <td className="py-4 px-4">
                       <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase">
                        {!item.categoryId ? "No Category" : "Missing VAT"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => handleFixClick(item)} className="text-primary font-bold text-sm hover:underline">Fix Issue</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isDetailsModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold text-dark">Resolve Transaction</h3>
                <button onClick={() => setIsDetailsModalOpen(false)}><XMarkIcon className="w-6 h-6 text-gray-400"/></button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{selectedTransaction?.description}</p>
                <p className="text-xl font-bold text-dark">{formatCurrency(selectedTransaction?.amount || 0)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tax Classification</label>
                <select 
                  value={editVatStatus} 
                  onChange={(e) => setEditVatStatus(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="MISSING_VAT">Missing VAT (Unresolved)</option>
                  <option value="TAGGED">7.5% VAT Applicable</option>
                  <option value="EXEMPT">Exempt / Zero Rated</option>
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={() => setIsDetailsModalOpen(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button 
                  onClick={handleSaveAndReconcile} 
                  disabled={isSaving} 
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition"
                >
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

function StatCard({ title, count, color, icon }: any) {
  const colors: any = { blue: "bg-blue-50 text-blue-500", gray: "bg-gray-50 text-gray-500", red: "bg-red-50 text-red-500" };
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between mb-4">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-dark">{count} Issues</h3>
    </div>
  );
}