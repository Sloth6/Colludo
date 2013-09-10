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
		}
	});
}