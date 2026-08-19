ALTER TABLE "Business"
ADD COLUMN "taxProfileCompleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Transaction"
ADD COLUMN "isDisallowable" BOOLEAN NOT NULL DEFAULT false;
