const AlertLog = require('../models/AlertLog');
const { broadcastToJurisdiction } = require('./wsEvents');

const createAlert = async (io, { type, title, message, severity, jurisdiction_id, incident_id, resource_id }) => {
    let normalizedSeverity = severity;
    if (typeof severity === 'number') {
        normalizedSeverity = severity >= 4 ? 'critical' : severity >= 3 ? 'warning' : 'info';
    }

    const alert = new AlertLog({
        type,
        title,
        message,
        severity: normalizedSeverity,
        jurisdiction_id: jurisdiction_id || null,
        incident_id: incident_id || null,
        resource_id: resource_id || null
    });
    await alert.save();
    if (jurisdiction_id) {
        broadcastToJurisdiction(io, jurisdiction_id.toString(), 'alert:new', alert);
    }
    return alert;
}

module.exports = createAlert;