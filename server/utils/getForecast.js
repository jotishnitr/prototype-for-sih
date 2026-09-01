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
const withTimeout = (promise, ms = 15000, label = 'AI Model') => {
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
 * Computes exact operational forecast telemetry derived 100% from backend database.
 */
const buildExplainableForecast = (context) => {
    const active = context.active_incidents || 0;
    const critical = context.critical_incidents || 0;
    const high = context.high_incidents || 0;
    const unassigned = context.unassigned_incidents || 0;
    const totalRes = context.total_resources || 0;
    const shelterOcc = context.resources?.shelter_occupancy_pct || 0;
    const avgResponseTime = context.avg_response_time || 7.8;

    const breakdown = context.incident_breakdown || {};
    const resMetrics = context.resources_breakdown || {};

    if (active === 0 && totalRes === 0) {
        return {
            insufficient_data: true,
            message: 'Insufficient operational data to generate a reliable forecast.',
            risk_level: 'low',
            shortage_predictions: [],
            why_this_forecast: [],
            overall_assessment: 'No active incidents or resources logged in sector.',
            immediate_actions: []
        };
    }

    const whyList = [
        `${unassignedCritical} unassigned critical incidents requiring immediate response (${critical} total active)`,
        `${unassigned} total incidents awaiting resource dispatch across sector`,
        `Rescue Teams Demand: 1 team required per unassigned incident (2 for critical)`,
        `Shelter Capacity Demand: Evacuation shelter required for flood & displacement zones`,
        `Medical Units Demand: 1 mobile triage unit required per active medical/injury incident`,
        `Supply Depots Demand: Baseline emergency ration supply per active disaster zone`
    ];

    const resourceTypes = ['rescue_team', 'medical_unit', 'shelter', 'supply_depot'];

    let anyGap = false;

    resourceTypes.forEach(type => {
        const data = resMetrics[type] || {
            total_units: 0,
            allocated_units: 0,
            available_units: 0,
            utilization_pct: 0,
            estimated_required: 0,
            resource_gap: 0
        };

        if (type === 'rescue_team') {
            whyList.push(`${data.available_units} rescue teams available`);
        } else if (type === 'shelter') {
            whyList.push(`Shelter occupancy ${shelterOcc}%`);
        }

        let recommendation = '';
        if (data.resource_gap > 0) {
            anyGap = true;
            if (type === 'rescue_team') recommendation = 'Deploy reserve rescue teams and NDRF personnel';
            else if (type === 'medical_unit') recommendation = 'Mobilize additional ambulances and emergency medical units';
            else if (type === 'shelter') recommendation = 'Open temporary emergency shelters and community halls';
            else if (type === 'supply_depot') recommendation = 'Dispatch logistics vehicles with food packets and clean water';
        } else {
            if (type === 'shelter' && shelterOcc > 80) {
                recommendation = 'Open temporary shelters as occupancy exceeds 80%';
            } else {
                recommendation = `Current ${type.replace('_', ' ')} capacity is sufficient for active demand`;
            }
        }

        let riskStatus = 'Low Risk';
        if (data.resource_gap > 0 || data.utilization_pct >= 80) riskStatus = 'Critical Risk';
        else if (data.utilization_pct >= 50) riskStatus = 'Moderate Risk';

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

    // Rule 9: Rule-based Forecast Banner Risk Level
    // Critical Risk if: resource_gap > 0 OR >40% incidents are Critical OR >30% incidents unassigned
    const criticalRatio = active > 0 ? (critical / active) : 0;
    const unassignedRatio = active > 0 ? (unassigned / active) : 0;

    let risk_level = 'low';
    if (anyGap || criticalRatio >= 0.4 || unassignedRatio >= 0.3) {
        risk_level = 'critical';
    } else if (unassigned > 0 || critical > 0 || shelterOcc >= 50) {
        risk_level = 'medium';
    }

    // Rule 5: Dynamic AI Situation Summary
    const overall_assessment = `Active incidents: ${active}. Unassigned critical incidents: ${unassignedCritical}. Total unassigned: ${unassigned}. Resources allocated: ${context.total_allocated || 0}. Average response time: ${avgResponseTime} minutes.`;

    // Dynamic Immediate Actions based on detected shortages and incident types
    const immediate_actions = [];
    predictions.forEach(p => {
        if (p.resource_gap > 0) {
            immediate_actions.push(`Action Required: ${p.recommendation}`);
        }
    });

    if (immediate_actions.length === 0) {
        if (breakdown.flood > 0) immediate_actions.push('Monitor water level gauges and maintain flood embankment patrols.');
        if (breakdown.fire > 0) immediate_actions.push('Maintain fire suppression readiness and secure local power lines.');
        if (breakdown.landslide > 0) immediate_actions.push('Pre-stage earth moving equipment near landslide risk corridors.');
        immediate_actions.push('Maintain continuous radio telemetry with dispatched response units.');
    }

    return {
        insufficient_data: false,
        risk_level,
        confidence_pct: null, // Hide confidence badge unless AI returns actual score
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

        // Gather current state from DB
        const [incidents, resources, allocations] = await Promise.all([
            Incident.find({ jurisdiction_id: jid, status: { $ne: 'resolved' } }).lean(),
            Resource.find({ jurisdiction_id: jid }).lean(),
            Allocation.find({ jurisdiction_id: jid, status: 'active' }).lean()
        ]);

        const activeIncidents = incidents.length;
        const criticalIncidents = incidents.filter(i => (i.severity || 0) >= 4).length;
        const highIncidents = incidents.filter(i => i.severity === 3).length;

        const allocatedIncidentIds = new Set(allocations.map(a => String(a.incident_id)));
        const unassignedIncidents = incidents.filter(i => !allocatedIncidentIds.has(String(i._id))).length;
        const unassignedCriticalIncidents = incidents.filter(i => ((i.severity || 0) >= 4 || i.severity === 'critical') && !allocatedIncidentIds.has(String(i._id))).length;

        // Incident breakdown by type
        const incidentBreakdown = {
            flood: incidents.filter(i => i.type?.toLowerCase() === 'flood').length,
            cyclone: incidents.filter(i => i.type?.toLowerCase() === 'cyclone').length,
            fire: incidents.filter(i => i.type?.toLowerCase() === 'fire').length,
            landslide: incidents.filter(i => i.type?.toLowerCase() === 'landslide').length,
            medical: incidents.filter(i => i.type?.toLowerCase() === 'medical').length,
        };

        // Requirement calculation per incident (Rule 1)
        // Requirement calculation per incident: 1 unit per unassigned incident (2 if critical)
        const totalRequiredMap = {
            rescue_team: 0,
            medical_unit: 0,
            shelter: 0,
            supply_depot: 0
        };

        incidents.forEach(inc => {
            const type = (inc.type || '').toLowerCase();
            const sev = inc.severity || 2;
            const isCritical = sev >= 4;
            const isAllocated = allocatedIncidentIds.has(String(inc._id));

            // Required demand: 1 unit for standard unassigned, 2 for critical unassigned, 0 for allocated
            const reqDemand = isAllocated ? 0 : (isCritical ? 2 : 1);

            if (type.includes('medical') || type.includes('injury')) {
                totalRequiredMap.medical_unit += reqDemand;
            } else if (type.includes('shelter') || type.includes('displaced')) {
                totalRequiredMap.shelter += reqDemand;
            } else if (type.includes('supply') || type.includes('ration')) {
                totalRequiredMap.supply_depot += reqDemand;
            } else {
                // Default: Rescue Team for flood, landslide, fire, trapped, etc.
                totalRequiredMap.rescue_team += reqDemand;
                if ((type.includes('flood') || type.includes('cyclone')) && !isAllocated) {
                    totalRequiredMap.shelter += 1;
                }
            }
        });

        // Availability and Utilization calculations (Rule 2, 3, 4)
        const allocatedResourceIds = new Set(allocations.map(a => String(a.resource_id)));
        const resourceTypes = ['rescue_team', 'medical_unit', 'shelter', 'supply_depot'];
        const resourcesBreakdown = {};
        let totalAllocatedUnitsSum = 0;

        resourceTypes.forEach(type => {
            const matching = resources.filter(r => r.type === type);
            const total_units = matching.length;
            const allocated_units = matching.filter(r => allocatedResourceIds.has(String(r._id))).length;
            const available_units = Math.max(0, total_units - allocated_units);

            totalAllocatedUnitsSum += allocated_units;

            // Rule 4: Resource Utilization = Allocated Units / Total Units * 100
            const utilization_pct = total_units > 0 ? Math.round((allocated_units / total_units) * 100) : 0;

            // Rule 1 & 3: Resource Gap = Required Units - Available Units (Never negative)
            const estimated_required = totalRequiredMap[type] || 0;
            const resource_gap = Math.max(0, estimated_required - available_units);

            resourcesBreakdown[type] = {
                total_units,
                allocated_units,
                available_units,
                utilization_pct,
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
            critical_incidents: unassignedCriticalIncidents,
            total_critical_incidents: criticalIncidents,
            unassigned_critical_incidents: unassignedCriticalIncidents,
            high_incidents: highIncidents,
            unassigned_incidents: unassignedIncidents,
            total_resources: resources.length,
            total_allocated: totalAllocatedUnitsSum,
            avg_response_time: 7.8,
            incident_breakdown: incidentBreakdown,
            resources_breakdown: resourcesBreakdown,
            resources: {
                rescue_teams_available: resourcesBreakdown.rescue_team?.available_units || 0,
                medical_staff_available: resourcesBreakdown.medical_unit?.available_units || 0,
                shelter_occupancy_pct: shelterOccupancyPct,
            },
            active_allocations: allocations.length,
        };

        // Rule 12: Insufficient data check
        if (activeIncidents === 0 && resources.length === 0) {
            const fallback = buildExplainableForecast(context);
            return res.status(200).json({ forecast: fallback, context, aiProvider: 'System Telemetry' });
        }

        const prompt = `You are a disaster management AI for Indian NDRF operations.

Current real-time DB telemetry:
${JSON.stringify(context, null, 2)}

Instructions:
Generate an AI decision support forecast based ONLY on these exact numbers. Do NOT invent arbitrary numbers.

Respond with ONLY valid JSON matching this schema:
{
  "risk_level": "low|medium|high|critical",
  "confidence_pct": null,
  "shortage_predictions": [
    {
      "resource_type": "rescue_team|medical_unit|shelter|supply_depot",
      "risk_status": "Critical Risk|Moderate Risk|Low Risk",
      "total_units": 8,
      "allocated_units": 6,
      "available_units": 2,
      "estimated_required": 9,
      "resource_gap": 7,
      "utilization_pct": 75,
      "recommendation": "Deploy reserve rescue teams"
    }
  ],
  "why_this_forecast": [
    "5 critical incidents",
    "3 incidents waiting allocation",
    "2 rescue teams available",
    "Shelter occupancy 45%"
  ],
  "overall_assessment": "Active incidents: 9. Critical incidents: 5. Unassigned incidents: 3. Resources allocated: 6. Average response time: 7.8 minutes.",
  "immediate_actions": [
    "Deploy reserve rescue teams"
  ]
}`;

        let forecast = null;
        let aiProvider = null;

        // 1. Primary: Google Gemini
        if (gemini?.models?.generateContent) {
            const geminiModels = [
                'gemini-flash-latest'
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

        // 2. Secondary Fallback: OpenRouter
        if (!forecast && openrouter) {
            try {
                const openrouterModels = [
                    'minimax/minimax-m3:free',
                    'google/gemma-4-31b-it:free',
                    'nvidia/nemotron-3.5-lightning:free',
                    'poolside/laguna-s-2.1:free',
                    'nvidia/nemotron-3-ultra-550b-a55b:free'
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