var fs = require('fs');
var crypto = require('crypto');

var exports = module.exports = {};

console.log('load:', 'utility.js');

exports.hash = function(data){
		var sha1 = crypto.createHash('sha1').update(data);
		sha1.setEncoding('hex');
		sha1.end();
		return sha1.read();
}

exports.make_rand = function (len){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@$%^&*-_=+";

	for( var i=0; i < len; i++ )
	text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

var config;
var users;
var __data;
var __datatime = 0;

exports.get_config = function (){
	if(!config){
		var data = fs.readFileSync('./config.json', 'utf8');
		config = JSON.parse(data);
	}
	return config;
}
exports.save_config = function () {
	fs.writeFile('./config.json', JSON.stringify(__data, null, 4));
}

exports.get_user = function () {
	if(!users){
		var data = fs.readFileSync('./user.json', 'utf8');
		users = JSON.parse(data);
	}
	return users;
}
exports.save_user = function () {
	fs.writeFile('./user.json', JSON.stringify(__data, null, 4));
}

exports.getJSON = function () {
	var now = new Date().getTime();
	if(now - __datatime > 3600*1000){
//	console.log('json');
		var data = fs.readFileSync('./data.json', 'utf8');
		data = JSON.parse(data);
	//	console.log(data);
		__datatime = now;
		__data = data;
	}
	return __data;
}
function flashJSON() {
	var now = new Date().getTime();
	var data = fs.readFileSync('./data.json', 'utf8');
	data = JSON.parse(data);
//	console.log(data);
	__datatime = now;
	__data = data;
}
function flushJSONSync() {
	fs.writeFileSync('data.json', JSON.stringify(__data, null, 4));
}
exports.flushJSON = function () {
	fs.writeFile('data.json', JSON.stringify(__data, null, 4));
}

exports.log = function (){
	var t = new Date();
	var arr = ['[' + getTime(t) + ']'];
	for (var i = 0; i < arguments.length; i++) {
		arr.push(arguments[i]);
	}
	console.log.apply(null , arr);
}

function getTime(d){
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

