////////////////////////////////////////////////////////////////////////////////
/*
	navbar-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {
	$('#view').prepend( $('#city') );
	$('#city-link').addClass('active');
});

$(window).on('resize', function() {
	if ($(window).width() <= 880) {
		$('#navbar-container').css({
			'left' : '0',
			'margin-left' : '0'
		});
	
	} else {
		$('#navbar-container').css({
			'left' : '50%',
			'margin-left' : '-430px'
		});
	}
	// console.log($(window).width(), $('#view').width());
});

$('#username').hover(
	function() {
		$('#username .sub_menu').removeClass('hidden');
		$('#username').addClass('active');
	},
	function() {
		$('#username .sub_menu').addClass('hidden');
		$('#username').removeClass('active');
	}
);

var directions = {
	'world'   : {
		'city'    : 'right',
		'message' : 'down',
	},
	'city'    : {
		'world'   : 'left',
		'message' : 'down',
	},
	'message' : {
		'city'    : 'up',
		'world'   : 'up',
	},
};

var panelWarehouse = {
	'world'   : $('#window_0'),
	'city'    : $('#window_1'),
	'message' : $('#window_2'),
};

function getPanelFromLink(link) {
	var panelId = link.id.split('-')[0];
	return $('#'+panelId);
}

function switchActive(current, next) {
	// console.log(current, next);
	current.removeClass('active');
	next.addClass('active');
}

function disableNav() {
	$('#navbar').addClass('disabled');
	$('#view').css('overflow', 'hidden');
}

function enableNav() {
	$('#navbar').removeClass('disabled');
	$('#view').css('overflow', 'auto');
}

function validSlidePanel(toId) {
	if (toId == 'username') return false;
	if (toId == 'profile') return false;
	if (toId == 'settings') return false;
	if (toId == 'logout') return false;
	return true;
}

$('ul.nav li').on('click', function(event) {
	event.preventDefault();
	if (this.id == 'logout') {
		window.location = SERVER + 'logout';
	}

	if (!validSlidePanel(this.id)) return;

	var to   = getPanelFromLink(this);
	var from = getPanelFromLink($('.active')[0]);
	var toId   = to[0].id;
	var fromId = from[0].id;

	if (fromId != toId) {
		var direction = directions[fromId][toId];

		slide(from, to, direction, fromId, toId);
	}
});

function slide(from, to, direction, fromId, toId) {
	var ghost  = $('#ghost');
	var view   = $('#view');
	var height = view.height();
	var width  = view.width();
	var slideTime = 600;

	if (direction == 'left' && !$('#navbar').hasClass('disabled')) {
		disableNav();
		switchActive( $('#'+fromId+'-link'), $('#'+toId+'-link') );
		// position
		from.appendTo(ghost);
		to.css('margin-left', '-'+width+'px');
		view.prepend(to);

		// slide
		from.animate({
			'margin-left': width+'px',
		}, slideTime);
		to.animate({
			'margin-left': '0px',
		}, slideTime);

		// reposition
		setTimeout(function() {
			from.animate({'margin-left': 0+'px'},10);
			from.appendTo(panelWarehouse[ fromId ]);
			enableNav();
		}, slideTime+200);
	
	} else if (direction == 'right' && !$('#navbar').hasClass('disabled')) {
		disableNav();
		switchActive( $('#'+fromId+'-link'), $('#'+toId+'-link') );
		// position
		to.css('margin-left', width+'px');
		to.appendTo(ghost);

		// slide
		from.animate({
			'margin-left': '-'+width+'px',
		}, slideTime);
		to.animate({
			'margin-left': '0px',
		}, slideTime);

		// reposition
		setTimeout(function() {
			view.prepend(to);
			from.animate({'margin-left': 0+'px'},10);
			from.appendTo(panelWarehouse[ fromId ]);
			enableNav();
		}, slideTime+200);
	
	} else if (direction == 'up' && !$('#navbar').hasClass('disabled')) {
		disableNav();
		switchActive( $('#'+fromId+'-link'), $('#'+toId+'-link') );
		// position
		from.appendTo(ghost);
		to.css('margin-top', '-'+height+'px');
		view.prepend(to);

		// slide
		from.animate({
			'margin-top': height+'px',
		}, slideTime);
		to.animate({
			'margin-top': 0+'px',
		}, slideTime);

		// reposition
		setTimeout(function() {
			from.animate({'margin-top': 0+'px'},10);
			from.appendTo(panelWarehouse[ fromId ]);
			enableNav();
		}, slideTime+200);
	
	} else if (direction == 'down' && !$('#navbar').hasClass('disabled')) {
		disableNav();
		switchActive( $('#'+fromId+'-link'), $('#'+toId+'-link') );
		// position
		to.css('margin-top', height+'px');
		to.appendTo(ghost);

		// slide
		from.animate({
			'margin-top': '-'+height+'px',
		}, slideTime);
		to.animate({
			'margin-top': 0+'px',
		}, slideTime);

		// reposition
		setTimeout(function() {
			view.prepend(to);
			from.animate({'margin-top': 0+'px'},10);
			from.appendTo(panelWarehouse[ fromId ]);
			enableNav();
		}, slideTime+200);
	
	} else {
		console.log('NAVBAR - clicked unslidable object');
	}
}