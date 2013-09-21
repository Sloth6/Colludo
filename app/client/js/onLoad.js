
/*
* Globals
*/

var socket = io.connect(SERVER);
var player;
var selectionContr;
var city;
var cityInputContr;
var worldInput;

var cityCanvas
  , cityCtx
  , worldCanvas
  , worldCtx

  , mapTilePath = '/img/hexTiles/'
  , mapTileNames = ['grass.png', 'city0.png',  'ocean.png', 'coastal.png',
			'forrest.png', 'mountain.png', 'tree.png','hill.png', 'treeHill.png',
			 'playerArmy.png', 'battle.png', 'hexSelected.png', 'enemyArmy.png']
  , mapTiles = [];//Image objects array.

var cityTilePath = '/img/cityTiles/';
var cityTileNames = [
	'field0', 'field1', 'field2', 'field3', 
	'river0', 'river1', 'river2',
	'trees0','trees1','trees2',
	'rocks0', 'rocks1',
	'mine0', 'mine1',
	'sawmill0','sawmill1',
	'house0','house1',
	'farm0', 
	'capital0', 
	'barracks0',
	'stable0', 
	'warehouse0', 
	'cranny0', 
	'tavern0'];
var cityTileImgs = {};//Image objects array.

var buildingImage = new Image();
buildingImage.src = cityTilePath+'building.png';

var selectedImg = new Image();
selectedImg.src = cityTilePath+'selected.png';

var cityBackgroundImg = new Image();
cityBackgroundImg.src = cityTilePath+'cityBackground.png';

var gradientImg = new Image();
gradientImg.src = cityTilePath+'AtmosphericGradient.png';

	var haveCityImages = false;

$(document).ready(function() {
	'use strict';
	selectionContr = new SelectionController();
	cityInputContr = new CityInputController();
	worldInput = new WorldInput();

	loadImages(mapTilePath, mapTileNames, mapTiles, function() {
		haveImages = true;
	});

	loadImages2(cityTilePath, cityTileNames, cityTileImgs, function() {
		haveCityImages = true;
	});

	bindMouse(cityInputContr, worldInput);
	// var cityInputHandler new CityInputHandler();

	cityCanvas = document.getElementById("cityCanvas");
	cityCtx = cityCanvas.getContext("2d");


	var mapWidth =  parseInt($('#view').css('width').slice(0, -2));
	var mapHeight = parseInt($('#view').css('height').slice(0, -2));

	cityCanvas.setAttribute('width', mapWidth);
	cityCanvas.setAttribute('height', mapHeight);

	$( ".accordion-outer" ).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
	});
	$( ".accordion-inner" ).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
	});
	onLoadRequests();

	$(window).on('resize', function() {
		var mapWidth = parseInt($('#view').css('width').slice(0, -2));
		var mapHeight = parseInt($('#view').css('height').slice(0, -2));
		cityCanvas.setAttribute('width', mapWidth);
		cityCanvas.setAttribute('height', mapHeight);
		drawMap();
	});
});


function bindMouse(cityInput, worldInput){
	// var DOMId = e.target.id;

	$(document).mousedown(function(e){
		switch(e.target.id) {
			case 'cityCanvas':
				cityInput.mouseDown(e);
				break;
			case 'worldCanvas':
				worldInput.mouseDown(e)
				break;
		}
	});

	$(document).keydown(function(e){
		switch(getCurrentPanel()) {
			case 'city':
				cityInput.keyDown(e);
				break;
			case 'world':
				worldInput.keyDown(e);
				break;
		}
	});
	$(document).mouseup(function(e){
		switch(e.target.id) {
			case 'cityCanvas':
				cityInput.mouseUp(e);
				break;
			case 'worldCanvas':
				worldInput.mouseUp(e)
				break;
		}
	
	});
	$(document).mousemove(function(e){
		switch(e.target.id) {
			case 'cityCanvas':
				cityInput.mouseMove(e);
				break;
			case 'worldCanvas':
				break;
			default:
				window.clearTimeout(cityInput.timer);
				break;
		}
	});

	// $(document).bind('mousewheel DOMMouseScroll', function(event) {
	//   preventDefault(event);
	//   var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
	//   console.log(delta);
	//   switch(getCurrentPanel()) {
	// 		case 'city':
	// 			cityInput.wheel(delta);
	// 			break;
	// 		case 'world':
	// 			break;
	// 	}
	// }); 
	$(document).mousewheel(function(event, delta, deltaX, deltaY) {
    // console.log(delta, deltaX, deltaY);
    switch(event.target.id) {
			case 'cityCanvas':
				preventDefault(event);
				cityInput.wheel(delta);
				break;
			case 'worldCanvas':
				worldInput.wheel(delta);
		}
});
	// $('#cityCanvas').mousewheel(function(e) {
	// 	(getCurrentPanel() == 'city') ? cityWheel(e) : worldWheel(e);
	// });


	// if (window.addEventListener) {
	//     window.addEventListener('DOMMouseScroll', wheel, false);
	// }
	// window.onmousewheel = document.onmousewheel = wheel;
}
function preventDefault(e) {
	e = e || window.event;
	if (e.preventDefault)
	  e.preventDefault();
	e.returnValue = false; 
}
var wheel = function(e) {
	var delta;
	if (e.wheelDelta) {  /* Chrome/IE/Opera. */
		delta = e.wheelDelta/120;
	} else if (e.detail) {
		delta = -e.detail/3;
	}
	switch(getCurrentPanel()) {
			case 'city':
				cityInputContr.wheel(delta);
				break;
			case 'world':
				break;
		}

	// var element = (e.srcElement) ? e.srcElement.id : e.originalTarget.id;
	
	
	
	// if (element == 'cityCanvas') {
	// 	preventDefault(e);
	// 	cityWheel(delta);
	// } else if (element == 'worldCanvas') {
	// 	preventDefault(e);
	// 	worldWheel(delta);
	// }
}



function cityBindInput(){
	//  No buttons yet. 

	cityCanvas.onselectstart = function () { return false; }
}

function worldBindInput() {
	// Buttons
	var zInButton = document.getElementById("zoomIn");
	var zOutButton= document.getElementById("zoomOut");
	var showCoordsButton = document.getElementById("showCoords");
	var moveArmyButton = document.getElementById('moveArmy');

	//Map the button being clicked to function handlers. 
	// zInButton.onclick = function(){worldWheel(-5)};
	// zOutButton.onclick= function(){worldWheel(5)};
	showCoordsButton.onclick = function(){
		showCords = !showCords;
		draw_hex_field();
	};
	moveArmyButton.onclick = toggleMovingArmy;
}
