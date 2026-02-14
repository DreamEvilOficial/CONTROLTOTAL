import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const configSchema = z.object({
  mpAccessToken: z.string().optional(),
  mpEnabled: z.boolean(),
});

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'AGENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const agent = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: { mpAccessToken: true, mpEnabled: true },
    });

    return NextResponse.json(agent);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error fetching config' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'AGENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { mpAccessToken, mpEnabled } = configSchema.parse(body);

    const updatedAgent = await prisma.user.update({
      where: { id: decoded.id as string },
      data: {
        mpAccessToken,
        mpEnabled,
      },
      select: { mpAccessToken: true, mpEnabled: true },
    });

    return NextResponse.json(updatedAgent);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error updating config' }, { status: 500 });
  }
}
