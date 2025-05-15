/**
 * Formats message for the artistic vault channel
 */
async function formatVaultMessage({ user, categories, emojiCount, files, timestamp }) {
  const date = new Date(parseInt(timestamp.split('.')[0]) * 1000).toISOString().split('T')[0];
  
  let message = `<@${user.id}>\n`;
  message += `Date: ${date}\n`;
  message += `Emoji count: ${emojiCount}\n`;
  message += `Categories: ${categories.join(', ')}\n\n`;
  
  // Add file information
  if (files && files.length > 0) {
    message += `Attachments: ${files.length} file(s)\n`;
    
    files.forEach(file => {
      if (file.permalink) {
        message += `<${file.permalink}|${file.name}>\n`;
      } else {
        message += `${file.name}\n`;
      }
    });
  }
  
  return message;
}

module.exports = { formatVaultMessage };