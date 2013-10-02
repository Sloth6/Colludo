exports.select = select;
exports.selectAll = selectAll;
exports.deleteArmy = deleteArmy;
exports.insert = insert;
// var db = require('/var/www/html/colludo/app/server/modules/db.js');
var db = require(__dirname + '/../db.js');


function formatArmy(army) {
	return {
		'id'	: army.id,
		'userId' : army.player_id,
		'user'   : army.username,
		'tileId' : army.tile_id,
		'soldiers' : army.soldiers,
		'calvary' : army.calvary
	}
}

function select(armyId, callback) {
	var query = 'SELECT id, player_id, username, tile_id, soldiers, calvary'+
		' FROM armies WHERE id = ?'
	  , values = [armyId];		
	db.query(query, values, function(err, rows) {
		 if (err) {
		 	callback(err);
		 } else {
		 	callback(null, formatArmy(rows[0]));
		 }
	});
}

function selectAll(callback) {
	var query = 'SELECT id, player_id, username, tile_id, soldiers, calvary FROM armies'
	db.query(query, function(err, rows) {
		 if (err) {
		 	callback(err);
		 } else {
		 	// console.log(rows);
		 	callback(null, rows.map(formatArmy));
		 }
	});
	
}

function deleteArmy(army, tileId) {
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

function insert(userId, tileId, username, army, callback) {
	var query = 'INSERT INTO armies(player_id, tile_id, soldiers, calvary,'+
		' username)VALUES (?, ?, ?, ?, ?)';
	var soldiers = (army.soldiers) ? army.soldiers : 0;
	var calvary = (army.calvary) ? army.calvary : 0;
	var values = [userId, tileId, soldiers, calvary, username];
	db.query(query, values, function(err, rows) {
		if (err) callback(err);
		else callback(null, rows.insertId);			
	});
}