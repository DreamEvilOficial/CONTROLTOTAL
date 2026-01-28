import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const config = await (prisma as any).systemConfig.findUnique({
    where: { id: 'config' },
    select: {
      whatsappNumber: true,
    },
  });

  const platforms = await (prisma as any).platform.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      bonus: true,
    },
  });

  return NextResponse.json({
    whatsappNumber: config?.whatsappNumber || null,
    platforms,
  });
}
