
////////////////////////////////////////////////////////////////////////////////
/*
	signup-validator.js
*/
////////////////////////////////////////////////////////////////////////////////

function emailSU(form) {
    // Email Address
    var email = form.email.value;
    // (1) must be non-empty
    if(email == "") {
		alert("Please enter an Email Address.");
		form.email.focus();
    
    // (2) must be no longer than 69 characters
    } else if(email.length > 69) {
		alert("Your Email Address must have less than 70 characters.");
		form.email.value = "";
		form.email.focus();
    
    } else {
		// (3) must be in valid email format
		var atpos = email.indexOf("@");
		var dotpos = email.lastIndexOf(".");
		if(atpos < 1 || (dotpos - atpos < 2)) {
			alert("Please enter a valid Email Address.");
			form.email.value = "";
			form.email.focus();
		
		} else {
			usernameSU(form);
		}
    }
}


function usernameSU(form) {
    // Username
    var username = form.username.value;
    // (1) must be non-empty
    if(username == "") {
		alert("Please enter a Username.");
		form.username.focus();

    // (2) must be no longer than 27 characters 
    } else if (username.length > 27) {
		alert("Your Username must have less than 28 characters.");
		form.username.value = "";
		form.username.focus();
    
    } else {
		passwordsSU(form);
    }
}


function passwordsSU(form) {
    // Password
    var password = form.password.value;
    var confirm = form.confirm.value;
    // (1) must be at least 6 characters
    if(password.length < 6) {
		alert("Your Password must at least 6 characters long.");
		form.password.value = "";
		form.confirm.value = "";
		form.password.focus();

    // (2) must be no longer than 40 characters
    } else if(password.length > 40) {
		alert("Your Password must have less than 41 characters.");
		form.password.value = "";
		form.confirm.value = "";
		form.password.focus();

    // (3) must match the confirmed password
    } else if(password != confirm) {
		alert("Your Password inputs must match.");
		form.password.value = "";
		form.confirm.value = "";
		form.password.focus();
    
    } else {
		register(form, form.username.value, form.email.value, form.password.value);
    }
}


function register(form, user, email, pass) {
    // var jstring = JSON.stringify([username, email, password]);
    $.ajax({
	    url:      SERVER+'/signup',
		dataType: 'text',
		type:     'post',
		data:     {'user' : user, 'email' : email, 'pass' : pass},
		success:  function(responseText, status) {
			console.log('status', status);
			if (status == 'success') {
			    alert("Successfully Registered: " + user + "!");
			    form.username.value = "";
			    form.email.value = "";
			    form.password.value = "";
			    form.confirm.value = "";
			    form.username.focus();	
			    form.username.blur();
			    // form.trigger('success');
			    $('#signUpForm').trigger('success');
			}
	    },
	    error : function(e) {

	    	$('#signUpForm').trigger('failure');
			if (e.responseText == 'email-taken'){
			    alert("That username has been taken.");
			    form.username.value = "";
			    form.username.focus();

			} else if (e.responseText == 'username-taken'){
			    alert("A user already exists with that Email Address.");
			    form.email.value = "";
			    form.email.focus();

			} else if (e.responseText == 'illigal-name'){
			    alert("That username cannot be used.");
			    form.username.value = "";
			    form.username.focus();

			} else if (e.responseText == 'illigal-email'){
			    alert("That email cannot be used.");
			    form.email.value = "";
			    form.email.focus();

			} else {
				alert("An error has occured with your connection!");
			    console.log(e);
			}
		}
	});
}
