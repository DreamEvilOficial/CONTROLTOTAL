import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const cvuSchema = z.object({
  bankName: z.string(),
  alias: z.string(),
  cbu: z.string(),
});

async function checkAdmin() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.role === 'ADMIN';
}

export async function GET() {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // CVUs might be visible to players too, but for admin management let's just return all.
  // Actually players need to see active CVUs.
  
  const cvus = await prisma.cvu.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(cvus);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bankName, alias, cbu } = cvuSchema.parse(body);

    const cvu = await prisma.cvu.create({
      data: {
        bankName,
        alias,
        cbu,
      },
    });

    return NextResponse.json(cvu);
  } catch (error) {
    return NextResponse.json({ error: 'Error creando CVU' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, active } = body;

    const cvu = await prisma.cvu.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(cvu);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error actualizando CVU' }, { status: 400 });
  }
}
