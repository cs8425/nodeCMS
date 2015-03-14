var exports = module.exports = {};

var express = require('express');
var router = exports.router = express.Router();



// simple logger for this router's requests
// all requests to this router will first hit this middleware
router.use(function(req, res, next) {
	console.log('%s %s %s', req.method, req.url, req.path);
	next();
});


router.get('/user/:id', function(req, res) {
	res.send('user ' + req.params.id);
});

