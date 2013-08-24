/*
 *	socket.js
 */
// var MS = require('./mapServer');
var cityManager = require('./city-manager.js');
var accountManager = require('./account-manager.js');
var armyManager = require('./army-manager.js');
var messageManager = require('./message-manager.js');
var socketio = require('socket.io');
var battleManager = require('./battle-manager.js');
var contractManager = require('./contract-manager.js');
var db = require('/var/www/html/colludo/app/server/modules/db.js');

var sio;
var connected = 0;	

module.exports.socketServer = socketServer;

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

function socketServer(app, server, sessionStore, cookieParser) {
	'use strict';
	sio = socketio.listen(server);
	module.exports.sio = sio;
	sio.set('log level', 1);
	console.log('COLLUDO SERVER STARTING @', eastCoastTime());
	var SessionSockets = require('session.socket.io')
    , sessionSockets = new SessionSockets(sio, sessionStore, cookieParser);

    // give message-manager.js the sio object
	armyManager.init(sio);
	messageManager.init(sio);
	
	console.log(eastCoastTime());
  /**
  *	Create main world object. This will create all teh necisarry structure and
  * load its contents from the database. 
  */
  var world = require('./world-manager.js');
  contractManager.init();

  sessionSockets.on('connection', function (err, socket, session) {
  	if(!session || !session.user) return;
		connected++;
  	console.log('USER LOGGED ON:', session.user.username, connected +' ONLINE.');	
		socket.join(session.user.username);

		socket.on('requestInitData', function(data){
			if(session && session.user)
				initData(world, session, socket);
			
		});

		// data = {to, subject, time, message}
		socket.on('sendMessage', function(data) {
			if(!session || !session.user)return;
			console.log('SENDING: sending message...', session);
			messageManager.sendMessage(session, data, function(err, messageArray) {
				if (err) {
					console.log('ERROR: sending message', err);
					socket.emit('messageConfirm', {'err' : err});
				} else {
					console.log('SUCCESS: sent message!', messageArray);
					socket.emit('messageConfirm', {});
				}
			});
		});

		socket.on('orderCityTiles', function (data){
			if(!session || !session.user)return;
			cityManager.orderTiles (sio, session, data, function(err){
				if (err) console.log('socketBuy Error: ', err);
			}); 
		});

		//orderTroops, cityId,  troopType, n;
		socket.on('orderTroops', function (data){
			var cityId 		= data.cityId
			  , troopType 	= data.troopType
			  , n 			= data.n;
			cityManager.orderTroops(sio, session, cityId, troopType, n);
		});

		socket.on('attack', function(data) {

		});

		// data {armyId, oldTile, newTile}
		socket.on('armyMovement', function(data) {
			console.log('Army moving!', data);
			if(!session || !session.user)return;
			world.moveArmy(data.armyId, data.path, socket);
		});

	//  	socket.on('getCityData', function (data) {
	//  		var city = world.getCity(data.cityId);
	//  		if (!city) console.log('Get city err', data);
	//  		else socket.emit('cityData', city);

	//  		// if(!session || !session.user)return;
	//  		// cityManager.getCityData(data.cityId, session, function(cityData) {
	//  		// 	socket.emit('cityData', cityData);
	//  		// });
	//  	});

	//  	socket.on('getArmyData', function(data){
	//  		var army = world.getArmy(data.armyId);
	//  		if (!army) console.log('Get army err', data);
	//  		else socket.emit('armyData', army);
	//  	});

	//  	socket.on('disconnect', function (data) {
	// 		if (session && session.user) socket.leave(session.user.username);
	// 		connected--;
	// 	});
	});
}


function initData(world, session, socket) {
	// console.log('ask for user data', session);
	accountManager.getUserData(session, function(err, userData){
		if (err) console.log('Error with getuserData', err);
		else socket.emit('userData', userData);
	});

	cityManager.getCityData(JSON.parse(session.user.cities)[0], session, function(err, cityData) {
		if (err) console.log('Error with getcityData', err);
		else socket.emit('cityData', cityData);
	});
	socket.emit('mapData', {'cities': world.cities,
										'armies': world.armies,
										'battles': world.battles});
		
	// });
	// MESSAGE.getMessages(JSON.parse(session.user.received_messages), function(err, data) {
	// 	if (err) console.log('Error with getMessageData', err);
	// 	else socket.emit('messageData', data);
	// });
}