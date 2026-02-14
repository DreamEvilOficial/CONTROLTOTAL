import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import MercadoPagoConfig, { Preference } from 'mercadopago';

const getMpClient = (accessToken: string) => {
  return new MercadoPagoConfig({ accessToken });
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { agent: true, user: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    let accessToken: string | null = null;
    const systemConfig = await (prisma as any).systemConfig.findUnique({ where: { id: 'config' } });

    if (transaction.agent && transaction.agent.role === 'AGENT' && transaction.agent.mpAccessToken && transaction.agent.mpEnabled) {
      accessToken = transaction.agent.mpAccessToken;
    } else if (systemConfig?.mpAccessToken) {
      accessToken = systemConfig.mpAccessToken;
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'MercadoPago not configured' }, { status: 400 });
    }

    const client = getMpClient(accessToken);
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: transaction.id,
            title: 'Carga de Fichas',
            quantity: 1,
            unit_price: transaction.amount,
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/player`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/player`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/player`,
        },
        auto_return: 'approved',
        external_reference: transaction.id,
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json({ error: 'Error creating preference' }, { status: 500 });
  }
}
