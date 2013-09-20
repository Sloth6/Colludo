function SelectionController() {
	this.selected = [];
	this.lastTile = null;
	this.type = null;
	this.selecting = false;
}
SelectionController.prototype.length = function() {
	return this.selected.length;
}
SelectionController.prototype.typeOf = function() {
	return this.type;
}
/**
* Loop through all the tiles that are highlighted and add to selected array. 
*/
function rowCol(id){
	return {
		row: id%city.numTiles,
		col: Math.floor(id/city.numTiles)
	};
}
SelectionController.prototype.addToSelected = function(a,b) {
	var startCol
	  , endCol
	  , startRow
	  , endRow;
	  var rca = rowCol(a.id);
	  var rcb = rowCol(b.id);


	console.log(a.id, b.id);
	// Switch bounds so we always loop from top left to lower right. 
	if (rca.row < rcb.row) {
		startRow = rca.row;
		endRow = rcb.row;
	} else {
		startRow = rcb.row;
		endRow = rca.row;
	}
	if (rca.col < rcb.col) {
		startCol = rca.col
		endCol = rcb.col;
	} else {
		startCol = rcb.col
		endCol = rca.col;
	}
	var id;
	for (var row = startRow; row <= endRow; row++) {
		for (var col = startCol; col <= endCol; col++) {
			id = (row * city.numTiles) + col;
			console.log(city.tiles[id].type === this.type);
			if(city.tiles[id].type === this.type) this.select(city.tiles[id]);//
		};
	};
	updateCityInfoPane();
}
//Input are x and y that are relative to the cityCanvas (opposed to the page).
//Take this tile and add it to the selected array and draw a yellow square
//Around it showing that it is selected. 
SelectionController.prototype.select = function(tile) {
	console.log(tile);
	if (tile.id >= 25*25 || tile.id < 0) return;
	var self = this;
	var index = self.selected.indexOf(tile.id);

	if (self.type === null) {
		self.type = tile.type;
	} else if (self.type !== tile.type){
		return;
	}

	if (index == -1) {
		drawSquareAt(tile.id);
		self.selected.push(tile.id);
		self.lastTile = tile;

	} else {
		var e = self.selected[index];
		self.selected.splice(index,1);
		drawMap();
		this.drawSelected();
	}
	updateCityInfoPane();
	// self.drawSelected();
}

/**
*	Check the tiles are valid before sending the request to the server.
*	Valid is defined as, not building on a river, and each resource collector
*	is on its correct resource. 
*/
SelectionController.prototype.allValid = function(type) {
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


//remove all elements from selected. 
SelectionController.prototype.clear = function() {
	this.selected = [];
	this.lastTile = null;
	this.type = null;
	this.selecting = false;
	drawMap();
}
SelectionController.prototype.drawSelected = function() {
	drawMap();
	for (var i = 0; i < this.selected.length; i++) {
		if(this.selected[i] || this.selected[i] == 0){
			drawSquareAt(this.selected[i]);
		}
	};
}


//////////////////////////////////////////////////////////////////////////////
/*
	CITYCANVAS FUCNTIONS.
*/
///////////////////////////////////////////////////////////////////////////////






