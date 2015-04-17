var exports = module.exports = {};

var express = require('express');
var router = exports.router = express.Router();

router.use('/:jse', function(req, res, next){
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
