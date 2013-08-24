// var mysql 	= require('mysql')
//   , fs 		= require('fs');
// var RM = require('./army-manager.js'); 
// var sio; 


// var db = mysql.createConnection({
//   host     : 'dbinstance.cgmcl2qapsad.us-west-2.rds.amazonaws.com',
//   user     : 'user',
//   password : 'password',
//   database : 'colludo',
// });

// var STARTING_WORLD = '/var/www/html/game_page/map_panel/colludoMap1.txt';
// var MAP_VERSION	= 10;//'/var/www/html/mapVersion.txt';

// var WORLD_ROWS = 48
//   , WORLD_COLS = 48
//   , WORLD_SEG_COLS = WORLD_COLS/8
//   , WORLD_SEG_ROWS = WORLD_ROWS/8;


// exports.announceTile = function() {
// 	exports.getSegById(getRandomInt(1, 30), function(err, segData){
// 		if (err){

// 		} else {
// 			sio.sockets.emit('map-piece', segData);
// 		}
// 	});
// }

// exports.setSegById = function(segId, mapSeg, callback) {
// 	var query = 'UPDATE map_segments SET tiles = ? WHERE id = ?'
// 	  , values = [JSON.stringify(mapSeg), segId+1];
// 	db.query(query, values, function(err, rows){
// 		if (err) {
// 			console.log('get seg Error!', err);
// 			callback(err);
// 		} else {
// 			callback(null);
// 		}
// 	});
// }

// // callback(err, tile)
// exports.getTileById = function(tileId, callback) {
// 	var row = Math.floor(tileId / WORLD_COLS)
// 	  , col = tileId % WORLD_COLS
// 	  , segRow = row>>3
// 	  , segCol = col>>3
// 	  , segId = (segRow * WORLD_SEG_COLS) + segCol
// 	  , segOff = ((row%8)*8) + (col%8);

// 	exports.getSegById(segId, function(err, mapSeg) {
// 		if (err) callback(err)
// 		else callback (null, mapSeg[segOff]);
// 	});
// }

// // getSegById : function(err, mapSeg)
// exports.getSegById = function(segId, callback) {
// 	var query
// 	  , values;
// 	query = "SELECT * FROM map_segments WHERE id = ?";
// 	values = [segId+1];
// 	db.query(query, values , function(err, rows){
// 		if (err) {
// 			callback(err)
// 		} else {
// 			// Parse the map segment then return the right tile. 
// 			// console.log('got segment from db', rows[0], segId);
// 			callback(null, JSON.parse(rows[0].tiles));
// 		}
// 	});
// }


// exports.getChanges = function(callback) {
// 	console.log('getting changes from db');
// 	var query = 'SELECT tile_id, city_id, army_id FROM map_events WHERE time > 0'
// 	  , values = [];
// 	db.query(query, values,	function(err, rows, fields){
// 		if (err) {
// 			console.log('db errror!',err);
// 			callback(null);
// 		} else {
// 			callback(rows);
// 		}
// 	});
// }

// exports.getVersion = function(callback) {
// 	fs.readFile('/derps.txt', 'utf8', function (err,data) {
// 		(err) ? callback(null) : callback(data);
// 	});
// }



// exports.setTile = function(tileId, cityId, armyId, session, callback, optTile) {
// 	console.log('inserting tile change into db.', 'tileid :', tileId, 'cityid :',cityId, 'armyid :', armyId);
// 	var row = Math.floor(tileId / WORLD_COLS)
// 	  , col = tileId % WORLD_COLS
// 	  , segRow = row>>3
// 	  , segCol = col>>3
// 	  , segId = (segRow * WORLD_SEG_COLS) + segCol
// 	  , segOff = ((row%8)*8) + (col%8)
// 	  , segId = segIdFromTileId(tileId);

// 	exports.getSegById(segId, function(err, mapSeg) {
// 		if (armyId > 0 && mapSeg[segOff][3] > 0) {
// 			console.log('detecting a collision!');
// 			// army is tring to land on top of another. 
// 			RM.handleCollision(session, armyId, mapSeg[segOff], optTile);

// 		// else ask if there exists an army going on an undefended city. 
// 		} else {
// 			if (armyId >= 0) {
// 				mapSeg[segOff][3] = armyId;
// 			}

// 			if (cityId >  0) mapSeg[segOff][2] = cityId;
// 			// set changes into map. 
// 			sio.sockets.emit('setTile', {'tileId' : tileId, 'cityId' : cityId, 'armyId' : armyId});

// 			if(session && session.user && armyId > 0 && mapSeg[segOff][2] >0 && JSON.parse(session.user.cities).indexOf(mapSeg[segOff][2])<0 ) {
// 				RM.raidCity(session, armyId, mapSeg[segOff][2], optTile);
// 			}

// 			exports.setSegById(segId, mapSeg, function(err){
// 				if(err) console.log('setTile Error. ', err);
// 				if(callback) callback();
// 			});
// 		}
// 	});
// }

// function now() {
// 	var d1 = new Date("January 1, 2013 12:00:00");
// 	var d2 = new Date();
// 	return d2.getTime() - d1.getTime();
// }


// function initArmyMovements() {
// 	var query = 'SELECT time, army_id, tile_id_old, tile_id_new FROM army_movements WHERE time >= ?'
// 	  , values = [now()]
// 	  , waitTime
// 	  , startTile
// 	  , endTile;
// 	db.query(query, values, function(err, rows, fields){
// 		if (err) {
// 			console.log('db errror!',err);
// 		} else if (rows.length > 0) {
// 			for (var i = 0; i < rows.length; i++) {
// 				exports.addArmyMovement(rows[i].time, rows[i].army_id,
// 					rows[i].tile_id_old, rows[i].tile_id_new);
// 			}
// 		} else {
// 			// Do nothing. 
// 		}
// 	});
// }

// exports.init = function(io) {
// 	sio = io;
// 	initArmyMovements();
// }

// function armyMove(oldTileId, newTileId, armyId, session) {
// 	// set city to null because it is not being changed. 
// 	RM.removeFromBattle(armyId);
// 	exports.setTile(newTileId, null, armyId, session, function(){
// 		exports.setTile(oldTileId, null, 0, session, function(){

// 		}); // add army to new tile.
// 	}, oldTileId);// remove army form old tile.
// }

// exports.handleArmyMovement = function(delay, session, armyId, oldTileId, newTileId) {
// 	console.log('adding movement to server', armyId, oldTileId, newTileId);
// 	exports.getSegById(segIdFromTileId(newTileId), function(err, segData){
// 		var row = Math.floor(newTileId / WORLD_COLS);
// 		var col = newTileId % WORLD_COLS;
// 		var segOff = ((row%8)*8) + (col%8);
// 		var newTile = segData[segOff];

// 		// trying to move to river or mountain.
// 		if (newTile[1] == 2 || newTile[1] == 3 || newTile[1] == 5) {
// 			return;
// 		}
// 		setTimeout( function() {
// 			armyMove(oldTileId, newTileId, armyId, session);
// 		}, delay);
// 	});
// }

// // callback(err, tileId)
// exports.getFreeTile = function(callback){
// 	// console.log('inserting city', cityId);
// 	var segId 
// 	  , tileId
// 	  , row
// 	  , col
// 	  , segRow
// 	  , segCol
// 	  , segOff;

// 	tileId = getRandomInt(0, WORLD_ROWS * WORLD_COLS);
// 	segId = segIdFromTileId(tileId);
// 	row = Math.floor(tileId / WORLD_COLS);
// 	col = tileId % WORLD_COLS;
// 	segOff = ((row%8)*8) + (col%8);

// 	exports.getSegById(segId, function(err, mapSeg) {
// 		// console.log('got tile', tileId,  segOff, segId, mapSeg);
// 		if ((mapSeg[segOff][1] == 0) && (mapSeg[segOff][2] == 0) && (mapSeg[segOff][3] == 0)){
// 			callback(null, tileId);
// 		} else {
// 			exports.getFreeTile(callback);
// 		}
// 	});
// }

// function segIdFromTileId (tileId) {
// 	var segId
// 	  , row
// 	  , col
// 	  , segRow
// 	  , segOff;
// 	row = Math.floor(tileId / WORLD_COLS);
// 	col = tileId % WORLD_COLS;
// 	segRow = row>>3;
// 	segCol = col>>3;
// 	segId = (segRow * WORLD_SEG_COLS) + segCol;  
// 	return segId;
// }

// // Random number [min, max) inclsuive, exclusive. 
// function getRandomInt (min, max) {
//     return Math.floor(Math.random() * (max - min)) + min;
// }
