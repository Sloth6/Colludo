'use strict';
socket.on('userData', function (data) {
	player = new Player(data.name, data.cities, data.armies);
});

socket.on('messageData', function (data) {
	console.log('got messageData:', data);
	readMessages(data);
});

socket.on('cityData', function (data) {
	console.log('cityData', data)
	city = new City(data);
	drawMap();
	drawResources();
	updateCityInfoPane();


	for (var i = 0; i < NUM_TILES*NUM_TILES; i++) {
		if (city.tiles[i].type === 'river') {
			rivers.push(i);
		}
	}

	$("#cityName").html('<h1>'+city.name+'</h1>');
	$(".dropdown").text(player.name);
	setViewToTileId(data.tileId);
	setInterval(function() {
		city.updateResources();
	}, 1000);

});

socket.on('mapData', function(data) {
	console.log('MAPDATA', data);
	fillWorld(data.armies, data.cities, data.battles, function() {
		setWorldInfoPane(world.cities, world.armies);
	});
});

