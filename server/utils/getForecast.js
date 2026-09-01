// utils/getForecast.js
const Incident = require('../models/Incident');
const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');
const User = require('../models/User');

let gemini = require('./gemini');
if (gemini && gemini.gemini) gemini = gemini.gemini;

let openrouter = require('./openrouter');
if (openrouter && openrouter.openrouter) openrouter = openrouter.openrouter;

/**
 * Timeout helper for external AI calls.
 */
const withTimeout = (promise, ms = 4000, label = 'AI Model') => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

/**
 * Parses JSON response from AI output with markdown fence stripping and bracket extraction.
 */
const parseForecastJson = (text) => {
    if (!text) return null;
    try {
        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
            try {
                const extracted = text.substring(first, last + 1);
                return JSON.parse(extracted);
            } catch (err) {
                return null;
            }
        }
    }
    return null;
};

/**
 * Heuristic fallback forecast when AI services are unavailable or rate-limited.
 */
const getHeuristicForecast = (context) => {
    const active = context.active_incidents || 0;
    const critical = context.critical_incidents || 0;

    let risk_level = 'low';
    if (critical > 2 || active >= 10) risk_level = 'critical';
    else if (critical > 0 || active >= 5) risk_level = 'high';
    else if (active >= 2) risk_level = 'medium';

    const shortage_predictions = [];
    const recAvail = context.resources?.rescue_teams_available || 0;
    const medAvail = context.resources?.medical_staff_available || 0;
    const shelterOcc = context.resources?.shelter_occupancy_pct || 0;

    if (recAvail < 5 || critical > 0) {
        shortage_predictions.push({
            resource_type: 'rescue_team',
            predicted_shortage_hours: risk_level === 'critical' ? 1.5 : 3.0,
            current_available: recAvail,
            predicted_demand: recAvail + (critical * 3) + 2,
            recommendation: 'Pre-position rescue teams and NDRF personnel from adjacent jurisdictions.'
        });
    }

    if (medAvail < 10 || (context.incident_breakdown?.medical || 0) > 0) {
        shortage_predictions.push({
            resource_type: 'medical_unit',
            predicted_shortage_hours: 2.0,
            current_available: medAvail,
            predicted_demand: medAvail + 8,
            recommendation: 'Alert district medical hospitals and request emergency mobile triage units.'
        });
    }

    if (shelterOcc > 75) {
        shortage_predictions.push({
            resource_type: 'shelter',
            predicted_shortage_hours: 2.5,
            current_available: Math.max(0, 100 - shelterOcc),
            predicted_demand: 100,
            recommendation: 'Activate secondary emergency relief centers and community halls.'
        });
    }

    if (shortage_predictions.length === 0) {
        shortage_predictions.push({
            resource_type: 'supply_depot',
            predicted_shortage_hours: 4.0,
            current_available: 20,
            predicted_demand: 15,
            recommendation: 'Maintain routine inventory monitoring and replenish standard relief packets.'
        });
    }

    return {
        risk_level,
        shortage_predictions,
        overall_assessment: `Active incidents: ${active} (${critical} critical). Current shelter capacity occupancy is ${shelterOcc}%. Emergency preparedness measures recommended for next 2-4 hours.`,
        immediate_actions: [
            'Verify real-time field communications with deployed personnel.',
            'Pre-stage mutual aid resources with neighboring jurisdictions.',
            'Ensure emergency broadcast frequencies and citizen helplines remain active.'
        ]
    };
};

const getForecast = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID missing' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const jid = user.jurisdiction_id;
        if (!jid) {
            return res.status(400).json({ message: 'No jurisdiction assigned to user' });
        }

        // Gather current state
        const [incidents, resources, allocations] = await Promise.all([
            Incident.find({ jurisdiction_id: jid, status: { $ne: 'resolved' } }).lean(),
            Resource.find({ jurisdiction_id: jid }).lean(),
            Allocation.find({ jurisdiction_id: jid, status: 'active' }).lean()
        ]);

        // Build context for AI
        const context = {
            active_incidents: incidents.length,
            incident_breakdown: {
                flood: incidents.filter(i => i.type === 'flood').length,
                cyclone: incidents.filter(i => i.type === 'cyclone').length,
                fire: incidents.filter(i => i.type === 'fire').length,
                landslide: incidents.filter(i => i.type === 'landslide').length,
                medical: incidents.filter(i => i.type === 'medical').length,
            },
            critical_incidents: incidents.filter(i => (i.severity || 0) >= 4).length,
            resources: {
                rescue_teams_available: resources
                    .filter(r => r.type === 'rescue_team' && r.status === 'available')
                    .reduce((s, r) => s + (r.rescue_team?.available_members || 0), 0),
                rescue_teams_deployed: resources
                    .filter(r => r.type === 'rescue_team' && r.status === 'deployed')
                    .reduce((s, r) => s + (r.rescue_team?.total_members || 0), 0),
                medical_staff_available: resources
                    .filter(r => r.type === 'medical_unit' && r.status === 'available')
                    .reduce((s, r) => s + (r.medical_unit?.available_staff || 0), 0),
                shelter_occupancy_pct: (() => {
                    const shelters = resources.filter(r => r.type === 'shelter');
                    const total = shelters.reduce((s, r) => s + (r.shelter?.capacity_total || 0), 0);
                    const remaining = shelters.reduce((s, r) => s + (r.shelter?.capacity_remaining || 0), 0);
                    return total ? Math.round(((total - remaining) / total) * 100) : 0;
                })(),
            },
            active_allocations: allocations.length,
        };

        const prompt = `You are a disaster management AI for Indian NDRF operations.

Current situation in jurisdiction:
${JSON.stringify(context, null, 2)}

Based on this data, provide a resource demand forecast for the next 2-4 hours.

Reply ONLY with this JSON structure, no explanation:
{
  "risk_level": "low|medium|high|critical",
  "shortage_predictions": [
    {
      "resource_type": "rescue_team|medical_unit|shelter|supply_depot",
      "predicted_shortage_hours": 2.5,
      "current_available": 10,
      "predicted_demand": 15,
      "recommendation": "Pre-position 5 rescue teams from neighboring areas"
    }
  ],
  "overall_assessment": "2-3 sentence situation summary",
  "immediate_actions": ["action1", "action2", "action3"]
}`;

        let forecast = null;
        let aiProvider = null;

        // 1. Primary: Google Gemini
        if (gemini?.models?.generateContent) {
            const geminiModels = ['gemini-flash-latest'];
            for (const model of geminiModels) {
                try {
                    const geminiPromise = gemini.models.generateContent({
                        model,
                        contents: prompt
                    });
                    const geminiRes = await withTimeout(geminiPromise, 4000, `Gemini (${model})`);
                    const text = geminiRes.text;
                    const parsed = parseForecastJson(text);
                    if (parsed) {
                        forecast = parsed;
                        aiProvider = 'ResQNet Intelligence Engine';
                        break;
                    }
                } catch (geminiErr) {
                    console.warn(`Gemini model ${model} failed or timed out:`, geminiErr.message);
                }
            }
        }

        // 2. Secondary Fallback: OpenRouter
        if (!forecast && openrouter?.chat?.completions?.create) {
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
                        model,
                        messages: [{ role: 'user', content: prompt }]
                    });
                    const completion = await withTimeout(openrouterPromise, 4000, `OpenRouter (${model})`);
                    const text = completion.choices?.[0]?.message?.content;
                    const parsed = parseForecastJson(text);
                    if (parsed) {
                        forecast = parsed;
                        aiProvider = 'ResQNet Intelligence Engine';
                        break;
                    }
                } catch (openrouterErr) {
                    console.warn(`OpenRouter model ${model} failed or timed out:`, openrouterErr.message);
                }
            }
        }

        // 3. Heuristic Fallback if both AI models fail
        if (!forecast) {
            console.warn('AI models unavailable, using heuristic fallback forecast');
            forecast = getHeuristicForecast(context);
            aiProvider = 'Manual Heuristic Analysis';
        }

        return res.status(200).json({ forecast, context, aiProvider });

    } catch (err) {
        console.error('Error in getForecast:', err);
        return res.status(500).json({ message: 'Server error generating forecast', error: err.message });
    }
};

module.exports = getForecast;