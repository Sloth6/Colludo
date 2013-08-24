exports.insert = insert;
exports.selectCity = selectCity;
exports.updateCity = updateCity;
exports.selectAll = selectAll;

var mysql 	= require('mysql');
var db = mysql.createConnection({
  host     : 'dbinstance.cgmcl2qapsad.us-west-2.rds.amazonaws.com',
  user     : 'user',
  password : 'password',
  database : 'colludo',
});
var startingCity = 
	'x, x, x, x, x,  x, x, x, x, x,  x, x, f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, x,  x, x, x, x, x,  x, f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, x,  x, x, x, x, x,  f0,f0,f0,f0,f0, f0,t, t, t, f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, x,  x, x, x, x, f0, f0,f0,f0,f0,f0, f0,f0,t, t, f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, x,  x, x, x, f0,f0, f0,f0,f0,f0,f0, f0,f0,t, t, f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, x,  x, x, f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, x,  x, r, r, f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, x,  f0,f0,r, f0,f0, t, t, f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'x, x, x, x, f0, f0,r, r, f0,f0, f0,t, t, f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'x, x, x, f0,f0, f0,r, f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'x, x, f0,f0,f0, f0,r, r, r, r,  f0,c, f0,f0,f0, f0,f0,f0,f0,ro, ro,ro,f0,f0,f0,'+
	'x, t, f0,f0,f0, f0,f0,f0,f0,r,  f, h, f0,f0,f0, f0,f0,f0,ro,ro, f0,f0,f0,f0,f0,'+
	't, t, f0,f0,f0, f0,f0,f0,f0,r,  f0,f, f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0,'+
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,r,  f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,x,'+ 
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,r,  r, r, r, r, f0, f0,f0,f0,f0,f0, f0,f0,f0,x, x,'+ 
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,r, r,  f0,f0,f0,f0,f0, f0,f0,x, x, x,'+ 
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,r,  r, r, f0,f0,f0, f0,x, x, x, x,'+ 
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,r, r, f0,f0, x, x, x, x, x,'+ 
	'f0,f0,f0,f0,ro, ro,ro,ro,f0,f0, f0,f0,f0,f0,f0, f0,f0,r, r, x,  x, x, x, x, x,'+ 
	'f0,f0,f0,f0,f0, ro,ro,ro,ro,f0, f0,f0,f0,f0,f0, f0,f0,f0,x, x,  x, x, x, x, x,'+ 
	'f0,f0,f0,f0,f0, ro,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,x, x, x,  x, x, x, x, x,'+
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,x, x, x, x,  x, x, x, x, x,'+
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, x, x, x, x, x,  x, x, x, x, x,'+ 
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,f0,x,  x, x, x, x, x,  x, x, x, x, x,'+ 
	'f0,f0,f0,f0,f0, f0,f0,f0,f0,f0, f0,f0,f0,x, x,  x, x, x, x, x,  x, x, x, x, x';

startingCity = JSON.stringify(startingCity.replace(/ /g,'').split(','));
				// if (city.tiles[tileId] >= 0) {
				// 	if (city.tiles[tileId] == 0){
				// 		if (Math.floor(Math.random()*12) == 0){
				// 			tileImg = cityTileImgs[14];
				// 		} else if (Math.floor(Math.random()*8) == 0) {
				// 			tileImg = cityTileImgs[15];
				// 		} else if(Math.floor(Math.random()*2) ==0){
				// 			tileImg = cityTileImgs[16];
				// 		}else {
				// 			tileImg = cityTileImgs[0];
				// 		}
				// 		var foo = (tileWidth /4.4)*1.9;  
				// 		ctx.drawImage(tileImg, screenCoords.x-foo, screenCoords.y-foo/2, tileWidth+(2*foo), tileHeight+foo);

				// 	}else {

var startingCityx = JSON.stringify([
	14,14,14,14,14, 14,14,14,14,14, 14,14,0,0,0, 0,0,0,0,0, 0,0,0,0,0,
	14,14,14,14,14, 14,14,14,14,14, 14,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0,
	14,14,14,14,14, 14,14,14,14,14, 0,0,0,0,0, 0,2,2,2,0, 0,0,0,0,0,
	14,14,14,14,14, 14,14,14,14,0, 0,0,0,0,0, 0,0,2,2,0, 0,0,0,0,0,
	14,14,14,14,14, 14,14,14,0,0, 0,0,0,0,0, 0,0,2,2,0, 0,0,0,0,0,
	14,14,14,14,14, 14,14,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0,
	14,14,14,14,14, 14,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0,
	14,14,14,14,14, 0,0,1,0,0, 2,2,0,0,0, 0,0,0,0,0, 0,0,0,0,0,
	14,14,14,14,0, 0,1,1,0,0, 0,2,2,0,0, 0,0,0,0,0, 0,0,0,0,0,
	14,14,14,0,0, 0,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0,
	14,14,0,0,0, 0,1,1,1,1, 0,8,0,0,0, 0,0,0,0,3, 3,3,0,0,0,
	14,2,0,0,0, 0,0,0,0,1, 7,6,0,0,0, 0,0,0,3,3, 0,0,0,0,0,
	2,2,0,0,0, 0,0,0,0,1, 0,7,0,0,0, 0,0,0,0,0, 0,0,0,0,0,
	0,0,0,0,0, 0,0,0,0,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,14,
	0,0,0,0,0, 0,0,0,0,1, 1,1,1,1,0, 0,0,0,0,0, 0,0,0,14,14,
	0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 0,0,0,0,0, 0,0,14,14,14,
	0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,0,0,0, 0,14,14,14,14,
	0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,0,0, 14,14,14,14,14,
	0,0,0,0,3, 3,3,3,0,0, 0,0,0,0,0, 0,0,1,1,14, 14,14,14,14,14,
	0,0,0,0,0, 3,3,3,3,0, 0,0,0,0,0, 0,0,0,14,14, 14,14,14,14,14,
	0,0,0,0,0, 3,0,0,0,0, 0,0,0,0,0, 0,0,14,14,14, 14,14,14,14,14,
	0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,14,14,14,14, 14,14,14,14,14,
	0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 14,14,14,14,14, 14,14,14,14,14,
	0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,14, 14,14,14,14,14, 14,14,14,14,14,
	0,0,0,0,0, 0,0,0,0,0, 0,0,0,14,14, 14,14,14,14,14, 14,14,14,14,14
]);


function insert(userId, userData, tileId, callback) {
	var userName = userData.user;
	// 3. Create entry in city table with player id.
	var query = 'INSERT INTO cities(player_id, username, city_data, tileId, name, '+
			'crop, wood, ore, population, last_update, '+
			'building_queues) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	var now = Math.floor(Date.now()/1000);
	var values = [userId, userName, startingCity, tileId, userName+'\'s City',
		10000.0, 10000.0, 10000.0, 5, now, '[]'];
	db.query(query, values, function(err, rows) {
		if (err) return callback(err);
		callback(null, rows.insertId);
	});
}

function selectAll(callback) {
	var query = 'SELECT id, player_id, username, tileId, population, name FROM cities'
	  , values = [];
	db.query(query, values, function(err, rows) {
		 if (err) {
		 	callback(err);
		 } else {
		 	// console.log(rows);
		 	callback(null, rows.map(formatCity));
		 }
	});
	function formatCity(data) {
		return {
			'id'	: data.id,
			'userId' : data.player_id,
			'user'   : data.username,
			'name'   : data.name,
			'tileId' : data.tileId,
			'population' : data.population
		}
	}
}

function selectCity (cityId, callback) {
	var query = 'SELECT * FROM cities WHERE id = ?'
	  , values = [cityId];
	db.query(query, values, function(err, rows, cols) {
		 if (err) {
		 	callback(err);
		 } else if (!rows.length){
		 	callback('not-found');
		 } else {
		 	callback(null, formatCity(rows[0]));
		 }
	});
	function formatCity(data) {
		return {
			'id'	: data.id,
			'userId' : data.player_id,
			'user'   : data.username,
			'name'   : data.name,
			'tileId' : data.tileId,
			'tiles'  : JSON.parse(data.city_data),
			'buildingQueues' : JSON.parse(data.building_queues),
			// 'trainingQueues' : JSON.parse(data.training_queues),
			'lastUpdate'     : data.last_update,

			'resources' : {
				'crop' : data.crop,
				'wood' : data.wood,
				'ore'  : data.ore,
				'workers' : data.workers},

			'population' : data.population,
			'armyId' : data.army_id,
		};
	}
}

function updateCity(cityData, callback){
	if (cityData.tiles == 'Unknown' || !cityData.tiles) {
		console.trace("Here I am!");
		// console.log(cityData);
		return;
	};
	// console.log('updateCity', cityData.resources);
	var query = 'UPDATE cities SET '+
		'city_data = ?, '+
		'building_queues = ?, '+
		'crop = ?, '+
		'wood = ?, '+
		'ore = ?, '+
		'population = ?, '+
		'last_update = ? '+
		'WHERE id = ?',
	  	values = [
			JSON.stringify(cityData.tiles),
			JSON.stringify(cityData.buildingQueues),
			cityData.resources.crop,
			cityData.resources.wood,
			cityData.resources.ore,
			cityData.population,
			cityData.lastUpdate,
			cityData.id
		];
		// console.log(query, values);
	db.query(query, values, function(err, rows){
		if(err){
			console.log('updateCity error!', err);
			callback(err);
		} else {
			console.log('updated city!', cityData.id,  cityData.resources);
			callback(null);
		}
	});
}