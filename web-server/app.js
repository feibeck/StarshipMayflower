var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var app = express();

app.use(methodOverride());
app.use(bodyParser());
app.set('view engine', 'jade');
app.set('views', __dirname + '/public');
app.set('view options', {layout: false});
app.set('basepath',__dirname + '/public');

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    app.use(express.static(__dirname + '/public'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

if ('production' == env) {
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(errorHandler());
}

console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");

app.listen(3001);
