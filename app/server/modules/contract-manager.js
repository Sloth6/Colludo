var contractsTable = require('./mysql/contracts.js');
var cityManager = require('./city-manager.js');

exports.init = init;
exports.executeContract = executeContract;


function init() {
	setTimeout(function(){
	contractsTable.selectAll(function(err, contracts) {
		// contracts.push(new Contract());
		if (err) return console.log('contract select error', err);
		if (contracts.length) {
			for (var i = 0; i < contracts.length; i++) {
				executeContract(contracts[i]);
			}
		}
	});
}, 4000);
}

function executeContract(C) {
	if (C.timesLeft > 0) {
		cityManager.tradeResources(C.city1, C.city2, C.from1to2, C.from2to1);
		C.timesLeft--;
		setTimeout( function() {
			executeContract(C);
		}, C.interval);
	} else {
		deleteContract(C);
	}
}


function deleteContract(contract) {
	console.log('deleting contract', contract.id);
}

function Contract() {
	this.id;
	this.interval = 7000;
	this.timesLeft = 50;
	this.player1 = 1;
	this.player2 = 2;
	this.city1 = 1;
	this.city2 = 2;
	this.from1to2 = {crop: 2, wood: 1}; 
	this.from2to1 = {ore: 3};
}
