
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { MetaAdsService } from '@/lib/facebook';
import { cookies } from 'next/headers';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import os from 'os';

export async function POST(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await prisma.systemConfig.findUnique({
      where: { id: 'config' },
    });

    if (!config?.metaAccessToken || !config?.metaAdAccountId || !(config as any)?.metaPageId) {
      return NextResponse.json({ error: 'Meta Ads not fully configured (Token, Account ID, or Page ID missing). Please configure in Settings.' }, { status: 400 });
    }

    const formData = await req.formData();
    const campaignName = formData.get('campaignName') as string;
    const dailyBudget = parseFloat(formData.get('dailyBudget') as string);
    const status = formData.get('status') as string || 'PAUSED';
    const targetUrl = formData.get('targetUrl') as string;
    const primaryText = formData.get('primaryText') as string;
    const headline = formData.get('headline') as string;
    const imageFile = formData.get('image') as File;

    if (!campaignName || !dailyBudget || !targetUrl || !imageFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save file temporarily
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const tempFilePath = join(os.tmpdir(), `${Date.now()}-${imageFile.name}`);
    await writeFile(tempFilePath, buffer);

    const adsService = new MetaAdsService(config.metaAccessToken, config.metaAdAccountId);

    try {
      // 1. Create Campaign
      const campaign = await adsService.createCampaign(campaignName, 'OUTCOME_TRAFFIC', status);

      // 2. Create Ad Set
      const adSet = await adsService.createAdSet(
        campaign.id,
        `${campaignName} - AdSet`,
        dailyBudget,
        {}, // Default targeting
        status
      );

      // 3. Upload Image
      const imageHash = await adsService.uploadImage(tempFilePath);
      if (!imageHash) throw new Error('Failed to upload image');

      // 4. Create Creative
      const creative = await adsService.createAdCreative(
        `${campaignName} - Creative`,
        imageHash,
        headline || campaignName,
        primaryText || '',
        targetUrl,
        (config as any).metaPageId
      );

      // 5. Create Ad
      const ad = await adsService.createAd(adSet.id, creative.id, `${campaignName} - Ad`, status);

      return NextResponse.json({ success: true, campaignId: campaign.id, adId: ad.id });

    } finally {
      // Clean up temp file
      await unlink(tempFilePath).catch(console.error);
    }

  } catch (error: any) {
    console.error('Meta Ads Error:', error);
    return NextResponse.json({ error: error.message || 'Error creating campaign' }, { status: 500 });
  }
}
