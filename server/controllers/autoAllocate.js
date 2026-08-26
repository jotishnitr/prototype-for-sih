const Resource = require('../models/Resource');
const Incident = require('../models/Incident');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const AlertLog = require('../models/AlertLog');
const SmsLog = require('../models/SmsLog');
const { broadcastToJurisdiction } = require('../utils/wsEvents');
const sendSms = require('../utils/sendSms');
const resourcePrediction = require('../utils/resourcePrediction');
const autoAllocate = async (req, res) => {
    try {
        const io = req.app.get('io');
        const userId = req.user.id;
        const incidentId = req.params.id;
        const user = await User.findById(userId);
        const incident = await Incident.findById(incidentId);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        const jurisdiction_id = incident.jurisdiction_id;

        // Predict suitable resource type using AI based on incident details
        let predicted_resource = null;
        try {
            predicted_resource = await resourcePrediction({
                body: {
                    description: incident.description,
                    type: incident.type,
                    severity: incident.severity
                }
            });
        } catch (predErr) {
            console.error("Resource prediction error in autoAllocate:", predErr);
        }

        let resource = null;
        if (predicted_resource) {
            resource = await Resource.findOne({
                jurisdiction_id: jurisdiction_id,
                status: 'available',
                type: predicted_resource,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: incident.location.coordinates
                        }
                    }
                }
            });
        }

        // Fallback: If no unit of predicted type is available, allocate closest available unit of any type in jurisdiction
        if (!resource) {
            resource = await Resource.findOne({
                jurisdiction_id: jurisdiction_id,
                status: 'available',
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: incident.location.coordinates
                        }
                    }
                }
            });
        }

        if (!resource) {
            return res.status(404).json({ message: "No available resources found in this sector" });
        }

        const allocation = new Allocation({
            incident_id: incidentId,
            resource_id: resource._id,
            allocated_by: userId,
            jurisdiction_id: jurisdiction_id,
            status: 'active'
        });
        await allocation.save();

        resource.status = 'deployed';
        if (resource.type === 'rescue_team' && resource.rescue_team) {
            resource.rescue_team.available_members = 0;
            resource.rescue_team.available_boats = 0;
            resource.rescue_team.available_vehicles = 0;
        } else if (resource.type === 'medical_unit' && resource.medical_unit) {
            resource.medical_unit.available_staff = 0;
            resource.medical_unit.available_ambulances = 0;
            resource.medical_unit.available_beds = 0;
        } else if (resource.type === 'shelter' && resource.shelter) {
            resource.shelter.capacity_remaining = 0;
            resource.status = 'full';
        }
        await resource.save();

        incident.status = 'allocated';
        incident.allocated_resource_id = resource._id;
        await incident.save();

        const updatedAlert = await AlertLog.findOneAndUpdate(
            { incident_id: incident._id },
            { $set: { status: "allocated", resource_id: resource._id, title: `Unit deployed ${resource.name} - ${resource.type}` } },
            { new: true }
        );

        broadcastToJurisdiction(io, jurisdiction_id.toString(), 'allocation:created', {
            incident_id: incident._id,
            resource_id: resource._id,
            incident_location: incident.location,
            resource_location: resource.location
        })
        broadcastToJurisdiction(io, jurisdiction_id.toString(), 'alert:new', updatedAlert)

        const reporterSms = await sendSms(incident.reporter_phone, `ResQNet: Resource allocated. Name: ${resource.name} Contact: ${resource.contact_phone}.`);
        if (reporterSms && reporterSms.return) {
            console.log("SMS sent successfully to reporter");
        }
        else {
            console.error("Failed to send SMS to reporter");
        }
        const smsLog1 = new SmsLog({
            resource_id: resource._id,
            incident_id: incidentId,
            jurisdiction_id,
            to: incident.reporter_phone,
            message: `ResQNet: Resource allocated. Name: ${resource.name} Contact: ${resource.contact_phone}.`,
            status: reporterSms && reporterSms.return ? "sent" : "failed"
        });
        await smsLog1.save();

        const resourceSms = await sendSms(resource.contact_phone, `ResQNet: Attend the incident. Reporter Contactno:${incident.reporter_phone} Incident Description :${incident.description} , Incident Location :${incident.location}`)
        if (resourceSms && resourceSms.return) {
            console.log("SMS sent successfully to resource");
        }
        else {
            console.error("Failed to send SMS to resource");
        }
        const smsLog2 = new SmsLog({
            resource_id: resource._id,
            incident_id: incidentId,
            jurisdiction_id,
            to: resource.contact_phone,
            message: `ResQNet: Attend the incident. Reporter Contactno:${incident.reporter_phone} Incident Description :${incident.description} , Incident Location :${incident.location}`,
            status: resourceSms && resourceSms.return ? "sent" : "failed"
        });
        await smsLog2.save();

        return res.status(200).json({ message: "Resource allocated successfully" });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = autoAllocate;