"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

const pageTours: Record<string, DriveStep[]> = {
  "/dashboard": [
    {
      element: "#tour-dashboard-welcome",
      popover: {
        title: "Your Siro overview",
        description: "Start here for a quick view of your business, tax readiness, and the work that needs attention.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-onboarding-checklist",
      popover: {
        title: "Your getting-started checklist",
        description: "These tasks guide you from setup to your first complete, exportable financial report.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-dashboard-main",
      popover: {
        title: "Your financial workspace",
        description: "As you add records, this area turns them into readiness scores, issues to fix, and recent activity.",
        side: "top",
        align: "start",
      },
    },
  ],
  "/transactions": [
    {
      element: "#tour-search-filter",
      popover: {
        title: "Find the right records",
        description: "Search by description and narrow the list by transaction type or source.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-record-actions",
      popover: {
        title: "Add, import, or export",
        description: "Use Add Record for manual entries and statement uploads. You can also export or clear records from here.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#tour-transaction-list",
      popover: {
        title: "Review your transactions",
        description: "Select records to categorize them in bulk, review their VAT status, or remove incorrect entries.",
        side: "top",
        align: "start",
      },
    },
  ],
  "/tax-readiness": [
    {
      element: "#tour-tax-overview",
      popover: {
        title: "Understand your readiness",
        description: "These cards summarize categorized expenses, missing evidence, VAT work, and your overall readiness score.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-tax-summary",
      popover: {
        title: "Review the tax details",
        description: "Filter individual records, check their VAT and document status, and export the view when needed.",
        side: "top",
        align: "start",
      },
    },
  ],
  "/reconciliation": [
    {
      element: "#tour-reconciliation-summary",
      popover: {
        title: "See what is incomplete",
        description: "These totals show records missing a category, VAT classification, or supporting document.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-reconciliation-list",
      popover: {
        title: "Resolve one record at a time",
        description: "Open a pending item to assign its category, confirm VAT treatment, and attach a receipt or invoice.",
        side: "top",
        align: "start",
      },
    },
  ],
  "/reports": [
    {
      element: "#tour-report-overview",
      popover: {
        title: "Read your business reports",
        description: "Track income, expenses, documentation coverage, and trends calculated from your recorded transactions.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-report-export",
      popover: {
        title: "Export a report",
        description: "Choose a date range and download a PDF or CSV for your records, accountant, or tax filing workflow.",
        side: "bottom",
        align: "end",
      },
    },
  ],
};

async function recordTourCompletion() {
  await fetch("/api/v1/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete_step", step: "TOUR_COMPLETED" }),
  }).catch(() => undefined);
}

export function useProductTour(pathname: string) {
  const driverRef = useRef<Driver | null>(null);
  const steps = useMemo(() => pageTours[pathname] ?? [], [pathname]);

  useEffect(() => () => driverRef.current?.destroy(), []);

  const startTour = useCallback(() => {
    if (steps.length === 0) return;

    driverRef.current?.destroy();
    const driverInstance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      allowScroll: true,
      smoothScroll: true,
      skipMissingElement: true,
      waitForElement: 750,
      overlayColor: "rgba(0, 0, 0, 0.6)",
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "siro-tour-popover",
      steps,
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish guide",
      onDoneClick: (_element, _step, { driver: activeDriver }) => {
        void recordTourCompletion();
        activeDriver.destroy();
      },
    });

    driverRef.current = driverInstance;
    driverInstance.drive();
  }, [steps]);

  const destroyTour = useCallback(() => {
    driverRef.current?.destroy();
  }, []);

  return { startTour, destroyTour, hasTour: steps.length > 0 };
}
