/*
	Army is a superset of the three js geometry object. It contains an object
	as well as functions for movement and such. 
*/
var Army = (function(){
	
	function Army(id, tileId, owner, soldiers, calvary, mesh) {
		var self = this;
		// create world object. 
		var geometry = new THREE.SphereGeometry( 6, 4, 4 );
		var material = new THREE.MeshLambertMaterial( { color: 0x333333 } );

		this.mesh = mesh || new THREE.Mesh( assets.geometries['army'], material );
		this.mesh.position = positionOfTile(tileId);
		// this.mesh.scale.set(.5,2,.5);

		// set info. 
		this.name = owner+'sarmyid'+id;
		this.id = id;
		this.tileId = tileId;
		this.soldiers = soldiers;
		this.calvary = calvary;

		this.labelOffset = new THREE.Vector3( -5, -10, 25 );
		console.log(this.labelOffset);
		var flag = document.createElement('img');
	  
	  flag.onload = function() {
			self.label = makeTextSprite( self.soldiers, flag,
				{ fontsize: 18, borderColor: {r:126, g:126, b:126, a:.8}, backgroundColor: {r:100, g:100, b:100, a:0.6} } );
			console.log(!!self.labelOffset);
			self.label.position.addVectors(self.mesh.position, self.labelOffset);
			scene.add( self.label );
		}
		flag.src = '/img/flags/usa.png';
		// flag.src = 'http://www.9jafiles.com/image/data/Usa-Flag.png';
	}

	/**
	* this function sits between the user clicking move and the actual request
	* to the server to move the army. We check it is a valid move and confirm any
	* attacks or events that will be th result of the move. 
	*/
	Army.prototype.moveTo = function(tile) {
	  var destCity = cityAt(tile)
	    , destArmy = armyAt(tile);

	  if(!validMove(tile)) return;

	  if (destArmy && !world.isAdjacent(this.tileId, destArmy)) {
	  	alert('Can only attack or merge with adjacent armies.');

	  } else if (destArmy && confirm('Attack enemy army?')) {
			this.attack(tile);

	  } else {
		  world.movingArmy = null;
		  scene.remove(selectedTile);
		  selectedTile = null;

		  var graphWithWeight = new Graph(world.tileTypes);
		  var startWithWeight = graphWithWeight.nodes[Math.floor(this.tileId/48)][this.tileId%48];
		  var endWithWeight = graphWithWeight.nodes[Math.floor(tile.tileId/48)][tile.tileId%48];
		  var geometry = new THREE.Geometry();
		  var material = new THREE.MeshBasicMaterial( { color: 0xF0F071, transparent: true, opacity:.5, } );
		  var path = [this.tileId];

		  geometry.vertices.push(this.mesh.position);
		  astar.search(graphWithWeight.nodes, startWithWeight, endWithWeight, true).map(function(e){
		    path.push((e.x*48)+e.y);
		    var particle = new THREE.Particle( material );
		    particle.position = positionOfTile((e.x*48)+e.y);
		    particle.position.y = 2;
		    scene.add( particle );
		    geometry.vertices.push( particle.position );
		  });
		  var line = new THREE.Line( geometry, material );
		  this.pathLine = line;
		  scene.add( line );
		  socket.emit('armyMovement', {armyId: this.id, path: path});
	  }
	};

	Army.prototype.attack = function(tile) {
		socket.emit()
	}
	return Army;
})();