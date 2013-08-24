socket.on('newMessage', function(messageArray) {
	console.log('Received new Message!!!');
	console.log(messageArray);

	displayNewMessage(messageArray);
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