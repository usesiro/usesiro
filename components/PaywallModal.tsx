"use client";

import { useState } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import CheckoutButton from "./CheckoutButton";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  featureName?: string;
}

export default function PaywallModal({ isOpen, onClose, userEmail, featureName }: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">

        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-blue-700 p-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-black mb-2">Unlock Siro Pro</h2>
          <p className="text-blue-100 text-sm">
            {featureName
              ? `"${featureName}" is a Pro feature.`
              : "This feature requires a Pro subscription."}
          </p>
        </div>

        {/* Features */}
        <div className="p-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What you get</p>

          <div className="space-y-3 mb-8">
            {[
              "Automated bank syncing via Mono",
              "AI-powered file imports (CSV, Excel, PDF)",
              "Tax-ready report exports (PDF & CSV)",
              "Unlimited transaction history",
              "Priority customer support",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-gray-900">₦9,999</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200">
              Early Adopter Rate
            </span>
          </div>

          {/* Checkout */}
          <div className="flex justify-center">
            <CheckoutButton userEmail={userEmail} />
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Secure payment via Paystack. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
