import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt';

async function isAdmin() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.role === 'ADMIN';
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const apply = url.searchParams.get('apply');

    // If explicitly requested, run the patch on GET for convenience
    if (apply === '1' || apply === 'true') {
      await runPatch();
    }

    const [{ exists }] = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE column_name = 'operationCode'
          AND table_name ILIKE 'transaction'
      ) AS exists;
    `);

    return NextResponse.json({ hasColumn: !!exists, applied: !!(apply && (apply === '1' || apply === 'true')) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await runPatch();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function runPatch() {
  // 1) Ensure column exists
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name ILIKE 'transaction'
          AND column_name = 'operationCode'
      ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "operationCode" TEXT;
      END IF;
    END $$;
  `);

  // 2) Backfill operationCode values
  await prisma.$executeRawUnsafe(`
    UPDATE "Transaction"
    SET "operationCode" = 'OP-' ||
      LPAD(CAST(EXTRACT(EPOCH FROM "createdAt")::BIGINT AS TEXT), 10, '0') ||
      '-' || SUBSTRING(id, 1, 6)
    WHERE "operationCode" IS NULL;
  `);

  // 3) Enforce NOT NULL and unique index
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      -- Set NOT NULL if there is at least one row (avoid failing on empty tables)
      IF EXISTS (SELECT 1 FROM "Transaction") THEN
        BEGIN
          ALTER TABLE "Transaction"
          ALTER COLUMN "operationCode" SET NOT NULL;
        EXCEPTION WHEN others THEN
          -- ignore if already not null
        END;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_operationCode_key"
    ON "Transaction"("operationCode");
  `);
}
