
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

var view = new THREE.Vector3(0,0,0);

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
	camera.position.set(0,100,1000);
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
	$('#ThreeJS canvas').attr('id', 'worldCanvas');
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
	var models = {
		field : 'field.js',
		mountain: 'mountain.js',
		ocean: 'ocean.js',
		cloud: 'cloud.js',
		desert: 'desert.js',
		tree: 'tree.js',
		army: 'army.js',
		city: 'city.js'
	};
	// var geometries = {}, materials = {};
	var n = 0;
	var pathTo = '/models/';
	for (var model in models) {
		(function(obj){
			jsonLoader.load(pathTo + models[obj], function(geometry, material) {
				n++;
				assets.geometries[obj] = geometry;
				assets.materials[obj] = new THREE.MeshFaceMaterial(material);
				if (n == Object.keys(models).length) {
					buildScene();
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
		camera.position.set(view.x, view.y + deltV, view.z + deltV);
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



function buildScene() 
{
	var sideLength = 9.9;
	var hexWidth = Math.sqrt(3) * sideLength;
	var hexHeight = 2 * sideLength;
	// var id;
	var hexGroup = new THREE.Object3D();
	var hex;
	var material = new THREE.MeshNormalMaterial();

	console.log('foobar',world.armies);

	for (var row = 0; row < world.rows; row++) {
		for (var col = 0 ; col < world.cols; col++) {
			switch(world.tileTypes[row][col]) {
				case 0:
					type = 'field';
					break;
				case 5:
					type = 'mountain';
					break;
				case 3:
				case 2:
					type = 'ocean';
					break;
				case 7:
					type = 'desert';
					break;
				default:
					type = 'tree';//tree
			}
			hex = new THREE.Mesh( assets.geometries[type], assets.materials[type]);

			hex.name = 'hex';
			hex.tileId = (row * world.cols + col);
			hex.tileType = type;
			hex.row = row;
			hex.col = col;

			if(row %2 ==0){
			  hex.translateX(col * hexWidth - world.cols/2 * hexWidth);
			} else {
			  hex.translateX((col * hexWidth) + hexWidth/2 - world.cols/2 * hexWidth);
			}
			hex.translateZ(row * 3/4* hexHeight - world.rows* hexHeight/2);
			if (type == 'mountain') {
				hex.scale.set(1,(Math.random()*1)+.1,1)
			} else if (type == 'field') {
				hex.scale.set(1,.1,1)
			} else {
				hex.scale.set(1.0,.1,1.0);
			}
			hexGroup.add(hex);
		}
	}
	scene.add(hexGroup);
}


/*
	called by onload listener. 
*/
function fillWorld(armies, cities, battles, callback) {
	var sideLength = 9.9;
	var hexWidth = Math.sqrt(3) * sideLength;
	var hexHeight = 2 * sideLength;

	for (var armyId in armies) {
		world.addArmy(armies[armyId]);
	}

	for (var cityId in cities) {
		var city = cities[cityId];
		world.addCity(city);

	}

	world.battles = [];
	if(callback) callback();
}


function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 2;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

	var spriteAlignment = THREE.SpriteAlignment.bottomLeft;
		
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100,50,1.0);
	sprite.width = textWidth + borderThickness;
	return sprite;	
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fill();
	ctx.stroke();   
}


function raidCity(){
	return;
}

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