const gemini = require('./gemini');
const groq = require('./groq');
const openrouter = require('./openrouter');
const Incident = require('../models/Incident');
const Allocation = require('../models/Allocation');

/**
 * Calculates historical response times and statistics from Incident and Allocation models
 * for a specific incident type.
 */
async function calculateHistoricalMetrics(incidentType) {
    try {
        const query = incidentType ? { type: new RegExp(`^${incidentType}$`, 'i') } : {};
        const incidents = await Incident.find(query).lean();
        const totalIncidents = incidents.length;
        const incidentIds = incidents.map(i => i._id);

        const allocations = await Allocation.find({ incident_id: { $in: incidentIds } }).lean();
        const allocMap = new Map();
        allocations.forEach(a => {
            if (a.incident_id) {
                allocMap.set(a.incident_id.toString(), new Date(a.createdAt).getTime());
            }
        });

        let totalResponseTimeMs = 0;
        let matchedCount = 0;

        incidents.forEach(inc => {
            const allocTime = allocMap.get(inc._id.toString());
            if (allocTime && inc.createdAt) {
                const incTime = new Date(inc.createdAt).getTime();
                const diff = allocTime - incTime;
                if (diff > 0) {
                    totalResponseTimeMs += diff;
                    matchedCount++;
                }
            }
        });

        let avgResponseMinutes = matchedCount > 0
            ? Number((totalResponseTimeMs / matchedCount / 60000).toFixed(1))
            : 0;

        // If no matching allocations exist for this specific type, fallback to general sector average
        if (avgResponseMinutes === 0) {
            const allAllocations = await Allocation.find().lean();
            if (allAllocations.length > 0) {
                const allAllocMap = new Map();
                allAllocations.forEach(a => {
                    if (a.incident_id) allAllocMap.set(a.incident_id.toString(), new Date(a.createdAt).getTime());
                });
                const allIncidents = await Incident.find().lean();
                let genTime = 0, genCount = 0;
                allIncidents.forEach(i => {
                    const t = allAllocMap.get(i._id.toString());
                    if (t && i.createdAt) {
                        const d = t - new Date(i.createdAt).getTime();
                        if (d > 0) { genTime += d; genCount++; }
                    }
                });
                if (genCount > 0) {
                    avgResponseMinutes = Number((genTime / genCount / 60000).toFixed(1));
                }
            }
        }

        if (avgResponseMinutes === 0) {
            avgResponseMinutes = 12.5; // Baseline estimated response time (minutes)
        }

        const allocatedCount = allocations.length;
        const resolvedCount = incidents.filter(i => String(i.status).toLowerCase() === 'resolved').length;

        return {
            totalIncidents,
            allocatedIncidents: allocatedCount,
            resolvedIncidents: resolvedCount,
            avgResponseTimeMinutes: avgResponseMinutes
        };
    } catch (dbErr) {
        console.warn("Error calculating historical metrics in precautions.js:", dbErr.message);
        return {
            totalIncidents: 0,
            allocatedIncidents: 0,
            resolvedIncidents: 0,
            avgResponseTimeMinutes: 15.0
        };
    }
}

/**
 * Constructs prompt for AI models to generate precautions & emergency suggestions.
 */
const precautionsPrompt = (description, type, reportedTime, estResponseTime, historicalStats) =>
    `You are an expert disaster safety and emergency response AI for Indian Disaster Response teams and citizen safety.

Analyze this reported incident and generate specific safety precautions and recommended action suggestions for citizens and first responders.

Incident Details:
- Incident Type: ${type || 'General Emergency'}
- Reported Time: ${reportedTime || new Date().toISOString()}
- Description: "${description || 'Disaster incident report.'}"
- Sector DB Estimated Response Time: ${estResponseTime} minutes
- Past Incidents of this Type in Sector DB: ${historicalStats.totalIncidents} reported, ${historicalStats.allocatedIncidents} units dispatched.

Instructions:
Provide a JSON object with EXACTLY two arrays: "precautions" and "suggestions".
- "precautions": List 4-5 crucial safety precautions citizens and on-scene persons must take immediately.
- "suggestions": List 4-5 clear operational suggestions/steps for emergency teams and dispatchers.

Respond with ONLY valid JSON format matching this schema:
{
  "precautions": [
    "Safety step 1",
    "Safety step 2",
    "Safety step 3",
    "Safety step 4"
  ],
  "suggestions": [
    "Response action 1",
    "Response action 2",
    "Response action 3",
    "Response action 4"
  ]
}`;

/**
 * Parses JSON response from AI output with fallback line parser.
 */
const parseAiJson = (text) => {
    if (!text) return null;
    try {
        const cleaned = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && (Array.isArray(parsed.precautions) || Array.isArray(parsed.suggestions))) {
            return {
                precautions: Array.isArray(parsed.precautions) ? parsed.precautions : [],
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
            };
        }
    } catch (e) {
        const lines = String(text).split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const precs = [];
        const suggs = [];
        let currentMode = 'prec';
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (lower.includes('suggestion') || lower.includes('action')) {
                currentMode = 'sugg';
            } else if (line.match(/^[-*•\d+\.]\s*/)) {
                const cleanLine = line.replace(/^[-*•\d+\.]\s*/, '');
                if (currentMode === 'prec') precs.push(cleanLine);
                else suggs.push(cleanLine);
            }
        });
        if (precs.length > 0 || suggs.length > 0) {
            return { precautions: precs, suggestions: suggs };
        }
    }
    return null;
};

/**
 * Rule-based heuristic fallback if AI APIs fail.
 */
function getHeuristicPrecautions(type, estResponseTime) {
    const t = String(type || '').toLowerCase();
    let precautions = [];
    let suggestions = [];

    if (t.includes('flood') || t.includes('water')) {
        precautions = [
            "Move immediately to higher ground or upper levels of sturdy structures.",
            "Avoid walking, swimming, or driving through moving floodwaters.",
            "Turn off main electrical switches and gas valves before evacuating.",
            "Keep phones and essential emergency devices in sealed waterproof bags."
        ];
        suggestions = [
            `Dispatch inflatable rescue boats and teams (Est. Arrival: ~${estResponseTime} mins).`,
            "Establish emergency relief shelter for displaced residents.",
            "Prepare clean drinking water distribution and medical kits."
        ];
    } else if (t.includes('fire')) {
        precautions = [
            "Evacuate the area immediately staying low below smoke levels.",
            "Cover mouth and nose with a damp cloth to prevent smoke inhalation.",
            "Do not use elevators; use stairwells and designated emergency exits.",
            "Maintain safe distance from burning structures and hazard zones."
        ];
        suggestions = [
            `Deploy fire tenders and medical units immediately (Est. Arrival: ~${estResponseTime} mins).`,
            "Cordon off perimeter to allow clear access for emergency vehicles.",
            "Alert nearby burn treatment facilities for incoming casualty management."
        ];
    } else if (t.includes('medical') || t.includes('casualty')) {
        precautions = [
            "Do not move severely injured victims unless immediate danger is present.",
            "Apply clean pressure to bleeding wounds using sterile cloths.",
            "Keep unconscious victims on their side to maintain an open airway.",
            "Stay on the line with emergency dispatchers to provide live victim updates."
        ];
        suggestions = [
            `Dispatch advance life support ambulances (Est. Arrival: ~${estResponseTime} mins).`,
            "Notify trauma receiving centers to prepare emergency triage rooms.",
            "Coordinate traffic control along emergency ambulance transit corridors."
        ];
    } else if (t.includes('landslide')) {
        precautions = [
            "Stay alert for unusual sounds like trees cracking or boulders knocking.",
            "Evacuate away from the path of mudflows or steep slope runoff immediately.",
            "Avoid river channels and low-lying valleys downstream of slide areas.",
            "Watch out for secondary ground subsidence and power line disruption."
        ];
        suggestions = [
            `Mobilize heavy earth-moving equipment & search teams (Est. Arrival: ~${estResponseTime} mins).`,
            "Establish perimeter safety zones and divert ongoing road traffic.",
            "Set up temporary shelter and food supply points for displaced families."
        ];
    } else {
        precautions = [
            "Remain calm, assess immediate hazards, and keep emergency contact active.",
            "Follow official instructions from local emergency authorities.",
            "Help vulnerable individuals (children, elderly) move to safe shelter.",
            "Avoid spreading rumors; follow verified emergency broadcast channels."
        ];
        suggestions = [
            `Deploy nearest available rapid response unit (Est. Arrival: ~${estResponseTime} mins).`,
            "Maintain continuous sector radar & spatial index monitoring.",
            "Broadcast emergency advisory updates to local jurisdiction contacts."
        ];
    }

    return { precautions, suggestions };
}

/**
 * Helper to enforce strict timeouts on AI model calls.
 */
const withTimeout = (promise, ms = 3500, label = "AI Model") => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

/**
 * Main precautions utility function.
 * Preference Order:
 * 1. Gemini (3.5s timeout)
 * 2. Groq (3.5s timeout)
 * 3. OpenRouter (3.5s timeout)
 * 4. Rule-based Heuristics
 */
const precautions = async (reqOrParams, res) => {
    let incident = null;
    let description = '';
    let reportedTime = '';
    let incidentType = 'General';

    if (reqOrParams?.body || reqOrParams?.query) {
        const body = reqOrParams.body || {};
        const query = reqOrParams.query || {};
        incident = body.incident || query.incident || null;
        description = body.description || query.description || body.details || '';
        reportedTime = body.reportedTime || query.reportedTime || body.time || body.createdAt || new Date().toISOString();
        incidentType = body.incidentType || body.type || query.incidentType || query.type || 'General';
    } else if (typeof reqOrParams === 'object' && reqOrParams !== null) {
        incident = reqOrParams.incident || null;
        description = reqOrParams.description || reqOrParams.details || '';
        reportedTime = reqOrParams.reportedTime || reqOrParams.time || reqOrParams.createdAt || new Date().toISOString();
        incidentType = reqOrParams.incidentType || reqOrParams.type || 'General';
    }

    // Query Incident & Allocation models from database
    const historicalStats = await calculateHistoricalMetrics(incidentType);
    const estResponseTime = historicalStats.avgResponseTimeMinutes;

    let precautionsList = null;
    let suggestionsList = null;
    let aiProviderUsed = null;

    const promptText = precautionsPrompt(description, incidentType, reportedTime, estResponseTime, historicalStats);

    // 1. Preference 1: Try Gemini (with 3.5s timeout)
    try {
        const geminiPromise = gemini.models.generateContent({
            model: 'gemini-flash-latest',
            contents: promptText
        });
        const geminiRes = await withTimeout(geminiPromise, 3500, "Gemini AI");
        const text = geminiRes.text;
        const parsed = parseAiJson(text);
        if (parsed && (parsed.precautions.length > 0 || parsed.suggestions.length > 0)) {
            precautionsList = parsed.precautions;
            suggestionsList = parsed.suggestions;
            aiProviderUsed = 'ResQNet Intelligence Engine';
        }
    } catch (geminiError) {
        console.warn("Gemini precautions generation failed or timed out, trying Groq:", geminiError.message);
    }

    // 2. Preference 2: Try Groq (with 3.5s timeout per model)
    if (!aiProviderUsed) {
        const groqModels = [
          'groq/compound-mini',
          'groq/compound'
        ];
        for (const model of groqModels) {
            try {
                const groqPromise = groq.chat.completions.create({
                    model: model,
                    messages: [{ role: 'user', content: promptText }]
                });
                const completion = await withTimeout(groqPromise, 3500, `Groq (${model})`);
                const text = completion.choices?.[0]?.message?.content;
                const parsed = parseAiJson(text);
                if (parsed && (parsed.precautions.length > 0 || parsed.suggestions.length > 0)) {
                    precautionsList = parsed.precautions;
                    suggestionsList = parsed.suggestions;
                    aiProviderUsed = 'ResQNet Intelligence Engine';
                    break;
                }
            } catch (groqError) {
                console.warn(`Groq model ${model} failed or timed out:`, groqError.message);
            }
        }
    }

    // 3. Preference 3: Try OpenRouter (with 3.5s timeout per model)
    if (!aiProviderUsed) {
        const openrouterModels = [
          'nvidia/nemotron-3-ultra-550b-a55b:free',
          'nvidia/nemotron-3.5-lightning:free',
          'nvidia/nemotron-3-super-120b-a12b:free',
          'google/gemma-4-31b-it:free',
          'minimax/minimax-m3:free',
          'poolside/laguna-s-2.1:free'
        ];
        for (const model of openrouterModels) {
            try {
                const openrouterPromise = openrouter.chat.completions.create({
                    model: model,
                    messages: [{ role: 'user', content: promptText }]
                });
                const completion = await withTimeout(openrouterPromise, 3500, `OpenRouter (${model})`);
                const text = completion.choices?.[0]?.message?.content;
                const parsed = parseAiJson(text);
                if (parsed && (parsed.precautions.length > 0 || parsed.suggestions.length > 0)) {
                    precautionsList = parsed.precautions;
                    suggestionsList = parsed.suggestions;
                    aiProviderUsed = 'ResQNet Intelligence Engine';
                    break;
                }
            } catch (openrouterError) {
                console.warn(`OpenRouter model ${model} failed or timed out:`, openrouterError.message);
            }
        }
    }

    // 4. Fallback: Rule-based heuristics
    if (!aiProviderUsed) {
        const fallback = getHeuristicPrecautions(incidentType, estResponseTime);
        precautionsList = fallback.precautions;
        suggestionsList = fallback.suggestions;
        aiProviderUsed = 'ResQNet Intelligence Engine';
    }

    const responseData = {
        success: true,
        incident: incident,
        incidentType: incidentType,
        description: description,
        reportedTime: reportedTime,
        estResponseTime: estResponseTime,
        precautions: precautionsList,
        suggestions: suggestionsList,
        historicalStats: historicalStats,
        aiProvider: aiProviderUsed
    };

    if (res && typeof res.status === 'function') {
        return res.status(200).json(responseData);
    }

    return responseData;
};

module.exports = precautions;
