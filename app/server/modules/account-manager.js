var db = require('./db.js');
var world = require('./world-manager.js');

var crypto = require('crypto');
var AM = require('./army-manager');
var CM = require('./city-manager');
var world = require('./world-manager.js');
var cityManager = require('./city-manager.js');

var sanitize = require('validator').sanitize


var startingArmy = {
	'soldiers'	: 10,
	'calvary'	: 0
};



exports.autoLogin = function(user, pass, callback) {
	db.query('SELECT * FROM users WHERE username = ?', [sanitize(user).xss()], function(err, rows, fields) {
		if ( (rows.length == 1) && (pass == rows[0].password) ) {
			callback(rows[0]);
		} else {
			// Set user data to null.
			callback(null);
		}
	});
}

exports.manualLogin = function(email, pass, callback) {
  	db.query('SELECT * FROM users WHERE email = ?', [sanitize(email).xss()], function(err, rows, fields) {
		if (err) callback(err);
		if (rows.length == 0) {
			callback('user-not-found');
		} else if (md5(pass) !== rows[0].password) {
			callback('invalid-password');
		} else {
			// Set err to null and return user data. 
			callback(null, rows[0]);
		}
	});
}

/* record insertion, update & deletion methods */
exports.addNewAccount = function(newData, callback) {
	if(newData.user != sanitize(newData.user).xss()) return callback('illigal-name');
	if(newData.email != sanitize(newData.email).xss()) return callback('illigal-email');

	console.log('Adding player ', newData.user, newData.email, newData.pass);	

	db.query('SELECT * FROM users WHERE username = ?', [newData.user], function(err, rows, fields) {
		if (err) return callback(err);
		if (rows.length != 0) return callback('username-taken');
		
		db.query('SELECT * FROM users WHERE email = ?', [newData.email], function(err, rows2, fields) {
			if (err) return callback(err);
			if (rows2.length != 0) return callback('email-taken');

			register(newData, function(err) {
				if(err) callback(err);
				else callback(null);
			});
		});
	});
}

// This code is damn fine. 
// callback(err)
function register(userData, callback) {
	var userId
	  , cityId
	  , tileId
	  , armyId;
	addUser(userData, function (err, userId) {
		if (err) return callback(err);
		world.getFreeTile(function (err, tileId) {
			if (err) return callback(err);
			CM.createCity(world, userId, userData, tileId, function (err, city) {
				if (err) return callback(err);
				AM.createArmy(world, userId, tileId, userData.user, startingArmy, function (err, army) {
					if (err) return callback(err);
					updateUser(userId, city.id, army.id, function (err) {
						callback(null);		
					});
				});
			});
		});
	});
}

function addArmyToPlayer(sio, userData, armyId, callback){
	var query = 'UPDATE users SET armies = ? WHERE id = ?'
	  , armyList = JSON.parse(userData.armies);
	armyList.push(armyId);
	var values = [JSON.stringify(armyList), userData.id];

	db.query(query, values, callback);
	sio.sockets.in(userData.username).emit('newArmy', {'armyId' : armyId});
}

function eastCoastTime() {
	var d = new Date();
	var localTime = d.getTime();
	var localOffset = d.getTimezoneOffset() * 60000;
	var utc = localTime + localOffset;

	var offset = -4.0;   
	var NYC = utc + (3600000*offset);

	var d = new Date(NYC); 
	return(d.toDateString() + ' '+d.toLocaleTimeString()+ ' GMT-4 (eastCoastTime)');
}

//callback(err, userId)
function addUser(userData, callback) {
	query = 'INSERT INTO users(username, registered, email, password, cities, received_messages, sent_messages)'+
		'VALUES (?, ?, ?, ?, ?, ?, ?)';
	values = [userData.user, eastCoastTime(), userData.email, md5(userData.pass), '[]', '[]', '[]'];
	db.query(query, values, function(err, rows) {
		if (err) callback(err);
		else callback(null, rows.insertId);
	});
}
// callback(err, cityId)

// callback(err, tileId)
function addCityToWorldMap(cityId, callback) {
	// Put the city in the the word map.
	// Create a map_events event that the new city was made. 
	MM.insertRandCity(cityId, function(err, tileId) {
		if (err) {
			callback(err);
		} else {
			query = 'UPDATE cities SET tileId = ? WHERE id = ?';
			values = [tileId, cityId];
			db.query(query, values, function(err, rows) {
				if (err) {
					callback(err);
				} else {
					callback(null, tileId);
				}
			});
		}
	});
}

// callback(err)
function updateUser (userId, cityId, armyId, callback) {
	// 5. Update player with the new city id.
	var query = 'UPDATE users SET cities = ?, armies = ? WHERE id = ?';
	var values = [JSON.stringify([cityId]), JSON.stringify([armyId]), userId];
	db.query(query, values, function(err, rows) {
		if (err) callback(err);
		else callback(null);	
	});
}

function addArmyToMap (armyId, tileId, callback) {
	MM.addArmy(tileId, armyId, function(err) {
		if (err) {
			callback(err);
		} else {
			query = 'UPDATE cities SET tileId = ? WHERE id = ?';
			values = [tileId, cityId];
			db.query(query, values, function(err, rows) {
				if (err) {
					callback(err);
				} else {
					callback(null, tileId);
				}
			});
		}
	});
}


/* account lookup methods */

exports.deleteAccount = function(id, callback) {
	// db.query('DELETE FROM login_test WHERE email = ?', [newData.email], function(err, rows2, fields) {
	// 			console.log('usernames', rows2);
	// 			if (err) callback(err);

	// 			if (rows2.length != 0) {
	// 				callback('email-taken');
	// 			} else {
	// 				var query = 'INSERT INTO login_test(username, email, password) VALUES (?, ?, ?)';
	// 				db.query(query, [newData.user, newData.email, md5(newData.pass)], callback);
	// 			}
	// 		});
	// accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback) {
	// accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback) {
	// accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
	// 	callback(o ? 'ok' : null);
	// });
}

/*
	Given the session data, return all player data.
	callback(err, data)
*/
exports.getUserData = function (session, callback) {
	exports.getUserDataById(session.user.id, function(err, userData) {
		callback(err, userData);
	});

}

// callback (err, userData)
exports.getUserDataById = function(userId, callback) {
	var query = 'SELECT username, cities, armies, sent_messages, received_messages FROM users WHERE id = ?'
	  , values = [userId]
	  , userData;

	db.query(query, values, function(err, rows, cols) {
		if (err) {
			console.log('ERROR: getting userData for userId: '+userId, err);
			callback(err);
		} else if (rows.length == 1) {
			userData = {
				'cities' : JSON.parse(rows[0].cities),
				'armies' : JSON.parse(rows[0].armies),
				'name' : rows[0].username,
				'receivedMessages' : JSON.parse(rows[0].received_messages),
				'sentMessages' : JSON.parse(rows[0].sent_messages),
			};
			callback(null, userData);
		} else {
			console.log('ERROR: multiple users with this id: ', userId);
		}
	});
}

/* private encryption & validation methods */

// var generateSalt = function()
// {
// 	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
// 	var salt = '';
// 	for (var i = 0; i < 10; i++) {
// 		var p = Math.floor(Math.random() * set.length);
// 		salt += set[p];
// 	}
// 	return salt;
// }

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

// var saltAndHash = function(pass, callback)
// {
// 	var salt = generateSalt();
// 	callback(salt + md5(pass + salt));
// }

// var validatePassword = function(plainPass, hashedPass, callback)
// {
// 	var salt = hashedPass.substr(0, 10);
// 	var validHash = salt + md5(plainPass + salt);
// 	callback(null, hashedPass === validHash);
// }

