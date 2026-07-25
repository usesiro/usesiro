"use client";

import dynamic from "next/dynamic";

const PaystackInner = dynamic(() => import("./PaystackInner"), {
  ssr: false,
  loading: () => (
    <button
      disabled
      className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white text-sm font-bold rounded-xl opacity-50 shadow-lg shadow-green-200"
    >
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading...
    </button>
  ),
});

interface CheckoutButtonProps {
  userEmail: string;
  amountInKobo?: number;
}

export default function CheckoutButton({ userEmail, amountInKobo = 999900 }: CheckoutButtonProps) {
  return <PaystackInner userEmail={userEmail} amountInKobo={amountInKobo} />;
}
