const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');
const Incident = require('../models/Incident');
const User = require('../models/User')
const AlertLog = require('../models/AlertLog')
const SmsLog = require('../models/SmsLog')
const sendSms = require('../utils/sendSms');
const { broadcastToJurisdiction } = require('../utils/wsEvents');


const postAllocate = async (req, res) => {
    try {
        const io = req.app.get('io');
        const { resource_id, incident_id } = req.body;
        const incident = await Incident.findById(incident_id);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        const resource = await Resource.findOneAndUpdate(
            { _id: resource_id, status: 'available' },
            { $set: { status: 'deployed' } },
            { new: true }
        );

        if (!resource) {
            return res.status(409).json({ message: 'Resource already allocated or unavailable' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        const jurisdiction_id = user.jurisdiction_id;

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


        const allocation = new Allocation({
            resource_id,
            incident_id,
            jurisdiction_id,
            allocated_by: userId,
        });


        await allocation.save();

        incident.status = 'allocated';
        incident.allocated_resource_id = resource._id;
        await incident.save();

        const updatedAlert = await AlertLog.findOneAndUpdate(
            { incident_id: incident._id },
            { $set: { status: "allocated", resource_id: resource._id, title: `Unit deployed ${resource.name} - ${resource.type}` } },
            { new: true }
        );

        broadcastToJurisdiction(io, incident.jurisdiction_id.toString(), 'allocation:created', {
            incident_id: incident._id,
            resource_id: resource._id,
            incident_location: incident.location,
            resource_location: resource.location
        })

        const reporterMsg = `[ResQNet Alert] Emergency unit allocated for your report. Unit: ${resource.name} | Contact: ${resource.contact_phone}. Help is on the way!`;
        const reporterSms = await sendSms(incident.reporter_phone, reporterMsg);
        if (reporterSms && reporterSms.return) { // Fast2Sms returns 'return': true/false in response
            console.log("SMS sent successfully to reporter");
        }
        else {
            console.error("Failed to send SMS to reporter");
        }
        const smsLog1 = new SmsLog({
            resource_id,
            incident_id,
            jurisdiction_id,
            to: incident.reporter_phone,
            message: reporterMsg,
            status: reporterSms && reporterSms.return ? "sent" : "failed"
        });
        await smsLog1.save();

        const locText = incident.location?.address || (typeof incident.location === 'string' ? incident.location : 'See ResQNet Portal');
        const resourceMsg = `[ResQNet Dispatch] URGENT: Attend emergency incident (${incident.type}). Description: ${incident.description}. Location: ${locText}. Reporter Contact: ${incident.reporter_phone}.`;
        const resourceSms = await sendSms(resource.contact_phone, resourceMsg);
        if (resourceSms && resourceSms.return) {
            console.log("SMS sent successfully to resource");
        }
        else {
            console.error("Failed to send SMS to resource");
        }
        const smsLog2 = new SmsLog({
            resource_id,
            incident_id,
            jurisdiction_id,
            to: resource.contact_phone,
            message: resourceMsg,
            status: resourceSms && resourceSms.return ? "sent" : "failed"
        });
        await smsLog2.save();

        return res.status(200).json({ message: "Resource allocated successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = postAllocate;
