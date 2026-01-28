import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

import { cookies } from 'next/headers';

const configSchema = z.object({
  metaAccessToken: z.string().optional(),
  metaAdAccountId: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: { metaAccessToken: true, metaAdAccountId: true },
    });

    return NextResponse.json(admin);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error fetching config' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { metaAccessToken, metaAdAccountId } = configSchema.parse(body);

    const updatedAdmin = await prisma.user.update({
      where: { id: decoded.id as string },
      data: {
        metaAccessToken,
        metaAdAccountId,
      },
    });

    return NextResponse.json(updatedAdmin);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error updating config' }, { status: 500 });
  }
}
