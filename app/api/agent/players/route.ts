import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

const playerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

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

  const players = await prisma.user.findMany({
    where: { managerId: agent.id as string },
    select: {
      id: true,
      name: true,
      email: true,
      balance: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const agent = await getAgent();
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password } = playerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const player = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PLAYER',
        managerId: agent.id as string,
      },
    });

    const { password: _, ...playerWithoutPassword } = player;
    return NextResponse.json(playerWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Error creando jugador' }, { status: 400 });
  }
}
