/**
 * Increment emoji usage count for a user
 */
async function incrementEmojiCount(storage, userId, emoji) {
  const key = `${userId}_${emoji}`;
  const currentCount = await storage.getItem(key) || 0;
  await storage.setItem(key, currentCount + 1);
  return currentCount + 1;
}

/**
 * Get emoji usage count for a user
 */
async function getEmojiCount(storage, userId, emoji) {
  const key = `${userId}_${emoji}`;
  return await storage.getItem(key) || 0;
}

module.exports = { incrementEmojiCount, getEmojiCount };