////////////////////////////////////////////////////////////////////////////////
/*
	login-validator.js
*/
////////////////////////////////////////////////////////////////////////////////
function loginUser(form) {
	console.log(form, form.email.value, form.password.value);
	$.ajax({
		url:      'http://204.236.234.28:8080/login',
		dataType: 'text',
		type:     'post',
		data:     {'email' : form.email.value, 'pass' : form.password.value},
		success:  function(responseText, status) {
			console.log('manual-login success!');
			window.location = 'http://204.236.234.28:8080/game';
		}
	});
}