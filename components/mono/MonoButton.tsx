'use client';

import React, { useMemo } from 'react';
import Connect from '@mono.co/connect.js';

interface MonoButtonProps {
  className?: string;
  label?: string;
  onSuccess?: () => void;
}

export default function MonoButton({ className, label, onSuccess }: MonoButtonProps) {
  // Matches your folder: app/api/v1/mono/exchange/route.ts
  const API_PATH = '/api/v1/mono/exchange'; 

  const monoInstance = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;

    if (!publicKey) {
      console.error("MONO ERROR: NEXT_PUBLIC_MONO_PUBLIC_KEY is missing in .env");
      return null;
    }

    const config = {
      key: publicKey,
      onSuccess: async (data: { code: string }) => {
        console.log("Mono code received. Sending to:", API_PATH);
        
        try {
          const response = await fetch(API_PATH, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('siro_access_token')}`, 
            },
            body: JSON.stringify({ code: data.code }),
          });

          const contentType = response.headers.get("content-type");
          
          // Safety check for HTML error pages (like 404/500)
          if (!contentType || !contentType.includes("application/json")) {
            const errorText = await response.text();
            console.error("Server Error Response:", errorText);
            alert("The server encountered an error. Check the terminal logs.");
            return;
          }

          const result = await response.json();

          if (response.ok) {
            alert("Bank linked successfully!");
            if (onSuccess) onSuccess();
          } else {
            console.error("Exchange API Error:", result);
            alert(`Link Failed: ${result.error || "Check server logs"}`);
          }
        } catch (err) {
          console.error("Network Exception:", err);
          alert("Could not connect to the server.");
        }
      },
      onClose: () => console.log("Mono widget closed."),
    };

    return new Connect(config);
  }, [onSuccess]);

  const handleOpen = () => {
    if (!monoInstance) {
      alert("Mono is not ready. Check your .env setup.");
      return;
    }
    monoInstance.setup();
    monoInstance.open();
  };

  return (
    <button onClick={handleOpen} className={className}>
      {label || "Link Bank Account"}
    </button>
  );
}