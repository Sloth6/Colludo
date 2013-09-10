function hexesUnderMouse(e) {
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	e.preventDefault();
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize());
	var intersects = ray.intersectObjects( scene.children[2].children );
	var hexes = intersects.filter(function(object) {return (object.object.name == 'hex')});
	return hexes;
}

function worldMouseDown(e) {
	var hexes = hexesUnderMouse(e);
	console.log('mouse down', scene.children);

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
function worldMouseUp(e) {
	var hexes = hexesUnderMouse(e);
	// create an array containing all objects in the scene with which the ray intersects
	if ( hexes.length > 0 ) {

	}

}
function worldKeyDown(e) {
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
function worldMouseMove(e) {
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
function worldWheel(delta) {
}
function raidCity(){
	return;
}

function validMove(tile)
{
	if (tile.tileType == 'ocean') {
	alert('Armies Can\'t swim!');
	return false;
	} else if (tile.tileType == 'mountain') {
	alert('Can\'t climb mountains!');
	return false;
	}
	return true;
}

function armyAt(tile) {
	if (!world.content[tile.tileId])
	return null;
	if (!world.content[tile.tileId].army)
	return null;
	return world.content[tile.tileId].army;
}

function cityAt(tile) {
	if (!world.content[tile.tileId])
	return null;
	if (!world.content[tile.tileId].city)
	return null;
	return world.content[tile.tileId].city;
}

////////////////////////////////////////////////////////////////////////////////
/*
	MAP CONTROLER
 */
////////////////////////////////////////////////////////////////////////////////
/*
	Make the map center over any arbitrary tile.
*/
function positionOfTile( tileId ) {
	var row = Math.floor(tileId/world.cols)
		, col = Math.floor(tileId%world.cols)
		, sideLength = 9.9
		, hexWidth = Math.sqrt(3) * sideLength
		, hexHeight = 2 * sideLength
		, pos = new THREE.Vector3( 0, 0, 0 );

	if( row %2 == 0 ){
		pos.x = (col * hexWidth - world.cols/2 * hexWidth);
	} else {
		pos.x = ((col * hexWidth) + hexWidth/2 - world.cols/2 * hexWidth);
	}
	pos.z = (row * 3/4* hexHeight - world.rows* hexHeight/2);
	
	return pos; 
}

function setViewToTileId( tileId ) { 
	var goTo = positionOfTile( tileId );

	tween = new TWEEN.Tween( view )
	.to( goTo, 1000 )
	.easing( TWEEN.Easing.Quadratic.Out )
	.onUpdate( function () {
	 } )
	.start();
}

function setViewToTile( tile ) {
	tween = new TWEEN.Tween( view )
	.to( tile.position, 1000 )
	.easing( TWEEN.Easing.Quadratic.Out )
	.onUpdate( function () {
	 } )
	.start();
}

////////////////////////////////////////////////////////////////////////////////
/*
	UTILITIES 
 */
////////////////////////////////////////////////////////////////////////////////


var rendererStats	 = new THREEx.RendererStats();


// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var projector, mouse = { x: 0, y: 0 }, selectedTile;
var deltV = 100; 
var view = new THREE.Vector3(0,0,0);

var bounds = {
	scrollMax: 420,
	scrollMin: 50
};
var tween;

init();
animate();

// FUNCTIONS	
function init() {
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.left = '100px';
	stats.domElement.style.zIndex = 100;
	$('#world')[0].appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.PointLight(0xffffff, 2);
	light.position.set(200,400,400);
	scene.add(light);

	// // SKYBOX/FOG
	// var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	// var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	// var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	// // scene.add(skyBox);
	// scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	renderer.setFaceCulling( THREE.CullFaceBack );
	////////////
	// CUSTOM //
	////////////
	var jsonLoader = new THREE.JSONLoader();
	var models = {field : 'field.js', mountain: 'mountain.js', ocean: 'ocean.js',cloud: 'cloud.js', desert: 'desert.js', tree: 'tree.js'};
	var geometries = {}, materials = {};
	var n = 0;
	var pathTo = '/models/';
	for (var model in models) {
		(function(obj){
			jsonLoader.load(pathTo + models[obj], function(geometry, material) {
				n++;
				geometries[obj] = geometry;
				materials[obj] = new THREE.MeshFaceMaterial(material);
				if (n == Object.keys(models).length) {
					buildScene(geometries, materials);
				}
			});
		})(model);
	}

	// var ambientLight = new THREE.AmbientLight(0x111111);
	// scene.add(ambientLight);


	rendererStats.domElement.style.position = 'absolute'
	rendererStats.domElement.style.left = '0px'
	rendererStats.domElement.style.bottom	 = '0px'
	 $('#world')[0].appendChild( rendererStats.domElement );
	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();
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
	// when the mouse moves, call the given function
	// document.addEventListener( 'mousedown', onDocumentMouseDown, false );	
}

Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};


function animate() {
	requestAnimationFrame( animate );
	render();	 
	update();
}


var cX = 0;
function update() {
	// console.log(c);
	if(cityCanvas){
	if(cX % 100 == 0) {
		ri = [];
		cX = 0;
		drawRivers(cityCtx, cityCanvas.width, cityCanvas.height);
		drawMap();
		selectionContr.drawSelected();
		// drawFoo()
	}
	cX++;
}
	// console.log(getCurrentPanel());
	if (getCurrentPanel() === 'world') {
		if ( keyboard.pressed("W"))
			view.z -=3 ;

		if ( keyboard.pressed("S"))
			view.z +=3;

		if ( keyboard.pressed("A"))
			view.x -=3;

		if ( keyboard.pressed("D"))
			view.x +=3;

		if ( keyboard.pressed("down") && ((deltV -3 >= bounds.scrollMin))) {
			deltV -= 3;

			$('#worldZoomSlider').slider('value', ((bounds.scrollMax + bounds.scrollMin)- deltV).toString());
		} else if ( keyboard.pressed("up")	&& (deltV +3 <= bounds.scrollMax)) {
			deltV +=3;
			$('#worldZoomSlider').slider('value', ((bounds.scrollMax + bounds.scrollMin)- deltV).toString());
		}

		if ( keyboard.pressed("J") && selectedTile) {
		 	setViewToTile(selectedTile);
		}
		// look.set(camera.position.x, camera.position.y-deltV, camera.position.z-deltV);
		camera.position.set(view.x, view.y + deltV, view.z + deltV*2/3);
		camera.lookAt(view);
		
		// controls.update();
		if (tween)
			TWEEN.update();

	} else {
		var delt = tileWidth/10;
		if ( keyboard.pressed("W")) {
			cityView.y-=delt;
			drawMap();
			selectionContr.drawSelected();
		}
		if ( keyboard.pressed("S")) {
			cityView.y+=delt;
			drawMap();
			selectionContr.drawSelected();
		}
		if ( keyboard.pressed("A")) {
			cityView.x-=delt;
			drawMap();
			selectionContr.drawSelected();
		}
		if ( keyboard.pressed("D")) {
			cityView.x+=delt;
			drawMap();
			selectionContr.drawSelected();
		}
	}
	stats.update();
	rendererStats.update(renderer);
}

function render() {
	renderer.render( scene, camera );
}