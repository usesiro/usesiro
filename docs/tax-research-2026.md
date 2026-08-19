# Nigeria Tax Rules Research — August 2026

This note records the source checks behind Siro's 2026 tax configuration. It is not legal advice. The product rules should be approved by Nigerian tax counsel against the gazetted legislation and current NRS regulations before reports are represented as filing-ready.

## Corporate Income Tax Rate

- Current implementation: **30%** for a non-small company.
- The Presidency's 10 January 2026 response to KPMG describes a "scope for reduction in corporate tax rate from 30% to 25%." That language indicates an enabling or prospective reduction, not evidence that 25% is already operative.
- PwC Worldwide Tax Summaries, last reviewed 29 May 2026, states that the current CIT rate is 30% for large companies.
- No operative presidential order reducing the rate to 25% was identified during this review.

Conclusion: retain 30% until an enacted order, NRS guidance, or counsel-confirmed gazetted provision establishes 25% as effective.

## Conflicts Requiring Counsel Sign-Off

The original implementation brief differs from current professional guidance in material areas:

| Rule | Original brief | Current PwC 2026 guidance |
| --- | --- | --- |
| Small-company turnover | NGN 50 million | NGN 100 million or less |
| Fixed-asset ceiling | NGN 250 million | NGN 250 million |
| VAT threshold | NGN 25 million | Organisations except small businesses collect VAT; this appears linked to the new small-business definition |
| Exports | Exempt | Exported services are zero-rated |
| Development levy base | Simplified taxable profit | Assessable profit before tax losses, capital allowances, and chargeable-gain considerations |

These differences affect classification and payable amounts. They should be resolved in a written rules matrix approved by counsel before changing the production engine.

## Sources

1. Presidency, "Response to KPMG: Observations on Nigeria's New Tax Laws," 10 January 2026: https://statehouse.gov.ng/response-to-kpmg-observations-on-nigerias-new-tax-laws/
2. Presidency, "New Tax Laws Will Commence on January 1, 2026 as Planned," 30 December 2025: https://statehouse.gov.ng/new-tax-laws-will-commence-on-january-1-2026-as-planned/
3. PwC Worldwide Tax Summaries, Nigeria — Taxes on corporate income, last reviewed 29 May 2026: https://taxsummaries.pwc.com/nigeria/corporate/taxes-on-corporate-income
4. PwC Worldwide Tax Summaries, Nigeria — Other taxes, last reviewed 29 May 2026: https://taxsummaries.pwc.com/nigeria/corporate/other-taxes

## Product Controls

- Existing businesses must explicitly complete annual turnover, fixed assets, and professional-services status before exporting.
- AI imports persist VAT status and disallowable-expense classification per transaction.
- Reports remain tax-readiness estimates until the conflicting rules above are resolved and the engine receives legal acceptance tests.
