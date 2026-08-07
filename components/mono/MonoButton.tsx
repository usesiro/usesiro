'use client';

import React, { useMemo } from 'react';
import Connect from '@mono.co/connect.js';
import { useNotification } from '@/context/NotificationContext';

interface MonoButtonProps {
  className?: string;
  label?: string;
  onSuccess?: () => void;
}

export default function MonoButton({ className, label, onSuccess }: MonoButtonProps) {
  const { showNotification } = useNotification();
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
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: data.code }),
          });

          const contentType = response.headers.get("content-type");
          
          // Safety check for HTML error pages (like 404/500)
          if (!contentType || !contentType.includes("application/json")) {
            const errorText = await response.text();
            console.error("Server Error Response:", errorText);
            showNotification("The bank service returned an unexpected response.", "error");
            return;
          }

          const result = await response.json();

          if (response.ok) {
            showNotification("Bank linked successfully!", "success");
            if (onSuccess) onSuccess();
          } else {
            console.error("Exchange API Error:", result);
            showNotification(result.error || "Bank linking failed.", "error");
          }
        } catch (err) {
          console.error("Network Exception:", err);
          showNotification("Could not connect to the bank service.", "error");
        }
      },
      onClose: () => console.log("Mono widget closed."),
    };

    return new Connect(config);
  }, [onSuccess, showNotification]);

  const handleOpen = () => {
    if (!monoInstance) {
      showNotification("Bank connection is not available yet.", "warning");
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
