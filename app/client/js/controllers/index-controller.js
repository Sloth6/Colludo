////////////////////////////////////////////////////////////////////////////////
/*
	index-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {

	var navbar = $('.navbar')
	  , win = $(window)
	  , winHeight = win.height()
	  , featureTop = $('#features').offset().top
	  , aboutTop = $('#about').offset().top;

	setInterval(function() {
		// set the navbar to be fixed at the top when it's scrolled out of view
		if ( win.scrollTop() >= 608 ) {
			navbar.css({
				'position' : 'fixed',
				'top' : '0'
			});
		} else {
			navbar.css({
				'position' : 'absolute',
				'top' : '608px'
			});
		}
		// feature section
		if ( win.scrollTop() >= featureTop && win.scrollTop() < aboutTop ) {
			$('li').removeClass('active');
			$('.left-1').addClass('active');
		// about us section
		} else if ( win.scrollTop() >= aboutTop ) {
			$('li').removeClass('active');
			$('.left-2').addClass('active');
		// defoult
		} else {
			$('li').removeClass('active');
			$('.left-0').addClass('active');
		}

		if (win.width() > 860) {
			$('body').css('overflow-x', 'hidden');
		} else {
			$('body').css('overflow-x', 'auto');
		}

	}, 10);

});


$('.scroll-position').on('click', function() {
	// console.log( $(this), $(this).children()[0], $(this).children()[0].href );
	window.location = $(this).children()[0].href;
});

// login handlers
$('#loginForm').on('submit', function(e) {
	e.preventDefault();
	var form = $('#loginForm')[0];
	loginUser(form);
});

// signup handlers
$('.signup-button').on('click', function() {

	var fader = $('#fader');
	fader.css({
		'height' : '100%',
		'width' : '100%'
	});
	fader.addClass('in');

	var signup = $('#signup');
	signup.css({
		'top' : '50%',
		'margin-top' : '-190px'
	});
	signup.addClass('show');

});

$('#fader').on('click', function() {
	var $this = $(this);
	// console.log($this, 'blarg');
	$this.removeClass('in');
	$this.css({
		'height' : '0',
		'width' : '0'
	});

	var signup = $('#signup');
	signup.removeClass('show');
	signup.css({
		'top' : '-500px',
		'margin-top' : '0'
	});
});

$('#signUpForm').on('submit', function(e) {
	e.preventDefault();
	var form = $('#signUpForm')[0];
	$('#signUpForm').attr('disabled', 'disabled');
	emailSU(form);
});

$('#signUpForm').on('success', function() {
	$('#signUpForm').attr('disabled', '');
	$('#fader').trigger('click');
});

$('#signUpForm').on('failure', function() {
	$('#signUpForm').attr('disabled', '');
});