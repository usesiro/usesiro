'use client';

import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  XMarkIcon, 
  ArrowUpTrayIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  VariableIcon,
  ShieldCheckIcon,
  TrashIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { SIRO_FIELDS, SiroField } from '@/lib/bank-mappings';

interface TransactionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'UPLOAD' | 'STANDARDIZING' | 'CONFIRM_CLEANUP' | 'MAP' | 'REVIEW' | 'IMPORTING' | 'SUCCESS';

export default function TransactionImportModal({ isOpen, onClose, onSuccess }: TransactionImportModalProps) {
  const [step, setStep] = useState<Step>('UPLOAD');
  const [fileData, setFileData] = useState<any[]>([]);
  const [standardizedData, setStandardizedData] = useState<any>(null);
  const [editableTransactions, setEditableTransactions] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, SiroField | null>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number, duplicates: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Confirmation states
  const [confirmedRate, setConfirmedRate] = useState<number | null>(null);
  const [applyOpeningBalance, setApplyOpeningBalance] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return editableTransactions.slice(start, start + PAGE_SIZE);
  }, [editableTransactions, currentPage]);

  const totalPages = Math.ceil(editableTransactions.length / PAGE_SIZE);

  if (!isOpen) return null;

  const handleStandardize = async (rawHeaders: string[], rawData: any[]) => {
    setStep('STANDARDIZING');
    try {
      const response = await fetch('/api/v1/import/standardize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}`
        },
        body: JSON.stringify({ headers: rawHeaders, data: rawData }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Standardization failed");
      
      setStandardizedData(result);
      setEditableTransactions(result.transactions || []);
      if (result.suggestedRate) setConfirmedRate(result.suggestedRate);
      
      // Only show confirmation step if there's something to confirm (balance or rate)
      const hasOpeningBalance = !!result.openingBalance;
      const hasForeignCurrency = result.detectedCurrency && result.detectedCurrency !== 'NGN';
      
      if (hasOpeningBalance || hasForeignCurrency) {
        setStep('CONFIRM_CLEANUP');
      } else {
        setStep('REVIEW');
      }
    } catch (err: any) {
      setError(err.message || "AI failed to clean the data.");
      setStep('UPLOAD');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    try {
      let fileHeaders: string[] = [];
      let data: any[] = [];

      if (isPdf) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/v1/import/parse-pdf', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}` },
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to parse PDF");
        
        fileHeaders = result.headers;
        data = result.data;
      } else {
        const bstr = await file.arrayBuffer();
        const wb = XLSX.read(bstr, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        if (data.length === 0) throw new Error("The file is empty.");
        fileHeaders = Object.keys(data[0] as object);
      }

      setFileData(data);
      setHeaders(fileHeaders);
      await handleStandardize(fileHeaders, data);
      
    } catch (err: any) {
      setError(err.message || "Failed to process file.");
      setIsUploading(false);
    }
  };

  const handleExecuteImport = async () => {
    setStep('IMPORTING');
    setError(null);

    try {
      const dataToImport = editableTransactions.length > 0 
        ? editableTransactions 
        : fileData;

      const response = await fetch('/api/v1/import/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}`
        },
        body: JSON.stringify({ 
          data: dataToImport, 
          mapping, 
          headers,
          rate: confirmedRate,
          updateOpeningBalance: applyOpeningBalance ? standardizedData?.openingBalance : null
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Import failed");

      setImportResult({ count: result.count, duplicates: result.duplicates });
      setStep('SUCCESS');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setStep('REVIEW');
    }
  };

  const updateEditableField = (index: number, field: string, value: any) => {
    setEditableTransactions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const deleteRow = (index: number) => {
    setEditableTransactions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Import Records</h2>
            <p className="text-sm text-gray-500 font-medium">Clearsheet AI powered smart importer</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex gap-3 text-sm font-medium">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* STEP: UPLOAD */}
          {step === 'UPLOAD' && (
            <div className="space-y-6 text-center">
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-200 rounded-3xl p-12 transition-all group ${isUploading ? 'opacity-50 cursor-wait' : 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer'}`}
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {isUploading ? <ArrowPathIcon className="w-8 h-8 animate-spin" /> : <ArrowUpTrayIcon className="w-8 h-8" />}
                </div>
                <h3 className="text-lg font-bold text-gray-800">{isUploading ? 'Reading file...' : 'Choose a file to upload'}</h3>
                <p className="text-xs text-gray-500 mt-2 font-medium">Accepts .csv, .xlsx, .xls, .pdf</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden" 
                />
              </div>
            </div>
          )}

          {/* STEP: STANDARDIZING */}
          {step === 'STANDARDIZING' && (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                <SparklesIcon className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-gray-800 mt-8">Clearsheet AI is Cleaning Up</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">Almost there! We're structuring your data and identifying transactions...</p>
            </div>
          )}

          {/* STEP: CONFIRM CLEANUP */}
          {step === 'CONFIRM_CLEANUP' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                <p className="text-sm font-bold text-purple-900">AI Cleanup Results</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {standardizedData?.openingBalance && (
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between col-span-full">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Detected Starting Balance</p>
                      <p className="font-black text-indigo-900 text-lg">₦{standardizedData.openingBalance.toLocaleString()}</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-indigo-700">Set as Account Start?</span>
                      <input 
                        type="checkbox" 
                        checked={applyOpeningBalance}
                        onChange={(e) => setApplyOpeningBalance(e.target.checked)}
                        className="w-5 h-5 rounded-lg border-indigo-200 text-indigo-600" 
                      />
                    </label>
                  </div>
                )}
                
                {standardizedData?.detectedCurrency !== 'NGN' && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between col-span-full">
                    <p className="text-xs font-bold text-amber-800">Exchange Rate ({standardizedData?.detectedCurrency} → NGN)</p>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-amber-200 min-w-[140px]">
                      <input 
                        type="number" 
                        value={confirmedRate || ''}
                        onChange={(e) => setConfirmedRate(Number(e.target.value))}
                        className="w-full text-right text-sm font-black text-amber-900 focus:outline-none"
                        placeholder="Rate"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button onClick={() => setStep('UPLOAD')} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition">Discard</button>
                <button onClick={() => setStep('REVIEW')} className="px-10 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all">Proceed to Review</button>
              </div>
            </div>
          )}

          {/* STEP: REVIEW */}
          {step === 'REVIEW' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Records</p>
                    <p className="font-black text-gray-800 text-sm">{editableTransactions.length}</p>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-3">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs text-amber-800 font-medium">
                  <p className="font-bold">Verify Clearsheet's Work</p>
                  <p className="mt-0.5 opacity-80">Please check the dates, amounts, and types below. Click any cell to make corrections if Clearsheet AI missed anything.</p>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto rounded-2xl border border-gray-100 no-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                    <tr>
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider w-[140px]">Date</th>
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider w-[120px]">Type</th>
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider w-[140px] text-right">Amount</th>
                      <th className="px-4 py-3 w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedTransactions.map((t, localIndex) => {
                      const globalIndex = (currentPage - 1) * PAGE_SIZE + localIndex;
                      return (
                        <tr key={globalIndex} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-4 py-2">
                            <input 
                              type="text" 
                              value={t.date} 
                              onChange={(e) => updateEditableField(globalIndex, 'date', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-gray-600 text-xs"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="text" 
                              value={t.description} 
                              onChange={(e) => updateEditableField(globalIndex, 'description', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-gray-800 text-xs"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select 
                              value={t.type} 
                              onChange={(e) => updateEditableField(globalIndex, 'type', e.target.value)}
                              className={`bg-transparent border-none focus:ring-0 p-0 text-[10px] font-black uppercase tracking-wider outline-none ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}
                            >
                              <option value="INCOME">Income</option>
                              <option value="EXPENSE">Expense</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input 
                              type="text" 
                              value={t.amount} 
                              onChange={(e) => updateEditableField(globalIndex, 'amount', e.target.value)}
                              className={`w-full bg-transparent border-none focus:ring-0 p-0 text-right font-black text-xs ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button 
                              onClick={() => deleteRow(globalIndex)}
                              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Correct any AI errors before saving</p>
                <div className="flex gap-4 items-center">
                  <button onClick={() => setStep('UPLOAD')} className="text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                  <button 
                    onClick={handleExecuteImport}
                    className="px-10 py-3 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Confirm & Finish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: IMPORTING / SUCCESS (Same as before) */}
          {step === 'IMPORTING' && (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black text-gray-800">Finalizing Import</h3>
              <p className="text-sm text-gray-500 mt-2">Uploading verified transactions to your ledger...</p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Import Complete!</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-2xl font-black text-gray-800">{importResult?.count}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Created</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-2xl font-black text-gray-800">{importResult?.duplicates}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duplicates</p>
                </div>
              </div>
              <button onClick={onClose} className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black transition-all">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
