const { client } = require('../config/redis.js');

exports.getCache = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null; // Parse cached data if it exists
  } catch (err) {
    console.error('Error getting cache:', err);
    return null;
  }
};

exports.setCache = async (key, value, expiry = 3600) => {
  try {
    // Ensure value is already a string before saving
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await client.set(key, stringValue, { EX: expiry }); // Expiry set in seconds
  } catch (err) {
    console.error('Error setting cache:', err);
  }
};
