
var RM 		= require('./army-manager.js')
  , fs 		= require('fs')
  , citiesTable = require('./mysql/cities.js')
  , assert 	= require('assert');

var db = require('./db.js');

var troopPrices = {
	'soldiers'	: 	{'crop': 75, 'wood': 90, 'ore': 75, 'workers' : 0},
	'calvary'	: 	{'crop': 75, 'wood': 90, 'ore': 75, 'workers' : 0},
}

var trainingTimes = {
	'soldiers'	: 	1,
	'calvary'	: 	6,
}

var tilePrices = {
	// resource producers 
	'farm'      :	{'crop': 75, 'wood': 90, 'ore': 75, 'workers' : 1},
	'mine' 		: 	{'crop': 50, 'wood': 80, 'ore': 40, 'workers' : 1},
	'sawmill'	:	{'crop': 60, 'wood': 40, 'ore': 75, 'workers' : 1},
	
	// city buildings
	'house' 	:	{'crop': 30, 'wood': 90, 'ore': 40, 'workers' : 0},
	'barracks'	:	{'crop': 30, 'wood': 90, 'ore': 40, 'workers' : 1},
	'stable'	:	{'crop': 30, 'wood': 90, 'ore': 40, 'workers' : 1},
	'capital'	:	{'crop': 30, 'wood': 90, 'ore': 40, 'workers' : 1},
	'warehouse'	:	{'crop': 50, 'wood': 0, 'ore': 0, 'workers' : 0},
	'cranny'	:	{'crop': 50, 'wood': 0, 'ore': 0, 'workers' : 0},
	'tavern'	:	{'crop': 50, 'wood': 0, 'ore': 0, 'workers' : 1},

	// city editing.
	'field'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'rocks'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'trees0'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'trees1'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'trees2'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'river'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
};

var tileIncomes = {
	'farm'      :	{'crop': 10, 'wood': 0,  'ore': 0,  'workers' : 0},
	'mine' 		: 	{'crop': 0,  'wood': 0,  'ore': 10, 'workers' : 0},
	'sawmill'   :	{'crop': 0,  'wood': 10, 'ore': 0,  'workers' : 0},
	
	'house' 	:	{'crop': -5, 'wood': 0, 'ore': 0, 'workers' : 0},
	'barracks'	:	{'crop': 0,  'wood': 0, 'ore': 0, 'workers' : 0},
	'stable'	:	{'crop': 0,  'wood': 0, 'ore': 0, 'workers' : 0},
	'capital'	:	{'crop': -3,  'wood': 0, 'ore': 0, 'workers' : 0},
	'warehouse'	:	{'crop': 0,  'wood': 0, 'ore': 0, 'workers' : 0},
	'cranny'	:	{'crop': 0,  'wood': 0, 'ore': 0, 'workers' : 0},
	'tavern'	:	{'crop': 0,  'wood': 0, 'ore': 0, 'workers' : 0},

	'field'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'rocks'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'trees0'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'trees1'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'trees2'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
	'river'		:	{'crop': 0, 'wood': 0, 'ore': 0, 'workers' : 0},
};

var buildTimes = {
	'farm'      :	5,
	'mine' 		: 	5,
	'sawmill'   :	5,
	
	'house' 	:	5,
	'barracks'	:	5,
	'stable'    :   5,
	'capital'	:	5,
	'warehouse'	:	5,
	'cranny'	:	5,
	'tavern'	:	5,

	'field'		:	0,
	'rocks'		:	0,
	'trees0'		:	0,
	'trees1'		:	0,
	'trees2'		:	0,
	'river'		:	0,
}

var encode = {
	'field'		: 'f0',
	'river0'	: 'r0',
	'trees0' 	: 't0',
	'trees1' 	: 't1',
	'trees2' 	: 't2',
	'rocks'		: 'ro',
	'sawmill'	: 'sm',
	'mine'		: 'm',
	'house'		: 'h',
	'farm'      : 'f',
	'capital'	: 'c',
	'barracks'	: 'b',
	'stable'	: 'st',
	'warehouse'	: 'w',
	'cranny'	: 'cr',
	'tavern'	: 'ta',
	'void'		: 'x',
};
var decode = {
	'f0' : 'field',
	'r' : 'river',
	't0' : 'trees0',
	't1' : 'trees1',
	't2' : 'trees2',
	'ro' : 'rocks',
	'sm' : 'sawmill',
	'm' : 'mine'	,
	'h' : 'house'	,
	'f' : 'farm'     ,
	'c' : 'capital',
	'b' : 'barracks',
	'st' : 'stable',
	'w' : 'warehouse',
	'cr' : 'cranny',
	'ta' : 'tavern',
	'x' : 'void'
};

exports.loadWorld = loadWorld;
exports.createCity = createCity;
exports.getCityData = getCityData;
exports.orderTiles = orderTiles;
exports.orderTroops = orderTroops;
exports.tradeResources = tradeResources;

/**
 *	resources1, 1->2
 *	resources2, 2->1
 */
function tradeResources(cityId1, cityId2, resources1, resources2) {
	getCityData(cityId1, 'server', function(err, city1) {
		getCityData(cityId2, 'server', function(err, city2) {
			if (takeResources(city1, resources1) && takeResources(city2, resources2)) {
				giveResources(city1, resources2);
				giveResources(city2, resources1);
				
				citiesTable.updateCity(city1, function(err) {if(err)console.log(err);});
				citiesTable.updateCity(city2, function(err) {if(err)console.log(err);});
				
				var sio = require('./sockets.js').sio;
				sio.sockets.in(city1.user).emit('resourcePush', city1);
				sio.sockets.in(city1.user).emit('contractEvent', {gained: resources2,
																													lost: resources1});

				sio.sockets.in(city2.user).emit('resourcePush', city2);
				sio.sockets.in(city2.user).emit('contractEvent', {gained: resources1,
																													lost: resources2});


			} else {
				console.log('TRADE RESOURCES: trade failed!');
			}
		});
	});
}
function giveResources(city, resources) {
	for (var elem in resources) {
		// see if it is a resource.
		if (city.resources[elem] !== undefined) {
			city.resources[elem] += resources[elem];
			// console.log('GAVE CITY', city.id, ' ', resources[elem]);
		}
	}
	
}

/**
 *	If enough resources exist, take from object and return true, otherwise
 *	make no hanges and return false. 
 *
 */
function takeResources(city, resources) {
	for (var elem in resources) {
		// see if it is a resource.
		if ((city.resources[elem] !== undefined) &&
			(city.resources[elem] < resources[elem])) {
				return false;
		}
	}

	// if here we can afford. 
	for (var elem in resources) {
		// see if it is a resource.
		if (city.resources[elem] !== undefined) {
			city.resources[elem] -= resources[elem];
		}
	}
	return true;
}

function loadWorld(world, callback) {
	citiesTable.selectAll(function(err, cities) {
		if (err) {
			console.log('LOAD city CITIES ERR', err);
		}
		else {
			// world.cities = cities;
			for (var i = 0; i < cities.length; i++)
			{
				var city = cities[i];
				world.addCity(city)
			}
			if (callback) callback();
		}
	});
}

// callback(err, cityData)
function getCityData (cityId, session, callback) {
	var notPublic = ['tiles', 'buildingQueues', 'trainingQueues', 'lastUpdate', 
		'capacity', 'resources', 'income'];

	citiesTable.selectCity(cityId, function(err, city) {
		if (err) return callback(err);
		updateCity(city, function(err, updatedCity) {
			var cityEcon = getCityEconomy(updatedCity);
			updatedCity.income = {
				'crop': cityEcon.crop, 
				'wood': cityEcon.wood, 
				'ore': cityEcon.ore
			}
			updatedCity.resources.workers = cityEcon.workers;
			updatedCity.population = cityEcon.population;
			updatedCity.capacity = {
				'storage' : cityEcon.storage,
				'hiding' : cityEcon.hiding
			}
			if (err) return callback(err);
			if ((session == 'server') || (JSON.parse(session.user.cities).indexOf(cityId) >= 0)) {
				callback(null, updatedCity);
			} else {
				for (var i = 0; i < notPublic.length; i++) {
					updatedCity[notPublic[i]] = null;
				}
				callback(null, updatedCity);
			}
		});
	});
}

////////////////////////////////////////////////////////////////////////////////
/*
	City Economy - All economically relevant data
*/
////////////////////////////////////////////////////////////////////////////////
function createCity(world, userId, userData, tileId, callback) {
	citiesTable.insert(userId, userData, tileId, function(err, cityId) {
		if (err) return callback(err);
		citiesTable.selectCity(cityId, function(err, city){
			if (err) return callback(err);
			world.addCity(city);
			var sio = require('./sockets.js').sio;
			sio.sockets.emit('newCity', city);
			callback(null, city);
		});
	});
	
}


/*
	getTilesWithinRadiusOf - returns an array of all the 
*/
function getTilesWithinRadiusOf( tileId, radius ) {
	var tileArray = [];
	var row = Math.floor(tileId/25)
	  , top = Math.max( 0, row - radius )
	  , bot = Math.min( 24, row + radius );
	var col = tileId % 25
	  , left = Math.max( 0, col - radius )
	  , right = Math.min( 24, col + radius );

	var x, y;
	for (var c = left; c <= right; c++) {
		for(var r = top; r <= bot; r++) {
			x = r - row;
			y = c - col;
			if ( Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) ) <= radius 
				&& (x != 0 || y != 0) ) 
			{
				tileArray.push( 25*r + c );
			}
		}
	}
	return tileArray;
}

function arrayContains( cityTiles, tileArray, tileTypeString ) {
	var count = 0;
	for (var i = 0; i < tileArray.length; i++) {
		if ( decode[ cityTiles[ tileArray[i] ] ] === tileTypeString ) {
			count++;
		}
	}
	return count;
}

function getTileBonuses( cityTiles, tileId, tileTypeString ) {
	var bonuses = {
		'quality'    : 1,
		'efficiency' : 1,
		'happiness'  : 1,
	};

	var neighbors = getTilesWithinRadiusOf( tileId, 1 );

	// quality
	if ( tileTypeString === 'farm' 
		&& arrayContains( cityTiles, neighbors, 'river' ) ) 
	{
		bonuses.quality += 0.2;
	}

	// efficiency bonus
	if (tileTypeString === 'farm'
		|| tileTypeString === 'sawmill'
		|| tileTypeString === 'mine')
	{
		var neighborCount = 0;
		for (var i = 0; i < neighbors.length; i++) {
			if ( decode[ cityTiles[ neighbors[i] ] ] === tileTypeString ) {
				neighborCount ++;
			}
		}
		bonuses.efficiency += 0.05*neighborCount;
	}

	// happiness bonus - todo later (requires optimal worker spread)
	return bonuses;
}

function getTileEconomy( cityTiles, tileType, tileId ) {
	// console.log( 'TILE '+tileId+' - '+decode[tileType] );
	var tileEconomy = {
		'crop' : 0,
		'wood' : 0,
		'ore'  : 0,
		'workers'    : 0,
		'population' : 0,
		'storage' : 0,
		'hidden'  : 0,
	};
	// if ( tileType >= 14 || tileType < 0 ) return tileEconomy;
	if ( tileType === 'x' || tileType === 'r') return tileEconomy;
	var tileTypeString = decode[ tileType ];

	var bonuses = getTileBonuses( cityTiles, tileId, tileTypeString );
	var bonus = bonuses.quality * bonuses.efficiency * bonuses.happiness;
	// tileEconomy.bonus = bonus;
	console.log(tileType, tileTypeString);
	tileEconomy.crop = Math.floor( bonus*tileIncomes[ tileTypeString ].crop );
	tileEconomy.wood = Math.floor( bonus*tileIncomes[ tileTypeString ].wood );
	tileEconomy.ore  = Math.floor( bonus*tileIncomes[ tileTypeString ].ore );

	if (tileTypeString === 'house') {
		tileEconomy.workers    = 5;
		tileEconomy.population = 5;
	} else if (tileTypeString === 'capital') {
		tileEconomy.storage = 1000;
		tileEconomy.workers    = 2;
		tileEconomy.population = 3;
	} else if (tileTypeString === 'warehouse') {
		tileEconomy.storage = 1000;
		tileEconomy.hidden  = 0;
	} else if (tileTypeString === 'cranny') {
		tileEconomy.storage = 200;
		tileEconomy.hidden  = 200;
	} else if (tileTypeString === 'capital') {
		tileEconomy.storage = 500;
		tileEconomy.hidden  = 0;
	} else {
		tileEconomy.storage = 0;
		tileEconomy.hidden  = 0;
	}

	// {
	// 	tileEconomy.workers    = -tilePrices[ tileTypeString ].workers;
	// 	tileEconomy.population = 0;
	// }

	// console.log(tileEconomy);
	return tileEconomy;	
}

function getCityEconomy(city) {
	var cityEconomy = {
		'crop' : 0,
		'wood' : 0,
		'ore'  : 0,
		'workers'    : 0,
		'population' : 0,
		'storage' : 0,
		'hidden'  : 0,
	};
	var tileEconomy, stat;
	for (var i = 0; i < city.tiles.length; i++) {
		tileEconomy = getTileEconomy( city.tiles, city.tiles[i], i );

		for (stat in cityEconomy) {
			cityEconomy[stat] += tileEconomy[stat];
		}
	}
	// for (var j = 0; j < decode.length; j++) {
	// 	console.log( decode[j] + ' - ' +
	// 		getNumberOfTiles( city.tiles, decode[j]) );
	// }
	return cityEconomy;
}

function getNumberOfTiles(tiles, tileTypeString) {
	var count = 0;
	for (var i = 0; i < tiles.length; i++) {
		if (decode[ tiles[i] ] === tileTypeString) count++;
	}
	return count;
}

////////////////////////////////////////////////////////////////////////////////

// updates the resources and manages building queues
function updateCity(city, callback) {
	console.log('update1', city.resources);
	// declare loopvariables
	var now, buildingOrder, finishTime, tileType, tileIds, timeSpan;
	now = Math.floor(Date.now()/1000);

	var cityEconomy;

	for (var i = 0; i < city.buildingQueues.length; i++) {
		buildingOrder = city.buildingQueues[i];
		// building order has not been completed, so break
		if (buildingOrder.finishTime > now) {
			break;
		// building order completed, so build it and update resources
		// and incomes up to the finishTime
		} else {
			finishTime = buildingOrder.finishTime;
			tileType   = buildingOrder.tileType;
			tileIds    = buildingOrder.tileIds;
			timeSpan   = (finishTime - city.lastUpdate)/3600;

			cityEconomy = getCityEconomy(city);
			city.resources.crop += timeSpan * cityEconomy.crop;
			city.resources.wood += timeSpan * cityEconomy.wood;
			city.resources.ore  += timeSpan * cityEconomy.ore;

			city.resources.crop = Math.min(city.resources.crop, cityEconomy.storage);
			city.resources.wood = Math.min(city.resources.wood, cityEconomy.storage);
			city.resources.ore = Math.min(city.resources.ore, cityEconomy.storage);

			// update the city tiles
			for (var j = 0; j < tileIds.length; j++) {
				city.tiles[tileIds[j]] = encode[tileType];
			}

			// the finishTime of this order is now the time of the lastUpdate
			city.lastUpdate = finishTime;
		}

	// if the loop builds everything in the queue, clear the queue
	} if (i == city.buildingQueues.length) {
		city.buildingQueues = [];
	// otherwise, only leave the unfinished orders
	} else {
		city.buildingQueues = city.buildingQueues.slice(i, city.buildingQueues.length);
	}

	// update the resources to the current values
	timeSpan = (now - city.lastUpdate)/3600;
	// console.log('cityUpdate:', now  - city.lastUpdate);
	
	cityEconomy = getCityEconomy(city);
	city.resources.crop += timeSpan * cityEconomy.crop;
	city.resources.wood += timeSpan * cityEconomy.wood;
	city.resources.ore  += timeSpan * cityEconomy.ore;

	city.resources.crop = Math.min(city.resources.crop, cityEconomy.storage);
	city.resources.wood = Math.min(city.resources.wood, cityEconomy.storage);
	city.resources.ore = Math.min(city.resources.ore, cityEconomy.storage);
			
	city.lastUpdate = now;

	citiesTable.updateCity(city, function(err) {
		if (err) callback(err);
		else callback(null, city);
	});
}

function canAffordBuildings(oldTileType, tileType, numTiles, cityData) {
	// console.log('Checking if we have enough resources:', oldTileType, tileType, numTiles, cityData.resources);

	if (oldTileType == 'house' && cityData.resources['workers'] < 5*numTiles) return false;
	if (numTiles * tilePrices[tileType]['crop'] > cityData.resources['crop']) return false;
	if (numTiles * tilePrices[tileType]['wood'] > cityData.resources['wood']) return false;
	if (numTiles * tilePrices[tileType]['ore'] > cityData.resources['ore']) return false;
	if (numTiles * tilePrices[tileType]['workers'] > cityData.resources['workers']) return false;
	return true;
}

function payForTroops(resources, troopType, n) {
	assert(troopType == 'calvary' || troopType == 'soldiers', 'Incorrect troop type!');


	if (resources.crop < troopPrices[troopType].crop) return false;
	if (resources.wood < troopPrices[troopType].wood) return false;
	if (resources.ore < troopPrices[troopType].ore) return false;
	return true;

}



function buildTiles(sio, username, cityId, tileType, tiles) {
	exports.getCityData(cityId, 'server', function(err, cityData) {

		sio.sockets.in(username).emit('builtTiles', {'tileType' : tileType, 'tiles' : tiles});
		sio.sockets.in(username).emit('resourcePush', {
			'cityId' : cityId,
			'resources' : cityData.resources,
			'population' : cityData.population,
		});

	});	
}

// data : {'tileType', 'tiles', 'cityId'}
function orderTiles(sio, session, data, callback) {
	// console.log('ORDER: check 1', data);
	var oldTileType;
	var numTiles = data.tiles.length;
	var now = Math.floor(Date.now()/1000);
	var tileType = data.tileType;
	var finishTime = now + buildTimes[tileType];
	if (session.user.cities.indexOf(data.cityId) < 0) {
		console.log('trying to build on a wrong city!');
		callback('invalid-cityID');
	} else {
		exports.getCityData(data.cityId, session, function(err, cityData) {
			// console.log('ORDER: check 2', cityData);
			oldTileType = decode[cityData.tiles[data.tiles[0]]];
			// check we have enough resources. 
			if (!canAffordBuildings(oldTileType, tileType, data.tiles.length, cityData)) {
				callback('not enough resources!, poor n00b');
			} else {
				// console.log('ORDER: check 3', cityData);
				cityData.resources['crop'] -= (numTiles * tilePrices[tileType]['crop']);
				cityData.resources['wood'] -= (numTiles * tilePrices[tileType]['wood']);
				cityData.resources['ore'] -= (numTiles * tilePrices[tileType]['ore']);
				cityData.resources['workers'] -= (numTiles * tilePrices[tileType]['workers']);

				if (oldTileType == 'house') {
					cityData.population -= (numTiles*5);
					cityData.resources['workers'] -= (numTiles*5);
				}

				cityData.resources['workers'] += numTiles * tilePrices[oldTileType]['workers'];

				cityData.income['crop'] -= (numTiles * tileIncomes[oldTileType]['crop']);
				cityData.income['wood'] -= (numTiles * tileIncomes[oldTileType]['wood']);
				cityData.income['ore'] -= (numTiles * tileIncomes[oldTileType]['ore']);

				cityData.buildingQueues.push({
					'finishTime' : finishTime,
					'tileType'   : tileType,
					'tileIds'    : data.tiles
				});

				// for (var i = 0; i < cityData.tiles.length; i++) {
				// 	cityData.tiles[data.tiles[i]] = -encode[data.tileType];
				// };

				// console.log('ORDER: check 4', cityData);

				setTimeout(function() {
					buildTiles(sio, session.user.username, data.cityId, tileType, data.tiles);
				}, buildTimes[tileType]*1000);

				citiesTable.updateCity(cityData, function(err) {
					if (err) callback(err);
					console.log('Ordered', numTiles, tileType, 'at', finishTime);
				});
				callback(null);
			}
		});
	}
}


function buildTroops(sio, userData, cityId, troopType, n) {
	var armyId;
	var army;
	exports.getCityData(cityId, 'server', function(cityData){
		MS.getTileById(cityData.tileId, function(err, tile){
			if (err) {
				console.log('build troops error!',err);
			} else {
				// See if any army is currently on this city.
				armyId = tile[3];
				if (armyId) {
					// If so, modify it,
					RM.getArmyData(armyId, 'server', function(err, armyData) {
						if (!err) {
							armyData[troopType] += n;
							RM.setArmyData(armyData, function(){
								console.log('trained troops!');
								sio.sockets.emit('armyData', armyData);
							});
						};
					})

				} else {
					// Else, create a new army. 
					armyData = {
						'soldiers' : 0,
						'calvary' : 0,
					}
					armyData[troopType] = n;
					RM.addArmy (userData.id, tile[0], userData.username, armyData, function(err, armyId){
						if(err)console.log('err', err);
						else {
							armyData.id = armyId;
							armyData.username = userData.username;
							armyData.crop = 0;
							armyData.wood = 0;
							armyData.ore = 0;

							addArmyToPlayer(sio, userData, armyId, function(err) {
								if (err) console.log('addArmyToPlayer ERR', err);
							});
							MS.setTile(tile[0], cityId, armyId, 'server', function (err) {
								if (err) console.log('setTile, error is:', err);
								sio.sockets.emit('armyData' , armyData);

							});
						}
					});
				}
			}
		}) 
	});
	console.log(cityId, troopType, n);
}

function orderTroops(sio, session, cityId, troopType, n) {
	// console.log(session.user);
	assert(troopType == 'calvary' || troopType == 'soldiers', 'Incorrect troop type!');
	var now = Math.floor(Date.now()/1000)
	  , finishTime = now + trainingTimes[troopType];

	exports.getCityData(cityId, session, function(cityData) {
		if(payForTroops(cityData.resources, troopType, n)) { 

			// cityData.trainingQueues.push({
			// 	'finishTime' : finishTime,
			// 	'troopType'   : troopType
			// });


			for (var resource in cityData.resources) {
				cityData.resources[resource] -= n*troopPrices[troopType][resource];
			}

			setTimeout(function() {
				buildTroops(sio, session.user,cityId, troopType, n);
			},	trainingTimes[troopType]*1000);

			citiesTable.updateCity(cityData, function(err) {
				if (err) callback(err);
			});

		}
	});

}