import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

const agentSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
});

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

  const agents = await prisma.user.findMany({
    where: { role: 'AGENT' },
    select: {
      id: true,
      name: true,
      username: true,
      balance: true,
      createdAt: true,
      _count: {
        select: { users: true }, // Count of players managed
      },
    },
  });

  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, username, password } = agentSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuario ya registrado' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const agent = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: 'AGENT',
      },
    });

    const { password: _, ...agentWithoutPassword } = agent;
    return NextResponse.json(agentWithoutPassword);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error creando agente' }, { status: 400 });
  }
}
