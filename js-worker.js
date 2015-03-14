"use strict";

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;


var log = function (){
	var arr = ['[worker #' + process.pid + '][' + procname + ']'];
	for (var i = 0; i < arguments.length; i++) {
		arr.push(arguments[i]);
	}
	process.send({
		't': 'log',
		'd': arr
	});
};

var procname = process.argv[2];
var event_bus = new EventEmitter();

process.on('message', function(msg, data) {
	//log('msg', msg);
	event_bus.emit(msg.type, msg);
});

event_bus.on('req.params', function(msg){
log('msg', msg);
	process.send({
		't': 'end',
		'd': '123!'
	});
});


