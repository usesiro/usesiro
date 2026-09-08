"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => href !== "/#features" && pathname === href;

  return (
    <nav className="fixed left-1/2 top-3 z-50 w-[84%] max-w-[22rem] -translate-x-1/2 rounded-full border border-[#d8e1f0] bg-white/80 px-3 py-2 shadow-[0_8px_30px_rgba(23,35,63,0.08)] backdrop-blur-xl md:top-4 md:w-fit md:max-w-none md:px-4">
      <div className="flex items-center justify-between gap-3 md:gap-5">
        <Link href="/" aria-label="Siro home" onClick={() => setIsOpen(false)}>
          <Image src="/landing/logo.svg" alt="Siro" width={64} height={30} className="h-auto w-14 sm:w-16" priority />
        </Link>

        <div className="hidden items-center gap-7 text-[11px] font-medium text-[#606b83] md:flex">
          {navLinks.map(({ label, href }) => (
            <Link key={href} href={href} className={isActive(href) ? "font-semibold text-[#2f6ef6]" : "transition hover:text-[#2f6ef6]"}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/register" className="rounded-full border border-[#dfe6f4] bg-white/70 px-3 py-2 text-[10px] font-semibold text-[#53617a] transition hover:border-[#2f6ef6] hover:text-[#2f6ef6] sm:px-4 sm:text-[11px]">
            Get Started <span aria-hidden>→</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#53617a] transition hover:bg-[#edf3ff] md:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <XMarkIcon className="h-5 w-5" aria-hidden="true" /> : <Bars3Icon className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-12 flex w-44 flex-col gap-1 rounded-2xl border border-[#e4e9f5] bg-white/95 p-2 text-left text-xs font-medium text-[#606b83] shadow-lg backdrop-blur-xl md:hidden">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`rounded-xl px-3 py-2 hover:bg-[#edf3ff] ${isActive(href) ? "font-semibold text-[#2f6ef6]" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
