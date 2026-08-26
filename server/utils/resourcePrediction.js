const gemini = require('./gemini');
const openrouter = require('./openrouter');

const openrouterModels = [
    "anthropic/claude-3.5-sonnet",
    "meta-llama/llama-3.1-70b-instruct",
    "mistralai/mistral-large-2411",
];

const validTypes = ['rescue_team', 'medical_unit', 'shelter', 'supply_depot'];

const parseResourceType = (text) => {
    if (!text) return null;
    const cleaned = String(text).toLowerCase().trim();
    for (const type of validTypes) {
        if (cleaned.includes(type)) {
            return type;
        }
    }
    return null;
};

const resourcePrompt = (description, type, severity) =>
    `You are a disaster resource allocation AI for Indian disaster response teams.

Analyze this incident and predict the most suitable resource type to dispatch first.

Incident Type: ${type || 'General'}
Severity: ${severity || 3}/5
Description: "${description || ''}"

Available Resource Types:
- rescue_team    : for people trapped, flood rescue, structural collapse, evacuation
- medical_unit   : for injuries, casualties, medical emergencies, unconscious persons
- shelter        : for displaced families, homeless citizens needing temporary housing
- supply_depot   : for food/water/medicine distribution, relief material needed

Rules:
- Injuries or casualties mentioned = medical_unit first
- People trapped in water/building = rescue_team first
- Families displaced, homeless = shelter first
- Food/water shortage only = supply_depot first
- Fire with injuries = medical_unit first
- Flood with trapped people = rescue_team first
- Multiple needs = pick most urgent one

Reply with ONLY one of these exact strings:
rescue_team
medical_unit
shelter
supply_depot

No explanation. No punctuation. No extra text.`;

const resourcePrediction = async (req, res) => {
    const description = req?.body?.description || req?.description || '';
    const type = req?.body?.type || req?.body?.incidentType || req?.type || 'General';
    const severity = req?.body?.severity || req?.severity || 3;

    let predicted = null;

    // Primary: Try Google Gemini (gemini-flash-latest)
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-flash-latest',
            contents: resourcePrompt(description, type, severity),
        });
        const text = response.text;
        predicted = parseResourceType(text);
    } catch (geminiError) {
        console.warn("Gemini resource prediction failed, falling back to OpenRouter:", geminiError.message);
    }

    // Fallback: Try OpenRouter models loop
    if (!predicted) {
        for (const model of openrouterModels) {
            try {
                const completion = await openrouter.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'user', content: resourcePrompt(description, type, severity) }
                    ]
                });
                const text = completion.choices?.[0]?.message?.content;
                predicted = parseResourceType(text);
                if (predicted) break;
            } catch (openrouterError) {
                console.warn(`OpenRouter model ${model} failed:`, openrouterError.message);
            }
        }
    }

    // Final Fallback: Heuristic keyword analysis
    if (!predicted) {
        const descLower = String(description).toLowerCase();
        if (descLower.includes("injur") || descLower.includes("casualt") || descLower.includes("doctor") || descLower.includes("hospital")) {
            predicted = 'medical_unit';
        } else if (descLower.includes("water") || descLower.includes("food") || descLower.includes("ration")) {
            predicted = 'supply_depot';
        } else if (descLower.includes("home") || descLower.includes("shelter") || descLower.includes("evacuat")) {
            predicted = 'shelter';
        } else {
            predicted = 'rescue_team';
        }
    }

    if (res && typeof res.status === 'function') {
        return res.status(200).json({ success: true, predicted_resource: predicted });
    }
    return predicted;
};

module.exports = resourcePrediction;