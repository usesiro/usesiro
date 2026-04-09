'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  XMarkIcon, 
  ArrowUpTrayIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { SIRO_FIELDS, SiroField } from '@/lib/bank-mappings';
import { parseFlexibleDate, parseFlexibleAmount } from '@/lib/import-parsers';

interface TransactionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'UPLOAD' | 'MAP' | 'REVIEW' | 'IMPORTING' | 'SUCCESS';

export default function TransactionImportModal({ isOpen, onClose, onSuccess }: TransactionImportModalProps) {
  const [step, setStep] = useState<Step>('UPLOAD');
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, SiroField | null>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number, duplicates: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAIMap = async () => {
    setIsAILoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/import/ai-detect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}`
        },
        body: JSON.stringify({ 
          headers, 
          sampleRows: fileData.slice(0, 3) 
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI Mapping failed");

      setMapping(prev => ({ ...prev, ...result.mapping }));
    } catch (err: any) {
      setError(err.message || "Failed to contact AI mapping service.");
    } finally {
      setIsAILoading(false);
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
        // --- PDF HANDLING: Backend extraction ---
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
        // --- CSV/EXCEL HANDLING: Standard XLSX logic ---
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

      // Fetch suggested mapping and validate format
      const response = await fetch('/api/v1/import/detect-columns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}`
        },
        body: JSON.stringify({ headers: fileHeaders }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "This file structure isn't recognized as a transaction record.");
      }

      setMapping(result.suggestedMapping);
      setStep('MAP');
    } catch (err: any) {
      setError(err.message || "Failed to process file.");
    } finally {
      setIsUploading(false);
    }
  };

  const getMappedValue = (row: any, field: SiroField) => {
    const entry = Object.entries(mapping).find(([_, mappedField]) => mappedField === field);
    return entry ? row[entry[0]] : undefined;
  };

  const transformRow = (row: any) => {
    let amount = 0;
    let type: 'INCOME' | 'EXPENSE' = 'INCOME';
    
    // mapping is a dictionary of file Header -> SiroField
    // So we need to reverse it to get row[Header] given a SiroField
    const amountVal = getMappedValue(row, 'amount');
    const debitVal = getMappedValue(row, 'debit');
    const creditVal = getMappedValue(row, 'credit');
    const dateVal = getMappedValue(row, 'date');
    const descVal = getMappedValue(row, 'description');
    const typeIndicatorVal = getMappedValue(row, 'transaction_type');

    if (amountVal !== undefined && amountVal !== "") {
      amount = parseFlexibleAmount(amountVal);
      type = amount < 0 ? 'EXPENSE' : 'INCOME';
      
      if (typeIndicatorVal && typeof typeIndicatorVal === 'string') {
        const tLower = typeIndicatorVal.toLowerCase();
        if (tLower.includes('out') || tLower.includes('expense') || tLower.includes('dr') || tLower.includes('debit') || tLower.includes('withdrawal')) {
          type = 'EXPENSE';
        } else if (tLower.includes('in') || tLower.includes('income') || tLower.includes('cr') || tLower.includes('credit') || tLower.includes('deposit')) {
          type = 'INCOME';
        }
      }

      amount = Math.abs(amount);
    } else if (debitVal !== undefined && debitVal !== "") {
      amount = Math.abs(parseFlexibleAmount(debitVal));
      type = 'EXPENSE';
    } else if (creditVal !== undefined && creditVal !== "") {
      amount = Math.abs(parseFlexibleAmount(creditVal));
      type = 'INCOME';
    }

    const d = parseFlexibleDate(dateVal);

    return {
      date: d ? d.toLocaleDateString() : 'N/A',
      description: descVal || 'No description',
      amount,
      type
    };
  };

  const handleExecuteImport = async () => {
    setStep('IMPORTING');
    setError(null);

    try {
      const response = await fetch('/api/v1/import/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}`
        },
        body: JSON.stringify({ 
          data: fileData, 
          mapping, 
          headers 
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

  const updateMapping = (header: string, field: SiroField | 'none') => {
    setMapping(prev => ({
      ...prev,
      [header]: field === 'none' ? null : field
    }));
  };

  // Helper to check if minimum required fields are mapped
  const isMappingValid = () => {
    const values = Object.values(mapping);
    return values.includes('date') && values.includes('description') && (values.includes('amount') || (values.includes('debit') && values.includes('credit')));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Import Records</h2>
            <p className="text-sm text-gray-500 font-medium">Upload statements or custom spreadsheet records (.csv, .xlsx)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {/* STEP 1: UPLOAD */}
          {step === 'UPLOAD' && (
            <div className="space-y-6 text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-3xl p-12 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ArrowUpTrayIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Choose a file to upload</h3>
                <p className="text-sm text-gray-500 mt-1">Accepts .csv, .xlsx, .xls, .pdf</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden" 
                />
              </div>
              <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-left">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <ExclamationCircleIcon className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">Security Note</p>
                  <p className="text-xs text-indigo-700/70">Your data is processed securely and hashed for idempotency. We never store raw file copies.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MAPPING */}
          {step === 'MAP' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex gap-3 flex-1">
                  <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                    We've tried to match your columns automatically. Please verify that each Siro field maps correctly.
                  </p>
                </div>
                
                <button
                  onClick={handleAIMap}
                  disabled={isAILoading}
                  className="shrink-0 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:hover:from-purple-600 disabled:hover:to-indigo-600"
                >
                  {isAILoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <SparklesIcon className="w-4 h-4 text-purple-100" />
                  )}
                  {isAILoading ? "AI is Mapping..." : "Map with AI (Groq)"}
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 no-scrollbar relative">
                {isAILoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-xl shadow-purple-900/5 flex flex-col items-center gap-3 border border-purple-100/50">
                      <SparklesIcon className="w-8 h-8 text-purple-500 animate-pulse" />
                      <p className="text-sm font-bold text-gray-800">Llama 3 is analyzing your data...</p>
                    </div>
                  </div>
                )}
                {headers.map(header => (
                  <div key={header} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Column in File</p>
                      <p className="font-bold text-gray-800 truncate" title={header}>{header}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ChevronRightIcon className="w-4 h-4 text-gray-300" />
                      <select 
                        value={mapping[header] || 'none'}
                        onChange={(e) => updateMapping(header, e.target.value as any)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[160px]"
                      >
                        <option value="none">Ignore Column</option>
                        {SIRO_FIELDS.map(field => (
                          <option key={field} value={field}>
                            {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium italic">
                  {!isMappingValid() && "Mapping required for Date, Description, and Amount (or Dr/Cr)."}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('UPLOAD')}
                    className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                  >
                    Back
                  </button>
                  <button 
                    disabled={!isMappingValid()}
                    onClick={() => setStep('REVIEW')}
                    className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                  >
                    Next: Review Records
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* STEP 2.5: REVIEW */}
          {step === 'REVIEW' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
                <CheckCircleIcon className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Review how Siro will import your records. This is exactly how they will appear in your transaction list.
                </p>
              </div>

              <div className="max-h-[350px] overflow-y-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fileData.slice(0, 10).map((row, i) => {
                      const t = transformRow(row);
                      return (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-600 truncate max-w-[100px]">{t.date}</td>
                          <td className="px-4 py-3 font-bold text-gray-800 truncate max-w-[200px]">{t.description}</td>
                          <td className={`px-4 py-3 font-black text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'EXPENSE' ? '-' : '+'}{Number(t.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {fileData.length > 10 && (
                  <div className="p-3 text-center bg-gray-50/50 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">And {fileData.length - 10} more records...</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium">
                  Ready to import {fileData.length} records.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('MAP')}
                    className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                  >
                    Adjust Mapping
                  </button>
                  <button 
                    onClick={handleExecuteImport}
                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Confirm & Finish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: IMPORTING */}
          {step === 'IMPORTING' && (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black text-gray-800">Processing Records</h3>
              <p className="text-sm text-gray-500 mt-2">Hashing items and checking for duplicates...</p>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-in">
                <CheckCircleIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Import Complete!</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-2xl font-black text-gray-800">{importResult?.count}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">New</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-2xl font-black text-gray-800">{importResult?.duplicates}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Skipped</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-500 font-medium">Your Transactions page has been updated.</p>
              <button 
                onClick={onClose}
                className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all"
              >
                Close Importer
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex gap-3 text-sm font-medium animate-in slide-in-from-top-2">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
