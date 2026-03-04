'use client';

import React, { useMemo } from 'react';
import Connect from '@mono.co/connect.js';

interface ConnectBankProps {
  onSuccess: () => void;
}

export default function ConnectBank({ onSuccess }: ConnectBankProps) {
  const monoInstance = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const config = {
      publicKey: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY!,
      onSuccess: async (data: { code: string }) => {
        // This 'code' is the temporary token we exchange in your backend
        const response = await fetch('/api/mono/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Get your JWT from localStorage/Cookies
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
  }, [onSuccess]);

  const handleOpen = () => {
    monoInstance?.setup();
    monoInstance?.open();
  };

  return (
    <button
      onClick={handleOpen}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
    >
      Link Bank Account
    </button>
  );
}