const gemini = require('./gemini');
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

const openrouterModels = [
    "anthropic/claude-3.5-sonnet",
    "meta-llama/llama-3.1-70b-instruct",
    "mistralai/mistral-large-2411",
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

const severityPrediction = async (req) => {
    const description = req.body?.description || req.body?.details || '';
    const incidentType = req.body?.incidentType || req.body?.type || 'General';

    // Primary: Try Gemini AI
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: severityPrompt(description, incidentType),
        });
        const text = response.text;
        const predicted = parseSeverity(text);
        if (predicted) return predicted;
    } catch (geminiError) {
        console.warn("Gemini severity prediction failed, falling back to OpenRouter:", geminiError.message);
    }

    // Fallback: Try OpenRouter models
    for (const model of openrouterModels) {
        try {
            const completion = await openrouter.chat.completions.create({
                model: model,
                messages: [
                    { role: 'user', content: severityPrompt(description, incidentType) }
                ]
            });
            const text = completion.choices?.[0]?.message?.content;
            const predicted = parseSeverity(text);
            if (predicted) return predicted;
        } catch (openrouterError) {
            console.warn(`OpenRouter model ${model} failed:`, openrouterError.message);
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