-- Add operationCode column to Transaction table
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "operationCode" TEXT;

-- Generate unique operation codes for existing transactions
UPDATE "Transaction" 
SET "operationCode" = 'OP-' || LPAD(CAST(EXTRACT(EPOCH FROM "createdAt")::BIGINT AS TEXT), 10, '0') || '-' || SUBSTRING(id, 1, 6)
WHERE "operationCode" IS NULL;

-- Make operationCode unique and not null
ALTER TABLE "Transaction" ALTER COLUMN "operationCode" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_operationCode_key" ON "Transaction"("operationCode");
