function CityInputController() {
	this.gliding = false;
	this.isMouseDown = false;
	this.lastTile= null;
	this.zoomMin = 30;
	this.zoomMax =  350;

	$('#cityZoomSlider').slider({
		orientation: "vertical",
		range: "min",
		min: this.zoomMin,
		max: this.zoomMax,
		value: tileWidth,
		slide: function( event, ui ) {
			var xyRatio = cityView.x/tileWidth;
			tileWidth = ui.value;
			cityView.x = tileWidth * xyRatio;
			cityView.y = tileWidth * xyRatio;
			drawMap();
			selectionContr.drawSelected();
		}
	});
} 

// Mouse up means that selecting is finished and an area may be highlighted.
CityInputController.prototype.mouseUp = function(e) {
	this.isMouseDown = false;
	var XY = xy(e);
	var tile = city.tileFromXY(XY.x,XY.y);

	// Reject clicks off of canvas. 
	// if (x >= cityCanvas.width || x < 0) return;
	// if (y >= cityCanvas.height || y < 0) return;
	if (!tile || tile.type === 'null') return;
	if (selectionContr.lastTile == null) return;

	
	// Check if only one tile was selected. 
	if ((tile.id == selectionContr.lastTile.id) && (city.tiles[tile.id] == selectionContr.type)) {
		// If so, seleect it. 
		selectionContr.select(tile.id);
		drawMap();
		updateCityInfoPane();
	} else {
		// Many tiles are highlighted, select all of them. 
		// selectionContr.addToSelected(selectionContr.lastTile, tile);
	}
}

function xy(e){
	var rect = cityCanvas.getBoundingClientRect();
	// console.log({
	// 	x: Math.floor(e.clientX - rect.left),
	// 	y: Math.floor(e.clientY - rect.top)
	// });
	return {
		x: Math.floor(e.clientX - rect.left),
		y: Math.floor(e.clientY - rect.top)
	}
}

// Begin selecting tiles. 
CityInputController.prototype.mouseDown = function(e) {
	this.isMouseDown = true;
	var XY = xy(e);
	var tile = city.tileFromXY(XY.x,XY.y);
	selectionContr.select(tile);

}
// When we move the mouse changed the highlighted area. 
CityInputController.prototype.mouseMove = function(e){
	return;
	var tileWidth = cityCanvas.width/NUM_TILES;
  var tileHeight= tileWidth/2;
	var rect = cityCanvas.getBoundingClientRect();
	var x = Math.floor(e.clientX - rect.left);
	var y = Math.floor(e.clientY - rect.top);
	if (this.isMouseDown) {
		drawMap();
		selectionContr.drawSelected();
		if (x >= cityCanvas.width || x < 0) return;
		if (y >= cityCanvas.height || y < 0) return;
		if (city.tileFromXY(x,y).type == 'null') return;
		console.log(selectionContr.lastTile);
		if(selectionContr.lastTile == null)return;

		var tile = city.tileFromXY(x, y);
		if (tile.id >= NUM_TILES * NUM_TILES) {return};

		// console.log(	selected.length + ((Math.abs(tile.row - this.lastTile.row)+1)  *  (Math.abs(tile.col-this.lastTile.col)+1) ));
		/*
			What the following lines do is to make sure that the original tile is
			always selected no matter which way we drag the mouse after the 
			original click. Since the drawing starts at the top left corner, 
			dragging up and left would not cover the orignal tile 
		*/

		drawFoo(selectionContr.lastTile, tile);
	}
}

CityInputController.prototype.wheel = function(delta){
	delta/=40;
	var scale = (tileWidth+delta)/tileWidth;
	
	if(tileWidth+delta < this.zoomMax && tileWidth+delta > this.zoomMin) {
		tileWidth+= delta;
		cityView.x *= scale;
		cityView.y *= scale;
		$('#cityZoomSlider').slider('value', tileWidth.toString());
    drawMap();
    selectionContr.drawSelected();
	} 
}

CityInputController.prototype.glide = function(dim, negative, n) {
	var delt = 2;
	if(!gliding) gliding = true;
	if (n <= 0) {
		gliding = false;
		return;
	}

	// delt = n;
	cityView[dim] += negative ? -1*delt : delt;
	drawMap();
	// selectionContr.drawSelected();
	
	// gliding = false;
	setTimeout(function() {
		glide(dim, negative, n-delt)
	}, 2);
}
// Bind keys.
CityInputController.prototype.keyDown = function(evt) {
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
		selectionContr.clear();
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