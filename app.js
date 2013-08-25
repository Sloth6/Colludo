var http = require('http')
  , connect = require('connect')
  , express = require('express')
  , app = express()
  , server = app.listen(8080)
  , cookieParser = express.cookieParser('secret secret')
  , sessionStore = new connect.middleware.session.MemoryStore();
  // , toobusy = require('toobusy');

app.configure(function(){
	// app.set('port', 8080);
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(cookieParser);
	app.use(express.session({ store: sessionStore }));

	app.use(require('stylus').middleware({ src: __dirname + '/app/client' }));
	app.use(express.static(__dirname + '/app/client'));
	// The absolute first piece of middle-ware we would register, to block requests
	// before we spend any time on them.
	// app.use(function(req, res, next) {
	//   // check if we're toobusy() - note, this call is extremely fast, and returns
	//   // state that is cached at a fixed interval
	//   if (toobusy()) res.send(503, "I'm busy right now, sorry.");
	//   else next();
	// });

});

app.configure('development', function(){
	app.use(express.errorHandler());
});

require('./app/server/router')(app);

// var server = http.createServer(app).listen(app.get('port'), function(){
// 	console.log("Express server listening on port " + app.get('port'));
// });

var sockets = require('./app/server/modules/sockets');
sockets.socketServer(app, server, sessionStore, cookieParser);
// require('./app/server/modules/army-manager.js').initCombatServer();
