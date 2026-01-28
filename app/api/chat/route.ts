import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.string().optional(),
});

async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('userId');

  // If Admin is requesting specific user chat
  if (user.role === 'ADMIN' && targetUserId) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: user.id },
        ],
        transactionId: null,
      },
      orderBy: { createdAt: 'asc' },
      include: { 
        sender: { select: { username: true, role: true } } 
      }
    });
    return NextResponse.json(messages);
  } 
  
  // If Admin is requesting list of conversations (no userId provided)
  if (user.role === 'ADMIN') {
    // Find all users who have sent messages to admin or received from admin (where transactionId is null)
    // This is a bit complex in Prisma without raw query for distinct.
    // We'll fetch all messages involving admin and group them in JS for now (not efficient for scale but works for MVP)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
        transactionId: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, role: true } },
        receiver: { select: { id: true, username: true, role: true } }
      }
    });

    // Group by the "other" person
    const conversations = new Map();
    messages.forEach(msg => {
      const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: (msg.senderId !== user.id && !(msg as any).read) ? 1 : 0
        });
      } else {
        const conv = conversations.get(otherUser.id);
        if (msg.senderId !== user.id && !(msg as any).read) {
          conv.unreadCount++;
        }
      }
    });

    return NextResponse.json(Array.from(conversations.values()));
  }

  // Regular user: Fetch chat with admin
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
      transactionId: null,
    },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { username: true, role: true } } }
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { content, receiverId } = messageSchema.parse(body);

    let finalReceiverId = receiverId;

    if (user.role !== 'ADMIN') {
      // User sending to Admin
      // Find the admin user (assuming there is one main admin)
      // We can search by role 'ADMIN'
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      
      if (!admin) {
        // Fallback: try to find 'admin' username
        const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
        if (!adminUser) return NextResponse.json({ error: 'Admin unavailable' }, { status: 500 });
        finalReceiverId = adminUser.id;
      } else {
        finalReceiverId = admin.id;
      }
    } else {
        // Admin sending to User
        if (!finalReceiverId) return NextResponse.json({ error: 'Receiver required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId: finalReceiverId!,
      },
      include: { sender: { select: { username: true, role: true } } }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
