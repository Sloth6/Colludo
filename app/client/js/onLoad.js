var socket = io.connect('http://204.236.234.28:8080');
// var socket = io.connect('http://localhost:8080');


var player;
// {
// 	'cities'
//  'armies'
// 	'name'
// 	'readMsgs'
// 	'unreadMsgs'
// };


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
	'field', 
	'river0', 'river1', 'river2',
	'Trees0','Trees1','Trees2',
	'rocks', 'sawmill',
	'mine', 'house', 'farm', 'capital', 'barracks',
	'stable', 'warehouse', 'cranny', 'tavern'];

var cityTileImgs = {};//Image objects array.


loadImages(mapTilePath, mapTileNames, mapTiles, function(){
	haveImages = true;
});
var haveCityImages = false;
loadImages2(cityTilePath, cityTileNames, cityTileImgs, function(){
	haveCityImages = true;
});
	
$(document).ready(function() {
	'use strict';
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

	bindMouse();
	cityBindInput();
	cityBindUI();

	worldBindInput();

	onLoadRequests();

	$(window).on('resize', function() {
		var mapWidth = parseInt($('#view').css('width').slice(0, -2));
		var mapHeight = parseInt($('#view').css('height').slice(0, -2));
		cityCanvas.setAttribute('width', mapWidth);
		cityCanvas.setAttribute('height', mapHeight);
		drawMap();
	});
});

// name that panel!
function getCurrentPanel() {
	var active = $('li.active')[0];
	if(active)
		return active.id.split('-')[0];
}

function loadImages(tilePath, imageNames, imageArr, callback) {
	var loadedImagesCount = 0;
	for (var i = 0; i < imageNames.length; i++) {
	    var image = new Image();
	    image.src = tilePath+imageNames[i];
	    image.onload = function(){
	        loadedImagesCount++;
	        if (loadedImagesCount >= imageNames.length) {	            
				//Get update the player model with server info.
				callback();
	        }
	    }
	    imageArr.push(image);
	}
}
function loadImages2(tilePath, imageNames, imageArr, callback) {
	var loadedImagesCount = 0;
	for (var i = 0; i < imageNames.length; i++) {
    var image = new Image();
    image.src = tilePath+imageNames[i]+'.png';
    image.onload = function(){
    	loadedImagesCount++;
    	if (loadedImagesCount >= imageNames.length) {	            
				//Get update the player model with server info.
				callback();
       }
    }
    imageArr[imageNames[i]] = image;
	}
}

function bindMouse(){
	$(document).keydown(function(e){
		(getCurrentPanel() == 'city') ? cityKeyDown(e) : worldKeyDown(e);
	});
	$(document).mousedown(function(e){
		var DOMId = e.target.id;
		if ((getCurrentPanel() == 'city')
			&&(e.target.id == 'cityCanvas' || DOMId == 'navbar-container')) {
			cityMouseDown(e);
		} else if (e.target.id == '') {
			worldMouseDown(e);
		} else {
			// Do nothing, button handlers will take care of it. 
		}
	});
	$(document).mouseup(function(e){
		var DOMId = e.target.id;
		if ((getCurrentPanel() == 'city')
			&&(e.target.id == 'cityCanvas' || DOMId == 'navbar-container')) {
			cityMouseUp(e);
		} else if (e.target.id == 'worldCanvas') {
			worldMouseUp(e);
		} else {
			// Do nothing, button handlers will take care of it. 
		}
	});
	$(document).mousemove(function(e){
	 	(getCurrentPanel() == 'city') ? cityMouseMove(e) : worldMouseMove(e);
	});
	// $('#cityCanvas').mousewheel(function(e) {
	// 	(getCurrentPanel() == 'city') ? cityWheel(e) : worldWheel(e);
	// });


	if (window.addEventListener) {
	    window.addEventListener('DOMMouseScroll', wheel, false);
	}
	window.onmousewheel = document.onmousewheel = wheel;


	// // IE9, Chrome, Safari, Opera
	// $('#cityCanvas').bind('mousewheel', wheel);

	// Firefox
	// $('#cityCanvas').bind('DOMMouseScroll', cityWheel);

	// $('#worldCanvas').bind('mousewheel', worldWheel);

}
function wheel(e) {
	var delta;
	var element = (e.srcElement) ? e.srcElement.id : e.originalTarget.id;
	
	if (e.wheelDelta) {  /* Chrome/IE/Opera. */
		delta = e.wheelDelta/120;
	} else if (e.detail) {
		delta = -e.detail/3;
	}
	
	if (element == 'cityCanvas') {
		preventDefault(e);
		cityWheel(delta);
	} else if (element == 'worldCanvas') {
		preventDefault(e);
		worldWheel(delta);
	}
}

function preventDefault(e) {
	e = e || window.event;
	if (e.preventDefault)
	  e.preventDefault();
	e.returnValue = false; 
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
	var attackButton = document.getElementById('attack');
	//Map the button being clicked to function handlers. 
	// zInButton.onclick = function(){worldWheel(-5)};
	// zOutButton.onclick= function(){worldWheel(5)};
	showCoordsButton.onclick = function(){
		showCords = !showCords;
		draw_hex_field();
	};
	moveArmyButton.onclick = function(){world.toggleMovingArmy();};
	attackButton.onclick = function(){alert('Implement me!');};
}