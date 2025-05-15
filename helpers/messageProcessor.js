const { detectEmojis, isSupportedAttachment, getCategoryFromEmoji } = require('./emojiUtils');
const { formatVaultMessage } = require('./messageFormatter');
const { incrementEmojiCount, getEmojiCount } = require('./userStats');

/**
 * Process a Slack message to check for emojis and attachments
 */
async function processMessage(event, client, storage) {
  // Extract message text and check for emojis
  const messageText = event.text || '';
  const emojisFound = detectEmojis(messageText);
  
  // If no target emojis found, ignore the message
  if (emojisFound.length === 0) return null;
  
  // Check for attachments
  const hasAttachments = event.files && event.files.length > 0;
  if (!hasAttachments) {
    return {
      success: false,
      errorMessage: "Please attach an attachment if you want me to take a record of this. Check out this canvas for more info"
    };
  }
  
  // Check for multiple tracked emojis
  if (emojisFound.length > 1) {
    return {
      success: false,
      errorMessage: "If you want me to take record of this, please use only one emoji. Check out this canvas for more info"
    };
  }
  
  const emoji = emojisFound[0];
  const files = event.files;
  
  // Check if attachment type matches emoji
  if (!files.some(file => isSupportedAttachment(file, emoji))) {
    return {
      success: false,
      errorMessage: "Sorry I could not take a record of this as the emoji you used is not related to the document attached. Check out this canvas for more info"
    };
  }
  
  // Get categories based on emoji
  const category = getCategoryFromEmoji(emoji);
  
  // Special case for images with both :backgrounds: and :art:
  let categories = [category];
  if (emoji === 'backgrounds' && messageText.includes(':art:')) {
    categories.push('art');
  } else if (emoji === 'art' && messageText.includes(':backgrounds:')) {
    categories.push('backgrounds');
  }
  
  // Increment emoji count for user
  const userId = event.user;
  await incrementEmojiCount(storage, userId, emoji);
  const emojiCount = await getEmojiCount(storage, userId, emoji);
  
  // Get user info for the ping
  const userInfo = await client.users.info({ user: userId });
  
  // Format the message for the vault
  const formattedMessage = await formatVaultMessage({
    user: userInfo.user,
    categories,
    emojiCount,
    files,
    timestamp: event.ts
  });
  
  // Send to the artistic vault channel
  await client.chat.postMessage({
    channel: process.env.ARTISTIC_VAULT_CHANNEL_ID,
    text: formattedMessage,
    unfurl_links: false,
    unfurl_media: true
  });
  
  return { success: true };
}

module.exports = { processMessage };