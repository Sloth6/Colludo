var mysql 	= require('mysql')
  , fs 		= require('fs');

var db = mysql.createConnection({
  host     : 'dbinstance.cgmcl2qapsad.us-west-2.rds.amazonaws.com',
  user     : 'user',
  password : 'password',
  database : 'colludo',
});

exports.NUKE = function(){
	db.query("TRUNCATE TABLE armies", function(){});
	db.query("TRUNCATE TABLE battles", function(){});
	db.query("TRUNCATE TABLE cities", function(){});
	db.query("TRUNCATE TABLE map_events", function(){});
	db.query("TRUNCATE TABLE messages", function(){});
	db.query("TRUNCATE TABLE users", function(){});
	console.log('SERVER NUKED.');
	return;
}