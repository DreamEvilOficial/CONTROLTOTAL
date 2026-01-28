import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAgent() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (payload?.role !== 'AGENT' && payload?.role !== 'ADMIN') return null;
  return payload;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const agent = await getAgent();
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { status } = await request.json() as { status: 'COMPLETED' | 'REJECTED' };
    
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: params.id },
      });

      if (!transaction) throw new Error('Transaction not found');
      if (transaction.status !== 'PENDING') throw new Error('Transaction already processed');

      // Update transaction status
      const updatedTx = await tx.transaction.update({
        where: { id: params.id },
        data: { status },
      });

      // Update balances if completed
      if (status === 'COMPLETED') {
        if (transaction.type === 'DEPOSIT') {
          // Add to user balance
          await tx.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } },
          });
        } else if (transaction.type === 'WITHDRAW') {
          // Deduct from user balance (already checked at creation, but double check or just confirm)
          // Actually withdraw usually deducts immediately or holds. 
          // Our simplified logic: deduct when approved.
          // Wait, earlier I checked balance at creation but didn't deduct.
          // So I should deduct now.
          await tx.user.update({
            where: { id: transaction.userId },
            data: { balance: { decrement: transaction.amount } },
          });
        }
      }

      return updatedTx;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
