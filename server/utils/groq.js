const dotenv = require("dotenv");
dotenv.config();

let groq;

try {
    const Groq = require("groq-sdk");
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
} catch (e1) {
    try {
        const Groq = require("groq");
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    } catch (e2) {
        const OpenAI = require("openai");
        groq = new OpenAI({
            baseURL: "https://api.groq.com/openai/v1",
            apiKey: process.env.GROQ_API_KEY,
        });
    }
}

module.exports = groq;