"use strict";

var fs = require('fs');
var https = require('https');
var path = require('path');
var cluster = require('cluster');
var EventEmitter = require('events').EventEmitter;

var privateKey  = fs.readFileSync('sslcert/server.key').toString();
var certificate = fs.readFileSync('sslcert/server.crt').toString();
var credentials = {key: privateKey, cert: certificate};
var isWin = !!process.platform.match(/^win/);

var express = require('express');
var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(server);
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var session = require('express-session');
var bodyParser = require("body-parser");

if (cluster.isMaster) {
	// Fork workers.
/*	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
		console.log('worker '+ i +' start');
	}*/
	cluster.fork();
	console.log('main worker start');

	var log = function (){
		var t = new Date();
		var arr = ['[' + getTime(t) + ']'];
		for (var i = 0; i < arguments.length; i++) {
			arr.push(arguments[i]);
		}
		console.log.apply(null , arr);
	}

	var getTime = function (d){
		var t = function (d){
			return (d<10) ? '0' + d : '' + d;
		};

		var d = d || new Date();
		var str = '';
		str += d.getFullYear();
		str += '/' + t(d.getMonth());
		str += '/' + t(d.getDate());

		str += '-' + t(d.getHours());
		str += ':' + t(d.getMinutes());
		str += ':' + t(d.getSeconds());

		return str;
	}

	cluster.on('exit', function(worker, code, signal) {
		//console.log('[', new Date(), ']worker ' + worker.process.pid + ' died');
		log('worker ' + worker.process.pid + ' died');
		cluster.fork();
		//console.log('[', new Date(), ']worker restart');
		log('worker restart');
	});

} else {

	var tool = require('./utility');
	var route = require('./router');

	var config = tool.get_config();

	var sessionMiddleware = session({
		secret: tool.make_rand(20),
		saveUninitialized: false,
		resave: false,
		cookie:{
			secure: false,
			expires : new Date(Date.now() + 60*60*10000)
		}
	});

	app.use('/public', express.static(path.join(__dirname, 'public'), { 'maxAge': '365d' }));
	app.use('/data', express.static(path.join(__dirname, 'data'), {'index': ['noindex.txt', 'index.html'], 'maxAge': '1d'}));
	app.use('/data', serveIndex(path.join(__dirname, 'data'), {'icons': true}));

	app.use(sessionMiddleware);
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

/*	app.engine('.html', require('ejs').__express);
	app.set('views', __dirname + '/views');

	app.set('view engine', 'html');*/

	app.enable('etag') // use strong etags
	app.set('etag', 'strong') // same

	app.use('/', route.router);

//	app.use('/', require('./script').router);

/*
	app.get('/script/:jse', function(req, res, next){
		var file = req.params.jse;
		var worker = require('child_process').fork('js-worker.js', [file]);
		var timeout = setTimeout(function() {
			worker.kill();
		}, 40*1000)
		console.log('[main] worker #' + worker.pid + ' start', file);
		worker.send({
			'type': 'req.params',
			'd': req.params
		});

		worker.on('disconnect', function() {
			console.log('[main] worker #' + worker.pid + ' end', file);
		});
		worker.on('message', function(msg, data) {
			//console.log('[main] worker #' + worker.pid + ' msg', msg);
			switch(msg.t){
				case 'log':
					console.log.apply(null , msg.d);
				break;
				case 'end':
					res.end(msg.d);
				break;
				case 'write':
					res.write(msg.d);
				break;
				
				default:

			}
		});
	});
*/

	process.on('SIGTERM', function () {
		console.log('Got SIGTERM. exit.');
		//flushJSONSync();
		process.exit();
	});
	process.on('SIGINT', function () {
		console.log('Got SIGINT. exit.');
		//flushJSONSync();
		process.exit();
	});

	var apps = https.createServer(credentials, app);
	apps.listen(config.sslport);
	app.listen(config.port, function(){
		try {
			console.log('Giving up root privileges...');
			//process.initgroups(1000, 1000);
			process.setgid(1000);
			//process.setgroups([1000]);
			process.setuid(1000);
			console.log('New uid: ' + process.getuid());
			console.log('groups', process.getgroups());
		}
		catch (err) {
			console.log('Failed to drop root privileges: ' + err);
		}
	});
	console.log('Listening on port ' + config.port + ',' + config.sslport);
}

