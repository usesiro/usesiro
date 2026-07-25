"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourSteps = [
  {
    element: "#tour-search-filter",
    popover: {
      title: "Search & Filter",
      description: "Quickly find any transaction by description, type, or source. Use date filters to narrow results to a specific period.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-upload-records",
    popover: {
      title: "Upload Records",
      description: "Import bank statements in CSV, XLSX, or PDF format. Our AI engine (Clearsheet) automatically maps columns, detects amounts, and categorizes transactions.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-add-transaction",
    popover: {
      title: "Add Transaction",
      description: "Manually record cash sales, POS settlements, or any transaction that doesn't go through your connected bank account.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
];

export function useProductTour() {
  const driverInstance = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(0, 0, 0, 0.6)",
    stagePadding: 8,
    stageRadius: 12,
    popoverClass: "siro-tour-popover",
    steps: tourSteps,
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Got it!",
  });

  const startTour = useCallback(() => {
    driverInstance.drive();
  }, [driverInstance]);

  const destroyTour = useCallback(() => {
    driverInstance.destroy();
  }, [driverInstance]);

  return { startTour, destroyTour };
}
