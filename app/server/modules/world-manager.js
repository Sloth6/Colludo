/**
* World is the object that stores all the world content in memory.
* When the client accesses state data it is retrieved and set here. 
* World calls the methods that keep the database in sync with its state. 
*/
var cityManager = require('./city-manager.js');
var armyManager = require('./army-manager.js');
var accountManager = require('./account-manager.js');
var db = require('./db.js');

var World = (function(){
  var self;
  function World (rows, cols) {
    self = this;
    // The size of the world map by number of hexagon tiles. 
    this.numRows = rows;
    this.numCols = cols;

    this.armies = {};
    this.cities = {};
    /**
    * Map tileId to cityid+armyid if any exist.  
    * ex: {3: {armyId:1, cityId: 2},}
    */
    this.content = {};
    /**
    * The base delay an army must wait between movement.  
    */
    this.moveSpeed = 2000;
    this.tileTypes = [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,2,2,2,2,3,3,3,3,3,3,3,2,2,2,2,2,3,2,3,3,3,3,3,2,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,2,3,2,3,2,2,2,2],
      [2,2,2,3,3,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2],
      [2,2,3,3,3,3,3,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2],
      [2,3,3,3,3,0,0,0,0,0,0,0,3,3,3,3,3,0,3,3,3,3,3,3,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,3,3,3,3,3,2],
      [2,3,3,3,0,0,0,6,0,6,0,6,0,0,3,0,0,0,0,3,3,3,3,3,3,0,0,0,0,0,0,0,0,6,0,0,6,0,0,0,0,0,0,0,3,3,3,2],
      [2,3,3,3,0,0,0,0,0,0,6,0,0,6,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,6,0,0,0,0,6,0,0,6,0,6,0,0,0,3,3,3,2],
      [2,3,3,3,0,0,0,0,6,7,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,6,0,6,0,6,0,0,0,0,3,3,3,2],
      [2,3,3,3,0,0,0,7,7,7,7,7,7,7,7,7,0,0,0,0,0,5,0,5,0,0,0,0,0,0,6,6,0,6,0,7,0,7,0,0,0,0,0,0,3,3,3,2],
      [2,3,3,3,0,0,0,7,7,0,7,0,7,0,7,0,0,0,0,0,0,5,5,5,5,5,0,0,0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0,3,3,3,2],
      [2,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,7,7,7,7,7,7,7,0,0,0,0,0,3,3,3,2],
      [2,3,3,3,0,6,0,6,0,6,0,0,0,0,0,3,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,7,7,7,0,7,0,0,0,0,0,0,0,3,3,3,2],
      [2,3,3,3,0,0,0,6,0,0,0,0,3,3,0,3,3,6,0,6,0,0,0,0,5,5,5,5,5,0,0,0,0,6,6,0,0,0,0,0,0,0,0,0,3,3,3,2],
      [2,3,3,3,0,0,0,6,0,6,0,3,3,3,3,3,3,0,0,0,0,6,0,0,8,8,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,2],
      [2,3,3,3,0,0,6,0,0,0,3,3,3,3,3,3,3,0,6,0,6,0,6,0,8,8,5,5,5,5,0,0,6,0,0,4,4,4,0,0,0,0,3,3,3,3,3,2],
      [2,3,3,3,0,0,0,0,0,0,3,3,3,3,3,3,6,0,0,6,0,6,0,0,8,8,8,5,5,5,0,6,0,4,4,4,4,0,0,0,0,3,3,3,3,3,3,2],
      [2,3,3,3,0,0,0,0,6,0,6,0,0,0,6,0,0,6,0,0,0,0,0,6,8,8,8,5,5,5,0,0,0,4,4,4,4,0,0,0,0,3,3,3,3,3,2,2],
      [2,3,3,3,0,0,0,0,0,0,0,0,6,0,0,6,0,0,0,6,6,6,0,0,6,8,8,5,5,5,0,6,4,4,4,4,0,0,0,0,0,3,3,3,3,2,2,2],
      [2,3,3,3,3,0,0,0,0,0,6,0,0,0,0,0,0,6,0,0,0,0,0,6,8,4,5,5,5,5,6,0,4,4,4,4,0,0,0,0,0,3,3,3,2,2,2,2],
      [2,3,3,3,3,0,0,0,0,0,0,6,4,4,4,4,4,4,6,4,6,4,0,4,4,4,0,5,0,0,0,0,0,4,4,0,0,0,0,0,0,3,3,2,2,2,2,2],
      [2,2,3,3,3,3,0,0,0,0,5,5,4,4,4,4,4,4,4,4,4,4,4,4,4,5,0,0,0,0,6,0,0,0,0,0,0,0,0,3,3,3,3,2,2,2,2,2],
      [2,2,3,3,3,3,0,0,0,0,5,5,5,5,5,5,4,5,4,4,4,4,4,5,5,5,0,8,8,6,6,0,0,0,0,0,0,0,3,3,3,2,2,3,3,3,2,2],
      [2,2,2,3,3,3,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,8,8,8,8,0,0,0,0,0,0,0,0,3,3,3,2,3,3,3,3,3,3,2],
      [2,2,3,3,3,3,0,0,0,0,6,0,0,0,5,0,5,7,5,5,5,8,5,8,8,8,8,8,6,0,0,0,0,0,0,0,0,3,3,3,3,3,3,0,3,3,3,2],
      [2,2,3,3,3,3,0,0,0,0,0,6,6,0,6,0,7,7,7,7,8,8,8,0,8,0,0,0,0,6,0,0,0,0,0,3,3,3,3,3,3,0,0,6,0,3,3,2],
      [2,3,3,3,3,0,0,0,0,6,0,0,0,6,0,7,7,7,7,8,8,8,0,6,0,3,6,3,0,3,3,3,3,3,3,3,3,3,3,3,6,0,0,0,6,3,3,2],
      [2,3,3,3,3,0,0,0,0,6,0,6,0,0,0,7,7,7,7,8,8,0,0,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,0,0,0,4,0,0,3,3,2],
      [2,3,3,3,3,0,0,0,0,0,0,0,6,0,6,7,7,7,7,8,8,6,0,0,3,3,3,0,3,0,6,6,0,0,3,3,2,3,3,0,0,4,4,0,0,3,3,2],
      [2,3,3,3,0,0,0,0,0,0,0,6,0,0,0,7,7,7,7,8,8,0,0,0,0,6,0,0,0,0,6,0,0,0,3,3,2,3,3,0,6,4,4,4,0,0,3,2],
      [2,3,3,3,0,0,0,0,0,0,0,0,0,6,0,6,7,7,7,8,8,8,6,0,6,0,0,0,6,0,0,8,0,0,3,3,2,3,3,0,6,6,4,4,4,7,2,2],
      [2,3,3,3,0,0,0,0,0,0,6,0,0,0,0,5,7,7,7,5,8,5,0,5,0,0,6,0,6,0,8,8,6,0,3,3,2,3,3,0,0,0,4,8,4,7,0,2],
      [2,3,3,3,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,6,0,8,8,8,0,0,3,3,3,3,3,0,0,6,0,8,7,5,0,2],
      [2,3,3,3,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,6,8,8,0,0,6,0,3,3,3,3,0,0,0,0,8,7,5,0,2],
      [2,3,3,3,0,0,0,6,0,5,5,5,5,5,5,5,5,5,5,0,5,0,5,0,0,6,0,0,8,8,8,0,6,0,0,3,3,3,0,6,0,0,6,8,7,5,0,2],
      [2,3,3,3,0,0,0,0,0,8,5,8,5,0,0,0,0,0,0,0,0,0,0,0,6,6,6,8,8,8,0,6,0,0,3,3,3,3,0,0,0,0,0,8,7,5,0,2],
      [2,3,3,3,0,0,0,6,0,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,8,8,0,0,0,0,3,3,3,3,0,0,0,6,8,8,7,7,5,0,2],
      [2,3,3,3,0,6,0,0,0,4,8,8,0,6,0,0,0,0,0,0,0,6,0,6,0,8,8,8,8,0,0,3,3,3,3,3,0,0,0,8,8,7,7,5,5,5,0,2],
      [2,3,3,3,6,6,0,4,4,4,4,8,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,0,0,6,3,3,3,3,3,3,3,0,6,8,7,7,5,5,5,5,0,2],
      [2,3,3,3,4,4,4,4,4,4,4,4,6,0,0,0,0,0,0,0,6,0,0,8,8,8,8,6,0,6,3,3,3,3,3,0,6,0,8,8,7,7,7,5,5,5,0,2],
      [2,3,3,3,4,4,4,4,4,4,4,4,6,0,0,0,0,0,0,0,0,6,0,0,8,0,0,0,0,0,3,3,3,3,0,0,0,8,8,6,6,0,7,7,5,5,0,2],
      [2,3,3,3,0,0,4,0,4,0,4,0,0,0,0,3,3,3,3,3,3,3,0,6,0,0,0,6,0,0,3,3,3,3,0,6,4,4,4,0,0,0,6,7,7,5,0,2],
      [2,3,3,3,6,0,0,0,0,6,0,0,6,0,0,3,3,3,3,3,3,3,0,0,6,6,0,0,0,0,3,3,3,3,0,0,4,6,0,3,3,6,0,0,7,5,0,2],
      [2,3,3,3,6,0,6,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,3,3,6,0,0,7,0,0,2],
      [2,3,3,3,3,3,0,3,0,3,0,3,0,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,0,0,0,0,2,2],
      [2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,3,3,3,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,2,2,2],
      [2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,3,2,3,2,3,2,2,2,3,3,3,3,3,3,3,2,3,3,3,3,3,2,2,2],
      [2,2,2,2,2,2,3,2,3,2,3,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,2,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]];
  }

  World.prototype.loadContent = function() {
  }

  World.prototype.getFreeTile = function(callback) {
    var self = this;
    var row=0, col=0, tileId = 0;
    while (!validCityTile(row, col, tileId)) {
      row = Math.floor(Math.random() * self.numRows);
      col = Math.floor(Math.random() * self.numCols);
      tileId = (row*self.numCols) + col;
    }
    callback(null, tileId);

    function validCityTile (row, col, tileId) {
      if (self.tileTypes[row][col] != 0) {
        return false;
      }
      if (self.content[tileId] && 
        (self.content[tileId].army || self.content[tileId].city)) {
        return false;
      }
      return true;
    }
  }

  function stepArmy(armyId, oldTile, newTile, sio, callback) {
    if (self.isArmyAt[newTile]) {
      console.log('An army path was blocked, tileId:', newTile);
      callback('Path Blocked!');

    } else {
      sio.sockets.emit('moveArmy', {
        'oldTile': oldTile,
        'newTile': newTile,
        'armyId': armyId
      });

      if (self.content[newTile]) self.content[newTile].army = armyId;
      else self.content[newTile] = {'army': armyId};

      self.content[oldTile].army = null;
      self.armies[armyId].tileId = newTile;

      var query = 'UPDATE armies SET tile_id = ? WHERE id = ?'
        , values = [newTile, armyId];
      db.query(query, values, function(err) {
        if (err) console.log('move army error!', err);
        else if (callback) callback();
      });
    }
  }

  World.prototype.moveArmy = function(armyId, path, sio) {
    console.log('Army moving!', armyId,  !!sio);
    var step = 1;
    var timerId = setInterval(function() {
      stepArmy(armyId, path[step-1], path[step], sio, function(failure) {
        step += 1;
        if (failure) { // we bumped into something. 
          clearInterval(timerId);
          sio.sockets.emit('armyBlocked', {armyId:armyId, cause:failure});

        } else if ((step) == path.length){
          clearInterval(timerId);
          sio.sockets.emit('armyMovementFinished', {armyId:armyId});
        }
      });
    }, this.moveSpeed);
  }

  World.prototype.addCity = function(city) {
    this.cities[city.id] = city;
    if ( this.content[city.tileId] ) {
      this.content[city.tileId]['city'] = city.id;
    } else {
      this.content[city.tileId] = {'city': city.id};
    }
  }

  World.prototype.addArmy = function(army) {
    this.armies[army.id] = army;
    if (this.content[army.tileId]) {
      this.content[army.tileId]['army'] = army.id;
    } else {
      this.content[army.tileId] = {'army': army.id};
    }
  }

  World.prototype.getArmy = function(armyId) {
    if (this.armies[armyId]) return this.armies[armyId];
    else return null;   
  }

  World.prototype.getCity = function(cityId) {
    if (this.cities[cityId]) return this.cities[cityId];
    else return this.content[tileId] = {'city': cityId};
  }

  World.prototype.addTroops = function (sio, userData, cityId, troopType, n) {
    var tileId = self.cities[cityId].tileId;
    
    if (self.content[tileId] && self.content[tileId].army) {
      var armyId = self.content[tileId].army;
      self.armies[armyId][troopType] += n;
      armyManager.setArmyData(self.armies[armyId], function(err) {
        if (err) return console.log('setArmyData Error!', err);
        sio.sockets.emit('armyData', self.armies[armyId]);
      });
    } else {
      var armyData = {soldiers  : 0,
                      calvary   : 0 ,
                      username  : userData.username,
                      crop      : 0,
                      wood      : 0,
                      ore       : 0 };
      armyData[troopType] = n;
    
      armyManager.createArmy (userData.id, tileId, userData.username, armyData, function(err, army) {
        if(err) return console.log('creatArmyErr', err);
        self.content[tileId].army = army.id;
        self.armies[army.id] = army;
        accountManager.addArmyToPlayer(sio, userData, army.id, function(err) {
          if (err) console.log('addArmyToPlayer ERR', err);
        });
      });
    }
  }

  World.prototype.isArmyAt = function(tileId) {
    return self.content[tileId] && self.content[tileId].army;
  }

  World.prototype.isCityAt = function(tileId) {
    return self.content[tileId] && self.content[tileId].city;
  }

  return World; 
})(); 

module.exports = World;

function tile() {
    this.id = id;
    this.row = row;
    this.col = col;
    this.army = 0;
    this.city = 0;
  }