import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import MercadoPagoConfig, { Payment } from 'mercadopago';

// Función auxiliar para inicializar cliente MP dinámicamente
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

    if (transaction.status === 'COMPLETED') {
      return NextResponse.json({ status: 'COMPLETED' });
    }

    // Determine which token to use
    let accessToken: string | null = null;
    const systemConfig = await (prisma as any).systemConfig.findUnique({ where: { id: 'config' } });

    if (transaction.agent && transaction.agent.role === 'AGENT' && transaction.agent.mpAccessToken && transaction.agent.mpEnabled) {
      accessToken = transaction.agent.mpAccessToken;
    } else if (systemConfig?.mpAccessToken) {
      accessToken = systemConfig.mpAccessToken;
    }

    if (!transaction.expectedAmount || !accessToken) {
      return NextResponse.json({ status: transaction.status, message: 'Manual verification required (No token configured)' });
    }

    // Inicializar MP con el token determinado
    const client = getMpClient(accessToken);
    const payment = new Payment(client);

    // Buscar pagos recientes con el monto exacto
    // Nota: La API de búsqueda de MP es poderosa. Filtramos por monto y estado.
    // Buscamos pagos creados después de la creación de la transacción (con un margen de error pequeño)
    const searchResult = await payment.search({
      options: {
        criteria: 'desc',
        sort: 'date_created',
        range: 'date_created',
        begin_date: new Date(transaction.createdAt.getTime() - 5 * 60000).toISOString(), // 5 min antes por si acaso
        end_date: new Date().toISOString(),
      }
    });
    
    // Filtrar manualmente por monto exacto y estado approved
    // MercadoPago a veces devuelve muchos resultados, iteramos para encontrar match
    const match = searchResult.results?.find((p: any) => 
      p.status === 'approved' && 
      Math.abs(p.transaction_amount - (transaction.expectedAmount || 0)) < 0.001
    );

    if (match) {
      // TRANSACCIÓN ENCONTRADA Y APROBADA
      console.log(`[PAYMENT VERIFIED] TxID: ${transaction.id}, MP_ID: ${match.id}, Amount: ${match.transaction_amount}, User: ${transaction.user.username}`);
      
      // Usar transacción de prisma para asegurar atomicidad
      await prisma.$transaction(async (tx: any) => {
        // Actualizar transacción
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            mpPaymentId: match.id!.toString(),
          },
        });

        // Actualizar saldo usuario
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: transaction.amount }, // Sumamos el monto original (sin decimales extra) o con decimales?
            // Generalmente se acredita lo que pagó. Si pagó 10000.04, se acredita 10000.04 o 10000?
            // El usuario pidió "estilo 10.000,04", asumiré que acredita el monto limpio o el exacto.
            // Para evitar confusión, acreditaré el monto limpio (transaction.amount) ya que los centavos son fee de identificación.
            // O mejor, acreditar EXACTAMENTE lo que pagó para que cuadre.
            // Decisión: Acreditar amount (monto solicitado) para mantener números redondos en el casino, los centavos son "costo operativo" o se ignoran.
            // Pero para ser justos, acreditaré transaction.amount (lo que pidió).
          },
        });
      });

      return NextResponse.json({ status: 'COMPLETED', paymentId: match.id });
    }

    return NextResponse.json({ status: 'PENDING' });

  } catch (error: any) {
    console.error('Error checking MP status:', error);
    return NextResponse.json({ error: 'Error checking status' }, { status: 500 });
  }
}
