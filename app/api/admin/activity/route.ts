import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.role === 'ADMIN';
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  
  // Calculate start of periods
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Helper to get stats for a period
  async function getStatsForPeriod(startDate: Date) {
    const [newUsers, transactions] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'PLAYER',
          createdAt: { gte: startDate },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      newUsers,
      volume: transactions._sum.amount || 0,
      transactionCount: transactions._count,
    };
  }

  const [day, week, month] = await Promise.all([
    getStatsForPeriod(startOfDay),
    getStatsForPeriod(startOfWeek),
    getStatsForPeriod(startOfMonth),
  ]);

  return NextResponse.json({ day, week, month });
}
