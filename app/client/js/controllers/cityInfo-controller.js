////////////////////////////////////////////////////////////////////////////////
/*
	cityInfo-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

function priceScaleFraction(n) {
	return Math.max(Math.pow(.98 , n-1), .5);
}

function priceScale(n) {
	return Math.floor(priceScaleFraction(n)*1000)/10;
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

////////////////////////////////////////////////////////////////////////////////
/*
	Resource Bar
*/
////////////////////////////////////////////////////////////////////////////////

$('#resourceBar li').hover(
	function() {
		var $this = $(this);
		if ($this.hasClass('food')) $('li.food .sub_menu').removeClass('hidden');
		if ($this.hasClass('wood')) $('li.wood .sub_menu').removeClass('hidden');
		if ($this.hasClass('stone')) $('li.stone .sub_menu').removeClass('hidden');
		if ($this.hasClass('population')) $('li.population .sub_menu').removeClass('hidden');
	},
	function() {
		var $this = $(this);
		if ($this.hasClass('food')) $('li.food .sub_menu').addClass('hidden');
		if ($this.hasClass('wood')) $('li.wood .sub_menu').addClass('hidden');
		if ($this.hasClass('stone')) $('li.stone .sub_menu').addClass('hidden');
		if ($this.hasClass('population')) $('li.population .sub_menu').addClass('hidden');
	}
);

function checkTime(time) {
	if (time < 10) time = '0'+time;
	return time;
}

function startResourceTimer(production, available, capacity, element) {
	var timer;
	if (production == 0) {
		timer = 'No Production';
	} else if (production < 0) {
		timer = 'Losing Resources!';
	} else if (available < capacity) {
		var perSecond = production/3600;
		var full      = Math.floor( (capacity - available)/perSecond );
		var hours     = Math.floor(full/3600);
		var minutes   = Math.floor(full/60) % 60;
		var seconds   = full%60;
		timer = checkTime(hours)+':'+checkTime(minutes)+':'+checkTime(seconds);
	} else {
		timer = 'Maxed Out';
	}
	element.text(timer);
}

function setFoodInfo(production, available, capacity) {
	var food = Math.floor(available);
	$('li.food li.income a').text(production+'/hour');
	$('li.food li.stored a').text(food+'/'+capacity);
	startResourceTimer(production, available, capacity, $('li.food li.timer a'));
}

function setWoodInfo(production, available, capacity) {
	var wood = Math.floor(available);
	$('li.wood li.income a').text(production+'/hour');
	$('li.wood li.stored a').text(wood+'/'+capacity);
	startResourceTimer(production, available, capacity, $('li.wood li.timer a'));
}

function setStoneInfo(production, available, capacity) {
	var stone = Math.floor(available);
	$('li.stone li.income a').text(production+'/hour');
	$('li.stone li.stored a').text(stone+'/'+capacity);
	startResourceTimer(production, available, capacity, $('li.stone li.timer a'));
}

function setPopulationInfo(work, pop) {
	$('li.population li.work a').text('Available: '+work);
	$('li.population li.pop a').text('Population: '+pop);
}

////////////////////////////////////////////////////////////////////////////////
/*
	Info Accordion
*/
////////////////////////////////////////////////////////////////////////////////

function plural(n) {
	if (n > 1) return 's';
	else return '';
}

function drawCityDefault(infoPane) {
	// console.log(city);
	var instruction1 = 'Click on a tile to select it.'
	  , instruction2 = 'Click and drag over tiles of the same type to select ' +
	  	'multiple tiles.'
	  , instruction3 = 'Clicking on or dragging over selected tiles ' +
	  	'deselects them.'
	  , instruction4 = 'Press the escape key to deselect all tiles.';

	infoPane.html(
		'<div id="instructions" class="accordion-open">' +
			'<h3 class="outer-h3">City Controls</h3>' +
			'<div class="outer-div">' +
				'<p>'+instruction1+'</p>' +
				'<p>'+instruction2+'</p>' +
				'<p>'+instruction3+'</p>' +
				'<p>'+instruction4+'</p>' +
			'</div>' +
		'</div>' +
		'<div id="buildingQueues" class="accordion-closed">' +
			'<h3 class="outer-h3">Construction</h3>' +
			'<div class="outer-div">' +
				'<p>No buildings currently under construction.</p>' +
			'</div>' +
		'</div>' +
		'<div class="accordion-closed">' +
			'<h3 class="outer-h3">Troop Training</h3>' +
			'<div class="outer-div">' +
				'<p>No troops currently being trained.</p>' +
			'</div>' +
		'</div>'
	);
}

// Field - this should be the longest
function drawFieldInfo(infoPane) {
	var tileCount = selectionContr.length();

	var info = tileCount + ' field tile'+plural(tileCount)+' selected';
	var percent = priceScale(tileCount);
	var discount = 'You will pay '+percent+'% of the original '+
		'value for any buildings if you purchase '+tileCount+' of them.';
	
	// for Farm
	var description = 'Produce food for your village!';

	var foodPrice = Math.ceil( prices['farm'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['farm'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['farm'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['farm'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var bonus = 0;
	for (var i = 0; i < selectionContr.length(); i++) {
		if (city.containsRiver(city.getNeighbors(selectionContr.selected[i]) )) bonus++;
	}

	var incomeString = 'You will gain ' + (tileCount*10 + 2*bonus) +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		'per hour from this purchase.'

	var farmAccordion = 
		'<div id="farm-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/city/icons/farm-icon.png">'+
				'Farm' +
				'<button id="buildFarm">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for House
	var description = 'Build houses to increase your population!';
	
	var foodPrice = Math.ceil( prices['house'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['house'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['house'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['house'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'These buildings will consume ' + tileCount*5 +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		'per hour to sustain the new citizens.'

	var houseAccordion = 
		'<div id="house-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/house0.png">'+
				'House' +
				'<button id="buildHouse">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for Tavern
	var description = 'Build a tavern to make your population happy with beer!';
	
	var foodPrice = Math.ceil( prices['tavern'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['tavern'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['tavern'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['tavern'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'These buildings will consume ' + tileCount*5 +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		'per hour to satisfy your population.'

	var tavernAccordion = 
		'<div id="tavern-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/tavern0.png">'+
				'Tavern' +
				'<button id="buildTavern">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for Tavern
	var description = 'Build a tavern to make your population happy with beer!';
	
	var foodPrice = Math.ceil( prices['tavern'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['tavern'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['tavern'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['tavern'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'These buildings will consume ' + tileCount*5 +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		'per hour to satisfy your population.'

	var tavernAccordion = 
		'<div id="tavern-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/tavern0.png">'+
				'Tavern' +
				'<button id="buildTavern">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for Warehouse
	var description = 'Build a warehouse to store more resources.';
	
	var foodPrice = Math.ceil( prices['warehouse'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['warehouse'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['warehouse'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['warehouse'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'These buildings will store '+tileCount*1000+' resources.'

	var warehouseAccordion = 
		'<div id="warehouse-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/warehouse0.png">'+
				'Warehouse' +
				'<button id="buildWarehouse">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for Cranny
	var description = 'Build a cranny to hide your resources.';
	
	var foodPrice = Math.ceil( prices['cranny'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['cranny'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['cranny'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['cranny'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'These buildings will hide '+tileCount*200+' resources.'

	var crannyAccordion = 
		'<div id="cranny-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/cranny0.png">'+
				'Cranny' +
				'<button id="buildCranny">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for Barracks
	var description = 'Build a barracks to train troops to defend your village. '+
		'You could also conquer people with them, but that would not be nice.';
	
	var foodPrice = Math.ceil( prices['barracks'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['barracks'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['barracks'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['barracks'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'These buildings will allow you to have '+tileCount+
		' more armies.';

	var barracksAccordion = 
		'<div id="barracks-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/barracks0.png">'+
				'Barracks' +
				'<button id="buildBarracks">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description+'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for Stables
	var description = 'Build a stable to train calvary at your local barracks.';
	
	var foodPrice = Math.ceil( prices['stable'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['stable'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['stable'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['stable'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'These buildings will allow you to have '+tileCount+
		' more armies.';

	var stableAccordion = 
		'<div id="stable-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/stable0.png">'+
				'Stable' +
				'<button id="buildStable">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// for Capital
	var description = 'Build a town center to look cool!';
	
	var foodPrice = Math.ceil( prices['capital'].crop * tileCount * priceScaleFraction(tileCount) )
	  , woodPrice = Math.ceil( prices['capital'].wood * tileCount * priceScaleFraction(tileCount) )
	  , stonePrice = Math.ceil( prices['capital'].ore * tileCount * priceScaleFraction(tileCount) )
	  , workPrice = prices['capital'].workers * tileCount;
	var priceString = 'Price: ' +
		'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
		foodPrice +
		'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
		woodPrice +
		'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
		stonePrice +
		'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
		workPrice;

	var incomeString = 'This is a useless building.';

	var capitalAccordion = 
		'<div id="capital-acc" class="accordion-inner accordion-closed">' +
			'<h3>' +
				'<img src="'+SERVER+'/img/cityTiles/capital0.png">'+
				'Town Center' +
				'<button id="buildCapital">Build</button>' +
			'</h3>' +
			'<div>' +
				'<p>'+description +'</p>' +
				'<p id="price-string">'+priceString +'</p>' +
				'<p id="income-string">'+incomeString+'</p>' +
			'</div>' +
		'</div>';


	// putting it all together
	infoPane.html(
		'<div class="accordion-open">' +
			'<h3 class="outer-h3">' +
				'<img src="'+SERVER+'/img/cityTiles/field0.png">'+
				'Grassland' +
			'</h3>' +
			'<div class="outer-div">' +
				'<p>'+info+'</p>' +
				'<p>'+discount+'</p>' +
			'</div>' +
		'</div>' +
		'<div class="accordion-open">' +
			'<h3 class="outer-h3">Buildings</h3>' +
			'<div class="outer-div">' +
				farmAccordion +
				houseAccordion +
				tavernAccordion +
				warehouseAccordion +
				crannyAccordion +
				barracksAccordion +
				stableAccordion +
				capitalAccordion +
			'</div>' +
		'</div>' +
		'<div class="accordion-closed">' +
			'<h3 class="outer-h3">World Editing</h3>' +
			'<div class="outer-div">' +
				'<button id="makeRiver">Generate River</button>' +
				'<button id="makeTrees">Generate Trees</button>' +
				'<button id="makeRocks">Generate Rocks</button>' +
			'</div>' +
		'</div>'
	);
}

function updateCityInfoPane() {
	var type = selectionContr.typeOf();
	var tileCount = selectionContr.length();

	selectionContr.drawSelected();
	infoPane = $('#cityInfoPane');
	if (selectionContr.length() == 0) {
		drawCityDefault(infoPane);
		// make accordions
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
	} else {
		if (type == 'field') {
			drawFieldInfo(infoPane);
		
		} else if (type == 'river') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/river0.png">'+
						'River' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>This river flows through your city providing lush '+
						'farmland.</p>' +
						'<p>Nothing can be build on a River currently. '+
						'You will be able to build bridges over them in future.</p>' +
					'</div>' +
				'</div>' +
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">World Editing</h3>' +
					'<div class="outer-div">' +
						'<button id="clearTile">Drain River</button>' +
					'</div>' +
				'</div>'
			);
		
		} else if (type == 'trees') {
			var description = 'Produce wood for your village!';
	
			var foodPrice = Math.ceil( prices['sawmill'].crop * tileCount * priceScaleFraction(tileCount) )
			  , woodPrice = Math.ceil( prices['sawmill'].wood * tileCount * priceScaleFraction(tileCount) )
			  , stonePrice = Math.ceil( prices['sawmill'].ore * tileCount * priceScaleFraction(tileCount) )
			  , workPrice = prices['sawmill'].workers * tileCount;
			var priceString = 'Price: ' +
				'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
				foodPrice +
				'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
				woodPrice +
				'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
				stonePrice +
				'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
				workPrice;

			var incomeString = 'You will gain ' + tileCount*10 +
				'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
				'per hour from this purchase.'

			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/trees0.png">'+
						'Forest' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>This forrest is populated by trees with strong wood.</p>' +
					'</div>' +
				'</div>' +
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">Buildings</h3>' +
					'<div id="sawmill-acc" class="accordion-inner accordion-closed last">' +
						'<h3>' +
							'<img src="'+SERVER+'/img/cityTiles/sawmill0.png">'+
							'Lumber Camp' +
							'<button id="buildSawmill">Build</button>' +
						'</h3>' +
						'<div>' +
							'<p>'+description +'</p>' +
							'<p id="price-string">'+priceString +'</p>' +
							'<p id="income-string">'+incomeString+'</p>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="accordion-closed">' +
					'<h3 class="outer-h3">World Editing</h3>' +
					'<div class="outer-div">' +
						'<button id="clearTile">Clear Forrest</button>' +
					'</div>' +
				'</div>'
			);
		
		} else if (type == 'rocks') {
			var description = 'Gather stone for your village!';
	
			var foodPrice = Math.ceil( prices['mine'].crop * tileCount * priceScaleFraction(tileCount) )
			  , woodPrice = Math.ceil( prices['mine'].wood * tileCount * priceScaleFraction(tileCount) )
			  , stonePrice = Math.ceil( prices['mine'].ore * tileCount * priceScaleFraction(tileCount) )
			  , workPrice = prices['mine'].workers * tileCount;
			var priceString = 'Price: ' +
				'<img src="'+SERVER+'/img/resourceBar/meat-icon.png">' +
				foodPrice +
				'<img src="'+SERVER+'/img/resourceBar/log-icon.png">' +
				woodPrice +
				'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
				stonePrice +
				'<img src="'+SERVER+'/img/resourceBar/pop-icon.png">' +
				workPrice;

			var incomeString = 'You will gain ' + tileCount*10 +
				'<img src="'+SERVER+'/img/resourceBar/rock-icon.png">' +
				'per hour from this purchase.'

			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/rocks0.png">'+
						'Rocks' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>These rocks would make for strong building material.</p>' +
					'</div>' +
				'</div>' +
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">Buildings</h3>' +
					'<div id="mine-acc" class="accordion-inner accordion-closed last">' +
						'<h3>' +
							'<img src="'+SERVER+'/img/cityTiles/mine0.png">'+
							'Quarry' +
							'<button id="buildMine">Build</button>' +
						'</h3>' +
						'<div>' +
							'<p>'+description +'</p>' +
							'<p id="price-string">'+priceString +'</p>' +
							'<p id="income-string">'+incomeString+'</p>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="accordion-closed">' +
					'<h3 class="outer-h3">World Editing</h3>' +
					'<div class="outer-div">' +
						'<button id="clearTile">Clear Rocks</button>' +
					'</div>' +
				'</div>'
			);
		
		} else if (type == 'farm') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/city/icons/farm-icon.png">'+
						'Farm' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>This is a Farm</p>' +
					'</div>' +
				'</div>'
			);
		
		} else if (type == 'sawmill') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/sawmill0.png">'+
						'Lumber Camp' +
						'<button id="makeTrees">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>Cutting down trees for wood. Way to destroy your'+
						' environment</p>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'mine') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/mine0.png">'+
						'Quarry' +
						'<button id="makeRocks">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>Gathering Stone.</p>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'house') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/house0.png">'+
						'House' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>Houses provide living area for your population.</p>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'tavern') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/tavern0.png">'+
						'Tavern' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>BEER! \'nuf said.</p>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'warehouse') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/warehouse0.png">'+
						'Warehouse' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>A place to store your resources.</p>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'cranny') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/cranny0.png">'+
						'Cranny' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>Hide your resources.</p>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'barracks') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/barracks0.png">'+
						'Barracks' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>It\'s troop training time!</p>' +
					'</div>' +
				'</div>' +
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">Training</h3>' +
					'<div class="outer-div">' +
						'<form id="train">' +
							'<input type="number" min="0" name="soldiers" value="0">'+
							'<input type="submit" value="Train">' +
						'</form>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'stable') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/tavern0.png">'+
						'Stable' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>Raises horses for usefull things.</p>' +
					'</div>' +
				'</div>'
			);

		} else if (type == 'capital') {
			infoPane.html(
				'<div class="accordion-open">' +
					'<h3 class="outer-h3">' +
						'<img src="'+SERVER+'/img/cityTiles/capital0.png">'+
						'Town Center' +
						'<button id="clearTile">Destroy</button>' +
					'</h3>' +
					'<div class="outer-div">' +
						'<p>The center of your town with lots of different functionality.</p>' +
					'</div>' +
				'</div>'
			);
		}

		// Things in the process of being built
		// } else if (typeInt == encode['buildingHouse']) {
		// 	infoPane.html(
		// 		'<p>A house is building here, yo!</p>');
		// }

		// make accordions
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

		// button handlers
		$('#clearTile').on('click', function() {
			city.buy(type, 'field');
		});

		$('#makeRiver').on('click', function() {
			// console.log('building river...');
			city.buy(type, 'river');
		});
		$('#makeTrees').on('click', function() {
			// console.log('building trees...');
			city.buy(type, 'trees');
		});
		$('#makeRocks').on('click', function() {
			city.buy(type, 'rocks');
		});

		$('#buildFarm').on('click', function() {
			city.buy(type, 'farm');
		});
		$('#buildSawmill').on('click', function() {
			city.buy(type, 'sawmill');
		});
		$('#buildMine').on('click', function() {
			city.buy(type, 'mine');
		});
		$('#buildHouse').on('click', function() {
			city.buy(type, 'house');
		});
		$('#buildTavern').on('click', function() {
			city.buy(type, 'tavern');
		});
		$('#buildWarehouse').on('click', function() {
			city.buy(type, 'warehouse');
		});
		$('#buildCranny').on('click', function() {
			city.buy(type, 'cranny');
		});
		$('#buildBarracks').on('click', function() {
			city.buy(type, 'barracks');
		});
		$('#buildStable').on('click', function() {
			city.buy(type, 'stable');
		});
		$('#buildCapital').on('click', function() {
			city.buy(type, 'capital');
		});

		// training soldiers
		$('#train').on('submit', function(event) {
			event.preventDefault();
			var n = parseInt( $('#train')[0].soldiers.value);
			orderTroops('soldiers', n);
		});
	}

	
}