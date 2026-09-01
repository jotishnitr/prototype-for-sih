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
const withTimeout = (promise, ms = 10000, label = 'AI Model') => {
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
 * Computes exact explainable forecast metrics and rule-based fallback
 * derived 100% from backend database telemetry.
 */
const buildExplainableForecast = (context) => {
    const active = context.active_incidents || 0;
    const critical = context.critical_incidents || 0;
    const high = context.high_incidents || 0;
    const unassigned = context.unassigned_incidents || 0;
    const shelterOcc = context.resources?.shelter_occupancy_pct || 0;

    const breakdown = context.incident_breakdown || {};
    const resMetrics = context.resources_breakdown || {};

    const predictions = [];
    const whyList = [];

    if (critical > 0) whyList.push(`${critical} Critical severity incidents active`);
    if (high > 0) whyList.push(`${high} High severity incidents active`);
    if (unassigned > 0) whyList.push(`${unassigned} Incidents currently unassigned to response teams`);

    // Helper for resource prediction calculation
    const resourceTypes = ['rescue_team', 'medical_unit', 'shelter', 'supply_depot'];

    resourceTypes.forEach(type => {
        const data = resMetrics[type] || {
            total_units: 0,
            allocated_units: 0,
            available_units: 0,
            utilization_pct: 0,
            estimated_required: 0,
            resource_gap: 0
        };

        if (data.utilization_pct >= 50) {
            whyList.push(`${type.replace('_', ' ')} utilization at ${data.utilization_pct}%`);
        }
        if (data.resource_gap > 0) {
            whyList.push(`${type.replace('_', ' ')} resource gap of ${data.resource_gap} units`);
        }

        let recommendation = '';
        if (type === 'rescue_team') {
            if (breakdown.flood > 0) recommendation = 'Deploy rescue boats, increase shelter capacity, and mobilize NDRF teams.';
            else if (breakdown.landslide > 0) recommendation = 'Dispatch heavy excavation units, restrict road access, and prepare rescue squads.';
            else recommendation = 'Pre-position 3 reserve rescue teams from neighboring sector depots.';
        } else if (type === 'medical_unit') {
            recommendation = 'Dispatch mobile ambulances, alert district hospitals, and prepare emergency triage beds.';
        } else if (type === 'shelter') {
            recommendation = 'Activate secondary emergency relief shelters, schools, and community centers.';
        } else {
            recommendation = 'Replenish standard emergency ration kits, clean water containers, and medical packets.';
        }

        let riskStatus = 'Low Risk';
        if (data.resource_gap > 0 || data.utilization_pct >= 80) riskStatus = 'Critical Risk';
        else if (data.utilization_pct >= 50) riskStatus = 'High Risk';
        else if (data.utilization_pct > 0) riskStatus = 'Moderate Risk';

        predictions.push({
            resource_type: type,
            risk_status: riskStatus,
            total_units: data.total_units,
            allocated_units: data.allocated_units,
            available_units: data.available_units,
            estimated_required: data.estimated_required,
            resource_gap: data.resource_gap,
            utilization_pct: data.utilization_pct,
            recommendation
        });
    });

    if (shelterOcc >= 60) whyList.push(`Shelter occupancy at ${shelterOcc}%`);
    if (whyList.length === 0) whyList.push('All sector incident metrics and resource levels are operating within baseline capacity.');

    // Overall Risk Level
    let risk_level = 'low';
    const hasCriticalRisk = predictions.some(p => p.risk_status === 'Critical Risk');
    const hasHighRisk = predictions.some(p => p.risk_status === 'High Risk');

    if (critical >= 3 || hasCriticalRisk || shelterOcc >= 85) risk_level = 'critical';
    else if (critical >= 1 || hasHighRisk || unassigned >= 2 || shelterOcc >= 70) risk_level = 'high';
    else if (active >= 2) risk_level = 'medium';

    // Data-consistent AI Summary
    const topType = Object.keys(breakdown).reduce((a, b) => breakdown[a] > breakdown[b] ? a : b, 'emergency');
    const rescueUtil = resMetrics.rescue_team?.utilization_pct || 0;
    const overall_assessment = `There are currently ${active} active incidents (${critical} Critical, ${high} High). ${unassigned} remain unassigned. Rescue resources are operating at ${rescueUtil}% utilization. Current operational priority focuses on active ${topType} response.`;

    // Dynamic Immediate Actions Protocol based on incident breakdown
    const immediate_actions = [];
    if (breakdown.flood > 0) {
        immediate_actions.push('Deploy inflatable rescue boats and watercraft to flooded zones.');
        immediate_actions.push('Expand community shelter capacity and distribute drinking water.');
        immediate_actions.push('Mobilize mobile medical teams for waterborne illness triage.');
    } else if (breakdown.landslide > 0) {
        immediate_actions.push('Dispatch heavy earth-moving equipment and search rescue teams.');
        immediate_actions.push('Erect perimeter safety barricades and restrict debris flow corridors.');
        immediate_actions.push('Alert trauma centers and prepare emergency medical transport.');
    } else if (breakdown.fire > 0) {
        immediate_actions.push('Dispatch additional fire tenders and aerial suppression units.');
        immediate_actions.push('Evacuate civilians downwind of smoke plumes and secure power lines.');
        immediate_actions.push('Prepare burn care kits and oxygen support at local clinics.');
    } else {
        immediate_actions.push('Verify continuous radio and satellite telemetry with dispatched units.');
        immediate_actions.push('Pre-stage mutual aid resources with adjacent jurisdiction depots.');
        immediate_actions.push('Maintain public advisory updates across emergency broadcast channels.');
    }

    const confidence_pct = Math.min(96, Math.max(84, 82 + Math.min(12, active + (context.total_resources || 0))));

    return {
        risk_level,
        confidence_pct,
        shortage_predictions: predictions,
        why_this_forecast: whyList,
        overall_assessment,
        immediate_actions
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

        const activeIncidents = incidents.length;
        const criticalIncidents = incidents.filter(i => (i.severity || 0) >= 4).length;
        const highIncidents = incidents.filter(i => i.severity === 3).length;
        const mediumIncidents = incidents.filter(i => i.severity === 2).length;
        const lowIncidents = incidents.filter(i => (i.severity || 0) <= 1).length;

        const allocatedIncidentIds = new Set(allocations.map(a => String(a.incident_id)));
        const unassignedIncidents = incidents.filter(i => !allocatedIncidentIds.has(String(i._id))).length;

        // Incident breakdown by type
        const incidentBreakdown = {
            flood: incidents.filter(i => i.type?.toLowerCase() === 'flood').length,
            cyclone: incidents.filter(i => i.type?.toLowerCase() === 'cyclone').length,
            fire: incidents.filter(i => i.type?.toLowerCase() === 'fire').length,
            landslide: incidents.filter(i => i.type?.toLowerCase() === 'landslide').length,
            medical: incidents.filter(i => i.type?.toLowerCase() === 'medical').length,
        };

        // Resource type calculations
        const resourceTypes = ['rescue_team', 'medical_unit', 'shelter', 'supply_depot'];
        const resourcesBreakdown = {};

        resourceTypes.forEach(type => {
            const matching = resources.filter(r => r.type === type);
            const total = matching.length;
            const allocated = matching.filter(r => r.status === 'deployed').length;
            const available = matching.filter(r => r.status === 'available').length;
            const util = total > 0 ? Math.round((allocated / total) * 100) : 0;

            // Calculate estimated required using severity weights
            let severityWeightSum = 0;
            incidents.forEach(inc => {
                const incType = String(inc.type || '').toLowerCase();
                const sev = inc.severity || 2;
                const weight = sev >= 4 ? 3 : sev === 3 ? 2 : 1;

                if (type === 'rescue_team' && (incType.includes('flood') || incType.includes('landslide') || incType.includes('rescue') || incType.includes('cyclone'))) {
                    severityWeightSum += weight * 2;
                } else if (type === 'medical_unit' && (incType.includes('medical') || incType.includes('injury') || incType.includes('flood'))) {
                    severityWeightSum += weight * 2;
                } else if (type === 'shelter' && (incType.includes('flood') || incType.includes('cyclone') || incType.includes('displaced'))) {
                    severityWeightSum += weight * 3;
                } else if (type === 'supply_depot') {
                    severityWeightSum += weight;
                } else {
                    severityWeightSum += 1;
                }
            });

            const estimated_required = Math.max(total, Math.ceil(severityWeightSum / 2));
            const resource_gap = Math.max(0, estimated_required - available);

            resourcesBreakdown[type] = {
                total_units: total,
                allocated_units: allocated,
                available_units: available,
                utilization_pct: util,
                estimated_required,
                resource_gap
            };
        });

        // Shelter Occupancy %
        const shelters = resources.filter(r => r.type === 'shelter');
        const totalShelterCap = shelters.reduce((s, r) => s + (r.shelter?.capacity_total || 0), 0);
        const remainingShelterCap = shelters.reduce((s, r) => s + (r.shelter?.capacity_remaining || 0), 0);
        const shelterOccupancyPct = totalShelterCap > 0 ? Math.round(((totalShelterCap - remainingShelterCap) / totalShelterCap) * 100) : 0;

        // Context built 100% from DB telemetry
        const context = {
            active_incidents: activeIncidents,
            critical_incidents: criticalIncidents,
            high_incidents: highIncidents,
            medium_incidents: mediumIncidents,
            low_incidents: lowIncidents,
            unassigned_incidents: unassignedIncidents,
            total_resources: resources.length,
            incident_breakdown: incidentBreakdown,
            resources_breakdown: resourcesBreakdown,
            resources: {
                rescue_teams_available: resourcesBreakdown.rescue_team?.available_units || 0,
                rescue_teams_deployed: resourcesBreakdown.rescue_team?.allocated_units || 0,
                medical_staff_available: resourcesBreakdown.medical_unit?.available_units || 0,
                shelter_occupancy_pct: shelterOccupancyPct,
            },
            active_allocations: allocations.length,
        };

        const prompt = `You are a disaster management AI for Indian NDRF operations.

Current real-time DB telemetry:
${JSON.stringify(context, null, 2)}

Instructions:
Generate an AI decision support forecast based ONLY on these exact numbers. Do NOT invent arbitrary numbers.

Respond with ONLY valid JSON matching this schema:
{
  "risk_level": "low|medium|high|critical",
  "confidence_pct": 92,
  "shortage_predictions": [
    {
      "resource_type": "rescue_team|medical_unit|shelter|supply_depot",
      "risk_status": "Critical Risk|High Risk|Moderate Risk|Low Risk",
      "total_units": 8,
      "allocated_units": 6,
      "available_units": 2,
      "estimated_required": 9,
      "resource_gap": 7,
      "utilization_pct": 75,
      "recommendation": "Deploy 5 additional rescue boats and mobilize teams"
    }
  ],
  "why_this_forecast": [
    "5 Critical severity incidents active",
    "3 Incidents unassigned to response teams",
    "Rescue utilization at 75%"
  ],
  "overall_assessment": "There are currently 9 active incidents. 5 are Critical. 3 remain unassigned. Rescue resources are operating at 75% utilization.",
  "immediate_actions": [
    "Deploy rescue boats and watercraft",
    "Expand shelter capacity",
    "Mobilize medical triage"
  ]
}`;

        let forecast = null;
        let aiProvider = null;

        // 1. Primary: Google Gemini (15s timeout per model)
        if (gemini?.models?.generateContent) {
            const geminiModels = [
                'gemini-flash-lite-latest',
                'gemini-flash-latest',
                'gemini-2.5-flash-lite'
            ];
            for (const model of geminiModels) {
                try {
                    const geminiPromise = gemini.models.generateContent({
                        model,
                        contents: prompt
                    });
                    const geminiRes = await withTimeout(geminiPromise, 15000, `Gemini (${model})`);
                    const text = geminiRes.text;
                    const parsed = parseForecastJson(text);
                    if (parsed && Array.isArray(parsed.shortage_predictions)) {
                        forecast = parsed;
                        aiProvider = 'ResQNet Intelligence Engine';
                        break;
                    }
                } catch (geminiErr) {
                    console.warn(`Gemini model ${model} failed or timed out:`, geminiErr.message);
                }
            }
        }

        // 2. Secondary Fallback: OpenRouter (15s timeout per model)
        if (!forecast && openrouter) {
            try {
                const openrouterModels = [
                    'minimax/minimax-m3:free',
                    'google/gemma-4-31b-it:free',
                    'nvidia/nemotron-3.5-lightning:free',
                    'poolside/laguna-s-2.1:free'
                ];
                for (const model of openrouterModels) {
                    try {
                        const openrouterPromise = openrouter.chat.completions.create({
                            model,
                            messages: [{ role: 'user', content: prompt }]
                        });
                        const completion = await withTimeout(openrouterPromise, 15000, `OpenRouter (${model})`);
                        const text = completion.choices?.[0]?.message?.content;
                        const parsed = parseForecastJson(text);
                        if (parsed && Array.isArray(parsed.shortage_predictions)) {
                            forecast = parsed;
                            aiProvider = 'ResQNet Intelligence Engine';
                            break;
                        }
                    } catch (openrouterErr) {
                        console.warn(`OpenRouter model ${model} failed or timed out:`, openrouterErr.message);
                    }
                }
            } catch (openrouterBlockErr) {
                console.warn('OpenRouter client execution error:', openrouterBlockErr.message);
            }
        }

        // 3. Heuristic Fallback if both AI models fail
        if (!forecast) {
            console.warn('AI models unavailable, using explainable heuristic fallback forecast');
            forecast = buildExplainableForecast(context);
            aiProvider = 'Manual Heuristic Analysis';
        }

        return res.status(200).json({ forecast, context, aiProvider });

    } catch (err) {
        console.error('Error in getForecast:', err);
        return res.status(500).json({ message: 'Server error generating forecast', error: err.message });
    }
};

module.exports = getForecast;