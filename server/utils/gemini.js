const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
});

module.exports = gemini;