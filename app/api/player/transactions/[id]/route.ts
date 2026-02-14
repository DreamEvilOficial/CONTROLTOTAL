import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'PLAYER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { screenshot } = await request.json();
        const { id } = params;

        const transaction = await prisma.transaction.update({
            where: {
                id,
                userId: payload.id as string
            },
            data: {
                screenshot
            } as any
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('[TRANSACTION PATCH ERROR]', error);
        return NextResponse.json({ error: 'Error updating transaction' }, { status: 500 });
    }
}
