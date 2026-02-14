import prisma from './prisma';

export async function sendTelegramMessage(message: string) {
    try {
        const config = (await prisma.systemConfig.findUnique({
            where: { id: 'config' },
        })) as any;

        if (!config?.telegramBotToken || !config?.telegramChatId) {
            console.log('Telegram bot not configured');
            return;
        }

        const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.telegramChatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });
    } catch (error) {
        console.error('Error sending telegram message:', error);
    }
}
