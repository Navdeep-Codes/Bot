const { App } = require('@slack/bolt');
const storage = require('node-persist');
const { processMessage } = require('./helpers/messageProcessor');
const { detectEmojis, isSupportedAttachment, getCategoryFromEmoji } = require('./helpers/emojiUtils');
const { formatVaultMessage } = require('./helpers/messageFormatter');
const { incrementEmojiCount } = require('./helpers/userStats');
require('dotenv').config();

// Initialize storage
async function initializeStorage() {
  await storage.init({
    dir: './db',
    stringify: JSON.stringify,
    parse: JSON.parse,
  });
}

// Initialize the Slack app with debug logging
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: 'info' // Add logging for better debugging
});

// Log connection events
app.client.on('connecting', () => {
  console.log('⏳ Connecting to Slack...');
});

app.client.on('authenticated', () => {
  console.log('✅ Successfully authenticated with Slack');
});

app.client.on('connected', () => {
  console.log('🟢 Connected to Slack!');
});

app.client.on('disconnected', () => {
  console.log('🔴 Disconnected from Slack');
});

app.client.on('error', (error) => {
  console.error('❌ Connection error:', error);
});

// Listen for message events
app.event('message', async ({ event, client }) => {
  console.log('📨 Message event received:', JSON.stringify(event, null, 2));

  // REMOVED the first filter that was blocking all subtypes
  
  // Channel restriction (optional - remove if you want to monitor all channels)
  const allowedChannels = [
    'C08RLEW570F',
    'C08QDNJCB1U'
  ];

  if (!allowedChannels.includes(event.channel)) {
    console.log(`Ignoring message from non-monitored channel: ${event.channel}`);
    return;
  }

  // Only ignore bot messages and message changes, but ALLOW file_share subtype
  if ((event.subtype && event.subtype !== 'file_share') || event.bot_id) {
    console.log('Ignoring message with subtype:', event.subtype);
    return;
  }

  try {
    // Log file attachments for debugging
    if (event.files) {
      console.log(`📎 Message has ${event.files.length} file(s) attached`);
      event.files.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.name} (${file.mimetype})`);
      });
    } else {
      console.log('📝 Message has no files attached');
    }

    // Log message text and detected emojis
    console.log('Message text:', event.text);
    const emojis = detectEmojis(event.text || '');
    console.log('Detected emojis:', emojis);
    
    // Process the message
    const result = await processMessage(event, client, storage);
    console.log('Process result:', result);
    
    // If there's a result, handle it
    if (result) {
      if (result.success) {
        // Send confirmation in thread
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.ts,
          text: "Your content has been successfully added to the artistic vault! ✨"
        });
      } else {
        // Send error message in thread
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.ts,
          text: result.errorMessage
        });
      }
    }
  } catch (error) {
    console.error(`❌ Error processing message:`, error);
  }
});

// Start the app
(async () => {
  try {
    await initializeStorage();
    await app.start();
    console.log('⚡️ Artistic Vault Bot is running!');
  } catch (error) {
    console.error('❌ Failed to start app:', error);
  }
})();