'use client';

import React, { useMemo, useState } from 'react';
import Connect from '@mono.co/connect.js';

interface ConnectBankProps {
  onSuccess: () => void;
}

export default function ConnectBank({ onSuccess }: ConnectBankProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Read the feature flag from the environment
  const enableMono = process.env.NEXT_PUBLIC_ENABLE_MONO === 'true';

  // --- MONO LOGIC (Preserved but hidden when flag is false) ---
  const monoInstance = useMemo(() => {
    if (typeof window === 'undefined' || !enableMono) return null;

    const config = {
      publicKey: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY!,
      onSuccess: async (data: { code: string }) => {
        const response = await fetch('/api/mono/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, 
          },
          body: JSON.stringify({ code: data.code }),
        });

        if (response.ok) {
          onSuccess();
        } else {
          alert("Failed to link bank. Please try again.");
        }
      },
      onClose: () => console.log("Widget closed"),
    };

    return new Connect(config);
  }, [onSuccess, enableMono]);

  const handleMonoOpen = () => {
    monoInstance?.setup();
    monoInstance?.open();
  };

  // --- SIRO PLUS MANUAL UPLOAD LOGIC ---
  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const formData = new FormData();
    // [Inference] Most standard file import pipelines expect the key 'file' 
    formData.append("file", file);

    try {
      // Pointing directly to the AI Import Pipeline built by Morenike
      const response = await fetch('/api/import/standardize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}`, 
        },
        body: formData,
      });

      if (response.ok) {
        onSuccess(); 
      } else {
        alert("Failed to process document. Please check the file format.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      // Clear the input so the user can upload the same file again if needed
      e.target.value = '';
    }
  };

  // Render Mono Button if enabled
  if (enableMono) {
    return (
      <button
        onClick={handleMonoOpen}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
      >
        Link Bank Account
      </button>
    );
  }

  // Render File Upload Button for Siro Plus MVP
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <label className={`w-full text-center px-6 py-3 rounded-lg font-semibold transition-all shadow-md cursor-pointer
        ${isUploading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
      >
        {isUploading ? "Extracting via AI..." : "Upload Bank Statement"}
        <input 
          type="file" 
          accept=".pdf,.csv" 
          className="hidden" 
          onChange={handleManualUpload}
          disabled={isUploading}
        />
      </label>
      <p className="text-xs text-gray-500 font-medium">Supports PDF and CSV</p>
    </div>
  );
}