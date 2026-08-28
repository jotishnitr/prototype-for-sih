const gemini = require('./gemini');
const groq = require('./groq');
const openrouter = require('./openrouter');

const severityPrompt = (description, type) =>
    `You are a disaster management AI for Indian disaster response teams.

Analyze this incident and predict severity level.

Incident Type: ${type || 'General'}
Description: "${description || ''}"

Severity Scale:
1 = Minor  — no immediate danger, minimal impact
2 = Low    — limited impact, no life threat
3 = Moderate — some risk, medical attention may be needed
4 = High   — serious danger, multiple people affected, urgent response needed
5 = Critical — life threatening, mass casualties possible, immediate dispatch required

Rules:
- People trapped = minimum severity 4
- Children/elderly involved = +1 severity
- Fire/flood/cyclone with casualties = minimum 4
- Infrastructure damage only = maximum 3
- Vague description with no danger = 2

Reply with ONLY a single digit between 1 and 5. No explanation. No punctuation.`;

const groqModels = [
  'groq/compound-mini',
  'groq/compound'
];

const openrouterModels = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
  'minimax/minimax-m3:free',
  'poolside/laguna-s-2.1:free'
];

const parseSeverity = (text) => {
    if (!text) return null;
    const match = String(text).match(/[1-5]/);
    if (match) {
        const val = parseInt(match[0], 10);
        if (val >= 1 && val <= 5) return val;
    }
    return null;
};

const withTimeout = (promise, ms = 3000, label = "AI Model") => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const severityPrediction = async (req) => {
    const description = req.body?.description || req.body?.details || '';
    const incidentType = req.body?.incidentType || req.body?.type || 'General';

    // Primary: Try Gemini AI with 3s timeout
    try {
        const geminiPromise = gemini.models.generateContent({
            model: 'gemini-flash-latest',
            contents: severityPrompt(description, incidentType),
        });
        const response = await withTimeout(geminiPromise, 3000, "Gemini AI");
        const text = response.text;
        const predicted = parseSeverity(text);
        if (predicted) return predicted;
    } catch (geminiError) {
        console.warn("Gemini severity prediction failed or timed out, trying Groq:", geminiError.message);
    }

    // Secondary: Try Groq models with 3s timeout
    for (const model of groqModels) {
        try {
            const groqPromise = groq.chat.completions.create({
                model: model,
                messages: [
                    { role: 'user', content: severityPrompt(description, incidentType) }
                ]
            });
            const completion = await withTimeout(groqPromise, 3000, `Groq (${model})`);
            const text = completion.choices?.[0]?.message?.content;
            const predicted = parseSeverity(text);
            if (predicted) return predicted;
        } catch (groqError) {
            console.warn(`Groq model ${model} failed or timed out:`, groqError.message);
        }
    }

    // Tertiary: Try OpenRouter models with 3s timeout per model
    for (const model of openrouterModels) {
        try {
            const openrouterPromise = openrouter.chat.completions.create({
                model: model,
                messages: [
                    { role: 'user', content: severityPrompt(description, incidentType) }
                ]
            });
            const completion = await withTimeout(openrouterPromise, 3000, `OpenRouter (${model})`);
            const text = completion.choices?.[0]?.message?.content;
            const predicted = parseSeverity(text);
            if (predicted) return predicted;
        } catch (openrouterError) {
            console.warn(`OpenRouter model ${model} failed or timed out:`, openrouterError.message);
        }
    }

    // Heuristic fallback if AI models fail or API keys are missing
    const descLower = String(description).toLowerCase();
    if (descLower.includes("trapped") || descLower.includes("casualty") || descLower.includes("critical") || descLower.includes("severe")) {
        return 5;
    } else if (descLower.includes("injured") || descLower.includes("fire") || descLower.includes("flood")) {
        return 4;
    }
    return 3;
};

module.exports = severityPrediction;