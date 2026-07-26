const { jsPDF } = require("jspdf");
const fs = require("fs");

const doc = new jsPDF({ unit: "mm", format: "a4" });
const pageWidth = 210;
const margin = 20;
const maxWidth = pageWidth - margin * 2;
let y = 20;

function checkPage(needed = 12) {
  if (y + needed > 280) { doc.addPage(); y = 20; }
}

function title(text, size = 22) {
  checkPage(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(47, 110, 246);
  doc.text(text, margin, y);
  y += size * 0.5 + 4;
}

function heading(text, size = 14) {
  checkPage(16);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(41, 6, 25);
  doc.text(text, margin, y);
  y += size * 0.45 + 3;
}

function subheading(text, size = 11) {
  checkPage(12);
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(80, 80, 80);
  doc.text(text, margin, y);
  y += size * 0.45 + 2;
}

function body(text) {
  checkPage(10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    checkPage(5);
    doc.text(line, margin, y);
    y += 5;
  }
  y += 2;
}

function bullet(text) {
  checkPage(6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text, maxWidth - 6);
  doc.text("•", margin, y);
  for (let i = 0; i < lines.length; i++) {
    checkPage(5);
    doc.text(lines[i], margin + 6, y);
    y += 5;
  }
  y += 1;
}

function tableRow(col1, col2, isHeader = false) {
  checkPage(8);
  doc.setFont("helvetica", isHeader ? "bold" : "normal");
  doc.setFontSize(9);
  doc.setTextColor(isHeader ? 41 : 60, isHeader ? 6 : 60, isHeader ? 25 : 60);
  if (isHeader) {
    doc.setFillColor(240, 242, 245);
    doc.rect(margin, y - 4, maxWidth, 7, "F");
  }
  doc.text(col1, margin + 2, y);
  doc.text(col2, margin + maxWidth * 0.5, y);
  y += 7;
}

function separator() {
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
}

// === COVER ===
y = 80;
doc.setFont("helvetica", "bold");
doc.setFontSize(36);
doc.setTextColor(47, 110, 246);
doc.text("Siro", pageWidth / 2, y, { align: "center" });
y += 16;
doc.setFontSize(14);
doc.setTextColor(41, 6, 25);
doc.text("Product Overview", pageWidth / 2, y, { align: "center" });
y += 10;
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(120, 120, 120);
doc.text("Tax Compliance & Automated Bookkeeping", pageWidth / 2, y, { align: "center" });
y += 6;
doc.text("for Nigerian Businesses", pageWidth / 2, y, { align: "center" });
y += 30;
doc.setFontSize(9);
doc.text("Siro Technologies — Confidential", pageWidth / 2, y, { align: "center" });
y += 5;
doc.text("July 2026", pageWidth / 2, y, { align: "center" });

// === PAGE 2: WHAT IS SIRO ===
doc.addPage();
y = 20;
title("What Is Siro?");
body("Siro is a tax compliance platform purpose-built for Nigerian businesses. It takes the pain out of bookkeeping by automatically organizing every naira that flows in and out of a business, tagging it for VAT, categorizing it, and producing clean reports that are ready for the Federal Inland Revenue Service (FIRS) when filing day arrives.");
body("The core problem: Most Nigerian SMEs track finances with WhatsApp notes, Excel sheets, or not at all. When tax season hits, they scramble. Siro eliminates that scramble by keeping your business tax-ready every single day — not just at filing time.");

separator();
heading("The User Journey");

subheading("Step 1: Sign Up & Onboarding");
bullet("Create Account — User signs up with email and password");
bullet("Email Verification — A 6-digit OTP confirms the email address");
bullet("Business Profile — Business name, type (Sole Proprietorship, Partnership, LLC), and industry (33 categories)");
bullet("Subscribe — No free tier. ₦9,999/month via Paystack (card, bank transfer, USSD) at Early Adopter Rate");
bullet("Welcome — After payment, the user chooses how to get transactions into Siro");

subheading("Step 2: Getting Transactions In");
body("There are three ways transactions enter Siro:");

subheading("a) File Upload — AI-Powered (Clearsheet Engine)");
body("The user uploads a bank statement in CSV, Excel, or PDF format. Behind the scenes:");
bullet("File Parsing — Siro reads the raw file. For PDFs, AI extracts structured data from scanned or digital statements.");
bullet("AI Standardization — Google Gemini detects columns (date, description, amount, debit/credit), classifies each row as INCOME or EXPENSE, detects the opening balance, account currency, and suggests exchange rates.");
bullet("Starting Balance Detection — When the AI detects an opening balance from the statement, it surfaces it to the user in the review screen. The user sees 'Detected Starting Balance: ₦X,XXX,XXX' and can toggle 'Set as Account Start?' to save it to their business profile. This establishes the baseline for all financial calculations.");
bullet("Currency Handling — If the statement is in USD or another foreign currency, Siro shows the detected currency and suggested exchange rate. The user can accept or override.");
bullet("Review & Edit — Full preview of extracted transactions before import. Users can edit, delete, or correct rows.");
bullet("Smart Duplicate Detection — Each transaction gets a unique fingerprint. Uploading the same statement twice skips duplicates automatically.");

checkPage(20);
subheading("b) Manual Entry");
body("For cash transactions, POS settlements, or anything that doesn't appear on a bank statement — added one by one through a simple form.");

subheading("c) Bank Sync (Coming Soon)");
body("Direct connection to Nigerian banks via Mono's Open Banking API. Fully built, disabled while the partnership is finalized.");

separator();
heading("The Three-Pass Categorization Engine");
body("This is the core intelligence that separates Siro from a basic spreadsheet.");

subheading("Pass 1 — Business Memory (Tenant-Specific)");
body("Has this specific business seen this description before? If a human previously categorized 'DANGOTE CEMENT LTD' as Construction for this business, Siro remembers and applies it automatically. Rules are tenant-specific — Business A's mappings never leak to Business B.");

subheading("Pass 2 — Standard Rules (Built-In Patterns)");
body("Siro has built-in recognition patterns for common Nigerian transactions:");
tableRow("Pattern", "Category", true);
tableRow("MTN, Airtel, Glo, fuel, diesel", "Fuel & Utilities");
tableRow("Paystack, Flutterwave, transfer fee", "Bank & POS Charges");
tableRow("Salary, payroll, stipend, bonus", "Salary & Wages");
tableRow("Facebook, Google Ads, Instagram", "Marketing & Ads");
tableRow("AWS, Vercel, GitHub, Zoom", "Software & IT");
tableRow("POS settlement, Opay payout", "Sales");

subheading("Pass 3 — Flag for Human Review");
body("If neither Pass 1 nor Pass 2 matches, Siro does NOT guess or hallucinate a category. It flags the transaction as 'Pending Review' and waits for a human to categorize it. When resolved, the pattern is saved so Siro handles it automatically next time. The system gets smarter with every resolution.");

separator();
heading("VAT Tagging");
body("Every transaction can be tagged as VAT-applicable (7.5%), VAT-exempt, or missing. Siro calculates:");
bullet("Output VAT — VAT collected from customers (on income)");
bullet("Input VAT — VAT paid on purchases (on expenses)");
bullet("Net VAT Payable = Output VAT − Input VAT");
body("This is the number the business reports to FIRS.");

separator();
heading("Tax Computation (CITA)");
body("Siro computes company income tax per the Companies Income Tax Act:");
bullet("Gross Income = Sum of all INCOME transactions");
bullet("Deductions = Sum of categorized EXPENSE transactions (auto + human-resolved)");
bullet("Taxable Income = Gross Income − Deductions");
bullet("Company Tax = Taxable Income × Tax Rate");
y += 2;
tableRow("Bracket", "CIT Rate", true);
tableRow("Small (below ₦25M turnover)", "0%");
tableRow("Medium (₦25M – ₦100M)", "20%");
tableRow("Large (above ₦100M)", "30%");
y += 2;
body("Expenses still in 'Pending Review' are excluded from deductions until resolved — a conservative, audit-safe approach.");

separator();
heading("The Dashboard");
bullet("Tax Readiness Score — Single percentage showing audit preparedness");
bullet("Compliance Breakdown — VAT tagging, categorization, and documentation progress bars");
bullet("Financial Snapshot — Total income, expenses, and net balance");
bullet("Action Cards — Urgent items with direct links to fix them");
bullet("Recent Activity — The 5 most recent transactions");

separator();
heading("Reports & Export");
body("Choose a date range, select PDF or CSV format, and download a clean, pre-organized tax report instantly. No last-minute scramble.");

// === FINAL PAGE: POSITIONING ===
doc.addPage();
y = 20;
title("Why Siro Is Different");
y += 4;
tableRow("Traditional Approach", "Siro", true);
tableRow("Excel sheets, WhatsApp notes", "Automated categorization engine");
tableRow("Accountant guesses categories", "AI + human-in-the-loop, no hallucination");
tableRow("One-size-fits-all rules", "Tenant-specific pattern memory that learns");
tableRow("End-of-quarter scramble", "Real-time tax readiness score");
tableRow("Manual VAT calculation", "Automatic VAT tagging + computation");
tableRow("Hiring a bookkeeper", "Self-service at ₦9,999/month");

separator();
heading("How to Talk About Siro");

subheading("For business owners:");
body('"Siro keeps your business tax-ready every single day — not just at filing time."');

subheading("For investors:");
body('"Siro is the compliance infrastructure layer for Nigerian SMEs — automated bookkeeping, VAT tagging, and FIRS-ready reporting in one platform."');

subheading("For accountants and consultants:");
body('"Siro handles the 80% of transactions that are obvious, and routes the 20% that need judgment directly to you — with pattern learning so you never categorize the same thing twice."');

y += 20;
doc.setFont("helvetica", "italic");
doc.setFontSize(11);
doc.setTextColor(47, 110, 246);
doc.text("Siro Technologies — Your business, always tax-ready.", pageWidth / 2, y, { align: "center" });

// Save
const output = doc.output("arraybuffer");
fs.writeFileSync("PRODUCT_OVERVIEW.pdf", Buffer.from(output));
console.log("PDF generated: PRODUCT_OVERVIEW.pdf");
