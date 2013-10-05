function City(data) {
	this.tiles = data.tiles;
	this.numTiles = 25;
	this.user = '';
	this.cityName = '';
	this.buildingQueues = [];

	this.capacity = data.capacity;
	this.resources = data.resources;
	this.income = data.income || {'crop' : 0, 'wood' : 0, 'ore' : 0};

	this.population = data.population;
	this.armyId = 0;

}

var prices = {
	//resource collectors. 
	'farm'       :	{'crop' : 75, 'wood' : 90, 'ore' : 75, 'workers'  : 1},
	'mine' 		 :  {'crop' : 50, 'wood' : 80, 'ore' : 40, 'workers'  : 1},
	'sawmill'	 :	{'crop' : 60, 'wood' : 40, 'ore' : 75, 'workers'  : 1},
	
	//city buildings
	'house' 	 :	{'crop' : 30, 'wood' : 90, 'ore' : 40, 'workers'  : 0},
	'barracks'	 :	{'crop' : 30, 'wood' : 90, 'ore' : 40, 'workers'  : 1},
	'stable'	 :	{'crop' : 30, 'wood' : 90, 'ore' : 40, 'workers'  : 1},
	'capital'	 :	{'crop' : 30, 'wood' : 90, 'ore' : 40, 'workers'  : 1},
	'warehouse'	 :	{'crop' : 50, 'wood' : 0,  'ore' : 0,  'workers'  : 0},
	'cranny'	 :	{'crop' : 50, 'wood' : 0,  'ore' : 0,  'workers'  : 0},
	'tavern'	 :	{'crop' : 50, 'wood' : 0,  'ore' : 0,  'workers'  : 1},

	//world editing.
	'field'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'rocks'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'trees'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'river'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
}
var incomes = {
	'farm'       :	{'crop' : 10, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'mine' 		 :  {'crop' : 0, 'wood' : 0, 'ore' : 10, 'workers'  : 0},
	'sawmill'    :	{'crop' : 0, 'wood' : 10, 'ore' : 0, 'workers'  : 0},
	
	'house' 	 :	{'crop' : -5, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'barracks'	 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'stable'	 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'capital'	 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'warehouse'	 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'cranny'	 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'tavern'	 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},


	'field'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'rocks'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'trees'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'river'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
}
var troopPrices = {
	'soldiers'	: 	{'crop': 75, 'wood': 90, 'ore': 75, 'workers' : 0},
	'calvary'	: 	{'crop': 75, 'wood': 90, 'ore': 75, 'workers' : 0},
}

City.prototype.updateResources = function() {
	this.resources.crop += this.income.crop/3600;
	this.resources.wood += this.income.wood/3600;
	this.resources.ore  += this.income.ore/3600;

	this.resources.crop = Math.min(this.resources.crop, this.capacity.storage);
	this.resources.wood = Math.min(this.resources.wood, this.capacity.storage);
	this.resources.ore = Math.min(this.resources.ore, this.capacity.storage);
	drawResources();
}

City.prototype.getTile = function(id) {
	assert(id > 0 && id < this.numTiles*this.numTiles, 'Invalid tile id in getTile: '+ id);
	return this.tiles[id];
}



City.prototype.getNeighbors = function(tileId) {
	var tileArray = [];
	if (tileId >= 25) tileArray.push( city.tiles[tileId - 25] );
	if (tileId < 600) tileArray.push( city.tiles[tileId + 25] );
	if (tileId % 25 != 0) tileArray.push( city.tiles[tileId - 1] );
	if (tileId % 25 != 24) tileArray.push( city.tiles[tileId + 1] );
	return tileArray;
}

/*
	Steps to building tile
	1. The client tells the server what it wants to buy
	2. Server checks if there are enough minerals and removes the cost from them.
	3. the server and client then both update their city representation, so the
	 entire city is never transfered. 

	Type is the string of the type of tile being built. 
*/
City.prototype.buy = function(oldType, newType) {
	if (selectionContr.length == 0) return;

	if ( !selectionContr.allValid(newType) ) {
		alert('Not a valid tile placement!');
		return;
	}
	// Try to pay for resources, return false on not enough minerals. 
	if ( !this.payFor(selectionContr.length(), oldType, newType) ) {
		alert('We require more minerals!');
		return;
	}
	// Set map to building icons. 
	// for (var i = 0; i < selected.length; i++) {
	// 	city.tiles[selected[i]] = -encode[newType];
	// }
	var cloneSelected = selectionContr.selected.slice(0);
	var cloneType = newType;
	// Tell server what we bought. 
	serverBuy(cloneType, cloneSelected);
	buffer = null;
	// Draw the map with building icons.
	drawMap();
	selectionContr.clear();
}

// This function is called once the server tells the client it is time to build. 
// The server has already made these changes. 
City.prototype.build = function(tileType, tiles, imgs) {
	assert(tiles.length == imgs.length);
	// update incomes
	buffer = null;
	console.log('buildTiles: ', this.resources);
	var resource;
	var n = tiles.length;
	for (var resource in this.resources) {
		console.log(resource , this.income[resource]  , n*incomes[tileType][resource]);
		this.income[resource]  += n*incomes[tileType][resource];


	}
	var tile;
	for (var i = 0; i < tiles.length; i++) {
		tile = this.tiles[tiles[i]];
		tile.type = tileType;
		tile.image = imgs[i];
		if (tileType == 'warehouse') {
			this.capacity.storage += 500;
		}; 
	}
	//drawSelected();
	drawResources();
	drawMap();
	updateCityInfoPane();
}

City.prototype.payForTroops = function(resources, troopType, n) {
	for (var resource in this.resources) { 
		if (this.resources[resource] < n*troopPrices[troopType][resource]) {
			return false;
		}
	}
	for (var resource in this.resources) {
		this.resources[resource] -= n*troopPrices[troopType][resource];
	}

	drawResources();
	return true;
}

City.prototype.orderTroops = function(troopType, n){
	var s;
	if(!this.payForTroops(this.resources, troopType, n)){
		alert('You cannot afford those troops!');
	} else {
		s = 'Ordered ' + n + ' ' + troopType + '!';
		serverOrderTroops(player.cities[0], troopType, n);
		alert(s);
	}
}


/*
 * 	checks if you have the resources to build "n" of "type",
 *  if not, return false, and leave things as they were
 * 	otherwise, subtract the cost from your resources, but DONT CHANGE INCOMES!!!
 */
City.prototype.payFor = function(n, oldType, newType) {
	console.log(this.resources, n, oldType, newType);
	for (var resource in this.resources) { 
		if (this.resources[resource] < n * prices[newType][resource]) {
			console.log(this.resources[resource] , n * prices[newType][resource]);
			return false;
		}
	}   
	   
	for (var resource in this.resources) {
		this.resources[resource] -= n * prices[newType][resource];
		this.income[resource] -= n*incomes[oldType][resource];
		console.log(this.income[resource] , n*incomes[oldType][resource]);
	}

	this.workers += prices[oldType]['workers'];

	drawResources();
	return true;
}




// Get the tile at the screen coords x,y.
City.prototype.tileFromXY = function(x, y) {
	var tileHeight = (tileWidth / 2);
	// first convert to world coordinates. 
	x += ((cityView.x - cityCanvas.width/2));
	y += ((cityView.y - cityCanvas.height/2)); 
	y -= (NUM_TILES * tileHeight / 2);
	x += (6 * tileWidth);
	var col = Math.floor((.5*x-y)/tileHeight)
	  , row = Math.floor((.5*x+y)/tileHeight);
	return this.tiles[this.getId(row, col)];
}
City.prototype.getId = function(row, col) {
	return this.numTiles * row + col;
}

// // Tile constructor. 
// function tile(row, col, id)
// {
// 	this.row = row;
// 	this.col = col;
// 	// id is an optional paramater. 
// 	if (id) this.id = id;
// 	else this.id = (row * NUM_TILES) + col;
// }

City.prototype.containsRiver = function(tileArray) {
	return false;
	// var bool = false;
	// for (var i = 0; i < tileArray.length; i++) {
	// 	if ( tileArray[i] === 1) bool = true;
	// }
	// return bool;
}