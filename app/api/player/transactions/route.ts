import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['DEPOSIT', 'WITHDRAW']),
});

async function getPlayer() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (payload?.role !== 'PLAYER') return null;
  return payload;
}

export async function GET() {
  const player = await getPlayer();
  if (!player) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Cancel expired pending deposit transactions (older than 20 minutes)
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
  await prisma.transaction.updateMany({
    where: {
      userId: player.id as string,
      type: 'DEPOSIT',
      status: 'PENDING',
      createdAt: { lt: twentyMinutesAgo },
    },
    data: {
      status: 'REJECTED', // Or create 'EXPIRED' status if schema allows, but REJECTED is safer for now
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: player.id as string },
    orderBy: { createdAt: 'desc' },
    include: { agent: { select: { name: true } } },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const playerPayload = await getPlayer();
  if (!playerPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, type, method, withdrawalCvu, withdrawalAlias, withdrawalBank, screenshot } = z.object({
      amount: z.number().positive(),
      type: z.enum(['DEPOSIT', 'WITHDRAW']),
      method: z.enum(['MANUAL', 'AUTO', 'MP']).optional(),
      withdrawalCvu: z.string().optional(),
      withdrawalAlias: z.string().optional(),
      withdrawalBank: z.string().optional(),
      screenshot: z.string().optional(),
    }).parse(body);

    const user = await prisma.user.findUnique({
      where: { id: playerPayload.id as string },
      include: { manager: true, platform: true },
    });

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    if (type === 'WITHDRAW' && user.balance < amount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }

    // Allow transaction even without manager if system config exists (users might be direct)
    // if (!user.managerId) {
    //   return NextResponse.json({ error: 'No tienes un agente asignado' }, { status: 400 });
    // }

    let expectedAmount = null;

    // Check MP availability (Agent or System)
    const systemConfig = await prisma.systemConfig.findUnique({ where: { id: 'config' } });
    const agentMp = user.manager?.mpEnabled && user.manager?.mpAccessToken;
    const systemMp = !!systemConfig?.mpAccessToken;

    // Si es depósito, generar monto con decimales para identificación manual
    if (type === 'DEPOSIT') {
      let unique = false;
      let attempts = 0;

      while (!unique && attempts < 10) {
        // Generar decimal aleatorio entre 0.01 y 0.99
        const decimal = Math.floor(Math.random() * 99) + 1;
        const candidate = amount + (decimal / 100);

        // Check for collision with other PENDING transactions
        const existing = await prisma.transaction.findFirst({
          where: {
            status: 'PENDING',
            type: 'DEPOSIT',
            expectedAmount: candidate
          }
        });

        if (!existing) {
          expectedAmount = candidate;
          unique = true;
        }
        attempts++;
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        expectedAmount,
        type,
        method,
        userId: user.id,
        agentId: user.managerId,
        status: 'PENDING',
        withdrawalCvu,
        withdrawalAlias,
        withdrawalBank,
        screenshot,
      } as any,
    });


    console.log(`[TRANSACTION CREATED] ID: ${transaction.id}, User: ${user.username}, Amount: ${amount}, Type: ${type}, Method: ${method || 'N/A'}, Expected: ${expectedAmount}`);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('[TRANSACTION ERROR]', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error creando transacción'
    }, { status: 400 });
  }
}
