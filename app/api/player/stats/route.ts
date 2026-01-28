import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

async function getPlayer() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (payload?.role !== 'PLAYER') return null;
  return payload;
}

// Force refresh
export async function GET() {
  const player = await getPlayer();
  if (!player) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = await prisma.user.findUnique({
    where: { id: player.id as string },
    select: { 
      balance: true, 
      username: true,
      platform: { select: { name: true } },
      platformUser: true,
      platformPassword: true
    },
  });

  return NextResponse.json({
    balance: userData?.balance || 0,
    username: userData?.username || '',
    platformName: userData?.platform?.name,
    platformUser: userData?.platformUser,
    platformPassword: userData?.platformPassword,
  });
}
