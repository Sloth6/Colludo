function Player(name, cities, armies) {
	this.currentCity = 0;
	this.cities = cities || [];
 	this.armies = armies || [];
	this.name = name || 'derp';
	this.readMsgs = [];
	this.unreadMsgs = [];

}
Player.prototype.getCurrentCity = function() {
	return city;
	// assert(this.cities[0], 'no city!');
	// return this.cities[this.currentCity];
}
Player.prototype.addCity = function(cityData) {
	this.cities.push(cityData);
}