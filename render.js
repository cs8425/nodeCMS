var fs = require('fs');
var path = require('path');

var compiled = {};

var exports = module.exports = {};

var PATH = exports.path = './views';

exports.render = function(name, data, done){
	//var err = null
	if(typeof compiled[name] === 'function'){
		done(compiled[name](data));
	}else{
		/*fs.readFile(path.join(PATH, name), {encoding: 'utf8'},function(err, tmpl){
			if(err) throw err;
			compiled[name] = dot.template(tmpl, undefined, defs);
			process.nextTick(function(){
					done(compiled[name](data));
			});
		});*/
		render_worker(name, data, done);
	}
}

var render_worker = exports.render2 = function(name, data, done){
	var file = path.join(PATH, name);
	var worker = require('child_process').fork('render-worker.js', [file]);
	var timeout = setTimeout(function() {
		worker.kill();
	}, 20*1000)
	console.log('[render] worker #' + worker.pid + ' start', file);

	worker.on('disconnect', function() {
		console.log('[render] worker #' + worker.pid + ' end', file);
	});
	worker.on('message', function(msg) {
		//console.log('[main] worker #' + worker.pid + ' msg', msg);
		switch(msg.t){
			case 'log':
				console.log.apply(null , msg.d);
			break;
			case 'end':
				try {
					compiled[name] = new Function(msg.d[0], msg.d[1]);
				} catch (e) {
					if (typeof console !== "undefined") console.log("Could not create a template function: " + msg.d[1]);
					throw e;
				}
				process.nextTick(function(){
						done(compiled[name](data));
				});
			break;
		}
	});
}

