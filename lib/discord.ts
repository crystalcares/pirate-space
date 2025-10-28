import { AdminExchangeData } from "@/components/admin/TransactionManagement";
import { Tables } from "./database.types";

const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const botAvatar = "https://media.discordapp.net/attachments/1429039353870680084/1431616762125750374/pirate-arrr.gif?ex=68ff6202&is=68fe1082&hm=12478fb149bbb3dca4ded63d0975128b8743b1fd8aac5703617009683b3b7c64&=&width=242&height=242";
const siteIcon = "https://media.discordapp.net/attachments/1429039353870680084/1431616762125750374/pirate-arrr.gif?ex=68ff6202&is=68fe1082&hm=12478fb149bbb3dca4ded63d0975128b8743b1fd8aac5703617009683b3b7c64&=&width=242&height=242";

interface WebhookPayload {
    username: string;
    avatar_url: string;
    embeds: Embed[];
}

interface Embed {
    title: string;
    description?: string;
    color: number;
    fields: Field[];
    timestamp?: string;
    thumbnail?: { url: string };
    footer?: { text: string; icon_url: string };
}

interface Field {
    name: string;
    value: string;
    inline?: boolean;
}

const truncateWalletAddress = (address: string | null | undefined, start = 6, end = 4): string => {
    if (!address) return "Not Provided";
    if (address.length <= start + end) return address;
    return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};

const sendWebhook = async (payload: WebhookPayload, retries = 1) => {
    if (!webhookUrl || webhookUrl === 'YOUR_DISCORD_WEBHOOK_URL') {
        console.warn("Discord webhook URL not configured. Skipping webhook notification.");
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Webhook failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to send Discord webhook:", error);
        if (retries > 0) {
            console.log(`Retrying webhook in 5 seconds... (${retries} retries left)`);
            setTimeout(() => sendWebhook(payload, retries - 1), 5000);
        }
    }
};

type ExchangeCreationData = {
    exchangeId: string;
    userId: string | null;
    userEmail: string;
    exchangeType: string;
    fromAmount: number | '';
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    fiatValue: number;
    recipientAddress: string;
}

export const sendExchangeCreationWebhook = async (data: ExchangeCreationData) => {
    const embed: Embed = {
        title: "💸 New Exchange Created!",
        color: 3447003, // Blue
        thumbnail: { url: siteIcon },
        fields: [
            { name: "User", value: data.userEmail || "Anonymous", inline: true },
            { name: "Exchange ID", value: `\`#${data.exchangeId}\``, inline: true },
            { name: "From → To", value: `${data.fromCurrency} → ${data.toCurrency}`, inline: true },
            { name: "Amount", value: `${data.fromAmount} ${data.fromCurrency} (~$${data.fiatValue.toFixed(2)})`, inline: false },
            { name: "Status", value: "Pending Payment", inline: false },
            { name: "Wallet Address", value: `\`${truncateWalletAddress(data.recipientAddress)}\``, inline: false },
        ],
        footer: { text: "Crypto Exchange | Live Feed Bot", icon_url: botAvatar },
        timestamp: new Date().toISOString(),
    };

    const payload: WebhookPayload = {
        username: "Exchange Tracker",
        avatar_url: botAvatar,
        embeds: [embed],
    };

    await sendWebhook(payload);
};

export const sendPaymentDetectedWebhook = async (exchange: Tables<'exchanges'>, confirmations: number) => {
    const embed: Embed = {
        title: "💰 Payment Detected!",
        color: 16776960, // Yellow
        fields: [
          { name: "Exchange ID", value: `\`#${exchange.exchange_id}\``, inline: true },
          { name: "User", value: exchange.user_id ? `User ID: \`${exchange.user_id}\`` : "Anonymous", inline: true },
          { name: "Status", value: `Confirming (${confirmations}/3)`, inline: false },
          { name: "Amount", value: `${exchange.send_amount} ${exchange.from_currency}`, inline: false },
        ],
        footer: { text: "Crypto Exchange | Live Feed Bot", icon_url: botAvatar },
        timestamp: new Date().toISOString(),
    };
    const payload: WebhookPayload = { username: "Exchange Tracker", avatar_url: botAvatar, embeds: [embed] };
    await sendWebhook(payload);
};

export const sendExchangeCompletionWebhook = async (exchange: Tables<'exchanges'>) => {
    const embed: Embed = {
        title: "✅ New Exchange Completed",
        color: 3066993, // Green
        fields: [
          { name: "User", value: exchange.user_id ? `User ID: \`${exchange.user_id}\`` : "Anonymous", inline: true },
          { name: "Exchange ID", value: `\`#${exchange.exchange_id}\``, inline: true },
          { name: "Crypto Sent", value: `${exchange.send_amount} ${exchange.from_currency}`, inline: false },
          { name: "Crypto Received", value: `${exchange.receive_amount.toFixed(8)} ${exchange.to_currency}`, inline: false },
          { name: "USD Value", value: exchange.usd_value ? `$${exchange.usd_value.toFixed(2)}` : 'N/A', inline: true },
          { name: "Wallet Address", value: `\`${truncateWalletAddress(exchange.recipient_wallet_address)}\``, inline: false },
        ],
        footer: { text: "Auto-Generated by Exchange System 🪐", icon_url: siteIcon },
        timestamp: new Date().toISOString(),
    };

    const payload: WebhookPayload = {
        username: "Exchange Tracker",
        avatar_url: botAvatar,
        embeds: [embed],
    };

    await sendWebhook(payload);
};

export const sendUncompletedExchangeWebhook = async (exchange: Tables<'exchanges'>) => {
    const embed: Embed = {
        title: "⚠️ Uncompleted Exchange",
        color: 15548997, // Red
        description: "An exchange was not completed within the 60-minute window.",
        fields: [
          { name: "Exchange ID", value: `\`#${exchange.exchange_id}\``, inline: true },
          { name: "User ID", value: `\`${exchange.user_id || 'Anonymous'}\``, inline: true },
          { name: "Expected Deposit", value: `${exchange.send_amount} ${exchange.from_currency}`, inline: false },
        ],
        footer: { text: "Auto-Generated by Exchange System 🪐", icon_url: siteIcon },
        timestamp: new Date().toISOString(),
    };
    
    const payload: WebhookPayload = {
        username: "Exchange Tracker",
        avatar_url: botAvatar,
        embeds: [embed],
    };

    await sendWebhook(payload);
};

type ExchangeStatusUpdateData = {
    exchange: AdminExchangeData;
    newStatus: 'completed' | 'cancelled';
    adminUsername: string;
}

export const sendExchangeStatusUpdateWebhook = async (data: ExchangeStatusUpdateData) => {
    const isCompleted = data.newStatus === 'completed';
    const embed: Embed = {
        title: isCompleted ? "✅ Exchange Approved" : "❌ Exchange Cancelled",
        color: isCompleted ? 3447003 : 15548997, // Green or Red
        thumbnail: { url: siteIcon },
        fields: [
            { name: "👤 User", value: data.exchange.username || 'Anonymous', inline: true },
            { name: "🆔 Exchange ID", value: `\`#${data.exchange.exchange_id}\``, inline: true },
            { name: "👑 Admin", value: data.adminUsername, inline: true },
            { name: "➡️ From", value: `${data.exchange.send_amount} ${data.exchange.from_currency}`, inline: true },
            { name: "⬅️ To", value: `${data.exchange.receive_amount.toFixed(8)} ${data.exchange.to_currency}`, inline: true },
            { name: "📊 Status", value: data.newStatus.charAt(0).toUpperCase() + data.newStatus.slice(1), inline: true },
            { name: "🏦 Wallet", value: `\`${truncateWalletAddress(data.exchange.recipient_wallet_address)}\``, inline: false },
        ],
        footer: {
            text: "Exchange Tracker • Status Update",
            icon_url: botAvatar
        },
        timestamp: new Date().toISOString(),
    };

    const payload: WebhookPayload = {
        username: "Exchange Tracker",
        avatar_url: botAvatar,
        embeds: [embed],
    };

    await sendWebhook(payload);
};
