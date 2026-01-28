import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAgent() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (payload?.role !== 'AGENT') return null;
  return payload;
}

export async function GET() {
  const agent = await getAgent();
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [playersCount, totalBalance] = await Promise.all([
    prisma.user.count({ where: { managerId: agent.id as string } }),
    prisma.user.aggregate({
      where: { managerId: agent.id as string },
      _sum: { balance: true },
    }),
  ]);

  return NextResponse.json({
    playersCount,
    totalPlayersBalance: totalBalance._sum.balance || 0,
  });
}
