function serverMapSet(tileId, cityId, armyId) {
    socket.emit('setTile', { 'tileId' : tileId, 'cityId' : cityId, 'armyId' : armyId});
}

function requestMapSeg(segId){
	socket.emit('getMapSeg', {'segId' : segId});
}

function requestCityData(cityId) {
	socket.emit('getCityData', {'cityId' : cityId} );
}