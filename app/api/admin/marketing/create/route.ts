import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import * as bizSdk from 'facebook-nodejs-business-sdk';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: { metaAccessToken: true, metaAdAccountId: true }
    });

    if (!admin?.metaAccessToken || !admin?.metaAdAccountId) {
      return NextResponse.json({ error: 'Meta Ads not configured' }, { status: 400 });
    }

    const body = await req.json();
    const { campaignName, dailyBudget, status } = body as { campaignName: string; dailyBudget: number; status?: string };

    const AdAccount = bizSdk.AdAccount;
    const Campaign = bizSdk.Campaign;

    bizSdk.FacebookAdsApi.init(admin.metaAccessToken);

    const account = new AdAccount(admin.metaAdAccountId);
    
    // Crear Campaña
    const campaign = await account.createCampaign(
      [Campaign.Fields.id],
      {
        [Campaign.Fields.name]: campaignName,
        [Campaign.Fields.objective]: 'OUTCOME_TRAFFIC', // Objetivo genérico
        [Campaign.Fields.status]: status || 'PAUSED',
        [Campaign.Fields.special_ad_categories]: [],
        // daily_budget requiere bid strategy, simplificamos para el ejemplo
      }
    );

    return NextResponse.json({ success: true, campaignId: campaign.id });

  } catch (error: any) {
    console.error('Meta Ads Error:', error);
    return NextResponse.json({ error: error.message || 'Error creating campaign' }, { status: 500 });
  }
}
