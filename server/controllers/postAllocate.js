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
        const resource = await Resource.findById(resource_id);
        const incident = await Incident.findById(incident_id);
        const userId = req.user.id;
        const user = await User.findById(userId);
        const jurisdiction_id = user.jurisdiction_id;
        if (!resource || !incident) {
            return res.status(404).json({ message: "Resource or Incident not found" });
        }

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

        const reporterSms = await sendSms(incident.reporter_phone, `ResQNet: Resource allocated. Name: ${resource.name} Contact: ${resource.contact_phone}.`);
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
            resource_id,
            incident_id,
            jurisdiction_id,
            to: resource.contact_phone,
            message: `ResQNet: Attend the incident. Reporter Contactno:${incident.reporter_phone} Incident Description :${incident.description} , Incident Location :${incident.location}`,
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
