////////////////////////////////////////////////////////////////////////////////
/*
	message-listeners.js - listens for any pushed messages and reacts 
		appropriately. [TODO: update message notification bubble.]
*/
////////////////////////////////////////////////////////////////////////////////

socket.on('newMessage', function(messageArray) {
	console.log('Received new Message!!!');
	console.log(messageArray);

	displayNewMessage(messageArray);
	console.log($('#new-messages'));
});

socket.on('messageConfirm', function(data){
	console.log(data);
	if (data.err) {
		alert(data.err);
	} else {
		$('#compose').value = '';
		$('#compose').value = '';
		$('#compose').value = '';
		$('#messageEnlarged').appendTo( $('#messagePanel') );

		alert('sent succesfully!');
	}
});