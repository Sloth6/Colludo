//All the tiles currently selected. 
var selected = [];
//The selecting variable is used to determine if the next click should be
//treated as the opposite corner of a selecting box. (shift was pressed).
var mouseDown = false;
//Last tile 
var lastTile = null;
var selectingType = null;

var encode = {
	'field'		: 'f0',
	'river0'	: 'r0',
	'Trees0' 	: 't0',
	'Trees1' 	: 't1',
	'Trees2' 	: 't2',
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
	't0' : 'Trees0',
	't1' : 'Trees1',
	't2' : 'Trees2',
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
	'trees0'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'trees1'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'trees2'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
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
	'trees0'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'trees1'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'trees2'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
	'river'		 :	{'crop' : 0, 'wood' : 0, 'ore' : 0, 'workers'  : 0},
}
var troopPrices = {
	'soldiers'	: 	{'crop': 75, 'wood': 90, 'ore': 75, 'workers' : 0},
	'calvary'	: 	{'crop': 75, 'wood': 90, 'ore': 75, 'workers' : 0},
}

//////////////////////////////////////////////////////////////////////////////
/*
	INPUT HANDLERS.
*/
///////////////////////////////////////////////////////////////////////////////


// Mouse up means that selecting is finished and an area may be highlighted.
function cityMouseUp(e) {
	mouseDown = false;
	var tileWidth = cityCanvas.width/NUM_TILES
	  , tileHeight= tileWidth / 2
	  , rect = cityCanvas.getBoundingClientRect()
	  , x = Math.floor(e.clientX - rect.left)
	  , y = Math.floor(e.clientY - rect.top)
	  , tile;

	// Reject clicks off of canvas. 
	if (x >= cityCanvas.width || x < 0) return;
	if (y >= cityCanvas.height || y < 0) return;
	if (city.tiles[tileFromXY(x,y).id] == encode['null']) return;
	if (lastTile == null) return;


	// Get the tile that the user left at. 
	tile = tileFromXY(x,y);
	
	// Check if only one tile was selected. 
	if ((tile.id == lastTile.id) && (city.tiles[tile.id] == selectingType)) {
		// If so, seleect it. 
		citySelectTile(tile.id);
		drawMap();
		updateCityInfoPane();
	} else {
		// Many tiles are highlighted, select all of them. 
		selectHighlighted(lastTile, tile);
	}

}
// Begin selecting tiles. 
function cityMouseDown(e) {
	mouseDown = true;
	var tileWidth = cityCanvas.width/NUM_TILES
	  , tileHeight= tileWidth/2
	  , rect = cityCanvas.getBoundingClientRect()
	  , x = Math.floor(e.clientX - rect.left)
	  , y = Math.floor(e.clientY - rect.top);

	// Reject clicks off of canvas.
	if (x >= cityCanvas.width || x < 0) return;
	if (y >= cityCanvas.height || y < 0) return;
	if (city.tiles[tileFromXY(x,y).id] == encode['null']) return;

	// store the first tile selected. 
	lastTile = tileFromXY(x,y);	
	console.log(lastTile.id);
	// Record which type of tile is being slected and we will only select that type.
	if (selected.length == 0) {
		selectingType = city.tiles[lastTile.id];
	};
	var tile = tileFromXY(x, y);
	if(city.tiles[tile.id] == selectingType)drawSquareAt(tile.id);
}
// Loop through all the tiles that are highlighted and add to selected array. 
function selectHighlighted(a, b){
	drawMap();
	var startCol
	  , endCol
	  , startRow
	  , endRow; 

	// Switch bounds so we always loop from top left to lower right. 
	if (a.row < b.row) {
		startRow = a.row;
		endRow = b.row;
	} else {
		startRow = b.row;
		endRow = a.row;
	}
	if (a.col < b.col) {
		startCol = a.col
		endCol = b.col;
	} else {
		startCol = b.col
		endCol = a.col;
	}

	for (var row = startRow; row <= endRow; row++) {
		for (var col = startCol; col <= endCol; col++) {
			id = (row * NUM_TILES) + col;
			//console.log(id);
			if(city.tiles[id] == selectingType) citySelectTile(id);//
		};
	};
	updateCityInfoPane();
}

// When we move the mouse changed the highlighted area. 
function cityMouseMove(e){
	var tileWidth = cityCanvas.width/NUM_TILES;
    var tileHeight= tileWidth/2;
	var rect = cityCanvas.getBoundingClientRect();
	var x = Math.floor(e.clientX - rect.left);
	var y = Math.floor(e.clientY - rect.top);

	if (mouseDown) {
		drawMap();
		drawSelected();
		if (x >= cityCanvas.width || x < 0) return;
		if (y >= cityCanvas.height || y < 0) return;
		if (city.tiles[tileFromXY(x,y).id] == encode['null']) return;
		if(lastTile == null)return;

		var tile = tileFromXY(x, y);


		if (tile.id >= NUM_TILES * NUM_TILES) {return};


		// console.log(	selected.length + ((Math.abs(tile.row - lastTile.row)+1)  *  (Math.abs(tile.col-lastTile.col)+1) ));
		/*
			What the following lines do is to make sure that the original tile is
			always selected no matter which way we drag the mouse after the 
			original click. Since the drawing starts at the top left corner, 
			dragging up and left would not cover the orignal tile 
		*/

		var x1 = (tile.col + tile.row) * tileHeight
		  , y1 = cityCanvas.height/2 - ((tile.col-tile.row) * tileHeight/2)
		  , x0 = (lastTile.col + lastTile.row) * tileHeight
		  , y0 = cityCanvas.height/2 - ((lastTile.col-lastTile.row) * tileHeight/2);
		drawFoo(lastTile, tile);
	}
}

function cityWheel(delta){
	// Zoom in
    if(delta > 0) {
    	if(tileWidth < 300) {
	    	cityView.x *= 1.03;
	    	cityView.y *= 1.03;
	    	tileWidth *= 1.03;
	    }
    }
    // Zoom Out
    else if (tileWidth > 30){
    	cityView.x *= .97;
    	cityView.y *= .97;
    	tileWidth *= .97;
    }
    $('#cityZoomSlider').slider('value', tileWidth.toString());
    drawMap();
    drawSelected();
}
function cityBindUI(){
	$('#cityZoomSlider').slider({
		orientation: "vertical",
		range: "min",
		min: 30,
		max: 300,
		value: tileWidth,
		slide: function( event, ui ) {
			var xyRatio = cityView.x/tileWidth;
			tileWidth = ui.value;
			cityView.x = tileWidth * xyRatio;
			cityView.y = tileWidth * xyRatio;
			drawMap();
			drawSelected();
		}
	});
}



function windowCity(can) {
	// console.log(can.width, can.height);
	tileHeight = (can.height / NUM_TILES);
	tileWidth = tileHeight*2;
	cityView.y = can.height/2;
	cityView.x = can.width/2 + (6 * tileWidth);
	// console.log('windowed view',cityView.x, cityView.y);
}

function windowCity2(can) {
	// console.log(can.width, can.height);
	tileHeight = (can.height / NUM_TILES);
	tileWidth = tileHeight*2;
	cityView.y = tileHeight * NUM_TILES/2;
	cityView.x = 6 * tileWidth;//tileWidth;//cityView.y * Math.sqrt(3) /4;
	// console.log('windowed view',cityView.x, cityView.y);
	$('#cityZoomSlider').slider('value', tileWidth.toString());//tileWidth;//cityView.y * Math.sqrt(3) /4;

}
function glide(dim, negative, n) {
	var delt = 2;
	if(!gliding) gliding = true;
	if (n <= 0) {
		gliding = false;
		return;
	}

	// delt = n;
	cityView[dim] += negative ? -1*delt : delt;
	drawMap();
	drawSelected();
	
	// gliding = false;
	setTimeout(function() {
		glide(dim, negative, n-delt)
	}, 2);
}

var gliding = false;
// Bind keys.
function cityKeyDown(evt) {
	// console.log(evt.keyCode);
	var key = evt.keyCode
	  , dist = tileWidth/5
	  , esc = 27
	  , left = 37
	  , up = 38 
	  , right = 39
	  , down = 40
	  , a = 65
	  , w = 87
	  , d = 68
	  , s = 83;

  	// Esc clears selected. 
	if (key == esc) {
		clearSelected();
		selecting = false;
	}
	// } if (key == left || key == a) {
	// 	cityView.x -= dist;
	// 	// if(!gliding)glide('x', true, dist);

	// } if (key == up || key == w) {
	// 	cityView.y -= dist;
	// 	// if(!gliding)glide('y', true, dist);

	// } if (key == right || key == d) {
	// 	cityView.x += dist;
	// 	// if(!gliding)glide('x', false, dist);

	// } if (key == down || key == s) {
	// 	cityView.y += dist;
	// 	// if(!gliding)glide('y', false, dist);

	// }
	// // console.log(cityView);
	// drawMap();
	// drawSelected();	
}

// Get the tile at the screen coords x,y.
function tileFromXY(x, y) {

	var tileHeight = (tileWidth / 2);

	// first convert to world coordinates. 
	x += ((cityView.x - cityCanvas.width/2));
  	y += ((cityView.y - cityCanvas.height/2)); 
  	// y -= ((cityCanvas.height/2) + tileHeight/2);

  	y -= (NUM_TILES * tileHeight / 2);
  	x += (6 * tileWidth);
	var col = Math.floor((.5*x-y)/tileHeight)
	  , row = Math.floor((.5*x+y)/tileHeight);
	// console.log('Row:', row, ' Col:', col, 'Id' ,row*NUM_TILES + col );

	return new tile(row, col);
}

// Tile constructor. 
function tile(row, col, id)
{
	this.row = row;
	this.col = col;
	// id is an optional paramater. 
	if (id) this.id = id;
	else this.id = (row * NUM_TILES) + col;
}

function getNeighbors(tileId) {
	var tileArray = [];
	if (tileId >= 25) tileArray.push( city.tiles[tileId - 25] );
	if (tileId < 600) tileArray.push( city.tiles[tileId + 25] );
	if (tileId % 25 != 0) tileArray.push( city.tiles[tileId - 1] );
	if (tileId % 25 != 24) tileArray.push( city.tiles[tileId + 1] );
	return tileArray;
}

function containsRiver(tileArray) {
	var bool = false;
	for (var i = 0; i < tileArray.length; i++) {
		if (tileArray[i] === 1) bool = true;
	}
	return bool;
}

//////////////////////////////////////////////////////////////////////////////
/*
	CITYCANVAS FUCNTIONS.
*/
///////////////////////////////////////////////////////////////////////////////


//Input are x and y that are relative to the cityCanvas (opposed to the page).
//Take this tile and add it to the selected array and draw a yellow square
//Around it showing that it is selected. 
function citySelectTile(id) {

	if(id>=NUM_TILES*NUM_TILES || id < 0) {return;}
	var index = selected.indexOf(id);
	// console.log('city select tile', id, index);
	//If it is not already in the array. 
	if (index == -1) {
		selected.push(id);

		//drawSquareAt(id);
	//If it is already in the array then remove it.
	} else {
		var e = selected[index];
		selected.splice(index,1);
		// drawTile(id);
		// updateCityInfoPane();
		
	}
	//document.getElementById("cityInfo").innerHTML=decode[city.tiles[id]];
	//console.log(selected);
	// updateInfoPane();
}


//remove all elements from selected. 
function clearSelected() {
	drawMap();
	var e;
	while (selected.length > 0) {
		e = selected.pop();
		//drawSquareAt(e, "#B3B3B3");
	}

	updateCityInfoPane();
}

/*
	Steps to building tile
	1. The client tells the server what it wants to buy
	2. Server checks if there are enough minerals and removes the cost from them.
	3. the server and client then both update their city representation, so the
	 entire city is never transfered. 

	Type is the string of the type of tile being built. 
*/
function clientBuy(oldType, newType) {

	if (selected.length == 0) {
		alert('Select tiles.');
		return;
	}
	if ( !all_select_valid(newType) ) {
		alert('Not a valid tile placement!');
		return;
	}
	// Try to pay for resources, return false on not enough minerals. 
	if ( !payFor(selected.length, oldType, newType) ) {
		alert('We require more minerals!');
		return;
	}
	// Set map to building icons. 
	// for (var i = 0; i < selected.length; i++) {
	// 	city.tiles[selected[i]] = -encode[newType];
	// }
	var cloneSelected = selected.slice(0);
	var cloneType = newType;
	// Tell server what we bought. 
	serverBuy(cloneType, cloneSelected);
	buffer = null;
	// Draw the map with building icons.
	drawMap();
	clearSelected();
}

// This function is called once the server tells the client it is time to build. 
// The server has already made these changes. 
function buildTiles(tileType, tiles) {
	// update incomes
	buffer = null;
	console.log('buildTiles: ', city.resources);
	var resource;
	var n = tiles.length;
	for (var resource in city.resources) {
		console.log(resource , city.income[resource]  , n*incomes[tileType][resource]);
		city.income[resource]  += n*incomes[tileType][resource];


	}
	console.log(city.income);
	while (tiles.length > 0) {
		e = tiles.pop();
		city.tiles[e] = encode[tileType];
		if (tileType == 'warehouse') {
			city.capacity.storage += 500;
		}; 
	}
	//drawSelected();
	drawResources();
	drawMap();
	updateCityInfoPane();
}

function payForTroops(resources, troopType, n) {
	for (var resource in city.resources) { 
		if (city.resources[resource] < n*troopPrices[troopType][resource]) {
			return false;
		}
	}
	for (var resource in city.resources) {
		city.resources[resource] -= n*troopPrices[troopType][resource];
	}

	drawResources();
	return true;
}

function orderTroops(troopType, n){
	var s;
	if(!payForTroops(city.resources, troopType, n)){
		alert('You cannot afford those troops!');
	} else {
		s = 'Ordered ' + n + ' ' + troopType + '!';
		serverOrderTroops(player.cities[0], troopType, n);
		alert(s);
	}
}

/*
	Check the tiles are valid before sending the request to the server.
	Valid is defined as, not building on a river, and each resource collector
	is on its correct resource. 
*/
function all_select_valid(type) {
	return true;
	var index;
	var tile;
	for (var i in selected) {
		index = selected[i];
		tile = decode[city.tiles[index]];
		if (tile =='river') {
			clearSelected();
			selecting = false;
			return false;
		}
		// console.log(type, tile, selected);
		if (type =='sawmill' && tile != 'trees') {
			return false;
		}
		if (type =='mine' && tile != 'rocks') {
			return false;
		}
		if (type =='farm' && tile != 'field') {
			return false;
		}
	}
	return true;
}

/*
 * 	checks if you have the resources to build "n" of "type",
 *  if not, return false, and leave things as they were
 * 	otherwise, subtract the cost from your resources, but DONT CHANGE INCOMES!!!
 */
function payFor(n, oldType, newType){
	for (var resource in city.resources) { 
		if (city.resources[resource] < priceScaleFraction(n) * n * prices[newType][resource]) {
			return false;
		}
	}
	
	for (var resource in city.resources) {
		city.resources[resource] -= priceScaleFraction(n) * n * prices[newType][resource];
		city.income[resource] -= n*incomes[oldType][resource];
	}

	city.workers += prices[oldType]['workers'];

	drawResources();
	return true;
}

function updateResources() {
	city.resources.crop += city.income.crop/3600;
	city.resources.wood += city.income.wood/3600;
	city.resources.ore  += city.income.ore/3600;

	city.resources.crop = Math.min(city.resources.crop, city.capacity.storage);
	city.resources.wood = Math.min(city.resources.wood, city.capacity.storage);
	city.resources.ore = Math.min(city.resources.ore, city.capacity.storage);

	drawResources();
}