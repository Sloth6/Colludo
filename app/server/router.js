
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

module.exports = function(app) {

// main login page //

	app.get('/', function(req, res) {
	// 	console.log('session data:', req.session);
	// 	console.log('cookie data:', req.cookies);
		// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('index', {});
		} else {
			// attempt automatic login //
			// console.log('attempt to log in with cookies');
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				// console.log('setting this player data as session', o);
				if (o != null){
					// password is correct and user is there. 
				    req.session.user = o;
					res.redirect('/game');
				}	else{
					// passwords dont match OR the user does not exist. 
					res.render('index', {});
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		// console.log('trying to manually log in');
		// console.log(req.session, req.param('remember-me'));
		
		AM.manualLogin(req.body.email, req.body.password, function(e, o){
			if (!o) {
				// eq.session.user = o;
				res.send(e, 400);
			} else {
			    req.session.user = o; //{'id' : o.id, 'name' : o.username};
			    // console.log('a,', o, req.param('remember-me'));
				// if (req.param('remember-me') == 'true'){
				res.cookie('user', o.username, { maxAge: 900000 });
				res.cookie('pass', o.password, { maxAge: 900000 });
				// }
				res.send(o, 200);
				res.redirect('/game');
			}
		});
	});
	
	app.get('/test', function(req, res) {
		MS.announceTile();
		res.redirect('/');
	});

	app.get('/game', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		} else {
			res.render('game', {});
		}
	});

// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
		// if user is not logged-in redirect back to login page
	        res.redirect('/');
	    }   else{
			res.render('home', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
	    }
	});

	app.get('/nuke', function(req, res) {
		require('./modules/nuke').NUKE();
		res.render('nuke', {});
	});
	
	app.get('/guide', function(req, res) {
		res.render('guide', {});
	})

	app.post('/home', function(req, res) {
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o) {
				if (e) {
					res.send('error-updating-account', 400);
				} else {
					req.session.user = o;
					// update the user's login cookies if user exists
					if (req.cookies.user != undefined && req.cookies.pass != undefined) {
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		} else if (req.param('logout') == 'true') {
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
	app.get('/map', function(req, res) {
		if (!req.session.user) {
			// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    } else {
			res.render('worldMap', {});
		}
	});

	app.get('/city', function(req, res) {
		if (!req.session.user) {
			// if user is not logged-in redirect back to login page //
	       res.redirect('/');
	    } else {
			res.render('city', {});
		}
	});

	// creating new accounts
	app.post('/signup', function(req, res) {
		AM.addNewAccount(req.body,
			function(e) {
				if (e) {
					console.log(e);
					res.send(e, 400);
				} else {
					res.send('success', 200);
				}
			}
		);
	});

	// creating new accounts
	app.post('/login', function(req, res) {
		// console.log('manually logging in...', req.body.email, req.body.pass);
		AM.manualLogin(req.body.email, req.body.pass, function(e, o) {
			if (!o) {
				// eq.session.user = o;
				res.send(e, 400);
			} else {
				// console.log('Log the fuck in!');
			    req.session.user = o; //{'id' : o.id, 'name' : o.username};
			    // console.log('a,', o, req.param('remember-me'));
				// if (req.param('remember-me') == 'true'){
				res.cookie('user', o.username, { maxAge: 900000 });
				res.cookie('pass', o.password, { maxAge: 900000 });
				// }
				res.send(o, 200);
				// console.log('No, seriously, why won\'t it just log the fuck in?!');
				// res.redirect('/game');
			}
		});
	});

	app.get('/logout', function(req, res) {
		res.cookie('user', null, { maxAge: 900000 });
		res.cookie('pass', null, { maxAge: 900000 });
		req.session.user = null;
        res.redirect('/');
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o) {
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};