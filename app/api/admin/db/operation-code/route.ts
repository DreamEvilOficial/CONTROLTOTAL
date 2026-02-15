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

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [{ exists }] = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'operationCode'
          AND table_name IN ('Transaction', 'transaction')
      ) AS exists;
      `
    );

    return NextResponse.json({ hasColumn: !!exists });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'Transaction'
            AND column_name = 'operationCode'
        ) THEN
          ALTER TABLE "Transaction" ADD COLUMN "operationCode" TEXT;
        END IF;
      END $$;
    `);

    // Backfill any nulls with generated codes
    await prisma.$executeRawUnsafe(`
      UPDATE "Transaction"
      SET "operationCode" = 'OP-' ||
        LPAD(CAST(EXTRACT(EPOCH FROM "createdAt")::BIGINT AS TEXT), 10, '0') ||
        '-' || SUBSTRING(id, 1, 6)
      WHERE "operationCode" IS NULL;
    `);

    // Set NOT NULL and unique index
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Transaction"
      ALTER COLUMN "operationCode" SET NOT NULL;
      
      CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_operationCode_key"
      ON "Transaction"("operationCode");
    `);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
