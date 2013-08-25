// var db = require('/var/www/html/colludo/app/server/modules/db.js');
var db = require(__dirname + '/../db.js');

exports.selectAll = selectAll;
exports.select = select;
exports.insert = insert;

var fields = 'id, player1Id, player2Id, from1To2, from2To1, recurrence, occurances';

function insert(c) {
	var query = 'INSERT into contracts(player1Id, player2Id, from1To2, from2To1, recurrence, occurances) '+
		'VALUES';
}

function selectAll(callback) {
	var query = 'SELECT '+fields+' FROM contracts';
	db.query(query, function(err, rows) {
		if (err) return callback(err);
		callback(null, rows);
	});
}


function select(id, callback) {
	var query = 'SELECT '+fields+' FROM contracts WHERE id = ?';
	var values = [id];		
	db.query(query, values, function(err, rows) {
		 if (err) return callback(err);
		 callback(null, rows[0]);
	});
}
