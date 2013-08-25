
exports.raidCity = function(session, armyId, cityId, oldTileId) {
	console.log('raid city!', cityId);
	exports.getArmyData(armyId, 'server', function(err, army) {
		CM.getCityData(cityId, 'server', function(cityData) {
			cityData.resources.crop -= 100;
			army.crop += 100;
			setArmyData(army);
			CM.updateCityData(cityData, function(){});
			sio.sockets.in(army.username).emit('armyData', army);
			console.log(cityData);
		});
	});
}



// exports.init = function (io){
// 	sio = io;
// 	setInterval(updateBattles, 5000);
// }

exports.getBattleData = function(session, callback) {
	var armies = '(' + session.user.armies.substr(1, session.user.armies.length-2) + ')'
	  , query = 'SELECT id, attacker_tile_id, defender_tile_id FROM battles WHERE attacker_id IN '+armies+' OR defender_id IN '+armies
	  , battles = [];
	console.log('armies', armies);
	if (!armies.length) {
		callback([]);
	} else {
		db.query(query, function(err, rows) {
			if (rows.length) {
				for (var i = 0; i < rows.length; i++) {
					battles[rows[i].id] = {
						'defTileId' : rows[i].defender_tile_id,
						'atkTileId' : rows[i].attacker_tile_id};
				};
				console.log('SENT BATTLE DATA', battles);
			}
			callback(battles);
		});
	}
}

function updateBattles() {
	var query = 'SELECT * FROM battles'
	  , i;

	db.query(query, function (err, rows, fields){
		// console.log(rows);
		for (i = 0; i < rows.length; ++i) {
			updateBattle(rows[i]);
		};
	});
}

exports.removeFromBattle = function(armyId) {
	var query = 'SELECT * from battles where attacker_id = ? OR defender_id = ?'
	  , values = [armyId, armyId];
	 db.query(query, values, function (err, rows){
	 	console.log(rows);
	 	if(err){
	 		console.log('removeFromBattle Error!', err);
	 	} else if(rows.length){
	 		deleteBattle(rows[0]);
	 	}
	 })
}

function usernameByArmyId(armyId, callback) {
	var query = 'SELECT username FROM armies where id = ?'
	  , values = [armyId];

	db.query(query, values, function(err, rows){
		if (err) {
			callback(err);
		} else if (!rows.length) {
			callback('not-found');
		} else {
			callback(null, rows[0].username);
		}
		
	})
}

function updateBattle(battle){
	var armyA, armyB;
	console.log('updating battle', battle);
	exports.getArmyData(battle.attacker_id, 'server', function(err, armyA) {
		if(err)return console.log(err);
		exports.getArmyData(battle.defender_id, 'server', function(err, armyB) {
			if(err)console.log(err);
			console.log(armyA, armyB);
			armyA.soldiers-=1;
			armyB.soldiers-=1;

			if (armyA.soldiers <=0){
				deleteBattle(battle);
				deleteArmy(armyA, battle.attacker_tile_id);
				armyB.crop += armyA.crop;
				setArmyData(armyB);
			} else {
				setArmyData(armyA);
			}

			if (armyB.soldiers <= 0) {
				deleteBattle(battle);
				deleteArmy(armyB, battle.defender_tile_id);
				armyA.crop += armyB.crop;
				setArmyData(armyA);
			} else {
				setArmyData(armyB);
			}
			sio.sockets.in(battle.defender_name).emit('armyData', armyB);
			sio.sockets.in(battle.attacker_name).emit('armyData', armyB);
			sio.sockets.in(battle.attacker_name).emit('armyData', armyA);
			sio.sockets.in(battle.defender_name).emit('armyData', armyA);

		});
	});
	
}

function startBattle(session, armyIdA, armyIdB, tileId, oldTileId, callback) {
	usernameByArmyId(armyIdB, function(err, usernameB) {
		if (err) console.log('usernameByArmyId error!',  err);
		else {
			console.log('startBattle', session.user.username, tileId, oldTileId);
			var query ='INSERT INTO battles(attacker_id, defender_id, attacker_tile_id,'+
				' defender_tile_id, attacker_name, defender_name) VALUES (?, ?, ?, ?, ?, ?)'
			  , values = [armyIdA, armyIdB, oldTileId, tileId,  session.user.username, usernameB];
			db.query(query, values, function(err, rows) {
				if (err) {
					console.log('startBattle error!', err);
					callback(err);
				} else {
					console.log('sending start battle', rows.insertId);
					sio.sockets.in(session.user.username).emit('battle',
						{'a' : armyIdA, 'b' : armyIdB, 'defTileId' : tileId,  'atkTileId': oldTileId, 'id' : rows.insertId});
					sio.sockets.in(usernameB).emit('battle',
						{'a' : armyIdA, 'b' : armyIdB, 'defTileId' : tileId,  'atkTileId': oldTileId, 'id' : rows.insertId});
					callback(null, rows.insertId);
				}
			});
		}
	});
			
}