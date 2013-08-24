exports.selectAll = selectAll;

var mysql 	= require('mysql');
var db = mysql.createConnection({
  host     : 'dbinstance.cgmcl2qapsad.us-west-2.rds.amazonaws.com',
  user     : 'user',
  password : 'password',
  database : 'colludo',
});

function selectAll(callback) {
	var query = 'SELECT * FROM battles';
	db.query(query, function(err, rows) {
		 if (err) {
		 	callback(err);
		 } else {
		 	callback(null, rows);
		 }
	});
}