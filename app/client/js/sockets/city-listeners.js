socket.on('resourcePush', function(data) {
	console.log('resource push', data);
	if(data.resources)city.resources = data.resources;
	if(data.population)city.population = data.population;
	drawResources();
});

// data :  {'tileType' : tileType, 'tiles' : tiles}
socket.on('builtTiles', function(data){
	// console.log('got build alert',data);
	city.build(data.tileType, data.tiles);
});

socket.on('contractEvent', function(data){
	var s = 'A contract has been executed! You lost: ' + JSON.stringify(data.lost) + ' and you got' + JSON.stringify(data.gained); 
	alert(s);
});