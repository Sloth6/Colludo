var armiesTable = require('./mysql/armies.js');
var db = require('./db.js');

module.exports.init = init;
module.exports.setArmyData  = setArmyData;
module.exports.loadWorld = loadWorld;
module.exports.createArmy = createArmy;
module.exports.move = move;

var sio;

function init(initSio, initDb) {
	sio = initSio;
}

function loadWorld(world, callback) {
	armiesTable.selectAll(function(err, armies) {
		if (err) console.log('LOAD ARMIES ERR', err);
		else {
			armies.forEach(function(army) {
				world.addArmy(army);
			});
			if (callback) callback();
		}
	});
}

/**
* createArmy - put the army in the disc and memory instances of the world.  
* callback(err, armyId)
*/
function createArmy(world, userId, tileId, username, army, callback) {
	armiesTable.insert(userId, tileId, username, army, function(err, armyId) {
		if (err) return callback(err);
		armiesTable.select(armyId, function(err, army){
			if (err) return callback(err);
			var sio = require('./sockets.js').sio;
			sio.sockets.emit('newArmy', army);
			world.addArmy(army);
			callback(null, army);
		});
	});
}

function move(armyId, oldTile, newTile, callback) {
	var world = require('./world-manager.js');
	if(world.content[newTile] && world.content[newTile].army){
		console.log('An army path was blocked, tileId:', newTile);
		callback('Path Blocked!');
	} else {
	// exports.removeFromBattle(armyId);
		sio.sockets.emit('moveArmy', {
			'oldTile': oldTile,
			'newTile': newTile,
			'armyId': armyId
		});

	  if (world.content[newTile]) {
	    world.content[newTile].army = armyId;
	  } else {
	     world.content[newTile] = {'army': armyId};
	  }
	  world.content[oldTile].army = null;
	  world.armies[armyId].tileId = newTile;

		var query = 'UPDATE armies SET tile_id = ? WHERE id = ?'
		  , values = [newTile, armyId];
		db.query(query, values, function(err) {
			if (err) console.log('move army error!', err);
			else if (callback) callback();
		});
	}
}

// currently uses deleteArmy of the id, w=needs to be the army object
function mergeArmies(session, armyIdA, tile) {
	var armyIdB = tile[3];
	exports.getArmyData(armyIdA, session, function(err, armyA){
		if (err) {
			console.log('get army error!', err);
		} else {
			exports.getArmyData(armyIdB, session, function(err, armyB){
				if (err) {
					console.log('get army error!', err);
				} else {
					// we now have data on both armies. 
					armyB.soldiers += armyA.soldiers;
					armyB.calvary += armyA.calvary;
					armyB.scouts += armyA.scouts;
					armyB.supply_wagons += armyA.supply_wagons;
					armyB.crop += armyA.crop;
					armyB.wood += armyA.wood;
					armyB.ore += armyA.ore;

					deleteArmy(armyIdA);
					setArmyData(session, armyB);
					sio.sockets.in(session.user.username).emit('armyData', {'armyId' : armyIdA, 'soldiers' : 0, 'calvary' : 0});
					sio.sockets.in(session.user.username).emit('armyData', armyB);
				}
			});
		}
	});
	
}
function deleteArmy(army, tileId){
	console.log('calling delete army', army);
	var query = 'DELETE FROM armies WHERE id = ?'
	  , values = [army.id];
	db.query(query, values, function(err){
		if (err) {
			console.log('deleteArmy data!', err);
		} else {
			console.log('deleted army from database!');
			MS.setTile(tileId, null, 0, 'server');
		}
	});

}

function deleteBattle(battle){
	var query = 'DELETE FROM battles WHERE id = ?'
	  , values = [battle.id];
	db.query(query, values, function(err){
		if (err) {
			
		} else {
			sio.sockets.in(battle.attacker_name).emit('endBattle', {'id' : battle.id}); 
			sio.sockets.in(battle.defender_name).emit('endBattle', {'id' : battle.id}); 
			console.log('deleted Battle!', err);
		}
	});
}



function setArmyData(armyData, callback){
	var query = 'UPDATE armies SET '+
		'player_id = ?, ' +
		'username = ?, ' +
		'soldiers = ?, ' +
		'calvary = ?, ' +
		'scouts = ?, ' +
		'supply_wagons = ?, ' +
		'crop = ?, ' +
		'wood = ?, ' +
		'ore = ? ' +
		'WHERE id = ?',
	values = [
		armyData.userId,
		armyData.username,
		armyData.soldiers,
		armyData.calvary,
		armyData.scouts,
		armyData.supplyWagons,
		armyData.crop,
		armyData.wood,
		armyData.ore,
		armyData.id
	]
	db.query(query, values, function(err){
		if (err) {
			console.log('setArmyData Error!', err);
		} else {
			if(callback)callback();
		}
	});
}

// the armyID owned by session is currently trying to enter the tile. 
exports.handleCollision = function(session, armyIdA, tile, oldTileId) {
	armyIdB = tile[3];
	// check if we are merging armies. 
	if (session.user.armies.indexOf(armyIdB) >= 0) {
		// mergeArmies(session, armyIdA, tile);
	} else {
		// fighting time!!!
		startBattle(session, armyIdA, armyIdB, tile[0], oldTileId, function(err, battleId) {
			if (err) console.log('startBattle error!', err);
			else console.log('started battle!!', battleId);
		});
	}
}
