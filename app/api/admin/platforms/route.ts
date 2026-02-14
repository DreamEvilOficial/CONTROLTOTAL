import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const platformSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional().or(z.literal('')),
  bonus: z.string().min(1),
  active: z.boolean().optional(),
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

  const platforms = await prisma.platform.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(platforms);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = platformSchema.parse(body);

    const platform = await prisma.platform.create({
      data,
    });

    return NextResponse.json(platform);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.platform.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting platform' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await req.json();
    const data = platformSchema.parse(body);

    const oldPlatform = await prisma.platform.findUnique({
      where: { id },
      select: { url: true }
    });

    const updatedPlatform = await prisma.platform.update({
      where: { id },
      data,
    });

    // If URL changed, notify all users of this platform
    if (oldPlatform?.url !== updatedPlatform.url && updatedPlatform.url) {
      const users = await prisma.user.findMany({
        where: { platformId: id },
        select: { id: true }
      });

      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      if (admin && users.length > 0) {
        await prisma.message.createMany({
          data: users.map(user => ({
            content: `📢 El link de la plataforma ${updatedPlatform.name} ha sido actualizado a: ${updatedPlatform.url}`,
            senderId: admin.id,
            receiverId: user.id,
          }))
        });
      }
    }

    return NextResponse.json(updatedPlatform);
  } catch (error) {
    console.error('Error updating platform:', error);
    return NextResponse.json({ error: 'Error updating platform' }, { status: 500 });
  }
}
