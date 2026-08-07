"use client";

import { useEffect } from "react";

export default function LegacyTokenCleanup() {
  useEffect(() => {
    localStorage.removeItem("siro_access_token");
  }, []);

  return null;
}
