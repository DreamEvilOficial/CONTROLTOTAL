import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const agentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
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
      email: true,
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
    const { name, email, password } = agentSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const agent = await prisma.user.create({
      data: {
        name,
        email,
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
