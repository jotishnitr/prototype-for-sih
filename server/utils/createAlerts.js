const AlertLog = require('../models/AlertLog');
const { broadcastToJurisdiction } = require('./wsEvents');

const createAlert = async (io, { type, title, message, severity, jurisdiction_id, incident_id, resource_id }) => {
    const alert = new AlertLog({
        type,
        title,
        message,
        severity,
        jurisdiction_id: jurisdiction_id,
        incident_id: incident_id || null,
        resource_id: resource_id || null
    });
    await alert.save();
    broadcastToJurisdiction(io, jurisdiction_id.toString(), 'alert:new', alert);
    return alert;
}

module.exports = createAlert;