const { App } = require('@slack/bolt');
require('dotenv').config();

// Initialize with debug logging
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: 'debug' // Enable detailed logging
});

// Log ALL events for debugging
app.use(async ({ logger, next }) => {
  logger.info('Received an event!');
  await next();
});

// Listen for ANY message
app.message(/.*/, async ({ message, say }) => {
  console.log('Message received:', message);
  await say({
    text: 'I received your message!',
    thread_ts: message.ts
  });
});

// Start the app
(async () => {
  await app.start();
  console.log('⚡️ Debug bot is running!');
})();