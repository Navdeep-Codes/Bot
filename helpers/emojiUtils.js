/**
 * Detects tracked emojis in message text
 */
function detectEmojis(text) {
  const trackedEmojis = ['backgrounds', 'art', 'cute-music', 'literature'];
  const foundEmojis = [];
  
  trackedEmojis.forEach(emoji => {
    if (text.includes(`:${emoji}:`)) {
      foundEmojis.push(emoji);
    }
  });
  
  return foundEmojis;
}

/**
 * Checks if the attachment is supported for the given emoji
 */
function isSupportedAttachment(file, emoji) {
  const fileType = file.filetype?.toLowerCase();
  
  switch (emoji) {
    case 'backgrounds':
    case 'art':
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType);
      
    case 'cute-music':
      return ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(fileType);
      
    case 'literature':
      return ['pdf', 'doc', 'docx', 'txt', 'md'].includes(fileType);
      
    default:
      return false;
  }
}

/**
 * Gets category name from emoji
 */
function getCategoryFromEmoji(emoji) {
  switch (emoji) {
    case 'backgrounds': return 'backgrounds';
    case 'art': return 'art';
    case 'cute-music': return 'music';
    case 'literature': return 'literature';
    default: return 'uncategorized';
  }
}

module.exports = { detectEmojis, isSupportedAttachment, getCategoryFromEmoji };