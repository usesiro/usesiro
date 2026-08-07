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
import { extractTransactionRegions, chunkByLines } from '@/lib/import-parsers';

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
  const [importProgress, setImportProgress] = useState(0);
  const [currentBatchText, setCurrentBatchText] = useState("");
  const [importStage, setImportStage] = useState<'IDLE' | 'READING' | 'EXTRACTING' | 'CLEANING' | 'REVIEW'>('IDLE');
  const [lastProcessedIndex, setLastProcessedIndex] = useState(-1);
  const [isRetrying, setIsRetrying] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset internal state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep('UPLOAD');
      setFileData([]);
      setStandardizedData(null);
      setEditableTransactions([]);
      setHeaders([]);
      setMapping({});
      setIsUploading(false);
      setImportResult(null);
      setError(null);
      setConfirmedRate(null);
      setApplyOpeningBalance(false);
      setCurrentPage(1);
      setLastProcessedIndex(-1);
    }
  }, [isOpen]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return editableTransactions.slice(start, start + PAGE_SIZE);
  }, [editableTransactions, currentPage]);

  const totalPages = Math.ceil(editableTransactions.length / PAGE_SIZE);

  if (!isOpen) return null;

  const handleStandardize = async (
    rawHeaders: string[], 
    rawData: any[], 
    fallbackBalance: number | null = null, 
    fallbackCurrency: string | null = null
  ) => {
    setStep('STANDARDIZING');
    setImportStage('CLEANING');
    setImportProgress(rawData.length > 250 ? 50 : 0); // Start at 50% if following Extraction
    setError(null);

    const BATCH_SIZE = 25;
    const batches = [];
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      batches.push(rawData.slice(i, i + BATCH_SIZE));
    }

    let allTransactions: any[] = lastProcessedIndex >= 0 ? [...editableTransactions] : [];
    let initialBalance = standardizedData?.openingBalance || null;
    let currency = standardizedData?.detectedCurrency || "NGN";
    let exchangeRate = standardizedData?.suggestedRate || null;

    try {
      const startIndex = lastProcessedIndex + 1;
      for (let i = startIndex; i < batches.length; i++) {
        setLastProcessedIndex(i);
        setCurrentBatchText(`AI Structuring: Records ${i * BATCH_SIZE + 1} to ${Math.min((i + 1) * BATCH_SIZE, rawData.length)}...`);
        
        const response = await fetch('/api/v1/import/standardize', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ headers: rawHeaders, data: batches[i] }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `Failed at batch ${i + 1}`);

        allTransactions = [...allTransactions, ...(result.transactions || [])];
        
        if (i === 0) {
          initialBalance = result.openingBalance;
          currency = result.detectedCurrency;
          exchangeRate = result.suggestedRate;
        }

        const baseProgress = rawData.length > 250 ? 50 : 0;
        const progressMultiplier = rawData.length > 250 ? 0.5 : 1;
        setImportProgress(Math.round(baseProgress + ((i + 1) / batches.length) * 100 * progressMultiplier));
        setEditableTransactions([...allTransactions]);
        
        if (batches.length > 1) await new Promise(r => setTimeout(r, 4500)); // Stay under 30 RPM
      }

      setStandardizedData({ 
        openingBalance: initialBalance || fallbackBalance, 
        detectedCurrency: currency || fallbackCurrency || "NGN", 
        suggestedRate: exchangeRate 
      });
      
      if (exchangeRate) setConfirmedRate(exchangeRate);
      setImportStage('REVIEW');

      const hasOpeningBalance = !!(initialBalance || fallbackBalance);
      const hasForeignCurrency = (currency || fallbackCurrency) && (currency || fallbackCurrency) !== 'NGN';
      
      if (hasOpeningBalance || hasForeignCurrency) {
        setStep('CONFIRM_CLEANUP');
      } else {
        setStep('REVIEW');
      }
      setLastProcessedIndex(-1); // Success, clear progress
    } catch (err: any) {
      const isNetwork = err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('timeout');
      setError(err.message || "Clearsheet AI failed to process some records.");
      if (!isNetwork) {
        setStep('UPLOAD');
        setImportStage('IDLE');
        setLastProcessedIndex(-1);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setEditableTransactions([]);
    setImportProgress(0);

    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    try {
      if (isPdf) {
        // --- STAGE 1: RAW TEXT EXTRACTION ---
        setImportStage('READING');
        setCurrentBatchText("Extracting raw text from PDF...");
        const formData = new FormData();
        formData.append('file', file);
        
        const extractRes = await fetch('/api/v1/import/extract-text', {
          method: 'POST',
          body: formData,
        });

        const extractResult = await extractRes.json();
        if (!extractRes.ok) throw new Error(extractResult.error || "Failed to read PDF");
        
        const rawText = extractResult.text;
        
        // --- STAGE 2: AI RECORD EXTRACTION (CHUNKED BY LINES WITH 2-LINE OVERLAP) ---
        setImportStage('EXTRACTING');
        const transactionLines = extractTransactionRegions(rawText);
        
        let allExtractedRows: any[] = [];
        const seenRows = new Set<string>(); // For de-duplication
        let detectedOpeningBalance: number | null = null;
        let detectedCurrency: string | null = null;

        // Recursive processor to handle "Split-and-Retry" for truncated responses
        // batchNumber and totalBatches are used for progress tracking/UI
        const processChunkWithRetry = async (lines: string[], batchNumber: number, totalBatches: number) => {
          setCurrentBatchText(`AI Reading: Section ${batchNumber} of ${totalBatches}...`);
          
          try {
            const parseRes = await fetch('/api/v1/import/parse-pdf', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text: lines.join('\n') }),
            });

            const parseResult = await parseRes.json();
            
            // If we hit a truncation error, split this specific chunk in half and retry
            if (!parseRes.ok && parseResult.error?.toLowerCase().includes('truncated')) {
              console.warn("AI Truncated. Splitting chunk and retrying...", lines.length);
              const half = Math.ceil(lines.length / 2);
              const firstHalf = lines.slice(0, half + 2); // 2-line overlap
              const secondHalf = lines.slice(half);
              
              await processChunkWithRetry(firstHalf, batchNumber, totalBatches + 1);
              await processChunkWithRetry(secondHalf, batchNumber + 1, totalBatches + 1);
              return;
            }

            if (!parseRes.ok) throw new Error(parseResult.error || `Failed to read section ${batchNumber}`);
            
            const newRows = parseResult.rows || [];
            
            // Capture Metadata (only if not already set)
            if (!detectedOpeningBalance) detectedOpeningBalance = parseResult.openingBalance;
            if (!detectedCurrency) detectedCurrency = parseResult.currency;
            
            // Smart De-duplication using composite key
            newRows.forEach((row: any) => {
              const rowKey = `${row.date}_${row.description}_${row.amount}`.toLowerCase().replace(/\s+/g, '');
              if (!seenRows.has(rowKey)) {
                seenRows.add(rowKey);
                allExtractedRows.push(row);
              }
            });

            setImportProgress(Math.round((batchNumber / totalBatches) * 50));
            // Add jitter/delay to stay under RPM limits on Free Tier
            await new Promise(r => setTimeout(r, 2500)); 
          } catch (error: any) {
             throw error;
          }
        };

        // Initial chunks of 25 lines (optimized for Qwen-235B)
        const initialChunks = chunkByLines(transactionLines, 25, 2);
        for (let i = 0; i < initialChunks.length; i++) {
          if (i <= lastProcessedIndex) continue; // Skip on retry if we track this separately
          await processChunkWithRetry(initialChunks[i], i + 1, initialChunks.length);
          setLastProcessedIndex(i);
        }

        setLastProcessedIndex(-1); // Reset for next stage

        if (allExtractedRows.length === 0) throw new Error("No transactions found in this PDF.");
        
        // --- STAGE 3: AI STANDARDIZATION ---
        setFileData(allExtractedRows);
        setHeaders(Object.keys(allExtractedRows[0] || {}));
        
        // Pass detected metadata to standardize or use as fallback
        await handleStandardize(
          Object.keys(allExtractedRows[0] || {}), 
          allExtractedRows,
          detectedOpeningBalance,
          detectedCurrency
        );

      } else {
        // XLSX/CSV Logic
        const bstr = await file.arrayBuffer();
        const wb = XLSX.read(bstr, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        if (data.length === 0) throw new Error("The file is empty.");
        const fileHeaders = Object.keys(data[0] as object);
        
        setFileData(data);
        setHeaders(fileHeaders);
        await handleStandardize(fileHeaders, data);
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to process file.");
      setIsUploading(false);
      setImportStage('IDLE');
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
          'Content-Type': 'application/json'
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
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex flex-col gap-3">
              <div className="flex gap-3 text-sm font-medium">
                <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                {error}
              </div>
              {lastProcessedIndex >= 0 && (
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => {
                        setError(null);
                        if (importStage === 'CLEANING') {
                            handleStandardize(headers, fileData, standardizedData?.openingBalance, standardizedData?.detectedCurrency);
                        } else if (importStage === 'EXTRACTING') {
                            // Stage 2 retry is trickier as it's inside handleFileUpload
                            // For now we mainly handle Stage 3 which is where the user failed
                            setError("Please re-upload for Stage 2 errors. Resuming Stage 3 cleanup...");
                            setStep('UPLOAD');
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-colors"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    Retry From Records {Math.max(0, lastProcessedIndex * 25)}
                  </button>
                </div>
              )}
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
              <h3 className="text-xl font-black text-gray-800 mt-8">
                {importStage === 'READING' && 'Reading Document'}
                {importStage === 'EXTRACTING' && 'AI Parsing Table'}
                {importStage === 'CLEANING' && 'AI Finalizing Cleanup'}
                {importStage === 'IDLE' && 'Clearsheet AI is Processing'}
              </h3>
              <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
                <div 
                  className="bg-purple-600 h-full transition-all duration-700 ease-in-out" 
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
              <p className="text-xs font-bold text-purple-600 mt-3">{importProgress}% Complete</p>
              <p className="text-[11px] text-gray-800 mt-2 font-bold">{currentBatchText}</p>
              <p className="text-sm text-gray-500 mt-8 max-w-sm">
                {importStage === 'READING' && "We're extracting the raw text from your PDF file..."}
                {importStage === 'EXTRACTING' && "Clearsheet AI is identifying transaction rows from the document..."}
                {importStage === 'CLEANING' && "Almost there! We're structuring the records into your ledger format..."}
              </p>
              <div className="mt-8 flex gap-2 items-center justify-center p-3 bg-blue-50 rounded-2xl border border-blue-100 max-w-xs">
                 <VariableIcon className="w-4 h-4 text-blue-500" />
                 <p className="text-[10px] text-blue-700 font-bold">This is a long document. We're processing it in chunks to ensure 100% accuracy.</p>
              </div>
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
                      <th className="px-4 py-3 font-black text-gray-400 text-[10px] uppercase tracking-wider min-w-[200px] max-w-[300px]">Description</th>
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
                          <td className="px-4 py-2 max-w-[300px]">
                            <input 
                              type="text" 
                              value={t.description} 
                              title={t.description}
                              onChange={(e) => updateEditableField(globalIndex, 'description', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-gray-800 text-xs truncate"
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
