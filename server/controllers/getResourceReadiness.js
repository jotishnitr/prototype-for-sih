const Resource = require('../models/Resource');
const User = require('../models/User');

const getResourceReadiness = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(401).json({ message: 'User does not exist' });
        const jurisdictionId = user.jurisdiction_id;

        // Calculating shelter readiness
        const shelters = await Resource.find({ jurisdiction_id: jurisdictionId, type: 'shelter' });
        const totalCapacity = shelters.reduce((total, shelter) => total + shelter.shelter.capacity_total, 0);
        const remainingCapacity = shelters.reduce((total, shelter) => total + shelter.shelter.capacity_remaining, 0);
        const shelterReadiness = totalCapacity === 0 ? 0 : (remainingCapacity / totalCapacity) * 100;

        // Calculating Rescue Team members deployed vs total
        const rescueTeams = await Resource.find({ jurisdiction_id: jurisdictionId, type: 'rescue_team' });
        const totalMembers = rescueTeams.reduce((total, team) => total + team.rescue_team.total_members, 0);
        const availableMembers = rescueTeams.reduce((total, team) => total + team.rescue_team.available_members, 0);
        const rescueTeamReadiness = totalMembers === 0 ? 0 : (availableMembers / totalMembers) * 100;

        // calculating Boats and vehicles readiness
        const totalBoats = rescueTeams.reduce((total, team) => total + team.rescue_team.total_boats, 0);
        const availableBoats = rescueTeams.reduce((total, team) => total + team.rescue_team.available_boats, 0);

        const totalVehicles = rescueTeams.reduce((total, team) => total + team.rescue_team.total_vehicles, 0);
        const availableVehicles = rescueTeams.reduce((total, team) => total + team.rescue_team.available_vehicles, 0);
        const boatsVehiclesReadiness = (totalBoats + totalVehicles) === 0 ? 0 : ((availableBoats + availableVehicles) / (totalBoats + totalVehicles)) * 100;

        // calculating medical units readiness
        const medicalUnits = await Resource.find({ jurisdiction_id: jurisdictionId, type: 'medical_unit' });
        const totalMedicalUnits = medicalUnits.length;
        const availableMedicalUnits = medicalUnits.filter((medicalUnit) => medicalUnit.status === 'available').length;
        const medicalUnitsReadiness = totalMedicalUnits === 0 ? 0 : (availableMedicalUnits / totalMedicalUnits) * 100;

        // calculating ambulances readiness
        const totalAmbulances = medicalUnits.reduce((total, medicalUnit) => total + medicalUnit.medical_unit.total_ambulances, 0);
        const availableAmbulances = medicalUnits.reduce((total, medicalUnit) => total + medicalUnit.medical_unit.available_ambulances, 0);
        const ambulancesReadiness = totalAmbulances === 0 ? 0 : (availableAmbulances / totalAmbulances) * 100;

        // calculating beds readiness
        const totalBeds = medicalUnits.reduce((total, medicalUnit) => total + medicalUnit.medical_unit.total_beds, 0);
        const availableBeds = medicalUnits.reduce((total, medicalUnit) => total + medicalUnit.medical_unit.available_beds, 0);
        const bedsReadiness = totalBeds === 0 ? 0 : (availableBeds / totalBeds) * 100;

        // calculating total medical staff readiness
        const totalStaff = medicalUnits.reduce((total, medicalUnit) => total + medicalUnit.medical_unit.total_staff, 0);
        const availableStaff = medicalUnits.reduce((total, medicalUnit) => total + medicalUnit.medical_unit.available_staff, 0);
        const staffReadiness = totalStaff === 0 ? 0 : (availableStaff / totalStaff) * 100;

        //calculating supply depot
        const supplyDepots = await Resource.find({ jurisdiction_id: jurisdictionId, type: 'supply_depot' });
        const totalFoodPackets = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.total_food_packets, 0);
        const availableFoodPackets = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.available_food_packets, 0);
        const foodPacketsReadiness = totalFoodPackets === 0 ? 0 : (availableFoodPackets / totalFoodPackets) * 100;

        const totalWaterLitres = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.total_water_litres, 0);
        const availableWaterLitres = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.available_water_litres, 0);
        const waterLitresReadiness = totalWaterLitres === 0 ? 0 : (availableWaterLitres / totalWaterLitres) * 100;

        const totalMedicineKits = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.total_medicine_kits, 0);
        const availableMedicineKits = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.available_medicine_kits, 0);
        const medicineKitsReadiness = totalMedicineKits === 0 ? 0 : (availableMedicineKits / totalMedicineKits) * 100;

        const totalBlankets = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.total_blankets, 0);
        const availableBlankets = supplyDepots.reduce((total, supplyDepot) => total + supplyDepot.supply_depot.available_blankets, 0);
        const blanketsReadiness = totalBlankets === 0 ? 0 : (availableBlankets / totalBlankets) * 100;

        return res.status(200).json({
            shelterReadiness,
            rescueTeamReadiness,
            boatsVehiclesReadiness,
            medicalUnitsReadiness,
            ambulancesReadiness,
            bedsReadiness,
            staffReadiness,
            foodPacketsReadiness,
            waterLitresReadiness,
            medicineKitsReadiness,
            blanketsReadiness
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = getResourceReadiness;