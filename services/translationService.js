const translate = require('google-translate-api-x');

exports.translateText = async (text, targetLanguage) => {
  if (!text) return '';

  try {
    const result = await translate(text, { to: targetLanguage });
    return result.text;
  } catch (error) {
    console.error('Translation Error:', error.message);
    return text; // Fallback to original text
  }
};
