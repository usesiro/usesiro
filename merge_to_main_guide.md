# Siro Admin Dashboard: Merge & Migration Guide

This guide provides the necessary steps for the CTO to securely merge the `feat/admin-dashboard` branch into `main` while maintaining database integrity.

## 1. Database Migration Strategy (Neon)
We have introduced a new `AuditLog` model and modified the `User` model.

### **Option A: Production Migration (Recommended)**
1.  **Branching**: Create a temporary Neon branch `temp-migrate` from `main`.
2.  **Verify Schema**: Run `npx prisma migrate dev` locally pointing to this branch.
3.  **Deploy**: Once verified, push the migration to the production database:
    ```bash
    npx prisma migrate deploy
    ```

### **Option B: Development Sync**
If you are developing in a shared test environment:
```bash
npx prisma db push
```

## 2. Environment Configuration
Ensure the following variables are set in your production `.env`:
- `DATABASE_URL`: Your primary Neon connection string.
- `JWT_SECRET`: For administrative session signing.
- `OTP_SECRET`: For SuperAdmin verification codes.

## 3. Merging the Codebase
1.  **PR Check**: Verify that `proxy.ts` is in the root directory. 
    > [!IMPORTANT]
    > **Next.js Note**: Our current setup uses `proxy.ts` for security middleware. Perform any custom configuration if necessary for your production environment.
2.  **Generate Client**: After merging, force a regeneration of the Prisma Client:
    ```bash
    npx prisma generate
    ```

## 4. Final Verification Flow
Once merged and deployed, the following sequence should be used to initialize the platform:
1.  Navigate to `/admin/setup` (Genesis Flow).
2.  Create the first SuperAdmin.
3.  Verify the account via the 6-digit OTP (Admin Verify).
4.  Access the Dashboard and confirm **Live Activity** is populating from the `AuditLog` table.

---
**Prepared by**: Siro Technologies Partner Engineering
