$(document).ready(function(){
	socket.on('newArmy', function(data){
		player.armies.push(data.armyId);
	});

	socket.on('armyData', function (data) {
		// console.log	world.armies, data.id);
		world.armies[data.id] = data;
		console.log('armyData', data);
		drawWorld();
	});

	socket.on('battle', function(data){
		world.battles[data.id] = data;
		console.log('gotBattle', data);
		drawWorld();
		console.log(data);
	});

	socket.on('endBattle', function(data){
		world.battles[data.id] = null;
		drawWorld();
		console.log('end battle', data);
	});

	socket.on('newArmy', function(data) {
		console.log('newArmy', data);
		world.addArmy(data);
		setWorldInfoPane(world.cities, world.armies);
	});
	socket.on('newCity', function(data) {
		console.log('newCity', data);
		world.addCity(data);
		setWorldInfoPane(world.cities, world.armies);

	});

	socket.on('tileChanges', function(data) {
		console.log('got tile changes', data);
		for (var i = 0; i < data.length; i++) {
			localMapSet(data[i]['tile_id'], data[i]['city_id'], data[i]['army_id']);
		};
		arrows[data[i]['army_id']] = undefined;
		drawArrows();
	});

	socket.on('moveArmy', function (data) {
		var army = world.armies[data.armyId];

	  army.mesh.position.copy( positionOfTile(data.newTile));

	  if (world.content[data.newTile]) {
	    world.content[data.newTile].army = data.armyId;
	  } else {
	     world.content[data.newTile] = {'army': data.armyId};
	  }
	  world.content[data.oldTile].army = null;

	  army.tileId = data.newTile;

	});


	socket.on('armyMovementFinished', function(data){
		alert('Army has finished moving!', data);
		scene.remove(world.armies[data.armyId].pathLine);
	});
	socket.on('armyBlocked', function(data){
		alert('Army path blocked!', data);
		scene.remove(world.armies[data.armyId].pathLine);
	});


	// data{segId, mapSeg}
	// socket.on('mapSeg', function (data) {
	// 	// console.log("recieved segment ",data.segId, data.mapSeg)
	// 	//console.log("data", data);
	// 	mapSegments[data.segId] = data.mapSeg;
	// 	// localStorage[data.segId.toString()] = JSON.stringify(data.mapSeg);
	// 	// drawWorld();
	// 	drawMapSegment(data.segId);
	// 	for (var i = 0; i < data.mapSeg.length; i++) {
	// 		if (data.mapSeg[i][2] >0) requestCityData(data.mapSeg[i][2]);
	// 		if (data.mapSeg[i][3] >0) socket.emit('getArmyData', {'armyId' : data.mapSeg[i][3]});
	// 	};
	// });
	
});