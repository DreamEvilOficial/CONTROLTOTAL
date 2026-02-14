import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { transactionId: params.id },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { name: true, role: true } } },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { content } = await request.json();
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Determine receiver
    const receiverId = user.id === transaction.userId ? transaction.agentId : transaction.userId;
    
    if (!receiverId) {
       return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id as string,
        receiverId: receiverId,
        transactionId: params.id,
      },
      include: { sender: { select: { name: true, role: true } } },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 });
  }
}
