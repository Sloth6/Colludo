var mysql 	= require('mysql');

var db = mysql.createConnection({
	host     : 'dbinstance.cgmcl2qapsad.us-west-2.rds.amazonaws.com',
	user     : 'user',
	password : 'password',
	database : 'colludo', 
});

module.exports = db;