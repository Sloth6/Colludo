////////////////////////////////////////////////////////////////////////////////
/*
	message-manager.js - handles the backend of all messages sent 
*/
////////////////////////////////////////////////////////////////////////////////

var mysql = require('mysql');
var AM = require('./account-manager.js');
var sanitize = require('validator').sanitize
var sio;

var db = mysql.createConnection({
	host     : 'dbinstance.cgmcl2qapsad.us-west-2.rds.amazonaws.com',
	user     : 'user',
	password : 'password',
	database : 'colludo',
});

// recieve and store the sio object for emits
exports.init = function(io) {
	sio = io;
}

////////////////////////////////////////////////////////////////////////////////
/*
	Get Messages - get all the sent (later) and received messages for User 
*/
////////////////////////////////////////////////////////////////////////////////

// get messages from the db
exports.getMessages = function(receivedMessages, callback) {
	// console.log('RECEIVED MESSAGES: ', receivedMessages);
	if (!receivedMessages.length) {
		callback(null);
	} else {
		var str = JSON.stringify(receivedMessages);
		var values = '('+str.substr(1,str.length-2)+')';
		// console.log(str, values);
		var query = 'SELECT * FROM messages WHERE id IN '+values;
		db.query(query, function(err, rows) {
			if (err) {
				callback(err);
			} else {
				// console.log(rows);
				callback(null, rows);
			}
		});
	}
}

////////////////////////////////////////////////////////////////////////////////
/*
	Send Message - sending a Message from Sender to Receiver requires the
		following steps:

	(1) GET the Receiver's Id and Received Messages
		(2) STORE the Message in the Messages table and GET the Message Id
			(3a) STORE the Message Id in the Receiver's Received Messages
				(4a) INCREMENT counter and attempt to EMIT
			(3b) STORE the Message Id in the Sender's Sent Messages
				(4b) INCREMENT counter and attempt to EMIT
*/
////////////////////////////////////////////////////////////////////////////////

// messageData = {to, subject, time, message}
exports.sendMessage = function(session, messageData, callback) {
	var messageArray = {
		'sender'  : sanitize(session.user.username).xss(),
		'subject' : sanitize(messageData.subject).xss(),
		'time'    : messageData.time,
		'message' : sanitize(messageData.message).xss()
	};

	// get userId of receiver from users table
	getReceiverInfo(messageData.to, function(err, receiverId, receivedMessages) {
		if (err) {
			callback(err);
		} else {
			// store message in messages table
			storeMessage(receiverId, messageData.to, session.user.id, 
				session.user.username, messageArray, function(err, messageId) {

				if (err) {
					callback(err);
				} else {
					console.log('SENDING: stored the message in messages', messageId);
					var counter = 0;

					// parse, push, and stringify receivedMessages
					receivedMessages = JSON.parse(receivedMessages);
					receivedMessages.push(messageId);
					receivedMessages = JSON.stringify(receivedMessages);

					// store messageId in receiver's receivedMessages
					receiverStoreMessage(receiverId, receivedMessages, function(err) {
						if (err) {
							callback(err);
						} else {
							console.log('SENDING: updated receiver\'s receivedMessages');
							sendEmit(++counter, messageArray, messageData.to, 
								function(success) {

								if (err) {
									callback(err);
								} else if (success) {
									callback(null, messageArray);
								} else {
									console.log('SENDING: counter = 1');
								}
							});
						}
					});
					
					// get sender's sentMessages
					AM.getUserDataById(session.user.id, function(err, senderData) {
						if (err) {
							callback(err);
						} else {
							console.log('SENDING: got senderData: ', senderData);
							// get, parse, push, and stringify sentMessages
							var sentMessages = senderData.sentMessages;
							console.log(sentMessages);
							// sentMessages = JSON.parse(sentMessages);
							sentMessages.push(messageId);
							sentMessages = JSON.stringify(sentMessages);

							// store messageId in sender's sentMessages
							senderStoreMessage(session.user.id, sentMessages, function(err) {
								if (err) {
									callback(err);
								} else {
									console.log('SENDING: updated sender\'s sentMessages');
									sendEmit(++counter, messageArray, messageData.to, 
										function(success) {

										if (err) {
											callback(err);
										} else if (success) {
											callback(null, messageArray);
										} else {
											console.log('SENDING: counter = 1');
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}

////////////////////////////////////////////////////////////////////////////////

// GETS the Receiver's Id from the Users table with the Receiver's Username
function getReceiverInfo(receiver, callback) {
	var receiverIdQuery = 'SELECT id, received_messages FROM users WHERE username = ?';
	var receiverIdValues = [receiver];
	db.query(receiverIdQuery, receiverIdValues, function(err, rows, cols) {
		if (err) {
			console.log('ERROR: sending message - getting receiverInfo', err);
			callback(err);
		} else if (rows.length == 1) {
			callback(null, rows[0].id, rows[0].received_messages); // receiverId
		} else {
			callback('User not found!');
		}
	});
}

// STORES the Message in the Messages table
// GETS the Message Id
function storeMessage(receiverId, receiver, senderId, sender, messageArray, callback) {
	var messageStoreQuery = 'INSERT INTO messages (to_id, mr_receiver, from_id, mr_sender, '+
		'time_sent, subject, message, opened, receiverDelete, senderDelete) '+
		'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	var messageStoreValues = [receiverId, receiver, senderId, sender, 
		messageArray.time, messageArray.subject, messageArray.message, 
		'0', '0', '0'];

	db.query(messageStoreQuery, messageStoreValues, function(err, rows) {
		if (err) {
			console.log('ERROR: sending message - storing message', err);
			callback(err);
		} else {
			callback(null, rows.insertId); // messageId
		}
	});
}

// STORES the new Received Messages array for the Receiver in the Users table
function receiverStoreMessage(receiverId, receivedMessages, callback) {
	var receiverStoreQuery = 'UPDATE users SET received_messages = ? '+
		'WHERE id = ?';
	var receiverStoreValues = [receivedMessages, receiverId];

	db.query(receiverStoreQuery, receiverStoreValues, function(err, rows) {
		if (err) {
			console.log('ERROR: sending message - updating receiver\'s '+
				'received_messages', err);
			callback(err);
		} else {
			callback(null);
		}
	});
}

// STORES the new Sent Messages array for the Sender in the Users table
function senderStoreMessage(senderId, sentMessages, callback) {
	var senderStoreQuery = 'UPDATE users SET sent_messages = ? WHERE id = ?';
	var senderStoreValues = [sentMessages, senderId];
	
	db.query(senderStoreQuery, senderStoreValues, function(err, rows) {
		if (err) {
			console.log('ERROR: sending message - updating sender\'s '+
				'sent_messages', err);
			callback(err);
		} else {
			callback(null);
		}
	});
}

// attempt to EMIT the Message Array to the Receiver
function sendEmit(counter, messageArray, receiver, callback) {
	if (counter === 1) {
		callback(false);
	} else if (counter === 2) {
		sio.sockets.in(receiver).emit('newMessage', messageArray);
		callback(true);
	} else {
		console.log('ERROR: sending message - counter does not equal 1 or 2',
			counter);
	}
}
