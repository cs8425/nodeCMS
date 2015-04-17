var exports = module.exports = {};

var express = require('express');
var router = exports.router = express.Router();

var url_node = require('url');

var tool = require('./utility');

var render = require('./render');


// simple logger for this router's requests
// all requests to this router will first hit this middleware
router.use(function(req, res, next) {
	console.log('%s %s', req.method, req.url);
	next();
});

// css per page
router.get('/api', function(req, res, next){
	var url_parts = url_node.parse(req.url, true);
	var query = url_parts.query;
	if(query.css || query.css == ''){
		var path = query.css;
		var data = tool.getJSON();
		console.log('css:', query, query.css, data.url2page[path]);
		res.setHeader('content-type', 'text/css; charset=UTF-8');
		if(path == ''){
			res.send(data.css);
		}else{
			if(data.url2page[path]){
				var page_id = data.url2page[path];
				if(data.pages[page_id].css){
					res.send(data.pages[page_id].css);
				}else{
					res.send('');
				}
			}else{
				next();
			}
		}
	}else{
		next();
	}
});
router.post('/api', function(req, res, next){
//router.post('/api', ensureAuthenticated, function(req, res, next){
	var url_parts = url_node.parse(req.url, true);
	var query = url_parts.query;
	var keys = Object.keys(query);
console.log('key:', keys, req.body);
	if(keys[0]){
		var path = query[keys[0]];
		var data = tool.getJSON();

	}else{
		next();
	}
});



router.route('/login').get(forceSSL, function(req, res, next){
	var data = tool.getJSON();
	//var url = req.params.url;
	if (req.session.user){
		res.redirect('/');
	}else{
		render.render('login.html', {
			url: 'login',
			navbar: data.navbar,
			name: data.title,
			sname: data.stitle,
			user: req.session.user,
			message: req.session.messages
		}, function(html){
			res.send(html);
		});
	}
}).post(forceSSL, function(req, res, next) {
	if(!req.session.user){
		var users = tool.get_user();
		check(req.body.name, req.body.pwd, users, function(status, arr){
			req = arr[0];
			res = arr[1];
			next = arr[2];
			if(status){
				req.session.user = req.body.name;
				res.send('ok');
			}else{
				res.send('err');
			}
		}, [req, res, next]);
	}else{
		//res.redirect('/');
		res.send('ok');
	}
});

router.route('/editor').get(forceSSL, function(req, res, next){
	var data = tool.getJSON();
	//var url = req.params.url;
	//if (req.session.user){
		render.render('editor.html', {
			url: 'editor',
			navbar: data.navbar,
			name: data.title,
			sname: data.stitle,
			user: req.session.user,
			message: req.session.messages
		}, function(html){
			res.send(html);
		});
	//}else{
	//	res.redirect('/login');
	//}
})

router.route(/^\/(.*)/).get(function(req, res, next){
//console.log(req.params);
	var data = tool.getJSON();
	var url = req.params['0'];
	if((typeof url == 'undefined')||(url == '')){
		url = 'index';
	}
//console.log(url);
	//console.log(data[url]);
	if(data.url2page[url]){
		var page_id = data.url2page[url];
		if(data.pages[page_id].hide != 'true' || req.isAuthenticated()){
			render.render('main.html', {
				url: url,
				data: data.pages[page_id],
				navbar: data.navbar,
				name: data.title,
				sname: data.stitle,
				user: req.session.user,
				news: data.news.list,
				links: data.links.list,
				message: req.session.messages,
			}, function(html){
				res.send(html);
			});
		}else{
			next();
		}
	}else{
		next();
	}
});


function ensureAuthenticated(req, res, next) {
	if (req.session.user & req.secure){
		return next();
	}
	res.set(403).end();
//	res.redirect('/login');
}

function forceSSL(req, res, next) {
	if(!req.secure){
		var config = tool.get_config();
		res.redirect('https://' + req.header('Host') + ':' + config.sslport + req.url);
	} else {
		next();
	}
}

function check (username, password, list, done, arr, i) {
//console.log(username, password, list, i);
	var j = i || 0;
	if(list[j]){
		var user = list[j];
		var hash = tool.hash(username + ':' + password);
		if((user.name == username)&&(user.pwd == hash)){
			console.log('login ok:', username);
			done(true, arr);
		}else{
			process.nextTick( function(){
				check(username, password, list, done, arr, j+1);
			});
		}
	}else{
		console.log('login err:', username, password);
		done(false, arr);
	}
}

