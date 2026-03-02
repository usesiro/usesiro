"use client";

import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  CheckIcon, 
  BuildingLibraryIcon, 
  PencilSquareIcon,
  ArrowRightIcon 
} from "@heroicons/react/24/outline";

export default function WelcomePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        {/* Header Section */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary">Siro</span>, House of Salam
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto mb-12">
          Let's get your business tax-ready in a few simple steps. Start by connecting 
          your bank account or adding your first transaction manually.
        </p>

        {/* Stepper / Progress Bar */}
        <div className="relative flex items-center justify-between mb-20 max-w-2xl mx-auto">
          {/* Step 1: Completed */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
              <CheckIcon className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight absolute -bottom-6 whitespace-nowrap">Account created</span>
          </div>

          <div className="flex-1 h-[2px] bg-green-600 mx-4"></div>

          {/* Step 2: Completed */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
              <CheckIcon className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight absolute -bottom-6 whitespace-nowrap">Business profile</span>
          </div>

          <div className="flex-1 h-[2px] bg-gray-300 mx-4"></div>

          {/* Step 3: Active */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              3
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tight absolute -bottom-6 whitespace-nowrap">Connect Transactions</span>
          </div>

          <div className="flex-1 h-[2px] bg-gray-300 mx-4"></div>

          {/* Step 4: Pending */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold">
              4
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight absolute -bottom-6 whitespace-nowrap">You are tax-ready</span>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Card 1: Bank Account */}
          <div className="bg-primary text-white p-8 rounded-3xl text-left relative overflow-hidden group">
            <div className="absolute top-6 right-8 bg-blue-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Recommended
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <BuildingLibraryIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Connect Your Bank Account</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              Automatically pull in your transactions through Open Banking. Siro categorizes and VAT-tags them for you.
            </p>
            <Link href="/dashboard" className="inline-flex items-center justify-between w-full bg-white text-primary font-bold py-4 px-6 rounded-xl hover:bg-blue-50 transition">
              Get Started
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>

          {/* Card 2: Manual Upload */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl text-left shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <PencilSquareIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Add Transaction Manually</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Prefer to enter cash or informal transactions yourself? Add them one by one and we'll handle the rest.
            </p>
            <Link href="/transactions" className="inline-flex items-center justify-between w-full border-2 border-primary text-primary font-bold py-4 px-6 rounded-xl hover:bg-blue-50 transition">
              Get Started
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer Link */}
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm font-medium underline underline-offset-4">
          Skip for now - take me to dashboard
        </Link>
      </div>
    </DashboardLayout>
  );
}