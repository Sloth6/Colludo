////////////////////////////////////////////////////////////////////////////////
/*
	worldInfo-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

function addCityInfo(cityName, str) {
	$( '#info-'+cityName ).append(
		'<p>'+str+'</p>'
	);
}

function addArmyInfo(armies, army, str) {
	console.log('ADDING ARMY INFO:', str);
	$( '#info-'+armies[army].name ).append(
		'<p>'+str+'</p>'
	);
}

function addCities(cities) {
	var accordion = 
		'<div class="accordion-open accordion-outer">' +
			'<h3 class="outer-h3">Cities</h3>' +
			'<div class="outer-div">';

	for (var city in cities) {
		accordion += 
			'<div class="accordion-closed accordion-inner">' +
				'<h3>'+cities[city].name+'</h3>' +
				'<div id=info-'+city+'>'+
					'<button id='+city+'>Jump To</button>'+
				'</div>' +
			'</div>';
	}
	accordion += '</div></div>';
	return accordion;
}

function addArmies(armies) {
	var accordion = 
		'<div class="accordion-open accordion-outer">' +
			'<h3 class="outer-h3">Armies</h3>' +
			'<div class="outer-div">';

	for (var army in armies) {
		accordion += 
			'<div class="accordion-closed accordion-inner">' +
				'<h3>'+armies[army].name+'</h3>' +
				'<div id=info-'+armies[army].name+'>'+
					'<button id='+armies[army].name+'>Jump To</button>'+ '<br>'+
					"Soldiers: "+ armies[army].soldiers + 
				'</div>' +
			'</div>';
	}
	accordion += '</div></div>';
	return accordion;
}

function setWorldInfoPane(cities, armies) {
	var worldInfoPane = $('#worldInfoPane');
	worldInfoPane.html(
		addCities(cities) +
		addArmies(armies)
	);

	$( '.accordion-closed' ).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
	});

	$( '.accordion-open' ).accordion({
		active: 0,
		collapsible: true,
		heightStyle: 'content'
	});

	for (var city in cities) {
		(function(val){
			$('#'+val).on('click', function() {
				setViewToTile(cities[val]);
			})
		})(city);
	}

	for (var army in armies) {
		(function(val){
			$('#'+armies[val].name).on('click', function() {
				setViewToTile(armies[val].mesh);
			})
		})(army);
	}
}

////////////////////////////////////////////////////////////////////////////////

// $('#worldInfoPane').draggable();
// $('#worldInfoPane').resizable();


// function printInfo() {
// 	var str = '';
// 	for (var i = 0; i < arguments.length; i++) {
// 	    str += arguments[i]+'<br>';
// 	}
// 	// if (overwrite){$('#worldInfoPane > p').html(str);}
// 	$('#worldInfoPane > p').append(str);
// }

// function clearInfo(){
// 	$('#worldInfoPane > p').html('');

// }