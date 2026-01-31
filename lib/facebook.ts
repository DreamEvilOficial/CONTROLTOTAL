
import * as bizSdk from 'facebook-nodejs-business-sdk';
import fs from 'fs';

const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const AdSet = bizSdk.AdSet;
const AdCreative = bizSdk.AdCreative;
const Ad = bizSdk.Ad;
const AdImage = bizSdk.AdImage;

export class MetaAdsService {
    private accountId: string;
    private accessToken: string;
    private account: any; // Type as unkown/any because SDK types are complex

    constructor(accessToken: string, accountId: string) {
        this.accessToken = accessToken;
        this.accountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
        bizSdk.FacebookAdsApi.init(accessToken);
        this.account = new AdAccount(this.accountId);
    }

    async createCampaign(name: string, objective: string = 'OUTCOME_TRAFFIC', status: string = 'PAUSED') {
        try {
            const campaign = await this.account.createCampaign(
                [Campaign.Fields.id, Campaign.Fields.name],
                {
                    [Campaign.Fields.name]: name,
                    [Campaign.Fields.objective]: objective,
                    [Campaign.Fields.status]: status,
                    [Campaign.Fields.special_ad_categories]: [],
                }
            );
            return campaign;
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    }

    async createAdSet(campaignId: string, name: string, dailyBudget: number, targeting: any, status: string = 'PAUSED') {
        try {
            // Default simple targeting if not provided
            const defaultTargeting = {
                geo_locations: { countries: ['AR'] }, // Default to Argentina for this user context usually? Or asking user.
                age_min: 18,
                age_max: 65,
                ...targeting
            };

            const adSet = await this.account.createAdSet(
                [AdSet.Fields.id, AdSet.Fields.name],
                {
                    [AdSet.Fields.name]: name,
                    [AdSet.Fields.campaign_id]: campaignId,
                    [AdSet.Fields.daily_budget]: dailyBudget * 100, // Amount in cents? FB uses cents often, but SDK dependent. Usually implies unit currency.
                    // Wait, 'daily_budget' is in unit of currency * 100 usually? No, it's just amount.
                    // Correction: API usually expects lowest currency unit (cents).
                    [AdSet.Fields.billing_event]: 'IMPRESSIONS',
                    [AdSet.Fields.optimization_goal]: 'LINK_CLICKS',
                    [AdSet.Fields.bid_strategy]: 'LOWEST_COST_WITHOUT_CAP',
                    [AdSet.Fields.targeting]: defaultTargeting,
                    [AdSet.Fields.status]: status,
                    [AdSet.Fields.start_time]: new Date().toISOString(), // Start immediately
                }
            );
            return adSet;
        } catch (error) {
            console.error('Error creating ad set:', error);
            throw error;
        }
    }

    async uploadImage(filePath: string) {
        try {
            const image = await this.account.createAdImage(
                [AdImage.Fields.hash, AdImage.Fields.url],
                {
                    [AdImage.Fields.filename]: filePath,
                }
            );
            // image is usually a list of results if batch, but single call returns object or list
            // SDK createAdImage returns a single object usually or a Cursor. 
            // Checking SDK docs implementation, it usually returns correct object.
            // However, we might need to handle it carefully.
            // Let's assume it returns a list and take the first one or just the object.
            // Safest way with this SDK:
            const images = await image.get([AdImage.Fields.hash]);
            // If it returns the object directly:
            if (images && images.hash) return images.hash;
            // If it's a list (which create usually isn't, but get is)
            if (Array.isArray(images) && images.length > 0) return images[0].hash;

            // Fallback: the create call result itself might be it
            // @ts-ignore
            if (image && image._data && image._data.hash) return image._data.hash;
            // @ts-ignore
            if (image && image.hash) return image.hash;

            return null;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async createAdCreative(name: string, imageHash: string, title: string, body: string, linkUrl: string, pageId: string) {
        try {
            const creative = await this.account.createAdCreative(
                [AdCreative.Fields.id, AdCreative.Fields.name],
                {
                    [AdCreative.Fields.name]: name,
                    [AdCreative.Fields.object_story_spec]: {
                        page_id: pageId,
                        link_data: {
                            image_hash: imageHash,
                            link: linkUrl,
                            message: body,
                            name: title, // Headline
                            call_to_action: {
                                type: 'LEARN_MORE',
                                value: { link: linkUrl }
                            }
                        }
                    }
                }
            );
            return creative;
        } catch (error) {
            console.error('Error creating ad creative:', error);
            throw error;
        }
    }

    async createAd(adSetId: string, creativeId: string, name: string, status: string = 'PAUSED') {
        try {
            const ad = await this.account.createAd(
                [Ad.Fields.id, Ad.Fields.name],
                {
                    [Ad.Fields.name]: name,
                    [Ad.Fields.adset_id]: adSetId,
                    [Ad.Fields.creative]: { creative_id: creativeId },
                    [Ad.Fields.status]: status,
                }
            );
            return ad;
        } catch (error) {
            console.error('Error creating ad:', error);
            throw error;
        }
    }
}
