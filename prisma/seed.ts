// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding standard categories...');

  const standardCategories = [
    // INCOME CATEGORIES
    { name: 'Sales', slug: 'sales', type: 'INCOME', description: 'Revenue from core business sales' },
    { name: 'Services', slug: 'services', type: 'INCOME', description: 'Revenue from services rendered' },
    { name: 'Interest', slug: 'interest', type: 'INCOME', description: 'Interest earned on balances' },
    { name: 'Uncategorized Income', slug: 'uncategorized-income', type: 'INCOME', description: 'Income pending review' },

    // EXPENSE CATEGORIES
    { name: 'Software & IT', slug: 'software-it', type: 'EXPENSE', description: 'SaaS, hosting, domains, and software tools' },
    { name: 'Fuel & Utilities', slug: 'fuel-utilities', type: 'EXPENSE', description: 'Diesel, electricity, internet, and water' },
    { name: 'Bank & POS Charges', slug: 'bank-pos-charges', type: 'EXPENSE', description: 'Transfer fees, POS charges, stamp duty' },
    { name: 'Salary & Wages', slug: 'salary-wages', type: 'EXPENSE', description: 'Employee payroll and contractor payments' },
    { name: 'Marketing & Ads', slug: 'marketing-ads', type: 'EXPENSE', description: 'Social media ads, printing, campaigns' },
    { name: 'Rent & Office', slug: 'rent-office', type: 'EXPENSE', description: 'Office rent, supplies, and maintenance' },
    { name: 'Uncategorized Expense', slug: 'uncategorized-expense', type: 'EXPENSE', description: 'Expenses pending review' },
  ];

  for (const category of standardCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug }, 
      update: {},
      create: category,
    });
  }

  console.log('✅ Standard categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });