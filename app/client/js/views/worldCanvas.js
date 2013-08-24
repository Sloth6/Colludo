
function buildScene( geometries, materials ) 
{
	var sideLength = 9.9;
	var hexWidth = Math.sqrt(3) * sideLength;
	var hexHeight = 2 * sideLength;
	// var id;
	var hexGroup = new THREE.Object3D();
	var hex;
	var material = new THREE.MeshNormalMaterial();


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
					type = 'tree';
			}
			hex = new THREE.Mesh( geometries[type], materials[type]);

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
				hex.scale.set(1,(Math.random()*3)+1,1)
			} else if (type == 'field') {
				hex.scale.set(1,(Math.random()/2)+.1,1)
			} else {
				hex.scale.set(1.0,1.0,1.0);
			}
			hexGroup.add(hex);

		}
	}
	scene.add(hexGroup);
}



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
