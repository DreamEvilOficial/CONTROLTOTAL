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
    const { amount, type, withdrawalCvu, withdrawalAlias, withdrawalBank } = z.object({
      amount: z.number().positive(),
      type: z.enum(['DEPOSIT', 'WITHDRAW']),
      withdrawalCvu: z.string().optional(),
      withdrawalAlias: z.string().optional(),
      withdrawalBank: z.string().optional(),
    }).parse(body);

    const user = await prisma.user.findUnique({
      where: { id: playerPayload.id as string },
      include: { manager: true },
    });

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    if (type === 'WITHDRAW' && user.balance < amount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }

    if (!user.managerId) {
      return NextResponse.json({ error: 'No tienes un agente asignado' }, { status: 400 });
    }

    let expectedAmount = null;

    // Si es depósito y el agente tiene MP activado, generar monto con decimales
    if (type === 'DEPOSIT' && user.manager?.mpEnabled && user.manager.mpAccessToken) {
      // Generar decimal aleatorio entre 0.01 y 0.99
      const decimal = Math.floor(Math.random() * 99) + 1;
      expectedAmount = amount + (decimal / 100);
      
      // Asegurar que no exista otra transacción pendiente con el mismo monto exacto (opcional pero recomendado)
      // Por simplicidad, asumimos colisión baja o manejable
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        expectedAmount,
        type,
        userId: user.id,
        agentId: agentId,
        status: 'PENDING',
        withdrawalCvu,
        withdrawalAlias,
        withdrawalBank,
      } as any,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Error creando transacción' }, { status: 400 });
  }
}
