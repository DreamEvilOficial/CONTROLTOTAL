import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const cvus = await prisma.cvu.findMany({
    where: { active: true },
  });
  return NextResponse.json(cvus);
}
