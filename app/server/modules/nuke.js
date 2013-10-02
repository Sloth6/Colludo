var mysql 	= require('mysql');
  // , fs 		= require('fs');
var World = require('./world-manager.js');
var armyManager = require('./army-manager.js');
var cityManager = require('./city-manager.js');
var db = require('./db.js');


exports.NUKE = function(){
	db.query("TRUNCATE TABLE armies", function(){});
	db.query("TRUNCATE TABLE battles", function(){});
	db.query("TRUNCATE TABLE cities", function(){});
	db.query("TRUNCATE TABLE map_events", function(){});
	db.query("TRUNCATE TABLE messages", function(){});
	db.query("TRUNCATE TABLE users", function(){});
	console.log('SERVER NUKED.');


	var world = new World(48,48);
	armyManager.loadWorld(world, function() {
		cityManager.loadWorld(world, function() {
			console.log('SERVER LOADED', world.content);
		});
	});
	global.world = world;

	return;
}