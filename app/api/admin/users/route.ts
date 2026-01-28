import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const userCreateSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(2),
  whatsapp: z.string().optional(),
});

const userUpdateSchema = z.object({
  id: z.string(),
  platformId: z.string().optional().nullable(),
  platformUser: z.string().optional().nullable(),
  platformPassword: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
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

  const users = await prisma.user.findMany({
    where: { role: 'PLAYER' },
    orderBy: { createdAt: 'desc' },
    include: {
      platform: true,
    },
  });

  // Remove passwords from response
  const safeUsers = users.map(user => {
    const { password, ...rest } = user;
    return rest;
  });

  return NextResponse.json(safeUsers);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, password, name, whatsapp } = userCreateSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: 'PLAYER',
        whatsapp,
      },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

// Force refresh
export async function PUT(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, platformId, platformUser, platformPassword, whatsapp } = userUpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: {
        platformId,
        platformUser,
        platformPassword,
        whatsapp,
      },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
