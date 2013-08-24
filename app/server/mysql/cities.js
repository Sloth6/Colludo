exports.selectCity = selectCity;
exports.updateCity = updateCity;

// function selectCity (cityId, callback) {
// 	var query = 'SELECT * FROM cities WHERE id = ?'
// 	  , values = [cityId];
// 	db.query(query, values, function(err, rows, cols) {
// 		 if (err) {
// 		 	callback(err);
// 		 } else if (!rows.length){
// 		 	callback('not-found');
// 		 } else {
// 		 	callback(null, formatCity(rows[0]));
// 		 }
// 	});


	// /ligyliuglkjh
	// var formatCity = function(data) {
	// 	return {
	// 		'userId' : data.player_id,
	// 		'user'   : data.username,
	// 		'name'   : data.name,
	// 		'tileId' : data.tileId,
	// 		'tiles'  : JSON.parse(data.city_data),
	// 		'buildingQueues' : JSON.parse(data.building_queues),
	// 		'trainingQueues' : JSON.parse(data.training_queues),
	// 		'lastUpdate'     : data.last_update,
	// 		'capacity' : {
	// 			'storage' : data.storage_capacity,
	// 			'hiding'  : data.hiding_capacity},
	// 		'resources' : {
	// 			'crop' : data.crop,
	// 			'wood' : data.wood,
	// 			'ore'  : data.ore,
	// 			'workers' : data.workers},
	// 		'income' = {
	// 			'crop' : data.crop_income,
	// 			'wood' : data.wood_income,
	// 			'ore' : data.ore_income},
	// 		'population' : data.population,
	// 		'armyId' : data.army_id,
	// 	};
	// }
}

function updateCity(cityData, callback) {
	var query = 'UPDATE cities SET '+
		'city_data = ?, '+
		'building_queues = ?, '+
		'last_update = ?, '+
		'storage_capacity = ?, '+
		'hiding_capacity = ?, '+
		'crop = ?, '+
		'wood = ?, '+
		'ore = ?, '+
		'workers = ?, '+
		'population = ?, '+
		'crop_income = ?, '+
		'wood_income = ?, '+
		'ore_income = ? '+
		'WHERE id = ?',
	  	values = [
			JSON.stringify(cityData.tiles),
			JSON.stringify(cityData.buildingQueues),
			cityData.lastUpdate,
			cityData.capacity.storage,
			cityData.capacity.hiding,
			cityData.resources.crop,
			cityData.resources.wood,
			cityData.resources.ore,
			cityData.resources.workers,
			cityData.population,
			cityData.income.crop,
			cityData.income.wood,
			cityData.income.ore,
			cityData.cityId
		];
	db.query(query, values, function(err, rows){
		if(err){
			console.log('updateCity error!', err);
			callback(err);
		} else {
			callback(null);
		}
	});
}

// // updates the resources and manages building queues
// function updateCity(data, callback) {
// 	// declare the data variables
// 	var resources = {
// 		'crop' : data.crop,
// 		'wood' : data.wood,
// 		'ore'  : data.ore,
// 		'workers' : data.workers
// 	};
// 	var income = {
// 		'crop' : data.crop_income,
// 		'wood' : data.wood_income,
// 		'ore'  : data.ore_income
// 	};
// 	var population = data.population;
// 	var lastUpdate = data.last_update;
// 	var buildingQueues = JSON.parse(data.building_queues);
// 	var cityTiles = JSON.parse(data.city_data);

// 	// declare loopvariables
// 	var now = Math.floor(Date.now()/1000);
// 	var buildingOrder, finishTime, tileType, tileIds, timeSpan;
// 	var i;
// 	for (i = 0; i < buildingQueues.length; i++) {
// 		buildingOrder = buildingQueues[i];
// 		// building order has not been completed, so break
// 		if (buildingOrder.finishTime > now) {
// 			break;
// 		// building order completed, so build it and update resources
// 		// and incomes up to the finishTime
// 		} else {
// 			finishTime = buildingOrder.finishTime;
// 			tileType   = buildingOrder.tileType;
// 			tileIds    = buildingOrder.tileIds;
// 			timeSpan   = (finishTime - lastUpdate)/3600;

// 			// update resources
// 			resources.crop += timeSpan*income.crop;
// 			resources.wood += timeSpan*income.wood;
// 			resources.ore  += timeSpan*income.ore;

// 			resources.crop = Math.min(resources.crop, data.storage_capacity);
// 			resources.wood = Math.min(resources.wood, data.storage_capacity);
// 			resources.ore = Math.min(resources.ore, data.storage_capacity);


// 			if (tileType == 'house') {
// 				population += tileIds.length*5;
// 				resources.workers += tileIds.length*5;
// 			}

// 			if (tileType == 'warehouse') {
// 				data.storage_capacity += tileIds.length*500;
// 			}

// 			// console.log(income, tileIncomes, tileType, tileIncomes[tileType]);

// 			// update incomes
// 			income.crop += tileIds.length*tileIncomes[tileType].crop;
// 			income.wood += tileIds.length*tileIncomes[tileType].wood;
// 			income.ore  += tileIds.length*tileIncomes[tileType].ore;

// 			// update the city tiles
// 			var j;
// 			for (j = 0; j < tileIds.length; j++) {
// 				cityTiles[tileIds[j]] = encode[tileType];

// 			}

// 			// the finishTime of this order is now the time of the lastUpdate
// 			lastUpdate = finishTime;
// 		}

// 	// if the loop builds everything in the queue, clear the queue
// 	} if (i == buildingQueues.length) {
// 		buildingQueues = [];
// 	// otherwise, only leave the unfinished orders
// 	} else {
// 		buildingQueues = buildingQueues.slice(i, buildingQueues.length);
// 	}

// 	// update the resources to the current values
// 	timeSpan = (now - lastUpdate)/3600;
// 	resources.crop += timeSpan*income.crop;
// 	resources.wood += timeSpan*income.wood;
// 	resources.ore  += timeSpan*income.ore;

// 	resources.crop = Math.min(resources.crop, data.storage_capacity);
// 	resources.wood = Math.min(resources.wood, data.storage_capacity);
// 	resources.ore = Math.min(resources.ore, data.storage_capacity);
			
// 	lastUpdate = now;

// 	cityData = {
// 		'userId' : data.player_id,
// 		'user'   : data.username,
// 		'name'   : data.name,
// 		'tileId' : data.tileId,
// 		'tiles'  : cityTiles,
// 		'buildingQueues' : buildingQueues,
// 		'trainingQueues' : data.training_queues,
// 		'lastUpdate'     : lastUpdate,
// 		'capacity' : {'storage' : data.storage_capacity,
// 					  'hiding'  : data.hiding_capacity},
// 		'resources' : {'crop' : resources.crop,
// 					   'wood' : resources.wood,
// 					   'ore'  : resources.ore,
// 					   'workers' : resources.workers},
// 		'income' : {'crop' : income.crop,
// 					'wood' : income.wood,
// 					'ore'  : income.ore},
// 		'population' : population,
// 		'armyId' : data.army_id,
// 	}
	
// 	callback(null, cityData);
// 	updateCityDatabase(cityData, function(err) {
// 		if (err) console.log(err);
// 	});
// }