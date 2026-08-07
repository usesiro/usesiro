"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Progress = {
  completedSteps: string[];
  completedCount: number;
  totalSteps: number;
  isComplete: boolean;
  isDismissed: boolean;
};

const steps = [
  { id: "PROFILE_COMPLETED", label: "Complete your business profile", href: "/settings" },
  { id: "TRANSACTION_ADDED", label: "Add or import transactions", href: "/transactions" },
  { id: "TRANSACTION_CATEGORIZED", label: "Review a transaction category", href: "/transactions" },
  { id: "VAT_REVIEWED", label: "Review a VAT status", href: "/tax-readiness" },
  { id: "DOCUMENT_ATTACHED", label: "Attach a receipt or invoice", href: "/reconciliation" },
  { id: "REPORT_GENERATED", label: "Generate your first report", href: "/reports" },
];

export default function OnboardingChecklist() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    fetch("/api/v1/onboarding")
      .then((response) => response.ok ? response.json() : null)
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  const dismiss = async () => {
    setProgress((current) => current ? { ...current, isDismissed: true } : current);
    await fetch("/api/v1/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss" }),
    }).catch(() => undefined);
  };

  if (!progress || progress.isComplete || progress.isDismissed) return null;

  const percent = Math.round((progress.completedCount / progress.totalSteps) * 100);

  return (
    <section id="tour-onboarding-checklist" className="mb-8 bg-white border border-blue-100 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.18em] mb-1">Getting started</p>
          <h2 className="text-lg font-black text-gray-900">Set up your tax-ready workspace</h2>
          <p className="text-sm text-gray-500 mt-1">{progress.completedCount} of {progress.totalSteps} completed</p>
        </div>
        <button onClick={dismiss} aria-label="Hide onboarding checklist" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {steps.map((step) => {
          const complete = progress.completedSteps.includes(step.id);
          return (
            <Link key={step.id} href={step.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
              <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 ${complete ? "text-green-500" : "text-gray-300"}`} />
              <span className={`text-sm font-semibold flex-1 ${complete ? "text-gray-400 line-through" : "text-gray-700"}`}>{step.label}</span>
              {!complete && <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-primary" />}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
