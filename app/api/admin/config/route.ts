import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

const configSchema = z.object({
  whatsappNumber: z.string().optional().nullable(),
  mpAccessToken: z.string().optional().nullable(),
  mpPublicKey: z.string().optional().nullable(),
  metaAccessToken: z.string().optional().nullable(),
  metaAdAccountId: z.string().optional().nullable(),
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

  let config = await prisma.systemConfig.findUnique({
    where: { id: 'config' },
  });

  if (!config) {
    config = await prisma.systemConfig.create({
      data: { id: 'config' },
    });
  }

  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = configSchema.parse(body);

    const config = await prisma.systemConfig.upsert({
      where: { id: 'config' },
      update: data,
      create: {
        id: 'config',
        ...data,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
