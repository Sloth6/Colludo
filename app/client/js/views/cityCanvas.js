var tileWidth = 40;
var NUM_TILES = 25;

var cityView = {
	x : NUM_TILES * tileWidth/2,
	y : NUM_TILES * tileWidth/4
};


///////////////////////////////////////////////////////////////////////////////
/*
	cityCANVAS DRAWING FUCNTIONS.
*/
///////////////////////////////////////////////////////////////////////////////


function worldXY(id) {
	var tileHeight = tileWidth/2
	  , col = (id%NUM_TILES)
	  , row = Math.floor(id/NUM_TILES)

	  , x = ((col + row) * tileHeight)
	  , y = (NUM_TILES * tileHeight / 2) - ((col-row) * tileHeight/2) - tileHeight/2;

	return {'x' : x, 'y' : y};
	// cityCtx.drawImage(selectedImg, x, y, tileWidth, tileHeight);
}

function screenXY(id, width, height) {
	var world = worldXY(id);
	var x = width/2 - cityView.x + world.x; 
	var y = height/2 - cityView.y + world.y;
	return {'x' : x, 'y' : y};
}

function drawSquareAt(id,  w, h) {
	var tileHeight = tileWidth/2
	  , width = (w) ? w : cityCanvas.width
	  , height = (h) ? h : cityCanvas.height
	  , viewXY = screenXY(id, width, height);

	cityCtx.drawImage(selectedImg, viewXY.x- tileWidth*6, viewXY.y, tileWidth, tileHeight);
}

function drawFoo(tileA, tileB) {
	console.log(tileA, tileB);
	tileA.row = Math.floor(tileA.id/25);
	tileB.row = Math.floor(tileB.id/25);
	tileA.col = (tileA.id%25);
	tileB.col = (tileB.id%25);
	
	var start = {'row' : Math.min(tileA.row, tileB.row), 'col' : Math.min(tileA.col, tileB.col)};
	var end = {'row' : Math.max(tileA.row, tileB.row), 'col' : Math.max(tileA.col, tileB.col)};
	var id;
	
	for (var row = start.row; row <= end.row; row++) {
		for (var col = start.col; col <= end.col; col++) {
			// the id of the current tile. 
			id = row*NUM_TILES + col;
			if (city.tiles[id].type === selectionContr.lastTile.type) 
				drawSquareAt(id);
		}
	}
}

var newRivers = true;
var rivers = [];
var ri = [];

function neRivers() {
	ri = [];
	for (var i = 0; i < rivers.length; i++) {
		ri.push(Math.floor(Math.random()*3));
	}
}


function drawRivers(ctx, width, height) {
	var tileHeight = Math.floor(tileWidth/2)
  , tileId
  , viewXY;
// console.log(rivers);
	if (ri.length == 0) {
		neRivers();
	} 
	for (var i = 0; i < rivers.length; i++) {
		screenCoords = screenXY(rivers[i], width, height);
		var foo = (tileWidth /4.4)*1.9;
		var s = 'river'+ri[i];
		ctx.drawImage(cityTileImgs[s],
			screenCoords.x-foo-tileWidth*6, screenCoords.y-foo/2,
			tileWidth+(2*foo), tileHeight+foo);
	}
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
	// $('#cityZoomSlider').slider('value', tileWidth.toString());//tileWidth;//cityView.y * Math.sqrt(3) /4;

}

var buffer;
var bufferCtx;
var first = true; 
function drawMap() {
	if(!city || city.tiles=={} || !haveCityImages){
		console.log('too soon! try back later.', haveCityImages);
		//too soon! try back later. 
		setTimeout(function(){
			drawRivers(cityCtx, width, height);
			drawMap();
		}, 100);
		return;
	}
	var width = cityCanvas.width
	  , height = cityCanvas.height;
	if (buffer) {
		var imageH = NUM_TILES * tileWidth/2
		  , imageW = 13 * tileWidth;

		cityCtx.clearRect(0, 0, width, height);
		drawRivers(cityCtx, width, height);
		cityCtx.drawImage(buffer,
			-(cityView.x - width/2),
			-(cityView.y - height/2),
			imageW,
			imageH
		);
		

	} else {
		var oldTileWidth = tileWidth;
		var oldView = {'x' : cityView.x, 'y': cityView.y};
		tileWidth = 240;
		var bufferWidth = 13 * tileWidth * 2, 
	  	bufferHeight = 25 * tileWidth/2 * 2;

		buffer = document.createElement('canvas');
		bufferCtx = buffer.getContext('2d');

		buffer.height = bufferHeight;
		buffer.width = bufferWidth;

		windowCity(buffer);

		drawMap2(bufferCtx, bufferWidth, bufferHeight);

		cityView.y = oldView.y;
		cityView.x = oldView.x;
		tileWidth = oldTileWidth;

		if (first) {
			windowCity2(cityCanvas);
			first = false;
		}
		drawMap();	
	}
}

//Draw the array of tiles. 
function drawMap2(ctx, width, height) {
	var city = player.getCurrentCity();
	var tileHeight = Math.floor(tileWidth/2);//height/(NUM_TILES+1)
	var tileId;
	var tileImg;
	var tile;
	ctx.clearRect(0,0, width, height);

	// ctx.drawImage(cityBackgroundImg,
	// 	screenXY(12, width, height).x, 
	// 	screenXY(12, width, height).y + tileHeight/2,
	// 	(NUM_TILES-12) * tileWidth,
	// 	(12) * tileHeight
	// );	
	var foo = (tileWidth /4.4)*1.9; 
	for (var row = 0; row < NUM_TILES; row++) {
		for (var col = NUM_TILES-1; col >=0 ; col--) {
			tileId = row * NUM_TILES + col;
			tile = city.tiles[tileId];
			screenCoords = screenXY(tileId, width, height);
			if (tile.type !== 'river' && tile.type !== 'field'){
				ctx.drawImage(cityTileImgs['field0'], screenCoords.x-foo, screenCoords.y-foo/2, tileWidth+(2*foo), tileHeight+foo);
			}
			if (tile.type !== 'void' && tile.type !== 'river') {
				tileImg = cityTileImgs[tile.type + tile.image];
				try{
					ctx.drawImage(tileImg, screenCoords.x-foo, screenCoords.y-foo/2, tileWidth+(2*foo), tileHeight+foo);
				} 
				catch(err){
					console.log(err, tileImg, tile.type + tile.image);
				}
			}
		}
	}
	ctx.drawImage(gradientImg, 0, 0, width, height);
}

// draws the given message. 
function drawText(x, y, msg) {
	cityCtx.fillStyle = "#000000";
	cityCtx.font = "bold 1em sans-serif";
	cityCtx.textAlign = "left";
	cityCtx.fillText(msg, x, y);
}
//Draw resources by changing the html resources paragraph
function drawResources() {
	//console.log(city);
	var food = Math.floor(city.resources['crop']);
	$('.food span').text(food);
	setFoodInfo(city.income['crop'], city.resources['crop'], city.capacity.storage);

	var wood = Math.floor(city.resources['wood']);
	$('.wood span').text(wood);
	setWoodInfo(city.income['wood'], city.resources['wood'], city.capacity.storage);

	var stone = Math.floor(city.resources['ore']);
	$('.stone span').text(stone);
	setStoneInfo(city.income['ore'], city.resources['ore'], city.capacity.storage);

	var work = city.resources['workers'];
	var pop = city.population;
	$('.population span').text(work+'/'+pop);
	setPopulationInfo(work, pop);
}
