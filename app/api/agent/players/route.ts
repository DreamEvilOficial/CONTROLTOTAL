import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

const playerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
});

async function getAgent() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (payload?.role !== 'AGENT' && payload?.role !== 'ADMIN') return null;
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
      username: true,
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
    const { name, username, password } = playerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuario ya registrado' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Always assign to 'admin' user
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 500 });
    }

    const player = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: 'PLAYER',
        managerId: adminUser.id,
      },
    });

    const { password: _, ...playerWithoutPassword } = player;
    return NextResponse.json(playerWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Error creando jugador' }, { status: 400 });
  }
}
