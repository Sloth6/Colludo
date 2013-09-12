////////////////////////////////////////////////////////////////////////////////
/*
	login-validator.js
*/
////////////////////////////////////////////////////////////////////////////////
function loginUser(form) {
	console.log(form, form.email.value, form.password.value);
	$.ajax({
		url:      SERVER+'/login',
		dataType: 'text',
		type:     'post',
		data:     {'email' : form.email.value, 'pass' : form.password.value},
		success:  function(responseText, status) {
			console.log('manual-login success!');
			window.location = SERVER+'/game';
		},
		error:    function(response) {
			console.log('received error:', response.responseText);
			if (response.responseText == 'user-not-found') {
				alert('There is no user attached to that email.');
				form.email.value = '';
				form.password.value = '';
				form.email.focus();
			}
			else if (response.responseText == 'invalid-password') {
				alert('The password you gave was incorrect.');
				form.password.value = '';
				form.password.focus();
			}
		}
	});
}