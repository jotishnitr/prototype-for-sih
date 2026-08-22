const broadcastToJurisdiction = (io, jurisdiction_id, event, data) => {
    io.to(`jurisdiction:${jurisdiction_id}`).emit(event, data);
};

module.exports = { broadcastToJurisdiction };