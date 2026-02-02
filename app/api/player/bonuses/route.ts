import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bonuses = await prisma.bonus.findMany({
    where: { active: true },
    include: {
      userBonuses: {
        where: { userId: user.id }
      }
    }
  });

  const formattedBonuses = bonuses.map(bonus => ({
    ...bonus,
    userStatus: bonus.userBonuses.length > 0 ? bonus.userBonuses[0].status : null,
    userBonusId: bonus.userBonuses.length > 0 ? bonus.userBonuses[0].id : null,
  }));

  return NextResponse.json(formattedBonuses);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { bonusId } = await req.json();

    // Check if bonus exists and is active
    const bonus = await prisma.bonus.findUnique({
      where: { id: bonusId },
    });

    if (!bonus || !bonus.active) {
      return NextResponse.json({ error: 'Bonus unavailable' }, { status: 400 });
    }

    // Check if already claimed
    const existing = await prisma.userBonus.findFirst({
      where: {
        userId: user.id,
        bonusId: bonusId,
        status: { in: ['CLAIMED', 'USED'] }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
    }

    // Check if user has another active bonus (optional constraint)
    const activeBonus = await prisma.userBonus.findFirst({
      where: {
        userId: user.id,
        status: 'CLAIMED'
      }
    });

    if (activeBonus) {
      return NextResponse.json({ error: 'You already have an active bonus. Use it first.' }, { status: 400 });
    }

    // Claim bonus
    const userBonus = await prisma.userBonus.create({
      data: {
        userId: user.id,
        bonusId: bonusId,
        status: 'CLAIMED'
      }
    });

    return NextResponse.json(userBonus);

  } catch (error) {
    return NextResponse.json({ error: 'Claim failed' }, { status: 500 });
  }
}
