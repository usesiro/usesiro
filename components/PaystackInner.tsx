"use client";

import { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { useNotification } from "@/context/NotificationContext";

interface PaystackInnerProps {
  userEmail: string;
  amountInKobo: number;
}

function PaystackInner({ userEmail, amountInKobo }: PaystackInnerProps) {
  const { showNotification } = useNotification();
  const [isVerifying, setIsVerifying] = useState(false);

  const config = {
    reference: `siro_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    email: userEmail,
    amount: amountInKobo,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || "",
    currency: "NGN",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (response: { reference: string }) => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("siro_access_token")}`,
        },
        body: JSON.stringify({ reference: response.reference }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        showNotification("Payment successful! Thank you.", "success");
      } else {
        showNotification(data.error || "Payment verification failed. Contact support.", "error");
      }
    } catch {
      showNotification("Could not verify payment. Please contact support.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const onClose = () => {
    showNotification("Payment window closed.", "warning");
  };

  return (
    <button
      onClick={() => initializePayment({ onSuccess, onClose })}
      disabled={isVerifying || !config.publicKey}
      className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 shadow-lg shadow-green-200"
    >
      {isVerifying ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Verifying...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Pay ₦9,999 — Subscribe
        </>
      )}
    </button>
  );
}

export default PaystackInner;
