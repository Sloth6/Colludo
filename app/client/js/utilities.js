function assert(condition, message) {
	if (!condition) {
		throw message || "Assertion failed";
	}
}
// name that panel!
function getCurrentPanel() {
	var active = $('li.active')[0];
	if(active)
		return active.id.split('-')[0];
}

function loadImages(tilePath, imageNames, imageArr, callback) {
	var loadedImagesCount = 0;
	for (var i = 0; i < imageNames.length; i++) {
		var image = new Image();
		image.src = tilePath+imageNames[i];
		image.onload = function(){
			loadedImagesCount++;
			if (loadedImagesCount >= imageNames.length) {	            
				//Get update the player model with server info.
				callback();
			}
		}
		imageArr.push(image);
	}
}
function loadImages2(tilePath, imageNames, imageArr, callback) {
	var loadedImagesCount = 0;
	for (var i = 0; i < imageNames.length; i++) {
<<<<<<< HEAD
    var image = new Image();
    image.src = tilePath+imageNames[i]+'.png';
    console.log(tilePath+imageNames[i]);
    image.onload = function(){
    	loadedImagesCount++;
    	if (loadedImagesCount >= imageNames.length) {	            
=======
		var image = new Image();
		image.src = tilePath+imageNames[i]+'.png';
		image.onload = function() {
			loadedImagesCount++;
			if (loadedImagesCount >= imageNames.length) {	            
>>>>>>> 046cc58323ef534213211b030ecdd36fbdf77d27
				//Get update the player model with server info.
				callback();
			}
		}
		imageArr[imageNames[i]] = image;
	}
}