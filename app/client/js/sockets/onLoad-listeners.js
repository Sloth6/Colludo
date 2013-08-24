
socket.on('userData', function (data) {
	player = data;
});

socket.on('messageData', function (data) {
	readMessages(data.messageData);
});

socket.on('cityData', function (data) {
	console.log('cityData', data)
	city = data;
	drawMap();
	drawResources();
	updateCityInfoPane();


	for (var i = 0; i < NUM_TILES*NUM_TILES; i++) {
		tileType = decode[city.tiles[i]];
		if (tileType === 'river') {
			rivers.push(i);
		}
	}

	$("#cityName").html('<h1>'+city.name+'</h1>');
	$(".dropdown").text(player.name);
	setViewToTileId(data.tileId);
	setInterval(function() {
		updateResources();
	}, 1000);

});

socket.on('mapData', function(data) {
	console.log('MAPDATA', data);
	fillWorld(data.armies, data.cities, data.battles, function() {
		setWorldInfoPane(world.cities, world.armies);
		// for (var city in world.cities) {
		// 	(function(val){
		// 		addCityInfo(val, 'Blarg');
		// 		addCityInfo(val, world.cities[val].name);
		// 	})(city);
		// }
		// for (var army in world.armies) {
		// 	(function(val){
		// 		addArmyInfo(world.armies, val, 'Hai!');
		// 		addArmyInfo(world.armies, val, world.armies[val].name);
		// 	})(army);
		// }
	});
});