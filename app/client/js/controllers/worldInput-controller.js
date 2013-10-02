var deltV = 100; 
var bounds = {
	scrollMax: 420,
	scrollMin: 50
};
function WorldInput() {

	// Buttons
		var showCoordsButton = document.getElementById("showCoords");
		var moveArmyButton = document.getElementById('moveArmy');
		showCoordsButton.onclick = function(){

		};
		moveArmyButton.onclick = function(){
			world.toggleMovingArmy();
		}

	$('#worldZoomSlider').slider({
		orientation: "vertical",
		range: "max",
		min: bounds.scrollMin,
		max: bounds.scrollMax,
		value: (bounds.scrollMax + bounds.scrollMin) - deltV,
		slide: function( event, ui ) {
			deltV = (bounds.scrollMax + bounds.scrollMin) - ui.value;
		}
	});
} 



WorldInput.prototype.mouseDown = function(e) {
	var hexes = hexesUnderMouse(e);
	// console.log('mouse down', scene.children);
	// create an array containing all objects in the scene with which the ray intersects
	if ( hexes.length > 0 ) {
		// this click is the placement of an army, we do not need to select the tile. 
		if (world.movingArmy) {
			world.movingArmy.moveTo(hexes[0].object);
			return;
		}
		if ( selectedTile && (selectedTile.tileId == hexes[0].object.tileId)) {
			scene.remove ( selectedTile );
			selectedTile = null;
		} else {
			if ( selectedTile ) {
				scene.remove ( selectedTile );
			}
			var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xF0F071, transparent: true, opacity:.5, } );
			selectedTile = new THREE.Mesh( hexes[0].object.geometry.clone(), outlineMaterial);
			selectedTile.position =	hexes[0].object.position.clone();
			selectedTile.scale.copy(hexes[0].object.scale).multiplyScalar(1.05);
			selectedTile.translateY(.1);
			selectedTile.name = 'hex';
			selectedTile.tileId = hexes[0].object.tileId;
			scene.add(selectedTile);
		}
	} 
}
WorldInput.prototype.mouseUp = function(e) {
	var hexes = hexesUnderMouse(e);
	// create an array containing all objects in the scene with which the ray intersects
	if ( hexes.length > 0 ) {

	}
}
WorldInput.prototype.keyDown = function(e) {
	var key = e.keyCode
		, dist = 40
		, esc = 27
		, left = 37
		, up = 38 
		, right = 39
		, down = 40
		, a = 65
		, w = 87
		, d = 68
		, s = 83;
}
WorldInput.prototype.mouseMove = function(e) {
	var hexes = hexesUnderMouse(e);
	if (hexes.length == 0) return;
	if (!world.movingArmy) return;
	// create an array containing all objects in the scene with which the ray intersects
	
	if (!selectedTile|| selectedTile.tileId != hexes[0].object.tileId) {
		if (selectedTile) {
			scene.remove (selectedTile);
		}
		var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xF0F071, transparent: true, opacity:.5, } );
		selectedTile = new THREE.Mesh( hexes[0].object.geometry.clone(), outlineMaterial);
		selectedTile.position =	hexes[0].object.position.clone();
		selectedTile.scale.copy(hexes[0].object.scale).multiplyScalar(1.05);
		selectedTile.translateY(.1);
		selectedTile.name = 'hex';
		selectedTile.tileId = hexes[0].object.tileId;
		scene.add(selectedTile);
	}
}
WorldInput.prototype.wheel = function(delta) {
	deltV += delta/30;
	$('#worldZoomSlider').slider('value', ((bounds.scrollMax + bounds.scrollMin)-deltV).toString());
}
