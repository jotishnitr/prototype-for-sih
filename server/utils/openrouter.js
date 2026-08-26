const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
});

module.exports = openrouter;