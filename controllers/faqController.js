const FAQ = require("../models/FAQ");
const { translateText } = require("../services/translationService.js");
const { getCache, setCache } = require('../services/cacheService');


exports.addFAQ = async (req, res) => {
  const { question, answer, language } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: "Question and Answer cannot be empty" });
  }

  try {
    const translations = {};

    if (language !== 'hi') {
      translations.hi = {
        question: await translateText(question, "hi"),
        answer: await translateText(answer, "hi"),
      };
    } else {
      translations.hi = { question, answer };
    }

    if (language !== 'bn') {
      translations.bn = {
        question: await translateText(question, "bn"),
        answer: await translateText(answer, "bn"),
      };
    } else {
      translations.bn = { question, answer };
    }

    let translatedQuestion = question;
    let translatedAnswer = answer;

    if (language !== 'en') {
      translatedQuestion = await translateText(question, "en");
      translatedAnswer = await translateText(answer, "en");
    }

    const newFAQ = new FAQ({ question: translatedQuestion, answer: translatedAnswer, translations });
    await newFAQ.save();

    const newFAQData = {
      en: { question: translatedQuestion, answer: translatedAnswer },
      hi: translations.hi,
      bn: translations.bn,
    };

    await Promise.all(
      ['en', 'hi', 'bn'].map(async (lang) => {
        const cacheKey = `faqs:${lang}`;
        let existingCache = await getCache(cacheKey);
        
        if (!Array.isArray(existingCache)) existingCache = []; // Ensure it's an array

        existingCache.push(newFAQData[lang]);
        const updatedCacheValue = JSON.stringify(existingCache);

        await setCache(cacheKey, updatedCacheValue);
      })
    );

    res.status(201).json({
      success: true,
      message: "FAQ added successfully with translations and cached!",
      faq: newFAQ,
    });
    
  } catch (error) {
    console.error('Error adding FAQ:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getFAQs = async (req, res) => {
  const lang = req.query.lang || 'en';

  try {
    const cacheKey = `faqs:${lang}`;
    const cachedFaqs = await getCache(cacheKey);

    if (cachedFaqs) {
      return res.status(200).json({ message: "Returning cached FAQs", cachedFaqs: cachedFaqs});
    }

    const faqs = await FAQ.find();

    const translatedFaqs = await Promise.all(
      faqs.map(async (faq) => {
        if (lang !== 'en' && faq.translations[lang]) {
          return {
            question: faq.translations[lang].question || faq.question,
            answer: faq.translations[lang].answer || faq.answer,
          };
        }
        return {
          question: faq.question,
          answer: faq.answer,
        };
      })
    );

    await setCache(cacheKey, translatedFaqs);

    res.status(200).json({ message: "Returning FAQs from db", translatedFaqs: translatedFaqs});


  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

