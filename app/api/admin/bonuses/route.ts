import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

const bonusSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  amount: z.number().positive(),
  active: z.boolean().optional(),
});

async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

export async function GET(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bonuses = await prisma.bonus.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(bonuses);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = bonusSchema.parse(body);

    const bonus = await prisma.bonus.create({
      data,
    });

    return NextResponse.json(bonus);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const bonus = await prisma.bonus.update({
      where: { id },
      data,
    });

    return NextResponse.json(bonus);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  try {
    await prisma.bonus.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
