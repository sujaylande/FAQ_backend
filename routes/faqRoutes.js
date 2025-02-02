const express = require('express');
const router = express.Router();
const { addFAQ, getFAQs } = require('../controllers/faqController.js');
const path = require('path');

router.post('/', addFAQ);
router.get('/', getFAQs);


module.exports = router;
