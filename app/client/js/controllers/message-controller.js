////////////////////////////////////////////////////////////////////////////////
/*
	message-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

$('li.mini-message').unbind('click');
$(document).on('click', 'li.mini-message', function() {
	var $this = $(this);
	var children = $this.children().clone();
	console.log(children);
	$('#messageView').empty();
	children.appendTo( $('#messageView') );
	$('#messageEnlarged').appendTo( $('#messagePanel') );
});

$('#composeButton').on('click', function() {
	$('#compose').appendTo( $('#messagePanel') );
});

$('#compose').on('submit', function(event) {
	event.preventDefault();

	var date = new Date();
	var timeString = (date.getMonth()+1)+'x'+date.getDate()+'x'+date.getHours()+
		'x'+date.getMinutes()+'x'+date.getSeconds();

	console.log('SENDING: Preparing messageData');
	var messageData = {
		'to'      : this.to.value,
		'subject' : this.subject.value,
		'time'    : timeString,
		'message' : this.message.value
	};
	console.log('SENDING: Prepared messageData', messageData);
	socket.emit('sendMessage', messageData);

	this.to.value = '';
	this.subject.value = '';
	this.message.value = '';

	$('#messageEnlarged').appendTo( $('#messagePanel') );
});

function displayNewMessage(messageArray) {
	var miniMessage = 
		'<li class="mini-message">'+
			'<h6 class="sender">'+messageArray.sender+'</h6>'+
			'<h6 class="subject">'+messageArray.subject+'</h6>'+
			'<h6 class="time">'+messageArray.time+'</h6>'+
			'<p>'+messageArray.message+'</p>'+
		'</li>';

	$('#messageList').prepend(miniMessage);
}

function displayStoredMessage(messageArray) {
	var miniMessage = 
		'<li class="mini-message">'+
			'<h6 class="sender">'+messageArray.mr_sender+'</h6>'+
			'<h6 class="subject">'+messageArray.subject+'</h6>'+
			'<h6 class="time">'+messageArray.time_sent+'</h6>'+
			'<p>'+messageArray.message+'</p>'+
		'</li>';

	$('#messageList').append(miniMessage);
}

function readMessages(messageData) {
	if (messageData) {
		var messageData = messageData.reverse();
		RECEIVED_COUNT = messageData.length;
		updateNotificationBubble();
		for (var i = 0; i < messageData.length; i++) {
			displayStoredMessage( messageData[i] );
			console.log('MESSAGE DATA: ', messageData[i]);
		};
	} else {
		RECEIVED_COUNT = 0;
		updateNotificationBubble();
	}
}

function updateNotificationBubble() {
	console.log('BUBBLES!!!', RECEIVED_COUNT);
	var elem = $('#new-messages');
	if (!RECEIVED_COUNT) {
		elem.addClass('hidden');
	} else {
		elem.removeClass('hidden');
		elem.text(RECEIVED_COUNT);
	}
}