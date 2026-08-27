const gemini = require('./gemini');
const openrouter = require('./openrouter');

const geminiModels = [
    'gemini-flash-latest'
];

const openrouterModels = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "deepseek/deepseek-r1:free"
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
- rescue_team    : for people trapped, flood rescue, structural collapse, evacuation, people stuck in water
- medical_unit   : for injuries, casualties, medical emergencies, unconscious persons
- shelter        : for displaced families, homeless citizens needing temporary housing
- supply_depot   : for food/water/medicine distribution, relief material needed

Rules:
- People trapped in water or flood = rescue_team first
- Injuries or casualties mentioned = medical_unit first
- Families displaced, homeless = shelter first
- Food/water shortage only = supply_depot first
- Fire with injuries = medical_unit first
- Flood with trapped people = rescue_team first

Reply with ONLY one of these exact strings:
rescue_team
medical_unit
shelter
supply_depot

No explanation. No punctuation. No extra text.`;

const withTimeout = (promise, ms = 3000, label = "AI Model") => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const resourcePrediction = async (req, res) => {
    const description = req?.body?.description || req?.description || '';
    const type = req?.body?.type || req?.body?.incidentType || req?.type || 'General';
    const severity = req?.body?.severity || req?.severity || 3;

    let predicted = null;

    // Primary: Try Google Gemini models with 3s timeout
    for (const model of geminiModels) {
        try {
            const geminiPromise = gemini.models.generateContent({
                model: model,
                contents: resourcePrompt(description, type, severity),
            });
            const response = await withTimeout(geminiPromise, 3000, `Gemini (${model})`);
            const text = response.text;
            predicted = parseResourceType(text);
            if (predicted) break;
        } catch (geminiError) {
            console.warn(`Gemini model ${model} failed or timed out:`, geminiError.message);
        }
    }

    // Fallback: Try OpenRouter models loop with 3s timeout
    if (!predicted) {
        for (const model of openrouterModels) {
            try {
                const openrouterPromise = openrouter.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'user', content: resourcePrompt(description, type, severity) }
                    ]
                });
                const completion = await withTimeout(openrouterPromise, 3000, `OpenRouter (${model})`);
                const text = completion.choices?.[0]?.message?.content;
                predicted = parseResourceType(text);
                if (predicted) break;
            } catch (openrouterError) {
                console.warn(`OpenRouter model ${model} failed or timed out:`, openrouterError.message);
            }
        }
    }

    // Final Fallback: Heuristic keyword analysis
    if (!predicted) {
        const descLower = String(description).toLowerCase() + ' ' + String(type).toLowerCase();
        
        // Priority 1: Rescue Team (people trapped, water/floods, evacuation, rescue, stuck/struck)
        if (descLower.includes("rescue") || descLower.includes("trap") || descLower.includes("stuck") || descLower.includes("struck") || descLower.includes("flood") || descLower.includes("collapse") || descLower.includes("drown") || descLower.includes("boat")) {
            predicted = 'rescue_team';
        }
        // Priority 2: Medical Unit (injuries, casualties, blood, unconscious, hospital, doctor)
        else if (descLower.includes("injur") || descLower.includes("casualt") || descLower.includes("doctor") || descLower.includes("hospital") || descLower.includes("blood") || descLower.includes("patient") || descLower.includes("unconscious")) {
            predicted = 'medical_unit';
        }
        // Priority 3: Shelter (homeless, displaced, housing)
        else if (descLower.includes("shelter") || descLower.includes("homeless") || descLower.includes("displaced")) {
            predicted = 'shelter';
        }
        // Priority 4: Supply Depot (food, ration, drinking water, packets)
        else if (descLower.includes("food") || descLower.includes("ration") || descLower.includes("drinking water") || descLower.includes("packets")) {
            predicted = 'supply_depot';
        }
        else {
            predicted = 'rescue_team';
        }
    }

    if (res && typeof res.status === 'function') {
        return res.status(200).json({ success: true, predicted_resource: predicted });
    }
    return predicted;
};

module.exports = resourcePrediction;