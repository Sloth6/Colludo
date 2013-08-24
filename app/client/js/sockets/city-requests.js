// The client tells the server what it wants to buy.
function serverBuy(tileType, tiles) {
	socket.emit('orderCityTiles', {'tileType' : tileType, 'tiles' : tiles, 'cityId' : player.cities[0]});
}


function serverOrderTroops(cityId, troopType, n) {
	socket.emit('orderTroops', {'cityId' : cityId, 'troopType' : troopType, 'n' : n});
}